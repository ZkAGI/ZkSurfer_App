// // components/agent/steps/AgentSetupStep.tsx
// "use client";
// import { useFormContext, Controller } from "react-hook-form";
// import { motion } from "framer-motion";
// import Image from 'next/image';

// const PREDICTION_MARKETS = [
//   { id: "sports", label: "⚽ Sports", description: "Game outcomes, player performance" },
//   { id: "politics", label: "🏛️ Politics", description: "Elections, policy decisions" },
//   { id: "markets", label: "📈 Financial Markets", description: "Stock moves, economic indicators" },
//   { id: "crypto", label: "₿ Crypto", description: "Price predictions, protocol launches" },
//   { id: "tech", label: "🚀 Tech", description: "Product launches, company news" },
//   { id: "entertainment", label: "🎬 Entertainment", description: "Box office, awards, releases" },
// ];

// export default function AgentSetupStep() {
//   const { control, watch, formState: { errors } } = useFormContext();
  
//   const tradingModel = watch("tradingModel");

//   return (
//     <div className="space-y-8">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-center mb-8"
//       >
//         <Image src="/images/cubs/trading.png" width={20} height={20} alt="bd"/>
//         <div className="text-6xl mb-4">🐯📊🔮</div>
//         <h3 className="text-2xl font-bold mb-2">Configure Your Agent Capabilities</h3>
//       </motion.div>

//       {/* Trading Agent */}
//       <div className="bg-[#1A1F3A] rounded-lg p-6 border border-[#2A2F5E]">
//         <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
//           📊 Trading Agent
//         </h4>
//         <Controller
//           name="tradingModel"
//           control={control}
//           defaultValue="foundational"
//           render={({ field }) => (
//             <div className="space-y-3">
//               <button
//                 type="button"
//                 onClick={() => field.onChange("foundational")}
//                 className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
//                   field.value === "foundational"
//                     ? "border-green-500 bg-green-500/10"
//                     : "border-[#2A2F5E] hover:border-green-500/50"
//                 }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <div className="font-semibold mb-1 text-green-400">✓ ZkAGI Foundational Model</div>
//                     <div className="text-sm text-gray-400">
//                       Proven strategies powered by advanced AI (Active & Ready)
//                     </div>
//                   </div>
//                   {field.value === "foundational" && (
//                     <span className="text-green-400">✓</span>
//                   )}
//                 </div>
//               </button>

//               <button
//                 type="button"
//                 onClick={() => field.onChange("custom")}
//                 disabled
//                 className="w-full p-4 rounded-lg border-2 border-[#2A2F5E] bg-[#0D0F1E] opacity-50 cursor-not-allowed text-left"
//               >
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <div className="font-semibold mb-1 flex items-center gap-2">
//                       Custom Strategy
//                       <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
//                         Coming Soon
//                       </span>
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       Build your own trading logic and algorithms
//                     </div>
//                   </div>
//                 </div>
//               </button>
//             </div>
//           )}
//         />
//       </div>

//       {/* Prediction Agent */}
//       <div className="bg-[#1A1F3A] rounded-lg p-6 border border-[#2A2F5E]">
//         <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
//           🔮 Prediction Agent
//         </h4>
//         <p className="text-sm text-gray-400 mb-4">
//           Select markets your ZEE should focus on (multiple selection allowed)
//         </p>
//         <Controller
//           name="predictionMarkets"
//           control={control}
//           defaultValue={[]}
//           render={({ field }) => (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {PREDICTION_MARKETS.map((market) => (
//                 <label
//                   key={market.id}
//                   className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                     field.value?.includes(market.id)
//                       ? "border-purple-500 bg-purple-500/10"
//                       : "border-[#2A2F5E] hover:border-purple-500/50"
//                   }`}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={field.value?.includes(market.id)}
//                     onChange={(e) => {
//                       const newValue = e.target.checked
//                         ? [...(field.value || []), market.id]
//                         : (field.value || []).filter((v: string) => v !== market.id);
//                       field.onChange(newValue);
//                     }}
//                     className="hidden"
//                   />
//                   <div className="flex items-start justify-between mb-2">
//                     <span className="text-lg">{market.label}</span>
//                     {field.value?.includes(market.id) && (
//                       <span className="text-purple-400">✓</span>
//                     )}
//                   </div>
//                   <p className="text-sm text-gray-400">{market.description}</p>
//                 </label>
//               ))}
//             </div>
//           )}
//         />
//       </div>

//       <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
//         <p className="text-sm text-gray-300">
//           💡 Your ZEE will use these capabilities to generate insights, make predictions, and execute strategies autonomously
//         </p>
//       </div>
//     </div>
//   );
// }

// components/agent/steps/AgentSetupStep.tsx
"use client";

