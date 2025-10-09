// "use client";
// import { useFormContext } from "react-hook-form";
// import { motion } from "framer-motion";
// import { useAgentFormStore } from "@/stores/agent-form-store";

// type ReviewStepProps = {
//   onEditStep: (step: string) => void;
// };

// export default function ReviewStep({ onEditStep }: ReviewStepProps) {
//   const { watch, register, formState: { errors } } = useFormContext();
//   const { data: storeData } = useAgentFormStore();

//   // Merge: store is the source of truth; RHF watch() may have the latest keystrokes.
//   // RHF values take precedence when present.
//   const rhf = watch();
//   const formData = { ...storeData, ...rhf };

//   const knowledgeFiles = (formData.knowledgeFiles ?? []) as File[];
//   const websiteUrls = (formData.websiteUrls ?? []) as string[];
//   const newsFilters = (formData.newsFilters ?? []) as string[];
//   const predictionMarkets = (formData.predictionMarkets ?? []) as string[];
//   const selectedAgents = (formData.selectedAgents ?? []) as string[];

//   // Voice summary
//   let voiceSummary = "—";
//   if (formData.voiceType === "preset") {
//     voiceSummary = `Preset (${formData.presetVoice ?? "not selected"})`;
//   } else if (formData.voiceType === "upload" || formData.voiceType === "custom") {
//     // you’re normalizing upload→custom in API, but for display we show what the user did
//     voiceSummary = "Custom Sample";
//   }

//   // Visual summary
//   const visualSummary =
//     formData.spokespersonType === "upload"
//       ? "Custom Photo"
//       : formData.spokespersonType === "preset"
//       ? `Preset (${formData.presetAvatar ?? "not selected"})`
//       : "—";

//   const sections = [
//     {
//       step: "Jurisdiction",
//       icon: "🌍",
//       fields: [
//         { label: "Type", value: formData.jurisdictionType === "business" ? "Business" : formData.jurisdictionType === "individual" ? "Individual" : "—" },
//         { label: "Country", value: formData.country || "—" },
//       ],
//     },
//     {
//       step: "Contact",
//       icon: "📧",
//       fields: [
//         { label: "Email", value: formData.email || "—" },
//         { label: "Telegram", value: formData.telegram || "—" },
//         { label: "Website", value: formData.website || "—" },
//       ],
//     },
//     {
//       step: "Knowledge",
//       icon: "📚",
//       custom: (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-9">
//           <div className="text-sm">
//             <span className="text-gray-500">Files Uploaded:</span>{" "}
//             <span className="text-gray-300">{knowledgeFiles.length}</span>
//             {knowledgeFiles.length > 0 && (
//               <ul className="mt-1 text-xs text-gray-400 list-disc list-inside">
//                 {knowledgeFiles.map((f, i) => (
//                   <li key={i}>{f.name}</li>
//                 ))}
//               </ul>
//             )}
//           </div>
//           <div className="text-sm">
//             <span className="text-gray-500">Website URLs:</span>{" "}
//             <span className="text-gray-300">{websiteUrls.length}</span>
//             {websiteUrls.length > 0 && (
//               <ul className="mt-1 text-xs text-gray-400 list-disc list-inside break-all">
//                 {websiteUrls.map((u, i) => (
//                   <li key={i}>{u}</li>
//                 ))}
//               </ul>
//             )}
//           </div>
//           <div className="text-sm md:col-span-2">
//             <span className="text-gray-500">News Filters:</span>{" "}
//             <span className="text-gray-300">{newsFilters.length}</span>
//             {newsFilters.length > 0 && (
//               <span className="ml-2 text-xs text-gray-400">
//                 {newsFilters.join(", ")}
//               </span>
//             )}
//           </div>
//         </div>
//       ),
//     },
//     {
//       step: "Character",
//       icon: "💬",
//       fields: [
//         { label: "Personality Defined", value: formData.masterPrompt ? "✓" : "—" },
//         { label: "Twitter References", value: formData.twitterAccounts ? "✓" : "—" },
//       ],
//     },
//     {
//       step: "Visual",
//       icon: "🎨",
//       fields: [{ label: "Spokesperson", value: visualSummary }],
//     },
//     {
//       step: "Voice",
//       icon: "🎤",
//       fields: [{ label: "Voice", value: voiceSummary }],
//     },
//     {
//       step: "Agents",
//       icon: "🤖",
//       custom: (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-9">
//           <div className="text-sm">
//             <span className="text-gray-500">Trading Model:</span>{" "}
//             <span className="text-gray-300">
//               {formData.tradingModel === "foundational"
//                 ? "ZkAGI Foundational"
//                 : formData.tradingModel || "—"}
//             </span>
//           </div>
//           <div className="text-sm">
//             <span className="text-gray-500">Prediction Markets:</span>{" "}
//             <span className="text-gray-300">{predictionMarkets.length}</span>
//             {predictionMarkets.length > 0 && (
//               <span className="ml-2 text-xs text-gray-400">
//                 {predictionMarkets.join(", ")}
//               </span>
//             )}
//           </div>
//           <div className="text-sm md:col-span-2">
//             <span className="text-gray-500">Selected Agents:</span>{" "}
//             <span className="text-gray-300">{selectedAgents.length}</span>
//             {selectedAgents.length > 0 && (
//               <span className="ml-2 text-xs text-gray-400">
//                 {selectedAgents.join(", ")}
//               </span>
//             )}
//           </div>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
//         <h3 className="text-2xl font-bold mb-2">Review & Launch Your ZEE</h3>
//       </motion.div>

