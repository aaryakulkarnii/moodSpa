import { motion } from "framer-motion";

const MOODS = [
  { emoji: "😔", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😶‍🌫️", label: "Numb" },
  { emoji: "😴", label: "Exhausted" },
  { emoji: "🌱", label: "Hopeful" },
];

export function WelcomeScreen({ onMood }: { onMood: (t: string, isMoodCheckIn: boolean) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-6xl mb-4 animate-pulse-soft">🌿</div>
        <h2 className="font-display text-white text-2xl md:text-3xl font-semibold mb-2">
          Welcome to MoodSpa
        </h2>
        <p className="text-white/60 font-body text-sm mb-8 max-w-xs leading-relaxed mx-auto">
          A safe, gentle space to talk about how you're feeling. I'm here to listen, without judgment.
        </p>
        <p className="text-white/40 text-[11px] font-body uppercase tracking-widest mb-4">
          How are you feeling right now?
        </p>
        <div className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto">
          {MOODS.map(({ emoji, label }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onMood(`I'm feeling ${label.toLowerCase()} right now.`, true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-white/80 hover:text-white hover:bg-white/20 text-sm font-body transition-all cursor-pointer"
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}