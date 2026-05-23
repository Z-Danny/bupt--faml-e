# 5.2 Emotion Recognition Evaluation

本目录用于支持论文第 5.2 节“情绪识别 Skill 结构化对比测试”。

## Files

| 文件 | 说明 |
|---|---|
| `emotion_testset_100.csv` | 100 条五类情绪测试样本，每类 20 条 |
| `emotion_recognition_raw_results.csv` | 普通大模型与 FamleeAI 情绪识别 Skill 的原始输出对比 |
| `emotion_recognition_report.md` | 可放入论文的实验目的、指标、结果表和简短分析 |
| `run_emotion_experiment.js` | 运行 5.2 实验并生成结果与报告的脚本 |

## Run

```bash
node docs/evaluation/5.2_emotion_recognition/run_emotion_experiment.js
```

如需重新生成普通大模型 baseline，对服务端配置 `DOUBAO_API_KEY` / `DOUBAO_MODEL` 后运行：

```bash
node docs/evaluation/5.2_emotion_recognition/run_emotion_experiment.js --with-baseline
```

## Notes

- 本实验关注结构化中间变量是否稳定，不评价心理支持回复质量。
- FamleeAI 输出字段包括 `emotion_label`、`semantic_summary`、`risk_level`、`recommended_skill`，用于后续安全保护与策略路由。