//       {/* Summary Cards */}
//       <div className="space-y-3">
//         {sections.map((section, idx) => (
//           <motion.div
//             key={section.step}
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: idx * 0.05 }}
//             className="bg-[#1A1F3A] rounded-lg p-4 border border-[#2A2F5E]"
//           >
//             <div className="flex items-start justify-between mb-3">
//               <div className="flex items-center gap-3">
//                 <span className="text-2xl">{section.icon}</span>
//                 <h4 className="font-semibold">{section.step}</h4>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => onEditStep(section.step)}
//                 className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
//               >
//                 Edit
//               </button>
//             </div>

//             {/* Either render custom block or simple key/values */}
//             {section.custom ? (
//               section.custom
//             ) : (
//               <div className="grid grid-cols-2 gap-3 ml-9">
//                 {(section.fields ?? []).map((field, i) => (
//                   <div key={i} className="text-sm">
//                     <span className="text-gray-500">{field.label}:</span>{" "}
//                     <span className="text-gray-300">{field.value}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </motion.div>
//         ))}
//       </div>

//       {/* Terms & Conditions */}
//       <div className="bg-[#1A1F3A] rounded-lg p-4 border border-[#2A2F5E]">
//         <label className="flex items-start gap-3 cursor-pointer">
//           <input type="checkbox" {...register("agreeToTerms")} className="mt-1" />
//           <span className="text-sm text-gray-300">
//             I agree to the{" "}
//             <a href="/terms" className="text-purple-400 hover:underline" target="_blank" rel="noreferrer">
//               Terms of Service
//             </a>{" "}
//             and{" "}
//             <a href="/privacy" className="text-purple-400 hover:underline" target="_blank" rel="noreferrer">
//               Privacy Policy
//             </a>
//           </span>
//         </label>
//         {errors.agreeToTerms && (
//           <p className="text-red-400 text-sm mt-2">{String(errors.agreeToTerms.message || "")}</p>
//         )}
//       </div>

//       {/* Final CTA Message */}
//       <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6 text-center">
//         <h4 className="text-lg font-semibold mb-2">🎉 Ready to Launch!</h4>
//         <p className="text-sm text-gray-300">
//           Your ZEE is configured and ready to go. Click &apos;Launch My ZEE&apos; below to bring it to life!
//         </p>
//       </div>
//     </div>
//   );
// }


