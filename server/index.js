import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { pool, query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const app = express();

const PORT = Number(process.env.PORT || 8787);
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-before-production';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(rootDir, 'uploads');
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || '';
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || '';
const DOUBAO_BASE_URL = process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const DOUBAO_MODEL = process.env.DOUBAO_MODEL || 'doubao-seed-2-0-lite-260215';

app.use(cors());
app.use(express.json({ limit: process.env.JSON_LIMIT || '12mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name ?? undefined,
    avatar_url: row.avatar_url ?? undefined,
    mood_preference: row.mood_preference ?? undefined,
    persona_preference: row.persona_preference ?? undefined,
  };
}

function mapJournal(row) {
  return {
    id: row.id,
    content: row.content,
    summary: row.summary ?? undefined,
    mood: row.mood,
    date: row.created_at,
    images: row.images ?? undefined,
    audio: row.audio_url ?? undefined,
  };
}

function mapSession(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    persona: row.persona,
    created_at: row.created_at,
    firstUserMessage: row.first_user_message ?? undefined,
  };
}

function mapMessage(row) {
  return {
    id: row.id,
    session_id: row.session_id,
    role: row.role,
    content: row.content,
    mood_detected: row.mood_detected,
    created_at: row.created_at,
  };
}

function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: '未登录' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

async function getUserById(id) {
  const { rows } = await query('select * from users where id = $1', [id]);
  return rows[0] ?? null;
}

async function ensureUploadDir(type) {
  const dir = path.join(UPLOAD_DIR, type);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

function decodeDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(.+?);base64,(.+)$/);
  if (!match) throw new Error('Invalid data url');
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

function extensionForMime(mimeType) {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('mpeg')) return 'mp3';
  return 'jpg';
}

async function saveDataUrl(dataUrl, type) {
  const { mimeType, buffer } = decodeDataUrl(dataUrl);
  const maxBytes = Number(process.env.UPLOAD_MAX_BYTES || 10 * 1024 * 1024);
  if (buffer.byteLength > maxBytes) {
    throw new Error(`文件不能超过 ${Math.floor(maxBytes / 1024 / 1024)}MB`);
  }

  const dir = await ensureUploadDir(type);
  const filename = `${crypto.randomUUID()}.${extensionForMime(mimeType)}`;
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/uploads/${type}/${filename}`;
}

function absoluteUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (!PUBLIC_BASE_URL) return url;
  return `${PUBLIC_BASE_URL.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
}

function mimeForFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/jpeg';
}

async function imageInputUrl(url) {
  if (!url || !url.startsWith('/uploads/')) return absoluteUrl(url);

  const relativePath = decodeURIComponent(url.replace(/^\/uploads\//, ''));
  const filePath = path.resolve(UPLOAD_DIR, relativePath);
  const uploadRoot = path.resolve(UPLOAD_DIR);
  if (!filePath.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new Error('Invalid upload path');
  }

  const buffer = await fs.readFile(filePath);
  return `data:${mimeForFilename(filePath)};base64,${buffer.toString('base64')}`;
}

const PERSONA_PROMPTS = {
  healing: `你是 Melty，小融，一位温暖、富有同理心的大学心理支持助手。你使用 ACT 接纳承诺疗法的语言，帮助用户接纳情绪、找到可执行的小行动。请用中文回答。遇到自伤或自杀风险时，建议用户立即联系身边可信任的人、校园心理中心或当地紧急服务。`,
  rational: `你是 Logic，罗极，一位冷静、客观、温和的大学心理支持助手。你使用 CBT 认知行为疗法，帮助用户识别自动思维和替代解释。请用中文回答。遇到自伤或自杀风险时，建议用户立即联系身边可信任的人、校园心理中心或当地紧急服务。`,
  fun: `你是 Spark，火花，一位幽默、有活力但善良的大学心理支持助手。你可以用轻松的方式解构烦恼，但不要嘲讽用户。请用中文回答。遇到自伤或自杀风险时，建议用户立即联系身边可信任的人、校园心理中心或当地紧急服务。`,
};

function systemPrompt(persona) {
  return PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.rational;
}

function detectMood(text) {
  if (/(开心|高兴|快乐|棒)/.test(text)) return 'HAPPY';
  if (/(焦虑|紧张|担心|害怕)/.test(text)) return 'ANXIOUS';
  if (/(难过|伤心|沮丧|崩溃)/.test(text)) return 'SAD';
  if (/(生气|愤怒|烦躁)/.test(text)) return 'ANGRY';
  return null;
}

async function buildDoubaoMessages(persona, history, message, images = []) {
  const messages = [{ role: 'system', content: systemPrompt(persona) }];
  for (const item of history) {
    messages.push({
      role: item.role === 'model' ? 'assistant' : 'user',
      content: item.content,
    });
  }

  if (images.length > 0) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: message || '请分析这些图片。' },
        ...(await Promise.all(
          images.map(async (url) => ({ type: 'image_url', image_url: { url: await imageInputUrl(url) } }))
        )),
      ],
    });
  } else {
    messages.push({ role: 'user', content: message });
  }
  return messages;
}

