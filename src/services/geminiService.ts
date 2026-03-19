import { getUserId } from '../lib/supabaseClient';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export interface StreamChunk {
  text: string;
  done: boolean;
  sessionId?: string;
}

const assertEnv = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase Edge Function credentials are missing.");
  }
};

const parseChunkLine = (
  line: string
): { text: string; done: boolean; sessionId?: string } => {
  try {
    // 处理 SSE 格式：移除 "data: " 前缀
    const jsonStr = line.startsWith("data: ") ? line.slice(6) : line;
    if (!jsonStr.trim()) return { text: "", done: false };

    const parsed = JSON.parse(jsonStr);
    return {
      // Edge Function 返回 content 字段，映射到 text
      text: parsed?.content ?? parsed?.text ?? "",
      done: Boolean(parsed?.done),
      sessionId: parsed?.sessionId,
    };
  } catch {
    return { text: "", done: false };
  }
};

export const streamChat = async (
  message: string,
  persona: string,
  sessionId?: string,
  isAudio?: boolean,
  audioData?: string,
  onChunk?: (chunk: StreamChunk) => void
): Promise<void> => {
  assertEnv();

  if (!message) throw new Error("message is required");
  if (!persona) throw new Error("persona is required");
  if (!onChunk) throw new Error("onChunk callback is required");

  const response = await fetch(`${supabaseUrl}/functions/v1/gemini-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      "x-user-id": getUserId(),
    },
    body: JSON.stringify({
      message,
      persona,
      sessionId,
      isAudio,
      audioData,
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "Unable to read body");
    throw new Error(`Edge Function request failed: ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const headerSessionId = response.headers.get("X-Session-Id") || undefined;
  let resolvedSessionId = headerSessionId || sessionId;
  let buffer = "";
  let finished = false;

  const emit = (text: string, done: boolean, chunkSessionId?: string) => {
    if (chunkSessionId && !resolvedSessionId) {
      resolvedSessionId = chunkSessionId;
    }
    onChunk({
      text,
      done,
      sessionId: resolvedSessionId ?? chunkSessionId,
    });
    if (done) finished = true;
  };

  const flushLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const { text, done, sessionId: chunkSessionId } = parseChunkLine(trimmed);
    if (text || done) {
      emit(text, done, chunkSessionId);
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    const decoded = value ? decoder.decode(value, { stream: !done }) : "";
    buffer += decoded;

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) > -1) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      flushLine(line);
    }

    if (done) {
      if (buffer.trim()) flushLine(buffer);
      if (!finished) emit("", true);
      break;
    }
  }
};

export const generateJournalSummary = async (entry: string): Promise<string> => {
  try {
    assertEnv();

    const response = await fetch(`${supabaseUrl}/functions/v1/gemini-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
        "x-user-id": getUserId(),
      },
      body: JSON.stringify({
        message: entry,
        type: "summary",
      }),
    });

    if (!response.ok) {
      throw new Error(`Edge Function error: ${response.status}`);
    }

    const data = await response.json();
    return data.summary || "暂时无法生成总结。";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "暂时无法连接到 AI。";
  }
};

export const blobToB64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const base64Content = base64data.split(",")[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