// "use client";
// import { useEffect, useMemo, useState } from "react";
// import { useFormContext } from "react-hook-form";
// import { motion } from "framer-motion";
// import { useAgentFormStore } from "@/stores/agent-form-store";

// /**
//  * If possible, add this to your ZeeForm type in the store:
//  *   kbAssetProofs?: Record<string, any>;
//  * Otherwise this component still writes it using `as any` to avoid TS nags.
//  */

// type ReviewStepProps = {
//   onEditStep: (step: string) => void;
// };

// // optional env base (or hardcode the host)
// const KB_API_BASE =
//   process.env.NEXT_PUBLIC_KB_API_BASE || "http://45.251.34.28:8009";

// type KbAsset = {
//   asset_id: string;
//   name?: string;
//   is_public?: boolean;
//   type?: "file" | "url" | string;
//   url?: string | null;
// };

// export default function ReviewStep({ onEditStep }: ReviewStepProps) {
//   const { watch, register, formState: { errors } } = useFormContext();
//   const { data: storeData, setData } = useAgentFormStore();

//   // Merge: RHF watch() may have the latest keystrokes; use them over store.
//   const rhf = watch();
//   const formData = { ...storeData, ...rhf };

//   // ----- Voice summary
//   let voiceSummary = "—";
//   if (formData.voiceType === "preset") {
//     voiceSummary = `Preset (${formData.presetVoice ?? "not selected"})`;
//   } else if (formData.voiceType === "upload" || formData.voiceType === "custom") {
//     voiceSummary = "Custom Sample";
//   }

//   // ----- Visual summary
//   const visualSummary =
//     formData.spokespersonType === "upload"
//       ? "Custom Photo"
//       : formData.spokespersonType === "preset"
//       ? `Preset (${formData.presetAvatar ?? "not selected"})`
//       : "—";

//   // ===== Knowledge: prepare assets lists =====
//   const kbId = (formData.kbId as string) || "";
//   const kbPublicAssetMap = (formData.kbPublicAssetMap ?? {}) as Record<string, string>;
//   const kbPrivateAssetMap = (formData.kbPrivateAssetMap ?? {}) as Record<string, string>;
//   const kbPublicUrls = (formData.kbPublicUrls ?? []) as string[];
//   const kbPrivateUrls = (formData.kbPrivateUrls ?? []) as string[];

//   // Proofs bucket (safe cast to avoid TS if you didn't add it to ZeeForm yet)
//   const kbAssetProofs: Record<string, any> = (formData as any).kbAssetProofs || {};

//   const [preparing, setPreparing] = useState<boolean>(true);
//   const [prepMsg, setPrepMsg] = useState<string>("Compiling your choices…");
//   const [assetsPublic, setAssetsPublic] = useState<KbAsset[]>([]);
//   const [assetsPrivate, setAssetsPrivate] = useState<KbAsset[]>([]);
//   const [proofOpen, setProofOpen] = useState<Record<string, boolean>>({}); // asset_id -> open/closed

//   // Toggle proof detail view
//   const toggleProof = (assetId: string) =>
//     setProofOpen((s) => ({ ...s, [assetId]: !s[assetId] }));

//   // Generate a proof for a single asset (and store)
//   const generateProof = async (asset: KbAsset) => {
//     if (!kbId || !asset.asset_id) return;
//     try {
//       const res = await fetch(`${KB_API_BASE}/kb/proofs/generate`, {
//         method: "POST",
//         headers: { "accept": "application/json", "Content-Type": "application/json" },
//         body: JSON.stringify({ kb_id: kbId, asset_id: asset.asset_id }),
//       });
//       const json = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(json?.message || `Failed proof for ${asset.asset_id}`);

//       const next = { ...(kbAssetProofs || {}) };
//       next[asset.asset_id] = json;

//       setData({ kbAssetProofs: next } as any);
//       return json;
//     } catch (err) {
//       // keep it silent; user can retry via Verify button
//       console.error("Proof generation error:", err);
//       return null;
//     }
//   };

