// 'use client'
// import React, { useState } from 'react'
// import { useTradingStore } from '@/stores/trading-store';
// import { ChevronDown } from 'lucide-react'

// const assets = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'] as const;
// type Asset = typeof assets[number];

// interface PredictionPanelProps {
//     className?: string;
// }

// const PredictionPanel: React.FC<PredictionPanelProps> = ({ className }) => {
//     const {
//         currentAsset,
//         currentPrice,
//         prediction,
//         setDirection,
//         setEntryPrice,
//         setStopLoss,
//         setTakeProfit,
//         placePrediction,
//         resetPrediction
//     } = useTradingStore()

//     const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState<boolean>(false)

//     const handleInputChange = (field: 'entryPrice' | 'stopLoss' | 'takeProfit', value: string): void => {
//         switch (field) {
//             case 'entryPrice':
//                 setEntryPrice(value)
//                 break
//             case 'stopLoss':
//                 setStopLoss(value)
//                 break
//             case 'takeProfit':
//                 setTakeProfit(value)
//                 break
//         }
//     }

//     const handleAssetSelect = (asset: Asset): void => {
//         setIsAssetDropdownOpen(false)
//         // You can add asset switching logic here
//         console.log(`Selected asset: ${asset}`)
//     }

//     return (
//         <div className={`bg-gray-900 text-white p-6 rounded-lg w-80 h-full space-y-4 ${className || ''}`}>
//             <h2 className="text-xl font-semibold">New Prediction</h2>

//             {/* Asset Selector */}
//             <div className="space-y-2">
//                 <label className="text-sm text-gray-400">Asset</label>
//                 <div className="relative">
//                     <button
//                         onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
//                         className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:bg-gray-750 transition-colors"
//                         type="button"
//                     >
//                         <span>{currentAsset}</span>
//                         <ChevronDown className={`w-4 h-4 transition-transform ${isAssetDropdownOpen ? 'rotate-180' : ''}`} />
//                     </button>

//                     {isAssetDropdownOpen && (
//                         <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
//                             {assets.map((asset) => (
//                                 <button
//                                     key={asset}
//                                     className="w-full px-4 py-3 text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
//                                     onClick={() => handleAssetSelect(asset)}
//                                     type="button"
//                                 >
//                                     {asset}
//                                 </button>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Direction Buttons */}
//             <div className="flex space-x-2">
//                 <button
//                     onClick={() => setDirection('Long')}
//                     className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${prediction.direction === 'Long'
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//                         }`}
//                     type="button"
//                 >
//                     Long
//                 </button>
//                 <button
//                     onClick={() => setDirection('Short')}
//                     className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${prediction.direction === 'Short'
//                         ? 'bg-red-600 text-white'
//                         : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//                         }`}
//                     type="button"
//                 >
//                     Short
//                 </button>
//             </div>

//             {/* Entry Price */}
//             <div className="space-y-2">
//                 <label className="text-sm text-gray-400">Entry Price</label>
//                 <input
//                     type="number"
//                     value={prediction.entryPrice}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('entryPrice', e.target.value)}
//                     className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
//                     placeholder="38,500"
//                 />
//             </div>

//             {/* Stop Loss and Take Profit */}
//             <div className="flex space-x-4">
//                 <div className="flex-1 space-y-2">
//                     <label className="text-sm text-gray-400">Stop Loss</label>
//                     <input
//                         type="number"
//                         value={prediction.stopLoss}
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('stopLoss', e.target.value)}
//                         className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
//                         placeholder="38,000"
//                     />
//                 </div>
//                 <div className="flex-1 space-y-2">
//                     <label className="text-sm text-gray-400">Take Profit</label>
//                     <input
//                         type="number"
//                         value={prediction.takeProfit}
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('takeProfit', e.target.value)}
//                         className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
//                         placeholder="41,500"
//                     />
//                 </div>
//             </div>

//             {/* Place Prediction Button */}
//             <button
//                 onClick={placePrediction}
//                 disabled={prediction.isActive}
//                 className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${prediction.isActive
//                     ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
//                     : 'bg-blue-600 hover:bg-blue-700 text-white'
//                     }`}
//                 type="button"
//             >
//                 {prediction.isActive ? 'Prediction Active' : 'Place Prediction'}
//             </button>

//             {/* Reset Button (when prediction is active) */}
//             {prediction.isActive && (
//                 <button
//                     onClick={resetPrediction}
//                     className="w-full py-2 px-4 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
//                     type="button"
//                 >
//                     Reset Prediction
//                 </button>
//             )}
//         </div>
//     )
// }

// export default PredictionPanel

// 'use client'
// import React, { useState } from 'react'
// import { useTradingStore } from '@/stores/trading-store';
// import { ChevronDown } from 'lucide-react'
// import clsx from 'clsx'

// import { z } from "zod";

// // --- small helpers ---
// const KEY_CHARS = /^[A-Za-z0-9_-]+$/;      // relax/tighten as needed
// const HEX40 = /^[0-9a-fA-F]{40}$/;
// const HEX40_WITH_0X = /^0x[0-9a-fA-F]{40}$/;

// const KeySchema = z.string()
//   .trim()
//   .length(107, "Must be exactly 107 characters.")
//   .regex(KEY_CHARS, "Invalid characters.");

// const WalletSchema = z.string()
//   .trim()
//   // if 40 hex without 0x, auto-prefix it
//   .transform(v => (HEX40.test(v) && !v.startsWith("0x")) ? `0x${v}` : v)
//   .refine(v => HEX40_WITH_0X.test(v), "Wallet must be 0x + 40 hex (42 chars).");

// const percentStr = z.string().trim().refine(v => {
//   const n = Number(v); return Number.isFinite(n) && n >= 0 && n <= 100;
// }, "Enter a % between 0 and 100");

// const usdStr = z.string().trim().refine(v => {
//   const n = Number(v); return Number.isFinite(n) && n >= 0;
// }, "Must be a non-negative number");

// // Step 1 schema (secrets)
// const CredsSchema = z.object({
//   wallet: WalletSchema,
//   apiKey: KeySchema,
//   apiSecret: KeySchema,
// });

// // Step 2 schema (risk config)
// const RiskCfgSchema = z.object({
//   aumPct: percentStr,
//   pctPerTrade: percentStr,
//   maxDailyLossUsd: usdStr,
//   maxLossPerTradeUsd: usdStr,
//   expectedDailyProfitUsd: usdStr,
//   useLeverage: z.boolean(),
//   levMin: z.number(),
//   levMax: z.number(),
// }).superRefine((v, ctx) => {
//   if (v.useLeverage) {
//     if (!(v.levMin > 0)) {
//       ctx.addIssue({ path: ["levMin"], code: z.ZodIssueCode.custom, message: "Must be > 0" });
//     }
//     if (!(v.levMax >= v.levMin)) {
//       ctx.addIssue({ path: ["levMax"], code: z.ZodIssueCode.custom, message: "Must be ≥ Min" });
//     }
//   }
// });


// const assets = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'] as const;
// type Asset = typeof assets[number];

// interface PredictionPanelProps {
//   className?: string;
// }

// type Step = 1 | 2;

// const PredictionPanel: React.FC<PredictionPanelProps> = ({ className }) => {
//   const {
//     currentAsset,
//     prediction,
//     setDirection,
//     setEntryPrice,
//     setStopLoss,
//     setTakeProfit,
//     placePrediction,
//     resetPrediction
//   } = useTradingStore()

//   const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState<boolean>(false)

