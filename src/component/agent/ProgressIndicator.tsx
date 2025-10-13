// // components/agent/ProgressIndicator.tsx
// "use client";
// import { motion } from "framer-motion";

// type ProgressIndicatorProps = {
//   currentStep: number;
//   totalSteps: number;
//   stepNames: string[];
// };

// export default function ProgressIndicator({
//   currentStep,
//   totalSteps,
//   stepNames,
// }: ProgressIndicatorProps) {
//   const progress = ((currentStep + 1) / totalSteps) * 100;

//   return (
//     <div className="mb-6">
//       {/* Progress Bar */}
//       <div className="relative h-2 bg-[#1A1F3A] rounded-full overflow-hidden mb-4">
//         <motion.div
//           className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500"
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.3 }}
//         />
//       </div>

//       {/* Step Indicators */}
//       <div className="flex justify-between items-center">
//         {stepNames.map((name, idx) => {
//           const isCompleted = idx < currentStep;
//           const isCurrent = idx === currentStep;
          
//           return (
//             <div key={name} className="flex flex-col items-center gap-2 flex-1">
//               {/* Circle */}
//               <motion.div
//                 className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${
//                   isCompleted
//                     ? "bg-purple-500 border-purple-500 text-white"
//                     : isCurrent
//                     ? "bg-blue-500 border-blue-500 text-white"
//                     : "bg-transparent border-gray-600 text-gray-500"
//                 }`}
//                 initial={{ scale: 0.8 }}
//                 animate={{ scale: isCurrent ? 1.1 : 1 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 {isCompleted ? "✓" : idx + 1}
//               </motion.div>

//               {/* Label */}
//               <span
//                 className={`text-xs text-center ${
//                   isCurrent ? "text-white font-semibold" : "text-gray-500"
//                 }`}
//               >
//                 {name}
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import React from "react";
import { Check } from "lucide-react"; // optional; replace or remove if you don't use lucide

type Props = {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
};

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepNames,
}: Props) {
  const pct =
    totalSteps > 1 ? ((currentStep + 1) / totalSteps) * 100 : 100;

  return (
    <div className="w-full">
      {/* Linear bar */}
      <div className="h-2 w-full rounded-full bg-[#1d2246] overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#a855f7] to-[#3b82f6] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Pills grid:
          - Mobile: 4 columns ⇒ 2 rows for 8 steps
          - ≥sm: 8 columns ⇒ single row for 8 steps
          - If you change step count, mobile still wraps (4 per row)
      */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-x-2 gap-y-2 justify-items-center">
        {stepNames.map((name, i) => {
          const done = i < currentStep;
          const active = i === currentStep;

          return (
            <div key={name} className="flex flex-col items-center w-full">
              <div
                className={[
                  "grid place-items-center rounded-full border",
                  "w-8 h-8 sm:w-9 sm:h-9",
                  done
                    ? "bg-[#7c3aed] border-[#7c3aed] text-white"
                    : active
                    ? "bg-[#1e2247] border-[#7c3aed] text-white"
                    : "bg-[#141736] border-[#2A2F5E] text-gray-300",
                ].join(" ")}
                title={name}
              >
                {done ? (
                  // check icon (or just a ✓)
                  <Check size={16} strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </div>

              {/* label: hidden on very small, show from sm up, truncate to keep tidy */}
              <div className="mt-1 hidden sm:block w-full text-center">
                <span className="block text-[10px] leading-3 text-gray-400 truncate">
                  {name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
