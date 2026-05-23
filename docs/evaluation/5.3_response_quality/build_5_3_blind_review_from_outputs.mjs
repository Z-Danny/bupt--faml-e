import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FileBlob, SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = __dirname;

const source = await FileBlob.load(path.join(outputDir, '5.3_AB盲评材料表.xlsx'));
const sourceWorkbook = await SpreadsheetFile.importXlsx(source);
const table = await sourceWorkbook.inspect({
  kind: 'table',
  range: 'AB盲评材料表!A1:F21',
  include: 'values',
  tableMaxRows: 25,
  tableMaxCols: 6,
});
const values = JSON.parse(table.ndjson).values;
const dataRows = values.slice(1);

const reviewers = ['R1', 'R2', 'R3'];
const reviewRows = [
  ['评审者', '编号', '用户输入', '回复版本', '回复内容', '情绪贴合度', '策略匹配性', '非评判性', '继续倾诉意愿', '记录与反思价值', '备注'],
];

for (const reviewer of reviewers) {
  for (const [id, input, replyA, replyB] of dataRows) {
    reviewRows.push([reviewer, id, input, 'A', replyA, '', '', '', '', '', '']);
    reviewRows.push([reviewer, id, input, 'B', replyB, '', '', '', '', '', '']);
  }
}

await exportCsvWorkbook({
  filename: '5.3_专家盲评表.xlsx',
  sheetName: '专家盲评表',
  rows: reviewRows,
});

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
