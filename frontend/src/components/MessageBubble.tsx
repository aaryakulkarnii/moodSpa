import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Message } from "../lib/types";

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-violet-400 flex items-center justify-center text-sm mr-3 mt-1 shadow-lg">
          🌿
        </div>
      )}

      <div className={`max-w-[78%] md:max-w-[65%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div className={isUser
          ? "glass rounded-2xl rounded-tr-sm px-4 py-3 text-white shadow-lg"
          : "glass-dark rounded-2xl rounded-tl-sm px-4 py-3 text-white/90 shadow-xl"
        }>
          {isUser ? (
            <p className="text-sm leading-relaxed font-body whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="ai-prose text-sm leading-relaxed font-body">
              {message.content === "" && isStreaming ? (
                <span className="flex gap-1 items-center h-5">
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              ) : (
                <>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  {isStreaming && (
                    <span className="inline-block w-0.5 h-3.5 bg-white/60 ml-0.5 animate-blink align-middle" />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <span className="text-white/30 text-[10px] mt-1 px-1 font-body">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-sm ml-3 mt-1">
          🧘
        </div>
      )}
    </motion.div>
  );
}
