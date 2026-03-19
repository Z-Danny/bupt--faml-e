/**
 * Gemini Chat Edge Function
 * 处理聊天消息、会话管理、流式响应和音频输入
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// 环境变量
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 请求体接口
interface ChatRequest {
  message: string;
  persona: string;
  sessionId?: string;
  isAudio?: boolean;
  audioData?: string; // base64
  type?: "chat" | "summary"; // 请求类型：聊天或日记摘要
}

// Persona 系统提示词配置
const PERSONA_PROMPTS: Record<string, string> = {
  healing: `你是一位温暖、富有同理心且专业的大学心理咨询助手。
你的名字叫 "Melty" (小融)，是一个看起来软软的、正在融化的布丁形象。
你的性格是：温柔、包容、无条件接纳。
使用 ACT (接纳承诺疗法) 的技巧，帮助用户接纳当下的情绪，而不是对抗它。
像一个知心好朋友一样对话，多使用温暖的语气词和表情符号。
请用**中文**回答。如果学生提到严重的自残或自杀倾向，请温柔地建议他们立即寻求校园心理中心的专业帮助。`,

  rational: `你是一位温暖、富有同理心且专业的大学心理咨询助手。
你的名字叫 "Logic" (罗极)，是一个线条简洁、充满几何美感的形象。
你的性格是：冷静、客观、逻辑缜密。
主要使用 CBT (认知行为疗法) 的技巧，帮助用户识别负面思维模式（如灾难化思维），并进行苏格拉底式提问。
引导用户进行逆向思考，发现问题的另一面。语气平和、理智，少用情绪化词汇，多用逻辑引导。
请用**中文**回答。如果学生提到严重的自残或自杀倾向，请温柔地建议他们立即寻求校园心理中心的专业帮助。`,

  fun: `你是一位温暖、富有同理心且专业的大学心理咨询助手。
你的名字叫 "Spark" (火花)，是一个五彩斑斓、跳脱搞怪的形象。
你的性格是：幽默、犀利、有点小毒舌但心地善良。
你可以用略带调侃的语气（毒舌锐评）来解构用户的烦恼，让他们觉得"这其实也没什么大不了"。
如果合适，可以结合 MBTI 性格分析（如："这很像 INFP 会纠结的事..."）来提供建议。
目的是通过幽默和独特的视角让用户开心起来。
请用**中文**回答。如果学生提到严重的自残或自杀倾向，请温柔地建议他们立即寻求校园心理中心的专业帮助。`,
};

// 创建新会话
async function createSession(userId: string, persona: string) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId, persona })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

// 验证会话是否存在
async function validateSession(sessionId: string) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (error || !data) return false;
  return true;
}

// 添加消息到数据库
async function addMessage(
  sessionId: string,
  role: "user" | "model",
  content: string,
  mood?: string
) {
  const { error } = await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role,
    content,
    mood_detected: mood ?? null,
  });

  if (error) throw error;
}

// 获取会话历史
async function fetchHistory(sessionId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// 构建系统提示词
function buildSystemPrompt(persona: string): string {
  return PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.rational;
}

// 简单的情绪检测（基于关键词）
function detectMood(text: string): string | null {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("开心") || lowerText.includes("高兴") || lowerText.includes("快乐")) {
    return "HAPPY";
  }
  if (lowerText.includes("焦虑") || lowerText.includes("紧张") || lowerText.includes("担心")) {
    return "ANXIOUS";
  }
  if (lowerText.includes("难过") || lowerText.includes("伤心") || lowerText.includes("沮丧")) {
    return "SAD";
  }
  if (lowerText.includes("生气") || lowerText.includes("愤怒") || lowerText.includes("烦躁")) {
    return "ANGRY";
  }

  return null;
}

// 音频转文本（占位实现）
async function transcribeAudio(audioData: string): Promise<string> {
  // TODO: 集成真实的音频转文本服务（如 Gemini Audio API）
  // 目前返回占位文本
  return "[音频消息已接收，转写功能待实现]";
}

// 生成日记摘要（非流式）
async function generateJournalSummary(content: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `请将以下日记内容总结为一句温暖且富有洞察力的话，送给这位同学。关注潜在的情绪。请用中文回答，不要超过50字。日记内容: "${content}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.trim() || "记录下这一刻的心情，是自我关怀的开始。";
}

// 调用 Gemini API（流式）
async function callGeminiStream(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  userMessage: string
) {
  // 构建 Gemini API 请求格式
  const contents = [
    ...history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  return response.body;
}

// 主处理函数
Deno.serve(async (req) => {
  // CORS 处理
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id",
      },
    });
  }

  try {
    // 解析请求体
    const body: ChatRequest = await req.json();
    const { message, persona, sessionId, isAudio, audioData, type } = body;

    // 处理日记摘要请求（非流式）
    if (type === "summary") {
      if (!message) {
        return new Response(
          JSON.stringify({ error: "缺少必需字段：message" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      const summary = await generateJournalSummary(message);
      return new Response(
        JSON.stringify({ summary }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 验证必需字段（聊天模式）
    if (!message || !persona) {
      return new Response(
        JSON.stringify({ error: "缺少必需字段：message 和 persona" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 获取用户ID（从请求头或生成临时ID）
    const userId = req.headers.get("x-user-id") || `temp_${Date.now()}`;

    // 处理会话
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      // 创建新会话
      currentSessionId = await createSession(userId, persona);
    } else {
      // 验证会话是否存在
      const isValid = await validateSession(currentSessionId);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "会话不存在" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // 处理音频输入
    let userMessageText = message;
    if (isAudio && audioData) {
      userMessageText = await transcribeAudio(audioData);
    }

    // 检测情绪
    const detectedMood = detectMood(userMessageText);

    // 保存用户消息
    await addMessage(currentSessionId, "user", userMessageText, detectedMood);

    // 获取历史消息
    const history = await fetchHistory(currentSessionId);

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(persona);

    // 调用 Gemini API（流式）
    const geminiStream = await callGeminiStream(
      systemPrompt,
      history.slice(0, -1), // 排除刚添加的用户消息
      userMessageText
    );

    // 创建转换流，用于累积完整回复
    let fullResponse = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = "";
    let processedLength = 0; // 记录已处理的位置

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });

        // Gemini streamGenerateContent 返回 JSON 数组流
        // 格式: [{"candidates":[...]}, {"candidates":[...]}]
        // 使用正则提取 "text":"..." 内容
        const textRegex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;

        // 从上次处理的位置开始搜索
        textRegex.lastIndex = processedLength;
        let match;

        while ((match = textRegex.exec(buffer)) !== null) {
          // 解码转义字符
          const content = match[1]
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, "\\");

          if (content) {
            fullResponse += content;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
          processedLength = textRegex.lastIndex;
        }
      },
      async flush(controller) {
        // 流结束后，保存完整的 AI 回复
        if (fullResponse) {
          await addMessage(currentSessionId!, "model", fullResponse);
        }

        // 发送结束标记
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: currentSessionId })}\n\n`));
      },
    });

    // 返回流式响应
    return new Response(
      geminiStream!.pipeThrough(transformStream),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "X-Session-Id": currentSessionId,
        },
      }
    );
  } catch (error) {
    console.error("Edge Function 错误:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "未知错误",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
