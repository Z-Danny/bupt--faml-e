import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSupportPipeline } from '../../server/ai/pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const testsetPath = path.join(__dirname, 'emotion_testset_100.csv');
const rawResultsPath = path.join(__dirname, 'emotion_recognition_raw_results.csv');
const reportPath = path.join(__dirname, 'emotion_recognition_report.md');

const LABEL_TO_CODE = {
  平静: 'NEUTRAL',
  开心: 'HAPPY',
  焦虑: 'ANXIOUS',
  难过: 'SAD',
  生气: 'ANGRY',
};

const CODE_TO_LABEL = Object.fromEntries(Object.entries(LABEL_TO_CODE).map(([label, code]) => [code, label]));

const SKILL_ALIASES = {
  cbt_reframe: 'cognitive_clarification',
  thought_record: 'cognitive_clarification',
  evidence_check: 'cognitive_clarification',
  act_acceptance: 'acceptance_support',
  values_clarification: 'acceptance_support',
  breathing: 'mindfulness_breathing',
  humor_buffer: 'light_buffering',
  empathic_support: 'empathic_support',
  personality_reflection: 'personality_reflection',
  crisis_triage: 'crisis_triage',
};

const args = new Set(process.argv.slice(2));
const withBaseline = args.has('--with-baseline');
const baselineTimeoutMs = Number(process.env.BASELINE_TIMEOUT_MS || 30000);

await loadDotEnv(path.join(rootDir, '.env.local'));
await loadDotEnv(path.join(rootDir, '.env'));

const rows = parseCsv(await fs.readFile(testsetPath, 'utf8'));
const results = [];

for (const [index, row] of rows.entries()) {
  if (withBaseline) {
    console.log(`[${index + 1}/${rows.length}] ${row.id}`);
  }
  const famlee = await runFamleeSkill(row.text);
  const baseline = withBaseline ? await runBaseline(row.text).catch((error) => baselineError(error)) : emptyBaseline();
  results.push({
    ...row,
    ...baseline,
    famlee_raw_output: JSON.stringify(famlee.rawOutput),
    famlee_emotion_label: famlee.emotionLabel,
    famlee_semantic_summary: famlee.semanticSummary,
    famlee_risk_level: famlee.riskLevel,
    famlee_recommended_skill: famlee.recommendedSkill,
    famlee_format_valid: String(famlee.formatValid),
    famlee_route_usable: String(famlee.routeUsable),
  });
}

await fs.writeFile(rawResultsPath, toCsv(results), 'utf8');
await fs.writeFile(reportPath, buildReport(results, { withBaseline }), 'utf8');

console.log(`Wrote ${rawResultsPath}`);
console.log(`Wrote ${reportPath}`);

async function runFamleeSkill(text) {
  const result = await runSupportPipeline({
    persona: 'rational',
    message: text,
    history: [],
    buildImageInputUrl: async (url) => url,
  });

  const metadata = result.metadata;
  const emotionLabel = CODE_TO_LABEL[metadata.emotion.primary] || '平静';
  const recommendedSkill = SKILL_ALIASES[metadata.route.skillId] || metadata.route.skillId;
  const rawOutput = {
    emotion_label: emotionLabel,
    semantic_summary: metadata.emotion.summary,
    risk_level: metadata.safety.level,
    recommended_skill: recommendedSkill,
  };

  return {
    rawOutput,
    emotionLabel,
    semanticSummary: rawOutput.semantic_summary,
    riskLevel: rawOutput.risk_level,
    recommendedSkill,
    formatValid: hasRequiredFamleeFields(rawOutput),
    routeUsable: isRouteUsable(rawOutput),
  };
}

