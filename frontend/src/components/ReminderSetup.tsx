import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Bell, BellOff } from "lucide-react";

interface Props {
  onClose: () => void;
}

const REMINDER_MESSAGES = [
  "🌿 Time for a quick check-in. How are you feeling right now?",
  "💙 Take a breath. You're doing better than you think.",
  "🧘 A 2-minute breathing exercise could reset your day.",
  "🌱 Small steps count. What's one kind thing you did for yourself today?",
  "✨ MoodSpa is here whenever you need to talk.",
];

export function ReminderSetup({ onClose }: Props) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [time, setTime] = useState("09:00");
  const [enabled, setEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPermission(Notification.permission);
    const saved = localStorage.getItem("moodspa_reminder");
    if (saved) {
      const { time: t, enabled: e } = JSON.parse(saved);
      setTime(t);
      setEnabled(e);
    }
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const saveReminder = () => {
    localStorage.setItem("moodspa_reminder", JSON.stringify({ time, enabled }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    if (enabled && permission === "granted") {
      scheduleReminder(time);
    }
  };

  const scheduleReminder = (reminderTime: string) => {
    const [hours, minutes] = reminderTime.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target.getTime() - now.getTime();
    setTimeout(() => {
      const msg = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
      new Notification("MoodSpa", { body: msg, icon: "/favicon.svg" });
    }, delay);
  };

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("MoodSpa", {
        body: "🌿 This is a test reminder — it's working!",
        icon: "/favicon.svg",
      });
    }
  };

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
          <h3 className="font-display text-white font-semibold text-lg">Daily Reminders</h3>
          <p className="text-white/40 text-xs font-body">Gentle check-in notifications</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white cursor-pointer">
          <X size={14} />
        </button>
      </div>

      {/* Permission state */}
      {permission !== "granted" ? (
        <div className="glass rounded-xl p-4 mb-4 text-center">
          <p className="text-white/70 text-sm font-body mb-3">
            Allow notifications to receive daily wellness reminders
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={requestPermission}
            className="px-6 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-body transition-all cursor-pointer"
          >
            Allow Notifications
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl glass">
          <Bell size={14} className="text-green-300" />
          <p className="text-green-300 text-xs font-body">Notifications enabled</p>
        </div>
      )}

      {/* Time picker */}
      <div className="glass rounded-xl p-4 mb-4">
        <p className="text-white/60 text-xs font-body uppercase tracking-wider mb-3">Reminder time</p>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-transparent text-white font-display text-2xl outline-none cursor-pointer w-full"
        />
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between glass rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          {enabled ? <Bell size={14} className="text-white/70" /> : <BellOff size={14} className="text-white/30" />}
          <p className="text-white/70 text-sm font-body">Daily reminder</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${enabled ? "bg-white/30" : "bg-white/10"}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? "left-6" : "left-1"}`} />
        </button>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={saveReminder}
          className="flex-1 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-body transition-all cursor-pointer"
        >
          {saved ? "✓ Saved!" : "Save"}
        </motion.button>
        {permission === "granted" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={sendTestNotification}
            className="px-4 py-2.5 rounded-xl glass text-white/60 hover:text-white text-sm font-body transition-all cursor-pointer"
          >
            Test
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}