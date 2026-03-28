import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "./hooks/useChat";
import { Header } from "./components/Header";
import { MessageFeed } from "./components/MessageFeed";
import { PromptInputBox } from "./components/PromptInputBox";
import { WelcomeScreen } from "./components/WelcomeScreen";

const BG_LIGHT = "radial-gradient(125% 125% at 50% 101%, rgba(245,87,2,1) 10.5%, rgba(245,120,2,1) 16%, rgba(245,140,2,1) 17.5%, rgba(245,170,100,1) 25%, rgba(238,174,202,1) 40%, rgba(202,179,214,1) 65%, rgba(148,201,233,1) 100%)";
const BG_DARK = "radial-gradient(125% 125% at 50% 101%, rgba(60,10,40,1) 10%, rgba(40,10,60,1) 25%, rgba(18,12,35,1) 65%, rgba(8,8,20,1) 100%)";

export default function App() {
  const { messages, isLoading, send, clear, ready, ttsEnabled, toggleTts } = useChat();
  const [dark, setDark] = useState(false);

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative"
      style={{ background: dark ? BG_DARK : BG_LIGHT, transition: "background 0.6s ease" }}>
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <div className="relative z-10 h-full flex flex-col w-full max-w-2xl mx-auto">
        <Header onClear={clear} darkMode={dark} onToggleDark={() => setDark((d) => !d)} messageCount={messages.length} />
        <div className="h-px bg-white/10 mx-5 flex-shrink-0" />

        <AnimatePresence mode="wait">
          {!ready ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center">
              <div className="flex gap-2">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </motion.div>
          ) : messages.length === 0 ? (
            <WelcomeScreen key="welcome" onMood={send} />
          ) : (
            <MessageFeed key="feed" messages={messages} isLoading={isLoading} />
          )}
        </AnimatePresence>

        {ready && <PromptInputBox onSend={send} disabled={isLoading} ttsEnabled={ttsEnabled} onToggleTts={toggleTts} />}
      </div>
    </div>
  );
}