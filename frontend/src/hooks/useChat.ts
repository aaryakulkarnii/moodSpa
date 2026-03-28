import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message } from "../lib/types";
import { sendMessage, loadHistory, clearHistory } from "../lib/api";

const SESSION_KEY = "moodspa_session_id";
const LANG_KEY = "moodspa_lang";

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) { id = uuidv4(); localStorage.setItem(SESSION_KEY, id); }
  return id;
}

// Detect language from text
function detectLang(text: string): string {
  // Hindi unicode range
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
  // Marathi (same script as Hindi but different patterns)
  if (/[\u0900-\u097F]/.test(text)) return "mr-IN";
  return localStorage.getItem(LANG_KEY) || "en-IN";
}

function speak(text: string, lang: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  // Strip markdown for cleaner speech
  const clean = text.replace(/[*_`#>\-]/g, "").replace(/\n+/g, ". ");
  const utt = new SpeechSynthesisUtterance(clean);
  utt.lang = lang;
  utt.rate = 0.95;
  utt.pitch = 1.05;
  window.speechSynthesis.speak(utt);
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState<string>(getOrCreateSessionId);
  const [ready, setReady] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [detectedLang, setDetectedLang] = useState("en-IN");
  const ttsRef = useRef(ttsEnabled);
  ttsRef.current = ttsEnabled;

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

    const lang = detectLang(text);
    setDetectedLang(lang);

    const userMsg: Message = { id: uuidv4(), role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const aiId = uuidv4();
    setMessages((prev) => [...prev, { id: aiId, role: "assistant", content: "", timestamp: new Date() }]);

    try {
      const reader = await sendMessage(text.trim(), sessionId, lang);
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: full } : m));
      }

      // Speak the response if TTS is on
      if (ttsRef.current && full) speak(full, lang);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: `⚠️ ${msg}` } : m));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const clear = useCallback(async () => {
    window.speechSynthesis?.cancel();
    await clearHistory(sessionId);
    setMessages([]);
  }, [sessionId]);

  const toggleTts = useCallback(() => {
    setTtsEnabled((v) => {
      if (v) window.speechSynthesis?.cancel();
      return !v;
    });
  }, []);

  return { messages, isLoading, send, clear, ready, ttsEnabled, toggleTts, detectedLang };
}