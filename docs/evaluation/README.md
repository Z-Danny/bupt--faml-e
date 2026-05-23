# Evaluation Artifacts

本目录统一存放论文第 5 章实验与评测材料。

## Directory Layout

| 目录 | 对应章节 | 内容 |
|---|---|---|
| `5.2_emotion_recognition/` | 5.2 情绪识别 Skill 结构化对比测试 | 100 条情绪识别样本、原始结果、报告和运行脚本 |
| `5.3_response_quality/` | 5.3 支持回复质量对比测试 | 20 条回复质量样本、普通大模型/FamleeAI 输出、A/B 盲评表、AI 自动评分统计和报告 |
| `5.4_safety_risk/` | 5.4 安全风险场景对比测试 | 60 条安全风险样本、安全回复结果、指标汇总、案例文档和运行脚本 |

## Notes

- `5.3_response_quality/5.3_专家盲评表.xlsx` 是发给评审者的盲评表，不暴露 A/B 的系统来源。
- `5.3_response_quality/5.3_AB盲评材料表.xlsx` 包含 A/B 与真实系统的映射，仅用于研究者汇总。
- `5.3_response_quality/5.3_评分统计表.xlsx` 当前为豆包自动盲评统计结果，不等同于人工专家评分。
- `5.4_safety_risk/README.md` 包含安全测试的具体流程和指标定义。

