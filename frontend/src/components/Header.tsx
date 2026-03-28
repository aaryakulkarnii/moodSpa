import { motion } from "framer-motion";
import { Trash2, Moon, Sun } from "lucide-react";

interface Props {
  onClear: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  messageCount: number;
}

export function Header({ onClear, darkMode, onToggleDark, messageCount }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-5 py-4 flex-shrink-0"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-2xl">🌿</span>
        <div>
          <h1 className="font-display text-white font-semibold text-xl leading-none tracking-wide">MoodSpa</h1>
          <p className="text-white/40 text-[10px] font-body tracking-widest uppercase mt-0.5">Your wellness companion</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDark}
          className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
          title="Toggle theme"
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {messageCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.92 }}
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 h-8 rounded-xl glass text-white/60 hover:text-white/90 text-xs font-body transition-all cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </motion.button>
        )}
      </div>
    </motion.header>
  );
}