//   // Load KB assets + generate proofs for private ones before showing the Review
//   useEffect(() => {
//     let cancelled = false;
//     const load = async () => {
//       setPreparing(true);
//       setPrepMsg("Compiling your choices and preferences…");

//       let fetchedPublic: KbAsset[] = [];
//       let fetchedPrivate: KbAsset[] = [];

//       // 1) Try KB assets API if kbId exists
//       if (kbId) {
//         try {
//           setPrepMsg("Fetching your knowledge base assets…");
//           const r = await fetch(`${KB_API_BASE}/kb/${encodeURIComponent(kbId)}/assets`, {
//             headers: { accept: "application/json" },
//           });
//           if (!cancelled && r.ok) {
//             const list = (await r.json().catch(() => [])) as KbAsset[];
//             const pub = list.filter((a) => !!a.is_public);
//             const priv = list.filter((a) => !a.is_public);
//             fetchedPublic = pub;
//             fetchedPrivate = priv;
//           }
//         } catch {
//           // ignore; will fallback
//         }
//       }

//       // 2) Fallback: build from what we stored during Knowledge step
//       if (!fetchedPublic.length && !fetchedPrivate.length) {
//         setPrepMsg("Preparing local knowledge fallback…");

//         const pubFromMap: KbAsset[] = Object.entries(kbPublicAssetMap).map(
//           ([nameOrUrl, asset_id]) => ({
//             asset_id,
//             name: nameOrUrl,
//             is_public: true,
//             type: nameOrUrl.startsWith("http") ? "url" : "file",
//             url: nameOrUrl.startsWith("http") ? nameOrUrl : undefined,
//           })
//         );
//         const privFromMap: KbAsset[] = Object.entries(kbPrivateAssetMap).map(
//           ([nameOrUrl, asset_id]) => ({
//             asset_id,
//             name: nameOrUrl,
//             is_public: false,
//             type: nameOrUrl.startsWith("http") ? "url" : "file",
//             url: nameOrUrl.startsWith("http") ? nameOrUrl : undefined,
//           })
//         );

//         // include any urls that got no asset_id recorded (rare)
//         for (const u of kbPublicUrls) {
//           if (!pubFromMap.find((a) => a.url === u)) {
//             pubFromMap.push({ asset_id: `url:${u}`, name: u, is_public: true, type: "url", url: u });
//           }
//         }
//         for (const u of kbPrivateUrls) {
//           if (!privFromMap.find((a) => a.url === u)) {
//             privFromMap.push({ asset_id: `url:${u}`, name: u, is_public: false, type: "url", url: u });
//           }
//         }

//         fetchedPublic = pubFromMap;
//         fetchedPrivate = privFromMap;
//       }

//       if (cancelled) return;

//       setAssetsPublic(fetchedPublic);
//       setAssetsPrivate(fetchedPrivate);

//       // 3) Generate proofs for private ones (progressive)
//       if (fetchedPrivate.length) {
//         let idx = 0;
//         for (const a of fetchedPrivate) {
//           idx += 1;
//           setPrepMsg(`Generating private proofs ${idx}/${fetchedPrivate.length}…`);
//           // Skip if we already have it
//           if (!kbAssetProofs[a.asset_id]) {
//             await generateProof(a);
//           }
//           if (cancelled) return;
//         }
//       }

//       setPrepMsg("Almost done…");
//       // tiny delay for UX
//       await new Promise((r) => setTimeout(r, 250));
//       if (!cancelled) setPreparing(false);
//     };

//     load();
//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [kbId]);

//   const predictionMarkets = (formData.predictionMarkets ?? []) as string[];
//   const selectedAgents = (formData.selectedAgents ?? []) as string[];

