const EMOTION_PATTERNS = [
  { emotion: 'SAD', tags: ['难过', '低落'], pattern: /(难过|難過|难受|難受|伤心|傷心|悲伤|悲傷|沮丧|沮喪|崩溃|崩潰|没意思|沒意思|空虚|空虛|委屈|想哭|撑不住|撐不住|失望|低落|沒自信|没自信|去世|過世|死了|走丢|走丟|枯萎|關門|关门|要關了|要关了|吵架|犯了.*错误|犯了.*錯誤|搞砸|移民|难见面|難見面|没有得到回报|沒有得到回報|好累|心情很差|提不起勁|提不起劲|失去.*方向|不順利|不顺利|沒人理|没人理)/ },
  { emotion: 'ANXIOUS', tags: ['焦虑', '担心'], pattern: /(焦虑|焦慮|紧张|緊張|担心|擔心|害怕|好怕|很怕|怕.*(考|面试|面試|答辩|答辯|报告|報告|通過|通过|不够|不夠|讲错|講錯|卡住)|會不會答不上來|会不会答不上来|不安|慌|心慌|失眠|压力|壓力|考砸|挂科|掛科|来不及|來不及|批注|批註|脑子一片空白|腦子一片空白|写不出|寫不出|简历|簡歷|offer|没什么回应|沒什麼回應|怀疑自己|懷疑自己|上台|展示|心跳很快|回消息很慢|反复看聊天记录|反覆看聊天記錄)/ },
  { emotion: 'ANGRY', tags: ['愤怒', '烦躁'], pattern: /(生气|生氣|愤怒|憤怒|烦躁|煩躁|火大|受不了|受夠|受够|讨厌|討厭|氣死|气死|想骂|想罵|不爽|沒禮貌|没礼貌|打斷|打断|插.*隊|插.*队|被罵|被骂|被忽略|拖延|推給我|推给我|每次都是我|害我|背後說|背后说|不做事|後悔跟|后悔跟|盗用|盜用|乱丢垃圾|亂丟垃圾|偷了|一直做错|一直做錯|不想理)/ },
  { emotion: 'HAPPY', tags: ['开心', '积极'], pattern: /(开心|開心|高兴|高興|快乐|快樂|顺利|順利|舒服|轻松|輕鬆|期待|棒|終於|终于|甄选上|甄選上|赢了|贏了|出国玩|出國玩|圣诞节|聖誕節|好朋友.*旁边|好朋友.*旁邊|錄取|录取|完成|第一名|爽|好消息|很好的消息|表扬|表揚|拿到.*证书|拿到.*證書|中了|升主管|接受了|學會|学会)/ },
];

const RISK_PATTERNS = [
  { signal: 'self_harm', pattern: /(自杀|想死|不想活|结束生命|割腕|跳楼|吃药死|了结自己|活不下去)/ },
  { signal: 'harm_others', pattern: /(杀了他|伤害别人|报复|弄死|想打死|同归于尽)/ },
  { signal: 'severe_distress', pattern: /(撑不住|崩溃了|彻底完了|没有希望|没人能帮我)/ },
];

export function recognizeEmotion({ message = '', images = [] }) {
  const text = String(message);
  const matched = EMOTION_PATTERNS.find((item) => item.pattern.test(text));
  const riskSignals = RISK_PATTERNS.filter((item) => item.pattern.test(text)).map((item) => item.signal);
  const tags = new Set(matched?.tags || []);

  if (images.length > 0) {
    tags.add('image_context');
  }

  return {
    primary: matched?.emotion || 'NEUTRAL',
    tags: [...tags],
    summary: summarizeText(text, images),
    riskSignals,
    confidence: matched ? 0.72 : 0.42,
    modality: {
      hasText: text.trim().length > 0,
      imageCount: images.length,
    },
  };
}

function summarizeText(text, images) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean && images.length > 0) return `用户上传了 ${images.length} 张图片，希望获得情绪或内容支持。`;
  if (!clean) return '用户未提供明确文本。';
  return clean.length > 90 ? `${clean.slice(0, 90)}...` : clean;
}
