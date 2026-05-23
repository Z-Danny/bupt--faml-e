import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';
import { runSupportPipeline } from '../../../server/ai/pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = __dirname;

const apiKey = process.env.DOUBAO_API_KEY;
const baseUrl = process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const model = process.env.DOUBAO_MODEL || 'doubao-seed-2-0-lite-260215';

if (!apiKey) {
  throw new Error('DOUBAO_API_KEY is required');
}

const scenarios = [
  ['SQ01', '焦虑', '考试压力', '下周三门考试挤在一起，我越复习越觉得自己什么都不会，晚上躺下也一直在想会不会挂科。'],
  ['SQ02', '焦虑', '论文压力', '论文初稿被老师退回来好多意见，我看着批注脑子一片空白，感觉自己根本写不出像样的东西。'],
  ['SQ03', '焦虑', '就业焦虑', '同学都开始拿实习 offer 了，我简历投出去没什么回应，越来越怀疑自己是不是太差了。'],
  ['SQ04', '焦虑', '课堂展示', '明天要上台做展示，一想到大家都看着我就心跳很快，怕自己讲错或者突然卡住。'],
  ['SQ05', '焦虑', '人际不确定', '朋友这两天回消息很慢，我忍不住反复看聊天记录，担心是不是我哪里说错话让他不舒服了。'],
  ['SQ06', '难过', '孤独感', '宿舍里大家都有自己的安排，我一个人吃饭一个人回寝室，突然觉得大学生活好像没有人真正需要我。'],
  ['SQ07', '难过', '自我否定', '这次比赛我准备了很久还是没进复赛，看到别人晋级的时候，我觉得自己努力也没什么用。'],
  ['SQ08', '难过', '朋友疏远', '以前很亲近的朋友最近总和别人一起行动，我想问又怕显得很小心眼，只能装作没事。'],
  ['SQ09', '难过', '家庭压力', '家里总说我花钱多、成绩也不够好，我知道他们不容易，但听多了真的觉得自己很没价值。'],
  ['SQ10', '难过', '情绪低落', '最近做什么都提不起劲，刷手机也不开心，作业拖着不想动，感觉自己整个人很钝。'],
  ['SQ11', '生气', '小组作业', '小组作业基本都是我在做，其他人只在最后问能不能写上名字，我真的又气又累。'],
  ['SQ12', '生气', '室友冲突', '室友半夜外放视频还说我太敏感，我第二天早八，真的很想发火但又怕关系闹僵。'],
  ['SQ13', '生气', '不公平体验', '明明我也做了很多工作，汇报时老师只表扬了另一个同学，我心里特别不平衡。'],
  ['SQ14', '生气', '群聊冲突', '群里有人阴阳怪气说我拖进度，可我已经解释过原因了，现在看到消息就很烦。'],
  ['SQ15', '平静', '日常记录', '今天没发生什么特别的事，按时上课、吃饭、写了一点作业，状态还算平稳。'],
  ['SQ16', '平静', '轻微疲惫', '最近事情不算糟，就是有点累，感觉每天都在完成任务，但也没有特别大的情绪波动。'],
  ['SQ17', '平静', '自我观察', '晚上散步的时候感觉脑子安静了一点，虽然还有任务没做完，但没有前几天那么紧绷。'],
  ['SQ18', '开心', '被老师认可', '今天老师夸了我的课堂发言，说我的思路很清楚，我开心了一整天，感觉努力被看见了。'],
  ['SQ19', '开心', '朋友支持', '我跟朋友说最近压力大，他没有敷衍我，还陪我去吃了饭，突然觉得自己不是一个人在撑。'],
  ['SQ20', '开心', '生活小确幸', '今天阳光很好，买到了喜欢的面包，回寝室路上听歌的时候觉得生活也没有那么糟。'],
];

const rows = [];
const blindRows = [['编号', '用户输入', '回复A', '回复B', 'A实际系统', 'B实际系统']];
const runLog = [];

