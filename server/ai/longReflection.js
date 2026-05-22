export function buildReflectionContext({ recentJournals = [], recentEmotionEvents = [] }) {
  const parts = [];

  if (recentJournals.length > 0) {
    const journalBrief = recentJournals
      .slice(0, 3)
      .map((item) => {
        const summary = item.summary || item.content;
        return `- ${item.mood || 'NEUTRAL'}：${String(summary || '').replace(/\s+/g, ' ').slice(0, 80)}`;
      })
      .join('\n');
    parts.push(`近期日记线索：\n${journalBrief}`);
  }

  if (recentEmotionEvents.length > 0) {
    const counts = recentEmotionEvents.reduce((acc, item) => {
      const key = item.primary_emotion || 'NEUTRAL';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    parts.push(
      `近期情绪趋势：${Object.entries(counts)
        .map(([emotion, count]) => `${emotion} ${count}次`)
        .join('，')}`
    );
  }

  return {
    summary: parts.join('\n\n'),
  };
}