async function callDoubaoJson(messages, options = {}) {
  if (!DOUBAO_API_KEY) {
    throw new Error('DOUBAO_API_KEY 未配置');
  }

  const response = await fetch(`${DOUBAO_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DOUBAO_API_KEY}`,
    },
    body: JSON.stringify({
      model: DOUBAO_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1200,
      stream: Boolean(options.stream),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`豆包 API 请求失败 (${response.status}): ${text}`);
  }

  return response;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: '请输入有效邮箱和至少 6 位密码' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `insert into users (email, password_hash, display_name)
       values ($1, $2, $3)
       returning *`,
      [email.toLowerCase(), passwordHash, email.split('@')[0]]
    );
    const user = mapUser(rows[0]);
    res.json({ token: signToken(user), user });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: '邮箱已注册' });
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await query('select * from users where email = $1', [String(email || '').toLowerCase()]);
    const userRow = rows[0];
    if (!userRow || !(await bcrypt.compare(password || '', userRow.password_hash))) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    const user = mapUser(userRow);
    res.json({ token: signToken(user), user });
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/me', requireAuth, async (req, res, next) => {
  try {
    res.json({ user: mapUser(await getUserById(req.user.id)) });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/auth/me', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['display_name', 'avatar_url', 'mood_preference', 'persona_preference'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return res.status(400).json({ error: '没有可更新字段' });
    }
    const setSql = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = fields.map((field) => updates[field]);
    const { rows } = await query(
      `update users set ${setSql}, updated_at = now() where id = $1 returning *`,
      [req.user.id, ...values]
    );
    res.json({ user: mapUser(rows[0]) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:id', requireAuth, async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id) return res.status(403).json({ error: '无权访问' });
    res.json({ user: mapUser(await getUserById(req.user.id)) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/uploads/:type', requireAuth, async (req, res, next) => {
  try {
    const typeMap = { images: 'images', avatar: 'avatars', audio: 'audio' };
    const type = typeMap[req.params.type];
    if (!type) return res.status(404).json({ error: '不支持的上传类型' });
    const url = await saveDataUrl(req.body.dataUrl, type);
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

app.get('/api/journals', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'select * from journals where user_id = $1 order by created_at desc',
      [req.user.id]
    );
    res.json({ journals: rows.map(mapJournal) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/journals', requireAuth, async (req, res, next) => {
  try {
    const { content, summary, mood, images, audio } = req.body;
    if (!content || !mood) return res.status(400).json({ error: '日记内容和情绪不能为空' });
    const { rows } = await query(
      `insert into journals (user_id, content, summary, mood, images, audio_url)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [req.user.id, content, summary || null, mood, images ? JSON.stringify(images) : null, audio || null]
    );
    res.json({ journal: mapJournal(rows[0]) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/journals/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('select * from journals where id = $1 and user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    res.json({ journal: rows[0] ? mapJournal(rows[0]) : null });
  } catch (error) {
    next(error);
  }
});

app.get('/api/chat/sessions', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `select cs.*,
        (
          select cm.content
          from chat_messages cm
          where cm.session_id = cs.id and cm.role = 'user'
          order by cm.created_at asc
          limit 1
        ) as first_user_message
       from chat_sessions cs
       where cs.user_id = $1
       order by cs.created_at desc`,
      [req.user.id]
    );
    res.json({ sessions: rows.map(mapSession) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/chat/sessions', requireAuth, async (req, res, next) => {
  try {
    const { persona = 'rational' } = req.body;
    const { rows } = await query(
      'insert into chat_sessions (user_id, persona) values ($1, $2) returning *',
      [req.user.id, persona]
    );
    res.json({ session: mapSession(rows[0]) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/chat/sessions/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `select cm.*
       from chat_messages cm
       join chat_sessions cs on cs.id = cm.session_id
       where cm.session_id = $1 and cs.user_id = $2
       order by cm.created_at asc`,
      [req.params.id, req.user.id]
    );
    res.json({ messages: rows.map(mapMessage) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/ai/summary', requireAuth, async (req, res, next) => {
  try {
    const content = String(req.body.content || '');
    if (!content.trim()) return res.status(400).json({ error: '内容不能为空' });
    const response = await callDoubaoJson(
      [
        {
          role: 'user',
          content: `请将以下日记内容总结为一句温暖且富有洞察力的话，送给这位同学。不要超过50字。\n\n${content}`,
        },
      ],
      { max_tokens: 200 }
    );
    const data = await response.json();
    res.json({ summary: data?.choices?.[0]?.message?.content?.trim() || '记录下这一刻的心情，是自我关怀的开始。' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/ai/chat', requireAuth, async (req, res, next) => {
  try {
    const { message, persona = 'rational', sessionId, images = [] } = req.body;
    if (!message && images.length === 0) return res.status(400).json({ error: '消息不能为空' });

    let activeSessionId = sessionId;
    if (activeSessionId) {
      const { rows } = await query('select id from chat_sessions where id = $1 and user_id = $2', [
        activeSessionId,
        req.user.id,
      ]);
      if (rows.length === 0) activeSessionId = null;
    }

    if (!activeSessionId) {
      const { rows } = await query(
        'insert into chat_sessions (user_id, persona) values ($1, $2) returning id',
        [req.user.id, persona]
      );
      activeSessionId = rows[0].id;
    }

    await query(
      'insert into chat_messages (session_id, role, content, images) values ($1, $2, $3, $4)',
      [activeSessionId, 'user', message || '[图片]', images.length ? JSON.stringify(images) : null]
    );

    const { rows: history } = await query(
      'select role, content from chat_messages where session_id = $1 order by created_at asc limit 20',
      [activeSessionId]
    );

    const response = await callDoubaoJson(
      await buildDoubaoMessages(persona, history.slice(0, -1), message, images),
      { stream: true }
    );

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Session-Id': activeSessionId,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    const send = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const handleLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) return;
      const content = trimmed.slice(5).trim();
      if (content === '[DONE]') return;
      try {
        const parsed = JSON.parse(content);
        const delta = parsed?.choices?.[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;
          send({ content: delta, done: false, sessionId: activeSessionId });
        }
      } catch {
        // Ignore malformed provider chunks.
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      buffer += value ? decoder.decode(value, { stream: !done }) : '';
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
        handleLine(buffer.slice(0, newlineIndex));
        buffer = buffer.slice(newlineIndex + 1);
      }
      if (done) break;
    }

    if (fullText) {
      await query(
        'insert into chat_messages (session_id, role, content, mood_detected) values ($1, $2, $3, $4)',
        [activeSessionId, 'model', fullText, detectMood(fullText)]
      );
    }

    send({ content: '', done: true, sessionId: activeSessionId });
    res.end();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (res.headersSent) {
    res.end();
    return;
  }
  res.status(500).json({ error: error.message || '服务器错误' });
});

async function initializeDatabase() {
  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  const maxAttempts = Number(process.env.DB_INIT_ATTEMPTS || 30);
  const retryDelayMs = Number(process.env.DB_INIT_RETRY_MS || 2000);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await pool.query(schema);
      return;
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      console.warn(`Database initialization failed, retrying (${attempt}/${maxAttempts})...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

await fs.mkdir(UPLOAD_DIR, { recursive: true });
await initializeDatabase();

app.listen(PORT, () => {
  console.log(`Famlée API listening on ${PORT}`);
});
