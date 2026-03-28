import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message } from "../lib/types";
import { sendMessage, loadHistory, clearHistory } from "../lib/api";

const SESSION_KEY = "moodspa_session_id";

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) { id = uuidv4(); localStorage.setItem(SESSION_KEY, id); }
  return id;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState<string>(getOrCreateSessionId);
  const [ready, setReady] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory(sessionId).then((history) => {
      if (history.length > 0) {
        setMessages(history.map((m) => ({
          id: uuidv4(), role: m.role, content: m.content, timestamp: new Date(),
        })));
      }
      setReady(true);
    });
  }, [sessionId]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: uuidv4(), role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const aiId = uuidv4();
    setMessages((prev) => [...prev, { id: aiId, role: "assistant", content: "", timestamp: new Date() }]);

    try {
      const reader = await sendMessage(text.trim(), sessionId);
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: full } : m));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: `⚠️ ${msg}` } : m));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const clear = useCallback(async () => {
    await clearHistory(sessionId);
    setMessages([]);
  }, [sessionId]);

  return { messages, isLoading, send, clear, ready };
}
