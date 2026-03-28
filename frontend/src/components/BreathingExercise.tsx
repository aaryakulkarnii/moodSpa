import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

const EXERCISES = [
  {
    name: "Box Breathing",
    description: "Reduces stress and anxiety",
    steps: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 4 },
      { label: "Exhale", duration: 4 },
      { label: "Hold", duration: 4 },
    ],
  },
  {
    name: "4-7-8 Breathing",
    description: "Promotes calm and sleep",
    steps: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 7 },
      { label: "Exhale", duration: 8 },
    ],
  },
  {
    name: "Deep Breathing",
    description: "Simple stress relief",
    steps: [
      { label: "Inhale", duration: 5 },
      { label: "Exhale", duration: 5 },
    ],
  },
];

export function BreathingExercise({ onClose }: Props) {
  const [selectedEx, setSelectedEx] = useState(0);
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exercise = EXERCISES[selectedEx];
  const currentStep = exercise.steps[stepIdx];

  useEffect(() => {
    if (!running) return;

    setSecondsLeft(exercise.steps[stepIdx].duration);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          const nextIdx = (stepIdx + 1) % exercise.steps.length;
          setStepIdx(nextIdx);
          if (nextIdx === 0) setCycles((c) => c + 1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [running, stepIdx, selectedEx]);

  const start = () => {
    setStepIdx(0);
    setCycles(0);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    clearInterval(intervalRef.current!);
    setStepIdx(0);
    setSecondsLeft(0);
  };

  const progress = running
    ? 1 - secondsLeft / currentStep.duration
    : 0;

  const circleSize = 140;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

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
          <h3 className="font-display text-white font-semibold text-lg">Breathing Exercise</h3>
          <p className="text-white/40 text-xs font-body">Follow the circle</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white cursor-pointer">
          <X size={14} />
        </button>
      </div>

      {/* Exercise selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {EXERCISES.map((ex, i) => (
          <button
            key={ex.name}
            onClick={() => { stop(); setSelectedEx(i); }}
            className={`px-3 py-1.5 rounded-full text-xs font-body transition-all cursor-pointer ${selectedEx === i ? "bg-white/25 text-white" : "text-white/40 hover:text-white"}`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      <p className="text-white/40 text-xs font-body text-center mb-4">{exercise.description}</p>

      {/* Animated circle */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative" style={{ width: circleSize, height: circleSize }}>
          <svg width={circleSize} height={circleSize} className="absolute inset-0">
            {/* Background circle */}
            <circle cx={circleSize / 2} cy={circleSize / 2} r={radius}
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            {/* Progress circle */}
            <motion.circle
              cx={circleSize / 2} cy={circleSize / 2} r={radius}
              fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.5 }}
              transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={running ? currentStep.label : "ready"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <p className="text-white font-display text-sm font-semibold">
                  {running ? currentStep.label : "Ready"}
                </p>
                {running && (
                  <p className="text-white/60 font-body text-2xl font-bold">{secondsLeft}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {running && (
          <p className="text-white/40 text-xs font-body mt-3">
            Cycle {cycles + 1}
          </p>
        )}
      </div>

      {/* Steps guide */}
      <div className="flex justify-center gap-3 mb-5">
        {exercise.steps.map((step, i) => (
          <div
            key={i}
            className={`text-center transition-all ${running && stepIdx === i ? "opacity-100" : "opacity-30"}`}
          >
            <p className="text-white text-xs font-body">{step.label}</p>
            <p className="text-white/60 text-[10px] font-body">{step.duration}s</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!running ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={start}
            className="px-8 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-body transition-all cursor-pointer"
          >
            Start
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stop}
            className="px-8 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 text-sm font-body transition-all cursor-pointer"
          >
            Stop
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}