//   const handleInputChange = (field: 'entryPrice' | 'stopLoss' | 'takeProfit', value: string): void => {
//     switch (field) {
//       case 'entryPrice':
//         setEntryPrice(value); break;
//       case 'stopLoss':
//         setStopLoss(value); break;
//       case 'takeProfit':
//         setTakeProfit(value); break;
//     }
//   }

//   const handleAssetSelect = (asset: Asset): void => {
//     setIsAssetDropdownOpen(false)
//     console.log(`Selected asset: ${asset}`)
//   }

//   // -------------------------------
//   // Copy ZkAGI Trade – wizard state
//   // -------------------------------
//   const [showCopyWizard, setShowCopyWizard] = useState(false)
//   const [step, setStep] = useState<Step>(1)
//   const [submitting, setSubmitting] = useState(false)
//   const [showSecret, setShowSecret] = useState(false)

//   const [credsErrors, setCredsErrors] = useState<Partial<Record<keyof typeof creds, string>>>({});
// const [cfgErrors, setCfgErrors] = useState<Partial<Record<keyof typeof cfg, string>>>({});
// const [info, setInfo] = useState<string>(""); // optional: to show auto-fix messages


// function validateStep1AndGoNext() {
//   setCredsErrors({});
//   setInfo("");

//   const result = CredsSchema.safeParse(creds);
//   if (!result.success) {
//     const fe = result.error.flatten().fieldErrors;
//     setCredsErrors({
//       wallet: fe.wallet?.[0],
//       apiKey: fe.apiKey?.[0],
//       apiSecret: fe.apiSecret?.[0],
//     });
//     return; // stay on step 1
//   }

//   // apply normalized values (wallet may be auto-prefixed with 0x)
//   if (!creds.wallet.trim().startsWith("0x") && result.data.wallet.startsWith("0x")) {
//     setInfo("Added missing 0x prefix to wallet.");
//   }
//   setCreds(result.data);
//   setStep(2);
// }


//   const [creds, setCreds] = useState({
//     wallet: '',
//     apiKey: '',
//     apiSecret: ''
//   })

//   const [cfg, setCfg] = useState({
//     aumPct: '',              // % of portfolio used for AUM
//     pctPerTrade: '',         // % of AUM per trade
//     maxDailyLossUsd: '',     // $
//     maxLossPerTradeUsd: '',  // $
//     expectedDailyProfitUsd: '',
//     useLeverage: true,
//     levMin: 5,
//     levMax: 20,
//   })

//   const percentOk = (v: string) => {
//     const n = Number(v)
//     return Number.isFinite(n) && n >= 0 && n <= 100
//   }
//   const positiveUsdOk = (v: string) => {
//     const n = Number(v)
//     return Number.isFinite(n) && n >= 0
//   }

//   const step1Valid =
//     creds.wallet.trim() &&
//     creds.apiKey.trim() &&
//     creds.apiSecret.trim()

//   const step2Valid =
//     percentOk(cfg.aumPct) &&
//     percentOk(cfg.pctPerTrade) &&
//     positiveUsdOk(cfg.maxDailyLossUsd) &&
//     positiveUsdOk(cfg.maxLossPerTradeUsd) &&
//     positiveUsdOk(cfg.expectedDailyProfitUsd) &&
//     (!cfg.useLeverage || (cfg.levMin > 0 && cfg.levMax >= cfg.levMin))

//   // async function handleEnableCopy() {
//   //   if (!step1Valid || !step2Valid) return
//   //   setSubmitting(true)
//   //   try {
//   //     // 🔐 IMPORTANT: send to a server route that stores these securely (DB/KMS),
//   //     // never localStorage.
//   //     const res = await fetch('/api/copy-trade/setup', {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify({ creds, cfg })
//   //     })

//   //     if (!res.ok) throw new Error('Setup failed')
//   //     // optional: toast
//   //     setShowCopyWizard(false)
//   //   } catch (e) {
//   //     console.error(e)
//   //     alert('Failed to enable copy trading. Check server logs.')
//   //   } finally {
//   //     setSubmitting(false)
//   //   }
//   // }

//   async function handleEnableCopy() {
//   // clear old errors
//   setCfgErrors({});
//   setInfo("");

//   // validate step 2 with Zod
//   const result = RiskCfgSchema.safeParse(cfg);
//   if (!result.success) {
//     const fe = result.error.flatten().fieldErrors;
//     setCfgErrors({
//       aumPct: fe.aumPct?.[0],
//       pctPerTrade: fe.pctPerTrade?.[0],
//       maxDailyLossUsd: fe.maxDailyLossUsd?.[0],
//       maxLossPerTradeUsd: fe.maxLossPerTradeUsd?.[0],
//       expectedDailyProfitUsd: fe.expectedDailyProfitUsd?.[0],
//       levMin: fe.levMin?.[0],
//       levMax: fe.levMax?.[0],
//     });
//     return;
//   }

//   setSubmitting(true);
//   try {
//     const res = await fetch('/api/copy-trade/setup', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ creds, cfg: result.data })
//     });
//     if (!res.ok) throw new Error('Setup failed');
//     setShowCopyWizard(false);
//   } catch (e) {
//     console.error(e);
//     alert('Failed to enable copy trading. Check server logs.');
//   } finally {
//     setSubmitting(false);
//   }
// }


//   return (
//     <div className={clsx('bg-gray-900 text-white p-6 rounded-lg w-full max-w-md md:w-80 h-full space-y-4 mx-auto md:mx-0', className)}>
//       {/* =============== Copy ZkAGI Trade card =============== */}
//       <div className="rounded-lg border border-gray-700 bg-gray-850 p-4">
//         <div className="flex items-start justify-between">
//           <div>
//             <h3 className="text-lg font-semibold">Copy ZkAGI Trade</h3>
//             <p className="text-xs text-gray-400">
//               Mirror our signals with your limits and leverage rules.
//             </p>
//           </div>
//           {!showCopyWizard && (
//             <button
//               onClick={() => { setShowCopyWizard(true); setStep(1); }}
//               className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
//             >
//               Copy
//             </button>
//           )}
//         </div>

//         {showCopyWizard && (
//           <div className="mt-4 space-y-3">
//             {/* Stepper */}
//             <div className="flex items-center text-xs">
//               <div className={clsx('px-2 py-1 rounded', step === 1 ? 'bg-blue-600' : 'bg-gray-700')}>1. Secrets</div>
//               <div className="mx-2 h-px flex-1 bg-gray-700" />
//               <div className={clsx('px-2 py-1 rounded', step === 2 ? 'bg-blue-600' : 'bg-gray-700')}>2. Risk Config</div>
//             </div>

//             {step === 1 && (
//               <div className="space-y-3">
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-400">HyperLiquid Wallet Address</label>
//                   {/* <input
//                     value={creds.wallet}
//                     onChange={e => setCreds(s => ({ ...s, wallet: e.target.value.trim() }))}
//                     className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
//                     placeholder="0x…"
//                   /> */}
//                   <input
//   value={creds.wallet}
//   onChange={e => setCreds(s => ({ ...s, wallet: e.target.value.trim() }))}
//   className={clsx(
//     "w-full bg-gray-800 border rounded px-3 py-2 text-sm",
//     credsErrors.wallet ? "border-red-600" : "border-gray-700"
//   )}
//   placeholder="0x…"
// />
// {credsErrors.wallet && <p className="text-[11px] text-red-500">{credsErrors.wallet}</p>}
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-400">Hyperliquid API Key</label>
//                   {/* <input
//                     value={creds.apiKey}
//                     onChange={e => setCreds(s => ({ ...s, apiKey: e.target.value.trim() }))}
//                     className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
//                     placeholder="hlpk_********"
//                   /> */}
//                   <input
//   value={creds.apiKey}
//   onChange={e => setCreds(s => ({ ...s, apiKey: e.target.value.trim() }))}
//   className={clsx(
//     "w-full bg-gray-800 border rounded px-3 py-2 text-sm",
//     credsErrors.apiKey ? "border-red-600" : "border-gray-700"
//   )}
//   placeholder="hlpk_********"
// />
// {credsErrors.apiKey && <p className="text-[11px] text-red-500">{credsErrors.apiKey}</p>}