import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { useAgentCart } from "@/stores/agent-cart-store";

const PREDICTION_MARKETS = [
  { id: "sports",        label: "⚽ Sports",           description: "Game outcomes, player performance" },
  { id: "politics",      label: "🏛️ Politics",         description: "Elections, policy decisions" },
  { id: "markets",       label: "📈 Financial Markets", description: "Stock moves, economic indicators" },
  { id: "crypto",        label: "₿ Crypto",            description: "Price predictions, protocol launches" },
  { id: "tech",          label: "🚀 Tech",              description: "Product launches, company news" },
  { id: "entertainment", label: "🎬 Entertainment",     description: "Box office, awards, releases" },
];

export default function AgentSetupStep() {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  // Zustand cart (where the user picks BD/Content/Support/etc.)
  const { items } = useAgentCart();

  // 1) Tell RHF this field exists
  useEffect(() => {
    register("selectedAgents");
  }, [register]);

  // 2) Keep RHF in sync with the cart
  useEffect(() => {
    const ids = items.map((i) => i.id); // ["BD","Content",...]
    setValue("selectedAgents", ids, { shouldValidate: true, shouldDirty: true });
  }, [items, setValue]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        {/* <div className="text-6xl mb-4">🐯📊🔮</div> */}
        <h3 className="text-2xl font-bold mb-2">Configure Your Agent Capabilities</h3>
        {/* <p className="text-gray-400">Tiger cubs role-playing (trading desk, crystal ball)</p> */}
      </motion.div>

      {/* Cart summary + validation for selected agents */}
      <div className="bg-[#0D1128] rounded-lg p-4 border border-[#2A2F5E]">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            <span className="font-semibold">{items.length}</span> agent(s) in your cart
          </div>
          {/* Hidden RHF field that your schema validates */}
          <input type="hidden" {...register("selectedAgents")} />
        </div>
        {errors.selectedAgents && (
          <p className="mt-2 text-red-400 text-sm">
            {String((errors as any).selectedAgents?.message || "Please pick at least one agent.")}
          </p>
        )}
      </div>

      {/* Trading Agent */}
      <div className="bg-[#1A1F3A] rounded-lg p-6 border border-[#2A2F5E]">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">📊 Trading Agent</h4>
        <Controller
          name="tradingModel"
          control={control}
          defaultValue="foundational"
          render={({ field }) => (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => field.onChange("foundational")}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  field.value === "foundational"
                    ? "border-green-500 bg-green-500/10"
                    : "border-[#2A2F5E] hover:border-green-500/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold mb-1 text-green-400">✓ ZkAGI Foundational Model</div>
                    <div className="text-sm text-gray-400">
                      Proven strategies powered by advanced AI (Active & Ready)
                    </div>
                  </div>
                  {field.value === "foundational" && <span className="text-green-400">✓</span>}
                </div>
              </button>

              <button
                type="button"
                onClick={() => field.onChange("custom")}
                disabled
                className="w-full p-4 rounded-lg border-2 border-[#2A2F5E] bg-[#0D0F1E] opacity-50 cursor-not-allowed text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      Custom Strategy
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                        Coming Soon
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">Build your own trading logic and algorithms</div>
                  </div>
                </div>
              </button>
            </div>
          )}
        />
        {(errors as any).tradingModel && (
          <p className="mt-2 text-red-400 text-sm">
            {String((errors as any).tradingModel?.message)}
          </p>
        )}
      </div>

      {/* Prediction Agent */}
      <div className="bg-[#1A1F3A] rounded-lg p-6 border border-[#2A2F5E]">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">🔮 Prediction Agent</h4>
        <p className="text-sm text-gray-400 mb-4">
          Select markets your ZEE should focus on (multiple selection allowed)
        </p>
        <Controller
          name="predictionMarkets"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PREDICTION_MARKETS.map((market) => {
                const checked = (field.value || []).includes(market.id);
                return (
                  <label
                    key={market.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      checked
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-[#2A2F5E] hover:border-purple-500/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(field.value || []), market.id]
                          : (field.value || []).filter((v: string) => v !== market.id);
                        field.onChange(next);
                      }}
                      className="hidden"
                    />
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-lg">{market.label}</span>
                      {checked && <span className="text-purple-400">✓</span>}
                    </div>
                    <p className="text-sm text-gray-400">{market.description}</p>
                  </label>
                );
              })}
            </div>
          )}
        />
        {(errors as any).predictionMarkets && (
          <p className="mt-2 text-red-400 text-sm">
            {String((errors as any).predictionMarkets?.message)}
          </p>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          💡 Your ZEE will use these capabilities to generate insights, make predictions, and execute strategies
          autonomously.
        </p>
      </div>
    </div>
  );
}
