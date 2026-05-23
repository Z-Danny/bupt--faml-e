import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FileBlob, SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = __dirname;

const apiKey = process.env.DOUBAO_API_KEY;
const baseUrl = process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const model = process.env.DOUBAO_MODEL || 'doubao-seed-2-0-lite-260215';

if (!apiKey) throw new Error('DOUBAO_API_KEY is required');

const abRows = await readSheetRows('5.3_AB盲评材料表.xlsx', 'AB盲评材料表!A1:F21', 21, 6);
const samples = abRows.slice(1).map(([id, input, replyA, replyB, systemA, systemB]) => ({
  id,
  input,
  replyA,
  replyB,
  systemA,
  systemB,
}));

const allReviewRows = [
  ['评审者', '编号', '用户输入', '回复版本', '回复内容', '情绪贴合度', '策略匹配性', '非评判性', '继续倾诉意愿', '记录与反思价值', '备注'],
];
const scoreRows = [];
const judgeLogs = [];

for (const sample of samples) {
  const judged = await judgeSample(sample);
  for (const roleReview of judged.reviews) {
    for (const version of ['A', 'B']) {
      const scores = roleReview[version];
      const reply = version === 'A' ? sample.replyA : sample.replyB;
      const system = version === 'A' ? sample.systemA : sample.systemB;
      allReviewRows.push([
        roleReview.reviewer,
        sample.id,
        sample.input,
        version,
        reply,
        scores.emotionFit,
        scores.strategyMatch,
        scores.nonJudgment,
        scores.continuationWillingness,
        scores.recordReflectionValue,
        scores.note,
      ]);
      scoreRows.push({
        system,
        emotionFit: scores.emotionFit,
        strategyMatch: scores.strategyMatch,
        nonJudgment: scores.nonJudgment,
        continuationWillingness: scores.continuationWillingness,
        recordReflectionValue: scores.recordReflectionValue,
      });
    }
  }
  judgeLogs.push(`${sample.id} judged`);
  console.log(judgeLogs.at(-1));
  await sleep(250);
}

const stats = computeStats(scoreRows);
const improvement = [
  ['指标', '普通大模型', 'FamleeAI', '提升'],
  ...[
    ['情绪贴合度', 'emotionFit'],
    ['策略匹配性', 'strategyMatch'],
    ['非评判性', 'nonJudgment'],
    ['继续倾诉意愿', 'continuationWillingness'],
    ['记录与反思价值', 'recordReflectionValue'],
  ].map(([label, key]) => [
    label,
    round2(stats['普通大模型'][key]),
    round2(stats.FamleeAI[key]),
    round2(stats.FamleeAI[key] - stats['普通大模型'][key]),
  ]),
];

await exportCsvWorkbook({
  filename: '5.3_专家盲评表_AI自动评分.xlsx',
  sheetName: 'AI自动评分',
  rows: allReviewRows,
});

await exportCsvWorkbook({
  filename: '5.3_评分统计表.xlsx',
  sheetName: '评分统计表',
  rows: [
    ['系统', '情绪贴合度均值', '策略匹配性均值', '非评判性均值', '继续倾诉意愿均值', '记录与反思价值均值'],
    [
      '普通大模型',
      round2(stats['普通大模型'].emotionFit),
      round2(stats['普通大模型'].strategyMatch),
      round2(stats['普通大模型'].nonJudgment),
      round2(stats['普通大模型'].continuationWillingness),
      round2(stats['普通大模型'].recordReflectionValue),
    ],
    [
      'FamleeAI',
      round2(stats.FamleeAI.emotionFit),
      round2(stats.FamleeAI.strategyMatch),
      round2(stats.FamleeAI.nonJudgment),
      round2(stats.FamleeAI.continuationWillingness),
      round2(stats.FamleeAI.recordReflectionValue),
    ],
    [],
    ...improvement,
    [],
    ['说明', '本表为豆包模型自动盲评统计结果，不等同于人工专家评分。'],
  ],
});

await fs.writeFile(
  path.join(outputDir, '5.3_AI自动评分日志.md'),
  [
    '# 5.3 AI 自动评分日志',
    '',
    `- 评审模型：${model}`,
    `- Base URL：${baseUrl}`,
    `- 样本数：${samples.length}`,
    '- 评审角色：R1 心理/学生工作视角，R2 HCI/交互设计视角，R3 AI/数字媒体视角',
    `- 生成时间：${new Date().toISOString()}`,
    '',
    '## 评分统计',
    '',
    '| 系统 | 情绪贴合度 | 策略匹配性 | 非评判性 | 继续倾诉意愿 | 记录与反思价值 |',
    '|---|---:|---:|---:|---:|---:|',
    `| 普通大模型 | ${round2(stats['普通大模型'].emotionFit)} | ${round2(stats['普通大模型'].strategyMatch)} | ${round2(stats['普通大模型'].nonJudgment)} | ${round2(stats['普通大模型'].continuationWillingness)} | ${round2(stats['普通大模型'].recordReflectionValue)} |`,
    `| FamleeAI | ${round2(stats.FamleeAI.emotionFit)} | ${round2(stats.FamleeAI.strategyMatch)} | ${round2(stats.FamleeAI.nonJudgment)} | ${round2(stats.FamleeAI.continuationWillingness)} | ${round2(stats.FamleeAI.recordReflectionValue)} |`,
    '',
    '## 每条样本',
    '',
    ...judgeLogs.map((line) => `- ${line}`),
  ].join('\n')
);