//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-400">Hyperliquid API Private Key</label>
//                   <div className="flex gap-2">
//                     {/* <input
//                       type={showSecret ? 'text' : 'password'}
//                       value={creds.apiSecret}
//                       onChange={e => setCreds(s => ({ ...s, apiSecret: e.target.value }))}
//                       className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
//                       placeholder="••••••••"
//                     /> */}
//                     <input
//   type={showSecret ? 'text' : 'password'}
//   value={creds.apiSecret}
//   onChange={e => setCreds(s => ({ ...s, apiSecret: e.target.value }))}
//   className={clsx(
//     "flex-1 bg-gray-800 border rounded px-3 py-2 text-sm",
//     credsErrors.apiSecret ? "border-red-600" : "border-gray-700"
//   )}
//   placeholder="••••••••"
// />

//                     <button
//                       type="button"
//                       onClick={() => setShowSecret(v => !v)}
//                       className="px-2 text-xs rounded bg-gray-700 hover:bg-gray-600"
//                     >
//                       {showSecret ? 'Hide' : 'Show'}
//                     </button>
                    
//                   </div>
//                   {credsErrors.apiSecret && <p className="text-[11px] text-red-500">{credsErrors.apiSecret}</p>}

// {info && <p className="text-[11px] text-emerald-500">{info}</p>}
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     className="flex-1 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
//                     onClick={() => setShowCopyWizard(false)}
//                     type="button"
//                   >
//                     Cancel
//                   </button>
//                   {/* <button
//                     className="flex-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm"
//                     disabled={!step1Valid}
//                     onClick={() => setStep(2)}
//                     type="button"
//                   >
//                     Next
//                   </button> */}
//                   <button
//   className="flex-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm"
//   // keep your existing simple non-empty guard if you like:
//   disabled={!creds.wallet || !creds.apiKey || !creds.apiSecret}
//   onClick={validateStep1AndGoNext}
//   type="button"
// >
//   Next
// </button>

//                 </div>
//                <p className="text-[10px] text-gray-500">
//   The system is configured to store credentials and keys on a TEE,{' '}
//   <a
//     href=""
//     target="_blank"
//     rel="noopener noreferrer"
//     className="underline text-blue-400"
//   >
//     read more. 
//   </a>
// </p>

//               </div>
//             )}

//             {step === 2 && (
//               <div className="space-y-3">
//                 <div className="grid grid-cols-2 gap-2">
//                   <div className="space-y-1">
//                     <label className="text-xs text-gray-400">% of Portfolio (AUM)</label>
//                     {/* <input
//                       inputMode="decimal"
//                       value={cfg.aumPct}
//                       onChange={e => setCfg(s => ({ ...s, aumPct: e.target.value }))}
//                       className={clsx(
//                         'w-full bg-gray-800 border rounded px-3 py-2 text-sm',
//                         percentOk(cfg.aumPct) ? 'border-gray-700' : 'border-red-600'
//                       )}
//                       placeholder="e.g. 50"
//                     /> */}
//                     <input
//   inputMode="decimal"
//   value={cfg.aumPct}
//   onChange={e => setCfg(s => ({ ...s, aumPct: e.target.value }))}
//   className={clsx(
//     "w-full bg-gray-800 border rounded px-3 py-2 text-sm",
//     cfgErrors.aumPct ? "border-red-600" : "border-gray-700"
//   )}
//   placeholder="e.g. 50"
// />
// {cfgErrors.aumPct && <p className="text-[11px] text-red-500">{cfgErrors.aumPct}</p>}

//                   </div>
//                   <div className="space-y-1">
//                     <label className="text-xs text-gray-400">% of AUM per Trade</label>
//                     <input
//                       inputMode="decimal"
//                       value={cfg.pctPerTrade}
//                       onChange={e => setCfg(s => ({ ...s, pctPerTrade: e.target.value }))}
//                       className={clsx(
//                         'w-full bg-gray-800 border rounded px-3 py-2 text-sm',
//                         percentOk(cfg.pctPerTrade) ? 'border-gray-700' : 'border-red-600'
//                       )}
//                       placeholder="e.g. 2"
//                     />
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-xs text-gray-400">Max Daily Loss ($)</label>
//                     <input
//                       inputMode="decimal"
//                       value={cfg.maxDailyLossUsd}
//                       onChange={e => setCfg(s => ({ ...s, maxDailyLossUsd: e.target.value }))}
//                       className={clsx(
//                         'w-full bg-gray-800 border rounded px-3 py-2 text-sm',
//                         positiveUsdOk(cfg.maxDailyLossUsd) ? 'border-gray-700' : 'border-red-600'
//                       )}
//                       placeholder="e.g. 100"
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <label className="text-xs text-gray-400">Max Loss per Trade ($)</label>
//                     <input
//                       inputMode="decimal"
//                       value={cfg.maxLossPerTradeUsd}
//                       onChange={e => setCfg(s => ({ ...s, maxLossPerTradeUsd: e.target.value }))}
//                       className={clsx(
//                         'w-full bg-gray-800 border rounded px-3 py-2 text-sm',
//                         positiveUsdOk(cfg.maxLossPerTradeUsd) ? 'border-gray-700' : 'border-red-600'
//                       )}
//                       placeholder="e.g. 25"
//                     />
//                   </div>

//                   <div className="col-span-2 space-y-1">
//                     <label className="text-xs text-gray-400">Expected Daily Profit ($)</label>
//                     <input
//                       inputMode="decimal"
//                       value={cfg.expectedDailyProfitUsd}
//                       onChange={e => setCfg(s => ({ ...s, expectedDailyProfitUsd: e.target.value }))}
//                       className={clsx(
//                         'w-full bg-gray-800 border rounded px-3 py-2 text-sm',
//                         positiveUsdOk(cfg.expectedDailyProfitUsd) ? 'border-gray-700' : 'border-red-600'
//                       )}
//                       placeholder="e.g. 150"
//                     />
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <label className="text-xs text-gray-400">Use Leverage?</label>
//                   <button
//                     onClick={() => setCfg(s => ({ ...s, useLeverage: !s.useLeverage }))}
//                     className={clsx(
//                       'px-3 py-1 rounded text-sm',
//                       cfg.useLeverage ? 'bg-emerald-600' : 'bg-gray-700'
//                     )}
//                     type="button"
//                   >
//                     {cfg.useLeverage ? 'Enabled' : 'Disabled'}
//                   </button>
//                 </div>

//                 {cfg.useLeverage && (
//                   <div className="grid grid-cols-2 gap-2">
//                     <div className="space-y-1">
//                       <label className="text-xs text-gray-400">Leverage Min (x)</label>
//                       <input
//                         type="number"
//                         min={1}
//                         value={cfg.levMin}
//                         onChange={e => setCfg(s => ({ ...s, levMin: Number(e.target.value) }))}
//                         className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
//                       />
//                     </div>
//                     <div className="space-y-1">
//                       <label className="text-xs text-gray-400">Leverage Max (x)</label>
//                       <input
//                         type="number"
//                         min={cfg.levMin}
//                         value={cfg.levMax}
//                         onChange={e => setCfg(s => ({ ...s, levMax: Number(e.target.value) }))}
//                         className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
//                       />
//                     </div>
//                     <p className="col-span-2 text-[10px] text-gray-500">
//                       We’ll clamp dynamic leverage to this range.
//                     </p>
//                   </div>
//                 )}

