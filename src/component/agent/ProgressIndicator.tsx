// components/agent/ProgressIndicator.tsx
"use client";
import { motion } from "framer-motion";

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
};

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepNames,
}: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-6">
      {/* Progress Bar */}
      <div className="relative h-2 bg-[#1A1F3A] rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {stepNames.map((name, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          
          return (
            <div key={name} className="flex flex-col items-center gap-2 flex-1">
              {/* Circle */}
              <motion.div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${
                  isCompleted
                    ? "bg-purple-500 border-purple-500 text-white"
                    : isCurrent
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-transparent border-gray-600 text-gray-500"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? "✓" : idx + 1}
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs text-center ${
                  isCurrent ? "text-white font-semibold" : "text-gray-500"
                }`}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}