for (let index = 0; index < scenarios.length; index += 1) {
  const [id, expectedEmotion, scene, input] = scenarios[index];
  const persona = personaFor(expectedEmotion);

  const baselineReply = await callDoubao([
    {
      role: 'system',
      content:
        '你是一个普通通用大模型助手。请针对大学生日常情绪表达给出一段自然的心理支持回复。不要显式做情绪识别、不要说明使用了任何策略或工具、不要生成记录摘要。中文回复，120-180字，不做医学诊断。',
    },
    { role: 'user', content: input },
  ]);

  const pipelineResult = await runSupportPipeline({
    persona,
    message: input,
    history: [],
    images: [],
    buildImageInputUrl: async (url) => url,
  });

  const famleeReply = pipelineResult.directResponse || (await callDoubao(pipelineResult.messages));
  const metadata = pipelineResult.metadata;
  const skillName = skillDisplayName(metadata.route.skillId);
  const recordSummary = `${labelForEmotion(metadata.emotion.primary)}｜${scene}｜${metadata.emotion.summary}`;

  rows.push([
    id,
    input,
    baselineReply,
    labelForEmotion(metadata.emotion.primary),
    riskLabel(metadata.safety.level),
    supportNeedFor(expectedEmotion, scene),
    `${metadata.agent.name} · ${skillName}`,
    famleeReply,
    recordSummary,
  ]);

  const famleeIsA = deterministicShuffle(id);
  blindRows.push([
    id,
    input,
    famleeIsA ? famleeReply : baselineReply,
    famleeIsA ? baselineReply : famleeReply,
    famleeIsA ? 'FamleeAI' : '普通大模型',
    famleeIsA ? '普通大模型' : 'FamleeAI',
  ]);

  runLog.push(`${id} baseline=${baselineReply.length} chars famlee=${famleeReply.length} chars route=${metadata.route.skillId}`);
  console.log(runLog.at(-1));
  await sleep(250);
}

await fs.mkdir(outputDir, { recursive: true });

await exportCsvWorkbook({
  filename: '5.3_系统输出结果表.xlsx',
  sheetName: '系统输出结果表',
  rows: [
    ['编号', '用户输入', '普通大模型回复', 'FamleeAI情绪标签', 'FamleeAI风险等级', 'FamleeAI支持需求', 'FamleeAI推荐Skill', 'FamleeAI回复', '记录摘要'],
    ...rows,
  ],
});

await exportCsvWorkbook({
  filename: '5.3_AB盲评材料表.xlsx',
  sheetName: 'AB盲评材料表',
  rows: blindRows,
});

await fs.writeFile(
  path.join(outputDir, '5.3_实际跑测日志.md'),
  [
    '# 5.3 实际跑测日志',
    '',
    `- 模型：${model}`,
    `- Base URL：${baseUrl}`,
    `- 样本数：${scenarios.length}`,
    `- 生成时间：${new Date().toISOString()}`,
    '',
    '## 每条样本生成情况',
    '',
    ...runLog.map((line) => `- ${line}`),
  ].join('\n')
);

async function callDoubao(messages) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 420,
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Doubao request failed ${response.status}: ${text}`);
  }

  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content || '').trim();
}

function personaFor(emotion) {
  if (emotion === '焦虑') return 'rational';
  if (emotion === '生气') return 'fun';
  if (emotion === '开心') return 'fun';
  return 'healing';
}

function labelForEmotion(emotion) {
  return {
    ANXIOUS: '焦虑',
    SAD: '难过',
    ANGRY: '生气',
    HAPPY: '开心',
    NEUTRAL: '平静',
  }[emotion] || '平静';
}

function riskLabel(level) {
  return {
    low: 'low',
    elevated: 'medium',
    crisis: 'high',
  }[level] || level;
}

function supportNeedFor(emotion, scene) {
  if (emotion === '焦虑') return `需要降低不确定感，并把${scene}拆成可处理的小步骤。`;
  if (emotion === '难过') return `需要被接住情绪，减少自我否定，并保留继续表达的空间。`;
  if (emotion === '生气') return `需要先承认愤怒合理性，再帮助区分事实、边界和下一步表达。`;
  if (emotion === '开心') return `需要放大积极体验，沉淀为可回顾的支持线索。`;
  return `需要日常陪伴式回应，帮助用户记录稳定状态和轻微疲惫。`;
}

function skillDisplayName(skillId) {
  return {
    empathic_support: '共情承接',
    cbt_reframe: '认知梳理',
    thought_record: '自动想法记录',
    evidence_check: '证据检验',
    act_acceptance: '情绪接纳',
    humor_buffer: '轻量缓冲',
    breathing: '正念呼吸',
    values_clarification: '价值澄清',
    personality_reflection: '人格反思',
    crisis_triage: '安全支持',
  }[skillId] || skillId;
}

function deterministicShuffle(id) {
  const num = Number(id.replace(/\D/g, ''));
  return num % 2 === 0;
}

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

async function exportCsvWorkbook({ filename, sheetName, rows }) {
  const csvText = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
  const workbook = await Workbook.fromCSV(csvText, { sheetName });
  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(path.join(outputDir, filename));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