//                 <div className="flex gap-2">
//                   <button
//                     className="flex-1 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
//                     onClick={() => setStep(1)}
//                     type="button"
//                   >
//                     Back
//                   </button>
//                   <button
//                     className="flex-1 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-sm"
//                     disabled={!step2Valid || submitting}
//                     onClick={handleEnableCopy}
//                     type="button"
//                   >
//                     {submitting ? 'Enabling…' : 'Enable Copy Trading'}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//       {/* =============== /Copy ZkAGI Trade card =============== */}

//       {/* <h2 className="text-xl font-semibold">New Prediction</h2> */}

//       {/* Asset Selector */}
//    {/* <div className="space-y-2">
//         <label className="text-sm text-gray-400">Asset</label>
//         <div className="relative">
//           <button
//             onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
//             className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:bg-gray-750 transition-colors"
//             type="button"
//           >
//             <span>{currentAsset}</span>
//             <ChevronDown className={`w-4 h-4 transition-transform ${isAssetDropdownOpen ? 'rotate-180' : ''}`} />
//           </button>

//           {isAssetDropdownOpen && (
//             <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
//               {assets.map((asset) => (
//                 <button
//                   key={asset}
//                   className="w-full px-4 py-3 text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
//                   onClick={() => handleAssetSelect(asset)}
//                   type="button"
//                 >
//                   {asset}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>  */}

//       {/* Direction Buttons */}
//        {/* <div className="flex space-x-2">
//         <button
//           onClick={() => setDirection('Long')}
//           className={clsx(
//             'flex-1 py-3 px-4 rounded-lg font-medium transition-colors',
//             prediction.direction === 'Long' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//           )}
//           type="button"
//         >
//           Long
//         </button>
//         <button
//           onClick={() => setDirection('Short')}
//           className={clsx(
//             'flex-1 py-3 px-4 rounded-lg font-medium transition-colors',
//             prediction.direction === 'Short' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//           )}
//           type="button"
//         >
//           Short
//         </button>
//       </div>  */}

//       {/* Entry Price */}
//       {/* <div className="space-y-2">
//         <label className="text-sm text-gray-400">Entry Price</label>
//         <input
//           type="number"
//           value={prediction.entryPrice}
//           onChange={(e) => handleInputChange('entryPrice', e.target.value)}
//           className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
//           placeholder="38,500"
//         />
//       </div> */}

//       {/* Stop Loss and Take Profit */}
//     {/* <div className="flex space-x-4">
//         <div className="flex-1 space-y-2">
//           <label className="text-sm text-gray-400">Stop Loss</label>
//           <input
//             type="number"
//             value={prediction.stopLoss}
//             onChange={(e) => handleInputChange('stopLoss', e.target.value)}
//             className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
//             placeholder="38,000"
//           />
//         </div>
//         <div className="flex-1 space-y-2">
//           <label className="text-sm text-gray-400">Take Profit</label>
//           <input
//             type="number"
//             value={prediction.takeProfit}
//             onChange={(e) => handleInputChange('takeProfit', e.target.value)}
//             className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
//             placeholder="41,500"
//           />
//         </div>
//       </div>   */}

//       {/* Place Prediction Button */}
//   {/* <button
//         onClick={placePrediction}
//         disabled={prediction.isActive}
//         className={clsx(
//           'w-full py-3 px-4 rounded-lg font-medium transition-colors',
//           prediction.isActive ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
//         )}
//         type="button"
//       >
//         {prediction.isActive ? 'Prediction Active' : 'Place Prediction'}
//       </button> */}

//       {/* Reset Button (when prediction is active) */}
//       {/* {prediction.isActive && (
//         <button
//           onClick={resetPrediction}
//           className="w-full py-2 px-4 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
//           type="button"
//         >
//           Reset Prediction
//         </button>
//       )} */}
//     </div> 
//   )
// }

// export default PredictionPanel



// 'use client'

// import React, { useEffect, useMemo, useState } from 'react'
// import clsx from 'clsx'
// import { z } from 'zod'
// import { useWallet } from '@solana/wallet-adapter-react'
// import { useSearchParams } from 'next/navigation'

// // ================= Validation helpers =================
// const KEY_CHARS = /^[A-Za-z0-9_-]+$/
// const HEX40 = /^[0-9a-fA-F]{40}$/
// const HEX40_WITH_0X = /^0x[0-9a-fA-F]{40}$/

// const KeySchema = z
//   .string()
//   .trim()
//   .length(107, 'Must be exactly 107 characters.')
//   .regex(KEY_CHARS, 'Invalid characters.')

// const WalletSchema = z
//   .string()
//   .trim()
//   .transform((v) => (HEX40.test(v) && !v.startsWith('0x') ? `0x${v}` : v))
//   .refine((v) => HEX40_WITH_0X.test(v), 'Wallet must be 0x + 40 hex (42 chars).')

// /** Step 1: Secrets */
// const CredsSchema = z.object({
//   wallet: WalletSchema,       // HL_MAIN_ADDR
//   apiKey: KeySchema,          // HL_API_PK (and HL_MAIN_PK = same)
//   apiAddr: z.string().trim(), // HL_API_ADDR (renamed UI field)
// })

// /** Step 2: Config (4 fields only) */
// const RiskCfgSchema = z.object({
//   capitalUsage: z.string().trim().refine(v => {
//     const n = Number(v); return Number.isFinite(n) && n >= 0 && n <= 1
//   }, 'Enter a decimal between 0 and 1 (e.g. 0.3)'),
//   maxLeverage: z.string().trim().refine(v => {
//     const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 5
//   }, 'Enter an integer 1–5'),
//   minNotional: z.string().trim().refine(v => {
//     const n = Number(v); return Number.isFinite(n) && n >= 1 && n <= 100
//   }, 'Enter a number between 1 and 100'),
//   enable: z.boolean(),
// })

// type Step = 1 | 2

// interface PredictionPanelProps {
//   className?: string
// }

// const PredictionPanel: React.FC<PredictionPanelProps> = ({ className }) => {
//   // -------- userId (wallet) --------
//   const { publicKey } = useWallet()
//   const searchParams = useSearchParams()
//   const uidFromQuery = searchParams.get('uid') ?? ''
//   const userId = useMemo(
//     () => publicKey?.toBase58() || uidFromQuery,
//     [publicKey, uidFromQuery]
//   )

//   // -------- status + ui gates --------
//   const [statusPayload, setStatusPayload] = useState<any>(null)
//   const [hasExistingConfig, setHasExistingConfig] = useState<boolean | null>(null)

//   // derive from status
//   const enabled =
//     !!(statusPayload && (statusPayload.enable ?? statusPayload.enabled))

//   // raw lastSeen can be string/number/object; treat ANY non-null as "has last seen"
//   const lastSeenRaw =
//     statusPayload?.lastSeen ??
//     statusPayload?.last_seen ??
//     statusPayload?.lastSeenAt ??
//     statusPayload?.last_seen_at ??
//     null

//   const hasLastSeen = lastSeenRaw != null

//   // pretty string for UI (optional)
//   const lastSeenDisplay = (() => {
//     if (!hasLastSeen) return null
//     const candidate =
//       (typeof lastSeenRaw === 'object' && (lastSeenRaw as any)?.time)
//         ? (lastSeenRaw as any).time
//         : lastSeenRaw
//     const d = new Date(String(candidate))
//     return isNaN(d.getTime()) ? null : d.toLocaleString()
//   })()