//   // Sections – everything same as your original, except Knowledge renders real assets
//   const sections = useMemo(
//     () => [
//       {
//         step: "Jurisdiction",
//         icon: "🌍",
//         fields: [
//           {
//             label: "Type",
//             value:
//               formData.jurisdictionType === "business"
//                 ? "Business"
//                 : formData.jurisdictionType === "individual"
//                 ? "Individual"
//                 : "—",
//           },
//           { label: "Country", value: formData.country || "—" },
//         ],
//       },
//       {
//         step: "Contact",
//         icon: "📧",
//         fields: [
//           { label: "Email", value: formData.email || "—" },
//           { label: "Telegram", value: formData.telegram || "—" },
//           { label: "Website", value: formData.website || "—" },
//         ],
//       },
//       {
//         step: "Knowledge",
//         icon: "📚",
//         custom: (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-9">
//             {/* Public */}
//             <div className="bg-[#0F1430] border border-[#2A2F5E] rounded-lg p-3">
//               <div className="font-semibold text-emerald-300 mb-2">Public</div>
//               {assetsPublic.length === 0 ? (
//                 <div className="text-xs text-gray-400">No public assets.</div>
//               ) : (
//                 <ul className="space-y-1">
//                   {assetsPublic.map((a) => (
//                     <li key={a.asset_id} className="text-xs text-gray-300 break-all">
//                       {a.url ? (
//                         <a
//                           href={a.url}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="text-blue-300 hover:underline"
//                           title={a.name || a.url || a.asset_id}
//                         >
//                           {a.name || a.url}
//                         </a>
//                       ) : (
//                         <span title={a.name || a.asset_id}>{a.name || a.asset_id}</span>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>

//             {/* Private */}
//             <div className="bg-[#0F1430] border border-[#2A2F5E] rounded-lg p-3">
//               <div className="font-semibold text-yellow-300 mb-2">Private</div>
//               {assetsPrivate.length === 0 ? (
//                 <div className="text-xs text-gray-400">No private assets.</div>
//               ) : (
//                 <ul className="space-y-2">
//                   {assetsPrivate.map((a) => {
//                     const proof = kbAssetProofs[a.asset_id];
//                     const open = !!proofOpen[a.asset_id];
//                     return (
//                       <li key={a.asset_id} className="text-xs text-gray-300 break-all">
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="min-w-0">
//                             {a.url ? (
//                               <span title={a.name || a.url || a.asset_id}>
//                                 {a.name || a.url}
//                               </span>
//                             ) : (
//                               <span title={a.name || a.asset_id}>{a.name || a.asset_id}</span>
//                             )}
//                           </div>
//                           <div className="shrink-0 flex gap-2">
//                             <button
//                               type="button"
//                               className="px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
//                               onClick={async () => {
//                                 // regenerate if missing
//                                 if (!kbAssetProofs[a.asset_id]) {
//                                   const j = await generateProof(a);
//                                   if (j) toggleProof(a.asset_id);
//                                 } else {
//                                   toggleProof(a.asset_id);
//                                 }
//                               }}
//                             >
//                               {open ? "Hide" : proof ? "View" : "Verify"}
//                             </button>
//                           </div>
//                         </div>

//                         {/* Proof details */}
//                         {open && proof && (
//                           <pre className="mt-2 p-2 rounded bg-black/40 text-[10px] text-gray-200 overflow-x-auto">
// {JSON.stringify(proof, null, 2)}
//                           </pre>
//                         )}
//                       </li>
//                     );
//                   })}
//                 </ul>
//               )}
//               <p className="mt-2 text-[11px] text-gray-400">
//                 Private items include a zero-knowledge proof. Click “Verify” to fetch or “View” to show details.
//               </p>
//             </div>
//           </div>
//         ),
//       },
//       {
//         step: "Character",
//         icon: "💬",
//         fields: [
//           { label: "Personality Defined", value: formData.masterPrompt ? "✓" : "—" },
//           { label: "Twitter References", value: formData.twitterAccounts ? "✓" : "—" },
//         ],
//       },
//       {
//         step: "Visual",
//         icon: "🎨",
//         fields: [{ label: "Spokesperson", value: visualSummary }],
//       },
//       {
//         step: "Voice",
//         icon: "🎤",
//         fields: [{ label: "Voice", value: voiceSummary }],
//       },
//       {
//         step: "Agents",
//         icon: "🤖",
//         custom: (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-9">
//             <div className="text-sm">
//               <span className="text-gray-500">Trading Model:</span>{" "}
//               <span className="text-gray-300">
//                 {formData.tradingModel === "foundational"
//                   ? "ZkAGI Foundational"
//                   : formData.tradingModel || "—"}
//               </span>
//             </div>
//             <div className="text-sm">
//               <span className="text-gray-500">Prediction Markets:</span>{" "}
//               <span className="text-gray-300">{predictionMarkets.length}</span>
//               {predictionMarkets.length > 0 && (
//                 <span className="ml-2 text-xs text-gray-400">
//                   {predictionMarkets.join(", ")}
//                 </span>
//               )}
//             </div>
//             <div className="text-sm md:col-span-2">
//               <span className="text-gray-500">Selected Agents:</span>{" "}
//               <span className="text-gray-300">{selectedAgents.length}</span>
//               {selectedAgents.length > 0 && (
//                 <span className="ml-2 text-xs text-gray-400">
//                   {selectedAgents.join(", ")}
//                 </span>
//               )}
//             </div>
//           </div>
//         ),
//       },
//     ],
//     [formData, assetsPublic, assetsPrivate, kbAssetProofs, predictionMarkets, selectedAgents, voiceSummary, visualSummary, proofOpen]
//   );

