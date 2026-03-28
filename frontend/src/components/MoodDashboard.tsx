import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { fetchMoodHistory } from "../lib/api";

interface Props {
  sessionId: string;
  onClose: () => void;
}

interface MoodEntry {
  mood: string;
  score: number;
  createdAt: string;
}

const SCORE_COLORS: Record<number, string> = {
  9: "#4ade80", 8: "#86efac", 7: "#bef264",
  6: "#fde047", 5: "#fdba74", 4: "#fb923c",
  3: "#f87171", 2: "#ef4444", 1: "#dc2626",
};

function getColor(score: number): string {
  return SCORE_COLORS[score] || "#94a3b8";
}

export function MoodDashboard({ sessionId, onClose }: Props) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLoading(true);
    fetchMoodHistory(sessionId, days).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [sessionId, days]);

  useEffect(() => {
    if (!canvasRef.current || entries.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const H = canvas.height = 160 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.offsetWidth;
    const h = 160;
    ctx.clearRect(0, 0, w, h);

    const pad = 24;
    const graphW = w - pad * 2;
    const graphH = h - pad * 2;

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = pad + (graphH / 4) * i;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
      ctx.stroke();
    }

    if (entries.length < 2) {
      // Single dot
      const x = w / 2;
      const y = pad + graphH - (entries[0].score / 10) * graphH;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = getColor(entries[0].score);
      ctx.fill();
      return;
    }

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    entries.forEach((e, i) => {
      const x = pad + (i / (entries.length - 1)) * graphW;
      const y = pad + graphH - (e.score / 10) * graphH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw dots
    entries.forEach((e, i) => {
      const x = pad + (i / (entries.length - 1)) * graphW;
      const y = pad + graphH - (e.score / 10) * graphH;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = getColor(e.score);
      ctx.fill();
    });
  }, [entries]);

  const avg = entries.length
    ? Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length * 10) / 10
    : null;

  const latest = entries[entries.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-dark rounded-2xl p-5 mx-4 mb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-white font-semibold text-lg">Mood Tracker</h3>
          <p className="text-white/40 text-xs font-body">Your emotional journey</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white cursor-pointer">
          <X size={14} />
        </button>
      </div>

      {/* Day toggle */}
      <div className="flex gap-2 mb-4">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded-full text-xs font-body transition-all cursor-pointer ${days === d ? "bg-white/25 text-white" : "text-white/40 hover:text-white"}`}
          >
            {d}d
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/40 text-sm font-body">No mood data yet.</p>
          <p className="text-white/30 text-xs font-body mt-1">Select a mood from the welcome screen to start tracking.</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 glass rounded-xl p-3 text-center">
              <p className="text-white/40 text-[10px] font-body uppercase tracking-wider mb-1">Latest</p>
              <p className="text-white font-display text-lg capitalize">{latest?.mood}</p>
            </div>
            <div className="flex-1 glass rounded-xl p-3 text-center">
              <p className="text-white/40 text-[10px] font-body uppercase tracking-wider mb-1">Avg score</p>
              <p className="text-white font-display text-lg">{avg}/10</p>
            </div>
            <div className="flex-1 glass rounded-xl p-3 text-center">
              <p className="text-white/40 text-[10px] font-body uppercase tracking-wider mb-1">Check-ins</p>
              <p className="text-white font-display text-lg">{entries.length}</p>
            </div>
          </div>

          {/* Graph */}
          <div className="glass rounded-xl p-2">
            <canvas ref={canvasRef} style={{ width: "100%", height: "160px", display: "block" }} />
          </div>

          {/* Mood history pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[...entries].reverse().slice(0, 8).map((e, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full font-body capitalize"
                style={{ background: getColor(e.score) + "30", color: getColor(e.score), border: `1px solid ${getColor(e.score)}40` }}
              >
                {e.mood}
              </span>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}