//   const isEmptyStatus =
//     statusPayload == null ||
//     (Array.isArray(statusPayload) && statusPayload.length === 0) ||
//     (typeof statusPayload === 'object' && Object.keys(statusPayload).length === 0)

//   // RULE:
//   // Allow Copy ONLY if status is empty OR (enabled === false AND NO lastSeen present)
//   // Otherwise show controls
//   const allowCopy = isEmptyStatus || (!enabled && !hasLastSeen)
//   const showControls = !allowCopy

//   // -------- wizard state --------
//   const [showCopyWizard, setShowCopyWizard] = useState(false)
//   const [step, setStep] = useState<Step>(1)
//   const [submitting, setSubmitting] = useState(false)
//   const [showSecret, setShowSecret] = useState(false)

//   const [creds, setCreds] = useState({ wallet: '', apiKey: '', apiAddr: '' })
//   const [cfg, setCfg] = useState({
//     capitalUsage: '',
//     maxLeverage: '',
//     minNotional: '',
//     enable: false, // default false
//   })

//   const [credsErrors, setCredsErrors] = useState<Partial<Record<keyof typeof creds, string>>>({})
//   const [cfgErrors, setCfgErrors] = useState<Partial<Record<keyof typeof cfg, string>>>({})
//   const [info, setInfo] = useState('')

//   // -------- fetch status --------
//   useEffect(() => {
//     let cancelled = false
//     async function checkStatus() {
//       if (!userId) {
//         setHasExistingConfig(false)
//         setStatusPayload(null)
//         return
//       }
//       try {
//         const res = await fetch(`/api/bot/status?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' })
//         const data = await res.json().catch(() => ({}))
//         if (cancelled) return
//         setStatusPayload(data)
//         const empty =
//           data == null ||
//           (Array.isArray(data) && data.length === 0) ||
//           (typeof data === 'object' && Object.keys(data).length === 0)
//         setHasExistingConfig(!empty)
//       } catch (e) {
//         console.error('[bot/status] error', e)
//         if (!cancelled) {
//           setHasExistingConfig(false)
//           setStatusPayload(null)
//         }
//       }
//     }
//     checkStatus()
//     return () => { cancelled = true }
//   }, [userId])

//   // -------- step 1 -> next --------
//   function validateStep1AndGoNext() {
//     setCredsErrors({})
//     setInfo('')
//     const result = CredsSchema.safeParse(creds)
//     if (!result.success) {
//       const fe = result.error.flatten().fieldErrors
//       setCredsErrors({
//         wallet: fe.wallet?.[0],
//         apiKey: fe.apiKey?.[0],
//         apiAddr: fe.apiAddr?.[0],
//       })
//       return
//     }
//     if (!creds.wallet.trim().startsWith('0x') && result.data.wallet.startsWith('0x')) {
//       setInfo('Added missing 0x prefix to wallet.')
//     }
//     setCreds(result.data)
//     setStep(2)
//   }

//   // -------- setup submit --------
//   async function handleEnableCopy() {
//     setCfgErrors({})
//     const parsed = RiskCfgSchema.safeParse(cfg)
//     if (!parsed.success) {
//       const fe = parsed.error.flatten().fieldErrors
//       setCfgErrors({
//         capitalUsage: fe.capitalUsage?.[0],
//         maxLeverage: fe.maxLeverage?.[0],
//         minNotional: fe.minNotional?.[0],
//         enable: fe.enable?.[0] as any,
//       })
//       return
//     }
//     if (!userId) {
//       alert('Connect your Solana wallet first (or open from the Report page).')
//       return
//     }

//     setSubmitting(true)
//     try {
//       const body = {
//         userId,
//         HL_MAIN_PK: creds.apiKey, // same as HL_API_PK
//         HL_MAIN_ADDR: creds.wallet,
//         HL_API_PK: creds.apiKey,
//         HL_API_ADDR: creds.apiAddr,
//         CAPITAL_USAGE: Number(parsed.data.capitalUsage),
//         MAX_LEVERAGE: Number(parsed.data.maxLeverage),
//         MIN_NOTIONAL: Number(parsed.data.minNotional),
//         enable: parsed.data.enable ?? false,
//       }

//       const res = await fetch('/api/bot/setup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       })
//       if (!res.ok) throw new Error('Setup failed')

//       // Refresh status
//       const statusRes = await fetch(`/api/bot/status?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' })
//       if (statusRes.ok) {
//         const statusData = await statusRes.json()
//         setStatusPayload(statusData)
//         const empty =
//           statusData == null ||
//           (Array.isArray(statusData) && statusData.length === 0) ||
//           (typeof statusData === 'object' && Object.keys(statusData).length === 0)
//         setHasExistingConfig(!empty)
//       }

//       setShowCopyWizard(false)
//     } catch (e) {
//       console.error(e)
//       alert('Failed to enable copy trading. Check server logs.')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   // -------- actions --------
//   async function postAction(path: '/api/bot/start' | '/api/bot/stop' | '/api/bot/trade-once') {
//     if (!userId) return
//     try {
//       const res = await fetch(path, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId }),
//       })
//       const data = await res.json().catch(() => ({}))
//       if (!res.ok) {
//         console.error(`${path} failed`, data)
//         alert(`Action failed: ${path.split('/').pop()}`)
//         return
//       }
//       // refresh status
//       const statusRes = await fetch(`/api/bot/status?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' })
//       if (statusRes.ok) {
//         const s = await statusRes.json()
//         setStatusPayload(s)
//         setHasExistingConfig(true)
//       }
//     } catch (e) {
//       console.error(`${path} error`, e)
//     }
//   }

//   const step1Valid = creds.wallet && creds.apiKey && creds.apiAddr
//   const step2Valid = RiskCfgSchema.safeParse(cfg).success

//   return (
//     <div className={clsx('bg-gray-900 text-white p-6 rounded-lg w-full max-w-md md:w-80 h-full space-y-4 mx-auto md:mx-0', className)}>
//       <div className="rounded-lg border border-gray-700 bg-gray-850 p-4">
//         <div className="flex items-start justify-between">
//           <div>
//             <h3 className="text-lg font-semibold">
//               {showControls ? 'Bot Controls' : 'Copy ZkAGI Trade'}
//             </h3>
//             <p className="text-xs text-gray-400">
//               {showControls
//                 ? 'Manage your trading bot.'
//                 : 'Mirror our signals with your limits and leverage rules.'}
//             </p>
//           </div>

//           {/* Header button appears only when Copy is allowed and wizard is closed */}
//           {allowCopy && !showCopyWizard && (
//             <button
//               onClick={() => { setShowCopyWizard(true); setStep(1) }}
//               className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold disabled:opacity-50"
//               disabled={!userId}
//               title={userId ? '' : 'Connect wallet or open from Report page'}
//             >
//               Copy
//             </button>
//           )}
//         </div>

//         {/* Controls view for all other cases */}
//         {showControls && (
//           <div className="mt-4 space-y-3">
//             <div className="text-xs text-gray-300">
//               <span className="font-semibold">User ID:</span> {userId}
//             </div>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => postAction('/api/bot/start')}
//                 className="flex-1 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
//                 type="button"
//               >
//                 Start
//               </button>
//               <button
//                 onClick={() => postAction('/api/bot/stop')}
//                 className="flex-1 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-sm font-semibold"
//                 type="button"
//               >
//                 Stop
//               </button>
//               <button
//                 onClick={() => postAction('/api/bot/trade-once')}
//                 className="flex-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-sm font-semibold"
//                 type="button"
//               >
//                 Run once
//               </button>
//             </div>