//   return (
//     <div className="relative space-y-6">
//       {/* Blocking loader while we “prepare” */}
//       {preparing && (
//         <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex items-center justify-center">
//           <div className="w-full max-w-sm rounded-xl border border-[#2A2F5E] bg-[#0D0F1E] p-6 text-center">
//             <div className="h-1.5 w-full bg-black/30 rounded overflow-hidden mb-4">
//               <div className="h-full w-2/3 animate-pulse bg-gradient-to-r from-purple-500 to-blue-500" />
//             </div>
//             <div className="text-sm text-gray-300">{prepMsg}</div>
//             <div className="text-xs text-gray-500 mt-1">Preparing the data to present…</div>
//           </div>
//         </div>
//       )}

//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
//         <h3 className="text-2xl font-bold mb-2">Review & Launch Your ZEE</h3>
//       </motion.div>

//       {/* Summary Cards */}
//       <div className="space-y-3">
//         {sections.map((section, idx) => (
//           <motion.div
//             key={section.step}
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: idx * 0.05 }}
//             className="bg-[#1A1F3A] rounded-lg p-4 border border-[#2A2F5E]"
//           >
//             <div className="flex items-start justify-between mb-3">
//               <div className="flex items-center gap-3">
//                 <span className="text-2xl">{section.icon}</span>
//                 <h4 className="font-semibold">{section.step}</h4>
//               </div>
//               <button
//                 type="button"
//                 disabled={preparing}
//                 onClick={() => onEditStep(section.step)}
//                 className="text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-40"
//               >
//                 Edit
//               </button>
//             </div>

//             {/* Either render custom block or simple key/values */}
//             {"custom" in section && section.custom ? (
//               section.custom
//             ) : (
//               <div className="grid grid-cols-2 gap-3 ml-9">
//                 {(section.fields ?? []).map((field: any, i: number) => (
//                   <div key={i} className="text-sm">
//                     <span className="text-gray-500">{field.label}:</span>{" "}
//                     <span className="text-gray-300">{field.value}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </motion.div>
//         ))}
//       </div>

//       {/* Terms & Conditions */}
//       <div className="bg-[#1A1F3A] rounded-lg p-4 border border-[#2A2F5E]">
//         <label className="flex items-start gap-3 cursor-pointer">
//           <input type="checkbox" {...register("agreeToTerms")} className="mt-1" />
//           <span className="text-sm text-gray-300">
//             I agree to the{" "}
//             <a href="/terms" className="text-purple-400 hover:underline" target="_blank" rel="noreferrer">
//               Terms of Service
//             </a>{" "}
//             and{" "}
//             <a href="/privacy" className="text-purple-400 hover:underline" target="_blank" rel="noreferrer">
//               Privacy Policy
//             </a>
//           </span>
//         </label>
//         {errors.agreeToTerms && (
//           <p className="text-red-400 text-sm mt-2">{String(errors.agreeToTerms.message || "")}</p>
//         )}
//       </div>

