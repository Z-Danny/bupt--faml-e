# 5.3 Response Quality Evaluation

本目录用于支持论文第 5.3 节“支持回复质量对比测试”。

## Files

| 文件 | 说明 |
|---|---|
| `5.3_测试场景表.xlsx` | 20 条大学生日常情绪表达测试样本 |
| `5.3_系统输出结果表.xlsx` | 普通大模型回复、FamleeAI 情绪标签、推荐 Skill、回复与记录摘要 |
| `5.3_AB盲评材料表.xlsx` | A/B 盲评材料与真实系统映射，供研究者汇总使用 |
| `5.3_专家盲评表.xlsx` | 可发给人工评审者填写的盲评表 |
| `5.3_专家盲评表_AI自动评分.xlsx` | 豆包自动盲评后的评分明细 |
| `5.3_评分统计表.xlsx` | 五个评价维度的均值统计 |
| `5.3_支持回复质量对比测试报告.md` | 可放入论文的 5.3 小节报告 |
| `5.3_实际跑测日志.md` | 实际调用模型生成输出的过程记录 |
| `5.3_AI自动评分日志.md` | 使用豆包进行 A/B 自动评分的过程记录 |
| `run_5_3_evaluation.mjs` | 生成普通大模型与 FamleeAI 两组回复 |
| `build_5_3_blind_review_from_outputs.mjs` | 从输出结果生成 A/B 盲评表 |
| `run_5_3_ai_judge.mjs` | 调用豆包对盲评材料进行自动评分 |

## Run

```bash
node docs/evaluation/5.3_response_quality/run_5_3_evaluation.mjs
node docs/evaluation/5.3_response_quality/build_5_3_blind_review_from_outputs.mjs
node docs/evaluation/5.3_response_quality/run_5_3_ai_judge.mjs
```

## Notes

- 当前评分统计来自豆包自动盲评，不等同于真实人工专家评分。
- 论文中如果写“专家评审”，需要使用 `5.3_专家盲评表.xlsx` 重新收集人工评分后再替换统计结果。
- FamleeAI 组体现的流程是：情绪识别 Skill -> 支持需求判断 -> Skill 路由 -> 支持回复 -> 记录摘要。