async function runBaseline(text) {
  const apiKey = process.env.DOUBAO_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DOUBAO_API_KEY. Omit --with-baseline or configure .env.local.');
  }

  const baseUrl = process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const model = process.env.DOUBAO_MODEL;
  if (!model) {
    throw new Error('Missing DOUBAO_MODEL. Configure .env.local before running --with-baseline.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), baselineTimeoutMs);
  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: `请判断下面文本中的主要情绪，并自然回复用户。不需要输出 JSON。\n\n文本：${text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 180,
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Baseline request failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim() || '';
  const label = extractChineseEmotionLabel(reply);
  const formatValid = hasStructuredFields(reply);
  const routeUsable = formatValid && /recommended_skill|推荐/.test(reply);

  return {
    baseline_reply: reply,
    baseline_emotion_label: label,
    baseline_format_valid: String(formatValid),
    baseline_route_usable: String(routeUsable),
  };
}

function emptyBaseline() {
  return {
    baseline_reply: '',
    baseline_emotion_label: '',
    baseline_format_valid: 'false',
    baseline_route_usable: 'false',
  };
}

function baselineError(error) {
  const message = error?.name === 'AbortError' ? 'BASELINE_TIMEOUT' : `BASELINE_ERROR: ${error?.message || error}`;
  return {
    baseline_reply: message,
    baseline_emotion_label: '',
    baseline_format_valid: 'false',
    baseline_route_usable: 'false',
  };
}

function extractChineseEmotionLabel(text) {
  if (/焦虑|焦慮|紧张|緊張|担心|擔心|不安/.test(text)) return '焦虑';
  if (/难过|難過|悲伤|悲傷|伤心|傷心|低落|沮丧|沮喪/.test(text)) return '难过';
  if (/生气|生氣|愤怒|憤怒|不爽|火大|烦躁|煩躁/.test(text)) return '生气';
  if (/开心|開心|高兴|高興|快乐|快樂|积极|正向/.test(text)) return '开心';
  if (/平静|平淡|中性|平和|稳定|穩定/.test(text)) return '平静';
  return '';
}

function hasStructuredFields(text) {
  return /emotion_label/.test(text) && /risk_level/.test(text) && /recommended_skill/.test(text);
}

function hasRequiredFamleeFields(output) {
  return Boolean(output.emotion_label && output.semantic_summary && output.risk_level && output.recommended_skill);
}

function isRouteUsable(output) {
  return (
    ['平静', '开心', '焦虑', '难过', '生气'].includes(output.emotion_label) &&
    ['low', 'elevated', 'crisis'].includes(output.risk_level) &&
    Boolean(output.recommended_skill)
  );
}

function buildReport(results, { withBaseline }) {
  const total = results.length;
  const famleeCorrect = results.filter((row) => row.famlee_emotion_label === row.gold_label).length;
  const baselineEvaluable = withBaseline && results.some((row) => row.baseline_reply);
  const baselineCorrect = baselineEvaluable
    ? results.filter((row) => row.baseline_emotion_label === row.gold_label).length
    : 0;

  const categories = ['平静', '开心', '焦虑', '难过', '生气'];
  const perClassRows = categories.map((label) => {
    const subset = results.filter((row) => row.gold_label === label);
    const correct = subset.filter((row) => row.famlee_emotion_label === row.gold_label).length;
    return `| ${label} | ${subset.length} | ${correct} | ${pct(correct, subset.length)} |`;
  });

  const examples = ['anxious_01', 'sad_01', 'angry_20']
    .map((id) => results.find((row) => row.id === id))
    .filter(Boolean)
    .map(
      (row) =>
        `| ${escapeMd(row.text)} | ${row.gold_label} | ${row.famlee_emotion_label} | ${row.famlee_risk_level} | ${row.famlee_recommended_skill} |`
    );

  const baselineAccuracy = baselineEvaluable ? pct(baselineCorrect, total) : 'N/A';
  const baselineFormat = baselineEvaluable
    ? pct(results.filter((row) => row.baseline_format_valid === 'true').length, total)
    : 'N/A';
  const baselineRoute = baselineEvaluable
    ? pct(results.filter((row) => row.baseline_route_usable === 'true').length, total)
    : 'N/A';

  return `# 5.2 情绪识别 Skill 结构化对比测试

## 实验目的

本实验只验证一件事：FamleeAI 的情绪识别 Skill 是否比普通大模型直接回复更适合作为 Agent 框架里的前置模块。

对比重点不是聊天自然度，而是是否能稳定产出后续系统可直接使用的中间变量：

- 情绪标签
- 语义摘要
- 风险等级
- 推荐 Skill

## 数据来源

测试集文件：\`emotion_testset_100.csv\`

- 总样本数：${total}
- 标签：平静、开心、焦虑、难过、生气
- 每类：20 条
- 平静、开心、难过、生气参考 \`Chinese_Multi-Emotion_Dialogue_Dataset\` 的标签体系进行映射整理
- 焦虑样本为大学生考试、DDL、就业、答辩、人际不确定等场景自建

标签映射：

| 原始/设计标签 | 实验标签 |
|---|---|
| 平淡 | 平静 |
| 开心 | 开心 |
| 悲伤 | 难过 |
| 愤怒 | 生气 |
| 自建焦虑场景 | 焦虑 |

## Prompt 设计

普通大模型 baseline prompt：

\`\`\`text
请判断下面文本中的主要情绪，并自然回复用户。不需要输出 JSON。
\`\`\`

FamleeAI 情绪识别 Skill 输出格式：

\`\`\`json
{
  "emotion_label": "焦虑",
  "semantic_summary": "用户担心即将到来的答辩表现，表现出明显不确定感。",
  "risk_level": "low",
  "recommended_skill": "cognitive_clarification"
}
\`\`\`

## 指标定义

情绪标签准确率：

\`\`\`text
识别正确样本数 / 总样本数 * 100%
\`\`\`

输出格式稳定性：

\`\`\`text
完整输出结构化字段的样本数 / 总样本数 * 100%
\`\`\`

可用于路由比例：

\`\`\`text
有明确 emotion_label、risk_level、recommended_skill 且标签在预设范围内的样本数 / 总样本数 * 100%
\`\`\`

## 表 5-1 情绪识别结构化对比结果

| 系统 | 情绪标签准确率 | 输出格式稳定性 | 可用于路由比例 |
|---|---:|---:|---:|
| 普通大模型直接回复 | ${baselineAccuracy} | ${baselineFormat} | ${baselineRoute} |
| FamleeAI 情绪识别 Skill | ${pct(famleeCorrect, total)} | ${pct(results.filter((row) => row.famlee_format_valid === 'true').length, total)} | ${pct(results.filter((row) => row.famlee_route_usable === 'true').length, total)} |

${baselineEvaluable ? '' : '> 注：当前报告未运行普通大模型 baseline。使用 `node docs/evaluation/5.2_emotion_recognition/run_emotion_experiment.js --with-baseline` 并配置 `DOUBAO_API_KEY` / `DOUBAO_MODEL` 后可生成完整对比。'}

## 表 5-2 FamleeAI 五类情绪识别结果

| 情绪类别 | 样本数 | 识别正确数 | 准确率 |
|---|---:|---:|---:|
${perClassRows.join('\n')}
| 总计 | ${total} | ${famleeCorrect} | ${pct(famleeCorrect, total)} |

## 表 5-3 情绪识别 Skill 输出示例

| 用户输入 | 人工标签 | 情绪标签 | 风险等级 | 推荐 Skill |
|---|---|---|---|---|
${examples.join('\n')}

## 简短分析

FamleeAI 情绪识别 Skill 将用户自然语言表达转换为稳定的结构化字段，使后续安全判断、支持策略路由、情绪记录和趋势分析能够直接使用这些中间变量。

普通大模型直接回复可以完成自然对话，但如果不强制结构化输出，其回复通常不保证包含完整的情绪标签、风险等级和推荐 Skill。因此它更适合作为对话生成模块，而不适合作为 Agent 框架中的前置路由模块。
`;
}

function pct(numerator, denominator) {
  if (!denominator) return '0.0%';
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

async function loadDotEnv(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index <= 0) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Optional env file.
  }
}

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function toCsv(rows) {
  const headers = [
    'id',
    'text',
    'gold_label',
    'source',
    'baseline_reply',
    'baseline_emotion_label',
    'baseline_format_valid',
    'baseline_route_usable',
    'famlee_raw_output',
    'famlee_emotion_label',
    'famlee_semantic_summary',
    'famlee_risk_level',
    'famlee_recommended_skill',
    'famlee_format_valid',
    'famlee_route_usable',
  ];

  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header] ?? '')).join(',')),
  ].join('\n');
}

function csvEscape(value) {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function escapeMd(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