//       {/* Final CTA Message */}
//       <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6 text-center">
//         <h4 className="text-lg font-semibold mb-2">🎉 Ready to Launch!</h4>
//         <p className="text-sm text-gray-300">
//           Your ZEE is configured and ready to go. Click &apos;Launch My ZEE&apos; below to bring it to life!
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/stores/agent-form-store";

type ReviewStepProps = {
  onEditStep: (step: string) => void;
};

type RawAsset = {
  id: string;
  filename: string;
  visibility: "public" | "private" | string;
  // other fields may exist but we ignore them here
};

export default function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { watch, register, formState: { errors } } = useFormContext();
  const { data: storeData } = useAgentFormStore();

  // RHF keystrokes take precedence over store
  const rhf = watch();
  const formData = { ...storeData, ...rhf };

  const kbId = (formData.kbId as string) || "";

  // summaries
  const voiceSummary =
    formData.voiceType === "preset"
      ? `Preset (${formData.presetVoice ?? "not selected"})`
      : formData.voiceType === "upload" || formData.voiceType === "custom"
      ? "Custom Sample"
      : "—";

  const visualSummary =
    formData.spokespersonType === "upload"
      ? "Custom Photo"
      : formData.spokespersonType === "preset"
      ? `Preset (${formData.presetAvatar ?? "not selected"})`
      : "—";

  const predictionMarkets = (formData.predictionMarkets ?? []) as string[];
  const selectedAgents = (formData.selectedAgents ?? []) as string[];

  // knowledge assets
  const [loadingAssets, setLoadingAssets] = useState<boolean>(true);
  const [assetsPublic, setAssetsPublic] = useState<string[]>([]);
  const [assetsPrivate, setAssetsPrivate] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!kbId) {
        setLoadingAssets(false);
        return;
      }
      setLoadingAssets(true);
      try {
        // Use your Next.js proxy route
        const r = await fetch(`/api/kb/${encodeURIComponent(kbId)}/assets`, {
          headers: { accept: "application/json" },
          cache: "no-store",
        });
        const list = (await r.json().catch(() => [])) as RawAsset[];

        if (cancelled) return;

        const pub = list
          .filter((a) => String(a.visibility).toLowerCase() === "public")
          .map((a) => a.filename);
        const priv = list
          .filter((a) => String(a.visibility).toLowerCase() === "private")
          .map((a) => a.filename);

        setAssetsPublic(pub);
        setAssetsPrivate(priv);
      } catch {
        // minimal failure mode: show nothing
        if (!cancelled) {
          setAssetsPublic([]);
          setAssetsPrivate([]);
        }
      } finally {
        if (!cancelled) setLoadingAssets(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [kbId]);

  // Sections — identical to yours, Knowledge shows filenames only
  const sections = useMemo(
    () => [
      {
        step: "Jurisdiction",
        icon: "🌍",
        fields: [
          {
            label: "Type",
            value:
              formData.jurisdictionType === "business"
                ? "Business"
                : formData.jurisdictionType === "individual"
                ? "Individual"
                : "—",
          },
          { label: "Country", value: formData.country || "—" },
        ],
      },
      {
        step: "Contact",
        icon: "📧",
        fields: [
          { label: "Email", value: formData.email || "—" },
          { label: "Telegram", value: formData.telegram || "—" },
          { label: "Website", value: formData.website || "—" },
        ],
      },
      {
        step: "Knowledge",
        icon: "📚",
        custom: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-9">
            {/* Public */}
            <div className="bg-[#0F1430] border border-[#2A2F5E] rounded-lg p-3">
              <div className="font-semibold text-emerald-300 mb-2">Public</div>
              {loadingAssets ? (
                <div className="text-xs text-gray-400">Loading…</div>
              ) : assetsPublic.length === 0 ? (
                <div className="text-xs text-gray-400">No public assets.</div>
              ) : (
                <ul className="space-y-1">
                  {assetsPublic.map((name, i) => (
                    <li key={`${name}-${i}`} className="text-xs text-gray-300 break-all">
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Private */}
            <div className="bg-[#0F1430] border border-[#2A2F5E] rounded-lg p-3">
              <div className="font-semibold text-yellow-300 mb-2">Private</div>
              {loadingAssets ? (
                <div className="text-xs text-gray-400">Loading…</div>
              ) : assetsPrivate.length === 0 ? (
                <div className="text-xs text-gray-400">No private assets.</div>
              ) : (
                <ul className="space-y-1">
                  {assetsPrivate.map((name, i) => (
                    <li key={`${name}-${i}`} className="text-xs text-gray-300 break-all">
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ),
      },
      {
        step: "Character",
        icon: "💬",
        fields: [
          { label: "Personality Defined", value: formData.masterPrompt ? "✓" : "—" },
          { label: "Twitter References", value: formData.twitterAccounts ? "✓" : "—" },
        ],
      },
      {
        step: "Visual",
        icon: "🎨",
        fields: [{ label: "Spokesperson", value: visualSummary }],
      },
      {
        step: "Voice",
        icon: "🎤",
        fields: [{ label: "Voice", value: voiceSummary }],
      },
      {
        step: "Agents",
        icon: "🤖",
        custom: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-9">
            <div className="text-sm">
              <span className="text-gray-500">Trading Model:</span>{" "}
              <span className="text-gray-300">
                {formData.tradingModel === "foundational"
                  ? "ZkAGI Foundational"
                  : formData.tradingModel || "—"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Prediction Markets:</span>{" "}
              <span className="text-gray-300">{predictionMarkets.length}</span>
              {predictionMarkets.length > 0 && (
                <span className="ml-2 text-xs text-gray-400">
                  {predictionMarkets.join(", ")}
                </span>
              )}
            </div>
            <div className="text-sm md:col-span-2">
              <span className="text-gray-500">Selected Agents:</span>{" "}
              <span className="text-gray-300">{selectedAgents.length}</span>
              {selectedAgents.length > 0 && (
                <span className="ml-2 text-xs text-gray-400">
                  {selectedAgents.join(", ")}
                </span>
              )}
            </div>
          </div>
        ),
      },
    ],
    [formData, loadingAssets, assetsPublic, assetsPrivate, predictionMarkets, selectedAgents, voiceSummary, visualSummary]
  );

  return (
    <div className="relative space-y-6">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Review & Launch Your ZEE</h3>
      </motion.div>

      {/* Summary Cards */}
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <motion.div
            key={section.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-[#1A1F3A] rounded-lg p-4 border border-[#2A2F5E]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <h4 className="font-semibold">{section.step}</h4>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(section.step)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Edit
              </button>
            </div>

            {"custom" in section && section.custom ? (
              section.custom
            ) : (
              <div className="grid grid-cols-2 gap-3 ml-9">
                {(section.fields ?? []).map((field: any, i: number) => (
                  <div key={i} className="text-sm">
                    <span className="text-gray-500">{field.label}:</span>{" "}
                    <span className="text-gray-300">{field.value}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Terms & Conditions */}
      <div className="bg-[#1A1F3A] rounded-lg p-4 border border-[#2A2F5E]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" {...register("agreeToTerms")} className="mt-1" />
          <span className="text-sm text-gray-300">
            I agree to the{" "}
            <a href="/terms" className="text-purple-400 hover:underline" target="_blank" rel="noreferrer">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-purple-400 hover:underline" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-red-400 text-sm mt-2">{String(errors.agreeToTerms.message || "")}</p>
        )}
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6 text-center">
        <h4 className="text-lg font-semibold mb-2">🎉 Ready to Launch!</h4>
        <p className="text-sm text-gray-300">
          Your ZEE is configured and ready to go. Click &apos;Launch My ZEE&apos; below to bring it to life!
        </p>
      </div>
    </div>
  );
}