//             {/* show Last seen only if non-null */}
//             {lastSeenDisplay && (
//               <div className="mt-2 text-right text-[11px] text-gray-400">
//                 Last seen: {lastSeenDisplay}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Copy wizard ONLY when allowed */}
//         {allowCopy && showCopyWizard && (
//           <div className="mt-4 space-y-3">
//             {/* Stepper */}
//             <div className="flex items-center text-xs">
//               <div className={clsx('px-2 py-1 rounded', step === 1 ? 'bg-blue-600' : 'bg-gray-700')}>1. Secrets</div>
//               <div className="mx-2 h-px flex-1 bg-gray-700" />
//               <div className={clsx('px-2 py-1 rounded', step === 2 ? 'bg-blue-600' : 'bg-gray-700')}>2. Config</div>
//             </div>

//             {/* Step 1 */}
//             {step === 1 && (
//               <div className="space-y-3">
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-400">HyperLiquid Wallet Address (HL_MAIN_ADDR)</label>
//                   <input
//                     value={creds.wallet}
//                     onChange={e => setCreds(s => ({ ...s, wallet: e.target.value.trim() }))}
//                     className={clsx('w-full bg-gray-800 border rounded px-3 py-2 text-sm', credsErrors.wallet ? 'border-red-600' : 'border-gray-700')}
//                     placeholder="0x…"
//                   />
//                   {credsErrors.wallet && <p className="text-[11px] text-red-500">{credsErrors.wallet}</p>}
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-400">Hyperliquid API Key (HL_API_PK)</label>
//                   <input
//                     value={creds.apiKey}
//                     onChange={e => setCreds(s => ({ ...s, apiKey: e.target.value.trim() }))}
//                     className={clsx('w-full bg-gray-800 border rounded px-3 py-2 text-sm', credsErrors.apiKey ? 'border-red-600' : 'border-gray-700')}
//                     placeholder="hlpk_********"
//                   />
//                   {credsErrors.apiKey && <p className="text-[11px] text-red-500">{credsErrors.apiKey}</p>}
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-400">HL API Address (HL_API_ADDR)</label>
//                   <div className="flex gap-2">
//                     <input
//                       type={showSecret ? 'text' : 'password'}
//                       value={creds.apiAddr}
//                       onChange={e => setCreds(s => ({ ...s, apiAddr: e.target.value.trim() }))}
//                       className={clsx('flex-1 bg-gray-800 border rounded px-3 py-2 text-sm', credsErrors.apiAddr ? 'border-red-600' : 'border-gray-700')}
//                       placeholder="••••••••"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowSecret(v => !v)}
//                       className="px-2 text-xs rounded bg-gray-700 hover:bg-gray-600"
//                     >
//                       {showSecret ? 'Hide' : 'Show'}
//                     </button>
//                   </div>
//                   {credsErrors.apiAddr && <p className="text-[11px] text-red-500">{credsErrors.apiAddr}</p>}
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     className="flex-1 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
//                     onClick={() => setShowCopyWizard(false)}
//                     type="button"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     className="flex-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm"
//                     disabled={!creds.wallet || !creds.apiKey || !creds.apiAddr}
//                     onClick={validateStep1AndGoNext}
//                     type="button"
//                   >
//                     Next
//                   </button>
//                 </div>

//                 <p className="text-[10px] text-gray-500">
//                   The system is configured to store credentials and keys on a TEE,{' '}
//                   <a href="" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">read more.</a>
//                 </p>
//               </div>
//             )}

//             {/* Step 2 */}
//             {step === 2 && (
//               <div className="space-y-3">
//                 <div className="grid grid-cols-2 gap-2">
//                   <div className="space-y-1">
//                     <label className="text-xs text-gray-400">CAPITAL_USAGE (0–1)</label>
//                     <input
//                       inputMode="decimal"
//                       value={cfg.capitalUsage}
//                       onChange={e => setCfg(s => ({ ...s, capitalUsage: e.target.value }))}
//                       className={clsx('w-full bg-gray-800 border rounded px-3 py-2 text-sm', cfgErrors.capitalUsage ? 'border-red-600' : 'border-gray-700')}
//                       placeholder="e.g. 0.3"
//                     />
//                     {cfgErrors.capitalUsage && <p className="text-[11px] text-red-500">{cfgErrors.capitalUsage}</p>}
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-xs text-gray-400">MAX_LEVERAGE (1–5)</label>
//                     <input
//                       inputMode="numeric"
//                       value={cfg.maxLeverage}
//                       onChange={e => setCfg(s => ({ ...s, maxLeverage: e.target.value }))}
//                       className={clsx('w-full bg-gray-800 border rounded px-3 py-2 text-sm', cfgErrors.maxLeverage ? 'border-red-600' : 'border-gray-700')}
//                       placeholder="e.g. 5"
//                     />
//                     {cfgErrors.maxLeverage && <p className="text-[11px] text-red-500">{cfgErrors.maxLeverage}</p>}
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-xs text-gray-400">MIN_NOTIONAL (1–100)</label>
//                     <input
//                       inputMode="decimal"
//                       value={cfg.minNotional}
//                       onChange={e => setCfg(s => ({ ...s, minNotional: e.target.value }))}
//                       className={clsx('w-full bg-gray-800 border rounded px-3 py-2 text-sm', cfgErrors.minNotional ? 'border-red-600' : 'border-gray-700')}
//                       placeholder="e.g. 20"
//                     />
//                     {cfgErrors.minNotional && <p className="text-[11px] text-red-500">{cfgErrors.minNotional}</p>}
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-xs text-gray-400">Enable</label>
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs text-gray-400">{cfg.enable ? 'true' : 'false'}</span>
//                       <button
//                         onClick={() => setCfg(s => ({ ...s, enable: !s.enable }))}
//                         className={clsx('px-3 py-1 rounded text-sm', cfg.enable ? 'bg-emerald-600' : 'bg-gray-700')}
//                         type="button"
//                       >
//                         {cfg.enable ? 'Enabled' : 'Disabled'}
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     className="flex-1 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
//                     onClick={() => setStep(1)}
//                     type="button"
//                   >
//                     Back
//                   </button>
//                   <button
//                     className="flex-1 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-sm"
//                     disabled={!step2Valid || submitting}
//                     onClick={handleEnableCopy}
//                     type="button"
//                   >
//                     {submitting ? 'Enabling…' : 'Enable Copy Trading'}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default PredictionPanel

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { z } from 'zod'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSearchParams } from 'next/navigation'

// ================= Validation helpers =================
const KEY_CHARS = /^[A-Za-z0-9_-]+$/
const HEX40 = /^[0-9a-fA-F]{40}$/
const HEX40_WITH_0X = /^0x[0-9a-fA-F]{40}$/

const KeySchema = z
  .string()
  .trim()
  .length(107, 'Must be exactly 107 characters.')
  .regex(KEY_CHARS, 'Invalid characters.')

const WalletSchema = z
  .string()
  .trim()
  .transform((v) => (HEX40.test(v) && !v.startsWith('0x') ? `0x${v}` : v))
  .refine((v) => HEX40_WITH_0X.test(v), 'Wallet must be 0x + 40 hex (42 chars).')

/** Step 1: Secrets */
const CredsSchema = z.object({
  wallet: WalletSchema,       // HL_MAIN_ADDR
  apiKey: KeySchema,          // HL_API_PK (and HL_MAIN_PK = same)
  apiAddr: z.string().trim(), // HL_API_ADDR (renamed UI field)
})

