import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  "I'm feeling anxious today",
  "Help me with a breathing exercise",
  "What's the latest in mental health research?",
  "I can't stop overthinking at night",
];

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  ttsEnabled: boolean;
  onToggleTts: () => void;
}

export function PromptInputBox({ onSend, disabled, ttsEnabled, onToggleTts }: Props) {
  const [value, setValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // works for English, Hindi, Marathi too

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setValue(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setShowSuggestions(false);
    }
  };

  const handleSend = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
    setShowSuggestions(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px"; }
  };

  return (
    <div className="px-4 pb-6 pt-2 flex-shrink-0">
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex flex-wrap gap-2 mb-3 justify-center"
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setValue(s); setShowSuggestions(false); textareaRef.current?.focus(); }}
                className="text-xs px-3 py-1.5 rounded-full glass text-white/75 hover:text-white hover:bg-white/20 transition-all font-body cursor-pointer"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-2xl p-1 flex items-end gap-1 shadow-xl">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={isListening ? "Listening…" : "How are you feeling right now…"}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-white/35 text-sm px-3 py-2.5 resize-none outline-none font-body leading-relaxed min-h-[44px]"
          style={{ maxHeight: "120px" }}
        />

        {/* TTS toggle */}
        <button
          onClick={onToggleTts}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors mb-0.5 cursor-pointer ${ttsEnabled ? "text-white bg-white/20" : "text-white/35 hover:text-white/60"}`}
          title={ttsEnabled ? "Mute voice" : "Enable voice output"}
        >
          {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* Voice input */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleListening}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all mb-0.5 cursor-pointer ${isListening ? "bg-red-400/40 text-red-200 animate-pulse" : "text-white/35 hover:text-white/60"}`}
          title={isListening ? "Stop listening" : "Voice input"}
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
        </motion.button>

        {/* Send */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all mb-0.5 shadow-md cursor-pointer"
        >
          {disabled
            ? <span className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
            : <Send size={15} />
          }
        </motion.button>
      </div>

      <p className="text-center text-white/22 text-[10px] mt-2 font-body">
        MoodSpa is not a substitute for professional mental health care.
      </p>
    </div>
  );
}