async function readSheetRows(filename, range, rows, cols) {
  const file = await FileBlob.load(path.join(outputDir, filename));
  const workbook = await SpreadsheetFile.importXlsx(file);
  const inspected = await workbook.inspect({
    kind: 'table',
    range,
    include: 'values',
    tableMaxRows: rows,
    tableMaxCols: cols,
  });
  return JSON.parse(inspected.ndjson).values;
}

async function judgeSample(sample) {
  const prompt = `
你是心理支持产品回复质量评审助手。请对同一位大学生用户输入下的回复A和回复B进行盲评。
不要猜测哪个系统生成，只根据回复质量评分。

评分范围：1-5 分，分数越高越好。
维度：
- emotionFit: 情绪贴合度，是否准确回应用户当前情绪
- strategyMatch: 策略匹配性，是否采用合适支持方式，如共情、梳理、缓冲
- nonJudgment: 非评判性，是否避免说教、诊断、命令式建议
- continuationWillingness: 继续倾诉意愿，是否让用户愿意继续表达
- recordReflectionValue: 记录与反思价值，是否能沉淀为后续情绪记录或反思材料

请分别模拟三类评审者：
- R1 心理/辅导员/学生工作相关背景
- R2 交互设计/HCI相关背景
- R3 AI/计算机/数字媒体相关背景

用户输入：
${sample.input}

回复A：
${sample.replyA}

回复B：
${sample.replyB}

只输出严格 JSON，不要 markdown，不要解释：
{
  "reviews": [
    {
      "reviewer": "R1",
      "A": {"emotionFit": 1, "strategyMatch": 1, "nonJudgment": 1, "continuationWillingness": 1, "recordReflectionValue": 1, "note": "不超过30字"},
      "B": {"emotionFit": 1, "strategyMatch": 1, "nonJudgment": 1, "continuationWillingness": 1, "recordReflectionValue": 1, "note": "不超过30字"}
    }
  ]
}
  `.trim();

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const text = await callDoubao([
      { role: 'system', content: '你只输出合法 JSON。' },
      { role: 'user', content: prompt },
    ]);
    try {
      const parsed = JSON.parse(extractJson(text));
      if (Array.isArray(parsed.reviews) && parsed.reviews.length === 3) return normalizeJudgment(parsed);
    } catch {
      if (attempt === 3) throw new Error(`Failed to parse judge JSON for ${sample.id}: ${text}`);
    }
  }
}

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
      temperature: 0.2,
      max_tokens: 1400,
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Doubao judge failed ${response.status}: ${text}`);
  }

  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content || '').trim();
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found');
  return match[0];
}

function normalizeJudgment(parsed) {
  const reviewers = ['R1', 'R2', 'R3'];
  return {
    reviews: reviewers.map((reviewer, index) => {
      const item = parsed.reviews.find((entry) => entry.reviewer === reviewer) || parsed.reviews[index];
      return {
        reviewer,
        A: normalizeScores(item.A),
        B: normalizeScores(item.B),
      };
    }),
  };
}

function normalizeScores(scores) {
  return {
    emotionFit: clampScore(scores.emotionFit),
    strategyMatch: clampScore(scores.strategyMatch),
    nonJudgment: clampScore(scores.nonJudgment),
    continuationWillingness: clampScore(scores.continuationWillingness),
    recordReflectionValue: clampScore(scores.recordReflectionValue),
    note: String(scores.note || '').slice(0, 40),
  };
}

function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 3;
  return Math.min(5, Math.max(1, Math.round(number)));
}

function computeStats(rows) {
  const systems = {
    '普通大模型': [],
    FamleeAI: [],
  };
  for (const row of rows) {
    systems[row.system].push(row);
  }
  return Object.fromEntries(
    Object.entries(systems).map(([system, items]) => [
      system,
      {
        emotionFit: average(items, 'emotionFit'),
        strategyMatch: average(items, 'strategyMatch'),
        nonJudgment: average(items, 'nonJudgment'),
        continuationWillingness: average(items, 'continuationWillingness'),
        recordReflectionValue: average(items, 'recordReflectionValue'),
      },
    ])
  );
}

function average(items, key) {
  return items.reduce((sum, item) => sum + item[key], 0) / items.length;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

async function exportCsvWorkbook({ filename, sheetName, rows }) {
  const csvText = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
  const workbook = await Workbook.fromCSV(csvText, { sheetName });
  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(path.join(outputDir, filename));
}

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