/** Step 2: Config (4 fields only) */
const RiskCfgSchema = z.object({
  capitalUsage: z.string().trim().refine(v => {
    const n = Number(v); return Number.isFinite(n) && n >= 0 && n <= 1
  }, 'Enter a decimal between 0 and 1 (e.g. 0.3)'),
  maxLeverage: z.string().trim().refine(v => {
    const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 5
  }, 'Enter an integer 1–5'),
  minNotional: z.string().trim().refine(v => {
    const n = Number(v); return Number.isFinite(n) && n >= 1 && n <= 100
  }, 'Enter a number between 1 and 100'),
  enable: z.boolean(),
})

type Step = 1 | 2

interface PredictionPanelProps {
  className?: string
}

const PredictionPanel: React.FC<PredictionPanelProps> = ({ className }) => {
  // -------- userId (wallet) --------
  const { publicKey } = useWallet()
  const searchParams = useSearchParams()
  const uidFromQuery = searchParams.get('uid') ?? ''
  const userId = useMemo(
    () => publicKey?.toBase58() || uidFromQuery,
    [publicKey, uidFromQuery]
  )

  // -------- status + ui gates --------
  const [statusPayload, setStatusPayload] = useState<any>(null)
  const [hasExistingConfig, setHasExistingConfig] = useState<boolean | null>(null)

  // derive from status
  const enabled =
    !!(statusPayload && (statusPayload.enable ?? statusPayload.enabled))

  // raw lastSeen can be string/number/object; treat ANY non-null as "has last seen"
  const lastSeenRaw =
    statusPayload?.lastSeen ??
    statusPayload?.last_seen ??
    statusPayload?.lastSeenAt ??
    statusPayload?.last_seen_at ??
    null

  const hasLastSeen = lastSeenRaw != null

  // pretty string for UI (optional)
  const lastSeenDisplay = (() => {
    if (!hasLastSeen) return null
    const candidate =
      (typeof lastSeenRaw === 'object' && (lastSeenRaw as any)?.time)
        ? (lastSeenRaw as any).time
        : lastSeenRaw
    const d = new Date(String(candidate))
    return isNaN(d.getTime()) ? null : d.toLocaleString()
  })()

  const isEmptyStatus =
    statusPayload == null ||
    (Array.isArray(statusPayload) && statusPayload.length === 0) ||
    (typeof statusPayload === 'object' && Object.keys(statusPayload).length === 0)

  // RULE:
  // Allow Copy ONLY if status is empty OR (enabled === false AND NO lastSeen present)
  // Otherwise show controls
  const allowCopy = isEmptyStatus || (!enabled && !hasLastSeen)
  const showControls = !allowCopy

  // -------- wizard state --------
  const [showCopyWizard, setShowCopyWizard] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const [creds, setCreds] = useState({ wallet: '', apiKey: '', apiAddr: '' })
  const [cfg, setCfg] = useState({
    capitalUsage: '',
    maxLeverage: '',
    minNotional: '',
    enable: false, // default false
  })

  const [credsErrors, setCredsErrors] = useState<Partial<Record<keyof typeof creds, string>>>({})
  const [cfgErrors, setCfgErrors] = useState<Partial<Record<keyof typeof cfg, string>>>({})
  const [info, setInfo] = useState('')

  // -------- toast state --------
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  // -------- show Trade Once result (tiny div) --------
  const [onceResult, setOnceResult] = useState<any>(null)

  // -------- fetch status --------
  useEffect(() => {
    let cancelled = false
    async function checkStatus() {
      if (!userId) {
        setHasExistingConfig(false)
        setStatusPayload(null)
        return
      }
      try {
        const res = await fetch(`/api/bot/status?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        setStatusPayload(data)
        const empty =
          data == null ||
          (Array.isArray(data) && data.length === 0) ||
          (typeof data === 'object' && Object.keys(data).length === 0)
        setHasExistingConfig(!empty)
      } catch (e) {
        console.error('[bot/status] error', e)
        if (!cancelled) {
          setHasExistingConfig(false)
          setStatusPayload(null)
        }
      }
    }
    checkStatus()
    return () => { cancelled = true }
  }, [userId])

  // -------- step 1 -> next --------
  function validateStep1AndGoNext() {
    setCredsErrors({})
    setInfo('')
    const result = CredsSchema.safeParse(creds)
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors
      setCredsErrors({
        wallet: fe.wallet?.[0],
        apiKey: fe.apiKey?.[0],
        apiAddr: fe.apiAddr?.[0],
      })
      return
    }
    if (!creds.wallet.trim().startsWith('0x') && result.data.wallet.startsWith('0x')) {
      setInfo('Added missing 0x prefix to wallet.')
    }
    setCreds(result.data)
    setStep(2)
  }

  // -------- setup submit --------
  async function handleEnableCopy() {
    setCfgErrors({})
    const parsed = RiskCfgSchema.safeParse(cfg)
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors
      setCfgErrors({
        capitalUsage: fe.capitalUsage?.[0],
        maxLeverage: fe.maxLeverage?.[0],
        minNotional: fe.minNotional?.[0],
        enable: fe.enable?.[0] as any,
      })
      return
    }
    if (!userId) {
      alert('Connect your Solana wallet first (or open from the Report page).')
      return
    }

    setSubmitting(true)
    try {
      const body = {
        userId,
        HL_MAIN_PK: creds.apiKey, // same as HL_API_PK
        HL_MAIN_ADDR: creds.wallet,
        HL_API_PK: creds.apiKey,
        HL_API_ADDR: creds.apiAddr,
        CAPITAL_USAGE: Number(parsed.data.capitalUsage),
        MAX_LEVERAGE: Number(parsed.data.maxLeverage),
        MIN_NOTIONAL: Number(parsed.data.minNotional),
        enable: parsed.data.enable ?? false,
      }

      const res = await fetch('/api/bot/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Setup failed')

      // Refresh status
      const statusRes = await fetch(`/api/bot/status?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' })
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        setStatusPayload(statusData)
        const empty =
          statusData == null ||
          (Array.isArray(statusData) && statusData.length === 0) ||
          (typeof statusData === 'object' && Object.keys(statusData).length === 0)
        setHasExistingConfig(!empty)
      }

      setShowCopyWizard(false)
      setToast({ type: 'success', msg: 'Copy trading setup saved.' })
    } catch (e) {
      console.error(e)
      setToast({ type: 'error', msg: 'Failed to enable copy trading.' })
    } finally {
      setSubmitting(false)
    }
  }

  // -------- actions --------
  async function postAction(path: '/api/bot/start' | '/api/bot/stop' | '/api/bot/trade-once') {
    if (!userId) return
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error(`${path} failed`, data)
        setToast({ type: 'error', msg: `Action failed: ${path.split('/').pop()}` })
        return
      }

      // Show success toast per action
      if (path.endsWith('start')) setToast({ type: 'success', msg: 'Bot started.' })
      if (path.endsWith('stop')) setToast({ type: 'success', msg: 'Bot stopped.' })
      if (path.endsWith('trade-once')) {
        setToast({ type: 'success', msg: 'Trade executed once.' })
        setOnceResult(data) // display tiny result div
      }

      // refresh status
      const statusRes = await fetch(`/api/bot/status?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' })
      if (statusRes.ok) {
        const s = await statusRes.json()
        setStatusPayload(s)
        setHasExistingConfig(true)
      }
    } catch (e) {
      console.error(`${path} error`, e)
      setToast({ type: 'error', msg: 'Network error' })
    }
  }

  const step1Valid = creds.wallet && creds.apiKey && creds.apiAddr
  const step2Valid = RiskCfgSchema.safeParse(cfg).success

  return (
    <div className={clsx('relative bg-gray-900 text-white p-6 rounded-lg w-full max-w-md md:w-80 h-full space-y-4 mx-auto md:mx-0', className)}>
      {/* Toast */}
      {toast && (
        <div
          className={clsx(
            'fixed z-50 right-4 top-4 px-3 py-2 rounded text-sm shadow',
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          )}
        >
          {toast.msg}
        </div>
      )}

      <div className="rounded-lg border border-gray-700 bg-gray-850 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {showControls ? 'Bot Controls' : 'Copy ZkAGI Trade'}
            </h3>
            <p className="text-xs text-gray-400">
              {showControls
                ? 'Manage your trading bot.'
                : 'Mirror our signals with your limits and leverage rules.'}
            </p>
          </div>

          {/* Header button appears only when Copy is allowed and wizard is closed */}
          {allowCopy && !showCopyWizard && (
            <button
              onClick={() => { setShowCopyWizard(true); setStep(1) }}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold disabled:opacity-50"
              disabled={!userId}
              title={userId ? '' : 'Connect wallet or open from Report page'}
            >
              Copy
            </button>
          )}
        </div>

        {/* Controls view for all other cases */}
        {showControls && (
          <div className="mt-4 space-y-3">
            <div className="text-xs text-gray-300">
              <span className="font-semibold">User ID:</span>{' '}
              <span className="break-all inline-block align-middle">{userId}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => postAction('/api/bot/start')}
                className="flex-1 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
                type="button"
              >
                Start
              </button>
              <button
                onClick={() => postAction('/api/bot/stop')}
                className="flex-1 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-sm font-semibold"
                type="button"
              >
                Stop
              </button>
              <button
                onClick={() => postAction('/api/bot/trade-once')}
                className="flex-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-sm font-semibold"
                type="button"
              >
                Run once
              </button>
            </div>

            {/* show Last seen only if non-null */}
            {lastSeenDisplay && (
              <div className="mt-2 text-right text-[11px] text-gray-400">
                Last seen: {lastSeenDisplay}
              </div>
            )}

            {/* Tiny div to show trade-once response if present */}
            {onceResult && (
              <div className="mt-2 p-2 rounded bg-gray-800 border border-gray-700 text-[11px] leading-snug break-words">
                <div className="text-gray-300 font-semibold mb-1">Last trade-once response</div>
                <pre className="whitespace-pre-wrap">
{typeof onceResult === 'string'
  ? onceResult
  : JSON.stringify(onceResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Copy wizard ONLY when allowed */}
        {allowCopy && showCopyWizard && (
          <div className="mt-4 space-y-3">
            {/* Stepper */}
            <div className="flex items-center text-xs">
              <div className={clsx('px-2 py-1 rounded', step === 1 ? 'bg-blue-600' : 'bg-gray-700')}>1. Secrets</div>
              <div className="mx-2 h-px flex-1 bg-gray-700" />
              <div className={clsx('px-2 py-1 rounded', step === 2 ? 'bg-blue-600' : 'bg-gray-700')}>2. Config</div>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">HyperLiquid Wallet Address (HL_MAIN_ADDR)</label>
                  <input
                    value={creds.wallet}
                    onChange={e => setCreds(s => ({ ...s, wallet: e.target.value.trim() }))}
                    className={clsx('w-full bg-gray-800 border rounded px-3 py-2 text-sm', credsErrors.wallet ? 'border-red-600' : 'border-gray-700')}
                    placeholder="0x…"
                  />
                  {credsErrors.wallet && <p className="text-[11px] text-red-500">{credsErrors.wallet}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Hyperliquid API Key (HL_API_PK)</label>
                  <input
                    value={creds.apiKey}
                    onChange={e => setCreds(s => ({ ...s, apiKey: e.target.value.trim() }))}
                    className={clsx('w-full bg-gray-800 border rounded px-3 py-2 text-sm', credsErrors.apiKey ? 'border-red-600' : 'border-gray-700')}
                    placeholder="hlpk_********"
                  />
                  {credsErrors.apiKey && <p className="text-[11px] text-red-500">{credsErrors.apiKey}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">HL API Address (HL_API_ADDR)</label>
                  <div className="flex gap-2">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={creds.apiAddr}
                      onChange={e => setCreds(s => ({ ...s, apiAddr: e.target.value.trim() }))}
                      className={clsx('flex-1 bg-gray-800 border rounded px-3 py-2 text-sm', credsErrors.apiAddr ? 'border-red-600' : 'border-gray-700')}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(v => !v)}
                      className="px-2 text-xs rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {showSecret ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {credsErrors.apiAddr && <p className="text-[11px] text-red-500">{credsErrors.apiAddr}</p>}
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                    onClick={() => setShowCopyWizard(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm"
                    disabled={!step1Valid}
                    onClick={validateStep1AndGoNext}
                    type="button"
                  >
                    Next
                  </button>
                </div>

                <p className="text-[10px] text-gray-500">
                  The system is configured to store credentials and keys on a TEE,{' '}
                  <a href="" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">read more.</a>
                </p>
              </div>
            )}

            {/* Step 2 — stacked vertically (one below another) */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">CAPITAL_USAGE (0–1)</label>
                  <input
                    inputMode="decimal"
                    value={cfg.capitalUsage}
                    onChange={e => setCfg(s => ({ ...s, capitalUsage: e.target.value }))}
                    className={clsx('w-full bg-gray-800 border rounded px-3 py-2 text-sm', cfgErrors.capitalUsage ? 'border-red-600' : 'border-gray-700')}
                    placeholder="e.g. 0.3"
                  />
                  {cfgErrors.capitalUsage && <p className="text-[11px] text-red-500">{cfgErrors.capitalUsage}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">MAX_LEVERAGE (1–5)</label>
                  <input
                    inputMode="numeric"
                    value={cfg.maxLeverage}
                    onChange={e => setCfg(s => ({ ...s, maxLeverage: e.target.value }))}
                    className={clsx('w-full bg-gray-800 border rounded px-3 py-2 text-sm', cfgErrors.maxLeverage ? 'border-red-600' : 'border-gray-700')}
                    placeholder="e.g. 5"
                  />
                  {cfgErrors.maxLeverage && <p className="text-[11px] text-red-500">{cfgErrors.maxLeverage}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">MIN_NOTIONAL (1–100)</label>
                  <input
                    inputMode="decimal"
                    value={cfg.minNotional}
                    onChange={e => setCfg(s => ({ ...s, minNotional: e.target.value }))}
                    className={clsx('w-full bg-gray-800 border rounded px-3 py-2 text-sm', cfgErrors.minNotional ? 'border-red-600' : 'border-gray-700')}
                    placeholder="e.g. 20"
                  />
                  {cfgErrors.minNotional && <p className="text-[11px] text-red-500">{cfgErrors.minNotional}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Enable</label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{cfg.enable ? 'true' : 'false'}</span>
                    <button
                      onClick={() => setCfg(s => ({ ...s, enable: !s.enable }))}
                      className={clsx('px-3 py-1 rounded text-sm', cfg.enable ? 'bg-emerald-600' : 'bg-gray-700')}
                      type="button"
                    >
                      {cfg.enable ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                    onClick={() => setStep(1)}
                    type="button"
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-sm"
                    disabled={!step2Valid || submitting}
                    onClick={handleEnableCopy}
                    type="button"
                  >
                    {submitting ? 'Enabling…' : 'Enable Copy Trading'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PredictionPanel
