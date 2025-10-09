// "use client";

// import { useEffect, useState } from "react";
// import { Controller, useFormContext } from "react-hook-form";
// import { motion } from "framer-motion";
// import { toast } from "sonner";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { useAgentFormStore } from "@/stores/agent-form-store";

// /* ---------------------------- UI data ---------------------------- */
// const NEWS_CATEGORIES = [
//   { id: "finance", label: "💰 Finance" },
//   { id: "health", label: "🏥 Health" },
//   { id: "ai", label: "🤖 AI & Tech" },
//   { id: "realestate", label: "🏠 Real Estate" },
//   { id: "crypto", label: "₿ Crypto" },
//   { id: "politics", label: "🏛️ Politics" },
//   { id: "sports", label: "⚽ Sports" },
//   { id: "entertainment", label: "🎬 Entertainment" },
// ];

// /* ---------------------------- Types ----------------------------- */
// type KBAsset = { name: string; type: "file" | "url"; asset_id: string };
// type KnowledgeDisclosure = { key: string; name: string; disclose: boolean };

// /* --------------------------- Helpers ---------------------------- */
// const apiBase = "http://45.251.34.28:8009";
// const fileKey = (f: File) => `${f.name}::${f.size}::${(f as any).lastModified ?? "na"}`;
// const toKBAsset = (a: any): KBAsset => ({
//   name: (a?.url ?? a?.name ?? a?.original_name ?? a?.filename ?? "").toString(),
//   type: (a?.url ? "url" : "file") as "url" | "file",
//   asset_id: (a?.asset_id ?? a?.id ?? a?.uuid ?? "").toString(),
// });

// async function fetchKbAssetsFull(kbId: string): Promise<Record<string, any>> {
//   const res = await fetch(`${apiBase}/kb/${kbId}/assets`, { headers: { accept: "application/json" } });
//   if (!res.ok) throw new Error(`Assets fetch failed (${res.status})`);
//   const arr = await res.json().catch(() => []);
//   const map: Record<string, any> = {};
//   if (Array.isArray(arr)) {
//     for (const a of arr) {
//       const id = (a?.asset_id ?? a?.id ?? a?.uuid)?.toString();
//       if (id) map[id] = a;
//     }
//   }
//   return map;
// }

// /* =================================================================
//    COMPONENT
// ================================================================= */
// export default function KnowledgeStep() {
//   const { register, control, setValue, formState: { errors } } = useFormContext();
//   const { publicKey } = useWallet();
//   const { data, setData } = useAgentFormStore();

//   const kbId = (data.kbId ?? "") as string;
//   const kbName = (data.kbName ?? "") as string;

//   /* Modal orchestration */
//   const [showModal, setShowModal] = useState<boolean>(!kbId);
//   const [creatingKb, setCreatingKb] = useState(false);
//   const [createMsg, setCreateMsg] = useState("storing your preference…");
//   const [createPct, setCreatePct] = useState(0);

//   /* Modal upload UI state */
//   const [modalFiles, setModalFiles] = useState<File[]>([]);
//   const [disclosures, setDisclosures] = useState<KnowledgeDisclosure[]>([]);
//   const [modalUrls, setModalUrls] = useState<string[]>([""]);

//   /* Modal staged upload progress */
//   const [savingKb, setSavingKb] = useState(false);
//   const [saveMsg, setSaveMsg] = useState("");
//   const [savePct, setSavePct] = useState(0);

//   /* In-step loading assets */
//   const [assetsLoading, setAssetsLoading] = useState(false);

//   /* Register custom RHF fields */
//   useEffect(() => {
//     register("knowledgeFiles");
//     register("knowledgeDisclosures");
//     register("websiteUrls");
//     register("newsFilters");
//   }, [register]);

//   /* Seed RHF from store for news/urls (post modal) */
//   useEffect(() => {
//     if (Array.isArray(data.websiteUrls)) setValue("websiteUrls", data.websiteUrls, { shouldDirty: false });
//     if (Array.isArray(data.newsFilters)) setValue("newsFilters", data.newsFilters, { shouldDirty: false });
//   }, []); // eslint-disable-line

//   useEffect(() => { if (!data.kbId) setShowModal(true); }, [data.kbId]);

//   /* -------------------- Create KB (inside modal) -------------------- */
//   const createKb = async (isPublicChoice: boolean) => {
//     if (!publicKey) return toast.error("Please connect your Solana wallet first.");
//     const swarmName = (data.name ?? "").toString().trim();
//     if (!swarmName) return toast.error("Swarm name missing (Contact step).");

//     setCreatingKb(true);
//     setCreatePct(10);
//     setCreateMsg("storing your preference…");

//     try {
//       const userId = `${publicKey.toBase58()}:${swarmName}`;
//       const kb_name = `${swarmName}-kb`;

//       const body = new URLSearchParams();
//       body.set("user_id", userId);
//       body.set("kb_name", kb_name);
//       body.set("is_public", String(isPublicChoice));

//       const res = await fetch(`${apiBase}/kb/create`, {
//         method: "POST",
//         headers: { accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
//         body,
//       });

//       setCreatePct(60);
//       setCreateMsg("making amends…");

//       if (!res.ok) throw new Error((await res.text().catch(() => "")) || "KB create failed");
//       const out = await res.json();
//       if (!out?.kb_id) throw new Error("No kb_id returned");

//       setData({
//         kbId: out.kb_id,
//         kbName: out.name || kb_name,
//         isKbPublic: !!out.is_public,
//         kbUserId: userId,
//       });

//       setCreatePct(90);
//       setCreateMsg("almost done…");
//       setTimeout(() => { setCreatePct(100); setCreatingKb(false); }, 400);
//     } catch (e: any) {
//       setCreatingKb(false);
//       toast.error(e?.message || "KB creation error");
//     }
//   };

//   /* ---------------------- Modal upload handlers --------------------- */
//   const addModalFiles = (picked: File[]) => {
//     if (!picked?.length) return;
//     const existing = new Map(modalFiles.map((f) => [fileKey(f), f]));
//     const next = [...modalFiles];
//     const nextDisclosures = [...disclosures];

//     for (const f of picked) {
//       const k = fileKey(f);
//       if (!existing.has(k)) {
//         next.push(f);
//         existing.set(k, f);
//         nextDisclosures.push({ key: k, name: f.name, disclose: false }); // default NO (public)
//       }
//     }
//     setModalFiles(next);
//     setDisclosures(nextDisclosures);
//   };

//   const onModalFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files ? Array.from(e.target.files) : [];
//     addModalFiles(files);
//     e.currentTarget.value = "";
//   };

//   const removeModalFile = (k: string) => {
//     setModalFiles((fs) => fs.filter((f) => fileKey(f) !== k));
//     setDisclosures((d) => d.filter((x) => x.key !== k));
//   };

//   const setDisclose = (k: string, val: boolean) => {
//     setDisclosures((d) => d.map((x) => (x.key === k ? { ...x, disclose: val } : x)));
//   };

//   const addUrlField = () => setModalUrls((u) => [...u, ""]);
//   const removeUrlField = (i: number) => setModalUrls((u) => u.filter((_, idx) => idx !== i));

//   /* -------------------- Proof generation helper --------------------- */
//   const generateProofsFor = async (kbIdLocal: string, assetIds: string[]) => {
//     const proofsMap: Record<string, any> = {};
//     for (const id of assetIds) {
//       try {
//         const res = await fetch(`${apiBase}/kb/proofs/generate`, {
//           method: "POST",
//           headers: { accept: "application/json", "Content-Type": "application/json" },
//           body: JSON.stringify({ kb_id: kbIdLocal, asset_id: id }),
//         });
//         if (!res.ok) throw new Error(await res.text());
//         const proof = await res.json();
//         proofsMap[id] = proof;
//       } catch (err) {
//         // non-fatal; skip this id
//       }
//     }
//     // merge into store
//     setData({ kbAssetProofs: { ...(data.kbAssetProofs || {}), ...proofsMap } });
//   };

//   /* -------------------------- Save to KB ---------------------------- */
//   const saveToKb = async () => {
//     if (!data.kbId || !data.kbUserId) return toast.error("KB not initialized yet.");

//     // Split files: YES = private, NO = public
//     const privateFiles: File[] = [];
//     const publicFiles: File[] = [];
//     for (const f of modalFiles) {
//       const row = disclosures.find((d) => d.key === fileKey(f));
//       const isPrivate = !!row?.disclose;
//       (isPrivate ? privateFiles : publicFiles).push(f);
//     }

//     // URLs → all public for now
//     const cleanedUrls = modalUrls.map((u) => u.trim()).filter(Boolean);
//     const privateUrls: string[] = [];
//     const publicUrls: string[] = cleanedUrls;

//     setSavingKb(true);
//     setSavePct(5);
//     setSaveMsg("storing your private preferences…");

//     // 1) PRIVATE upload
//     let privateIds: string[] = [];
//     try {
//       if (privateFiles.length || privateUrls.length) {
//         const fd = new FormData();
//         fd.set("user_id", data.kbUserId!);
//         fd.set("kb_id", data.kbId!);
//         privateFiles.forEach((f) => fd.append("files", f));
//         privateUrls.forEach((u) => fd.append("urls", u));
//         const r = await fetch(`${apiBase}/kb/upload/private`, { method: "POST", body: fd });
//         if (!r.ok) throw new Error(await r.text());
//         const jr = await r.json().catch(() => ({}));
//         privateIds = Array.isArray(jr?.created_assets) ? jr.created_assets.map(String) : [];
//       }
//       setSavePct(25);
//       setSaveMsg("generating private proofs…");
//       if (privateIds.length) await generateProofsFor(data.kbId!, privateIds);
//       setSavePct(35);
//       setSaveMsg("private upload complete.");
//     } catch (e: any) {
//       setSavingKb(false);
//       return toast.error(e?.message || "Private upload failed");
//     }

//     // 2) PUBLIC upload
//     setSaveMsg("storing your public preferences…");
//     let publicIds: string[] = [];
//     try {
//       if (publicFiles.length || publicUrls.length) {
//         const fd2 = new FormData();
//         fd2.set("user_id", data.kbUserId!);
//         fd2.set("kb_id", data.kbId!);
//         publicFiles.forEach((f) => fd2.append("files", f));
//         publicUrls.forEach((u) => fd2.append("urls", u));
//         const r2 = await fetch(`${apiBase}/kb/upload/public`, { method: "POST", body: fd2 });
//         if (!r2.ok) throw new Error(await r2.text());
//         const jr2 = await r2.json().catch(() => ({}));
//         publicIds = Array.isArray(jr2?.created_assets) ? jr2.created_assets.map(String) : [];
//       }
//       setSavePct(60);
//       setSaveMsg("generating public proofs…");
//       if (publicIds.length) await generateProofsFor(data.kbId!, publicIds);
//       setSavePct(70);
//       setSaveMsg("public upload complete.");
//     } catch (e: any) {
//       setSavingKb(false);
//       return toast.error(e?.message || "Public upload failed");
//     }

//     // 3) Resolve & store assets; mark ready
//     try {
//       const byId = await fetchKbAssetsFull(data.kbId!);
//       const kbPrivateAssets: KBAsset[] = (privateIds || []).map((id) => byId[id]).filter(Boolean).map(toKBAsset);
//       const kbPublicAssets: KBAsset[] = (publicIds || []).map((id) => byId[id]).filter(Boolean).map(toKBAsset);

//       setData({
//         kbPrivateAssets,
//         kbPublicAssets,
//         kbPrivateAssetMap: Object.fromEntries(kbPrivateAssets.map((a) => [a.name, a.asset_id])),
//         kbPublicAssetMap: Object.fromEntries(kbPublicAssets.map((a) => [a.name, a.asset_id])),
//         kbPrivateUrls: kbPrivateAssets.filter((a) => a.type === "url").map((a) => a.name),
//         kbPublicUrls: kbPublicAssets.filter((a) => a.type === "url").map((a) => a.name),
//         knowledgeFiles: modalFiles,
//         knowledgeDisclosures: disclosures,
//         websiteUrls: cleanedUrls,
//         kbReady: true,
//       });

//       setSavePct(100);
//       setSaveMsg("Your knowledge base has been stored. Almost done…");
//       setTimeout(() => { setSavingKb(false); setShowModal(false); toast.success("Knowledge base saved"); }, 500);
//     } catch (e: any) {
//       setSavingKb(false);
//       toast.error(e?.message || "Failed to finalize KB");
//     }
//   };

//   /* --------------- In-step: fetch assets if empty --------------- */
//   useEffect(() => {
//     const needFetch = !!data.kbId &&
//       (!Array.isArray(data.kbPublicAssets) || !Array.isArray(data.kbPrivateAssets));
//     if (!needFetch) return;
//     (async () => {
//       try {
//         setAssetsLoading(true);
//         const byId = await fetchKbAssetsFull(data.kbId!);
//         const all = Object.values(byId).map(toKBAsset);
//         const publicAssets: KBAsset[] = all.filter((a: any) => a?.is_public !== false);
//         const privateAssets: KBAsset[] = all.filter((a: any) => a?.is_public === false);
//         setData({ kbPublicAssets: publicAssets, kbPrivateAssets: privateAssets });
//       } catch {}
//       finally { setAssetsLoading(false); }
//     })();
//   }, [data.kbId]); // eslint-disable-line

//   /* ----------------------- Render ------------------------ */
//   const publicAssetsList = (data.kbPublicAssets ?? []) as KBAsset[];
//   const privateAssetsList = (data.kbPrivateAssets ?? []) as KBAsset[];

//   return (
//     <div className="relative space-y-6">
//       {/* SINGLE MODAL: create + upload + staged loader */}
//       {showModal && (
//         <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70">
//           <div className="w-full max-w-2xl bg-[#0D0F1E] border border-[#2A2F5E] rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
//             {!data.kbId ? (
//               <>
//                 <h3 className="text-xl font-semibold mb-2">Make your knowledge base public?</h3>
//                 <p className="text-sm text-gray-400 mb-4">
//                   You can still mark individual files as <b>private</b> using the “Selective Disclosure” toggle.
//                 </p>
//                 <div className="flex gap-2">
//                   <button onClick={() => createKb(true)} disabled={creatingKb} className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
//                     Yes, make it public
//                   </button>
//                   <button onClick={() => createKb(false)} disabled={creatingKb} className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50">
//                     No, keep it private
//                   </button>
//                 </div>

//                 {creatingKb && (
//                   <div className="mt-5">
//                     <div className="h-2 bg-gray-700 rounded">
//                       <div className="h-2 bg-purple-500 rounded transition-all" style={{ width: `${createPct}%` }} />
//                     </div>
//                     <div className="mt-2 text-xs text-gray-400">{createMsg}</div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <>
//                 <h3 className="text-xl font-semibold mb-1">Add knowledge</h3>
//                 <p className="text-xs text-gray-400 mb-4">
//                   KB: <span className="text-green-400">{kbName}</span> • ID: <span className="text-gray-300">{kbId}</span>
//                 </p>

//                 {/* Files */}
//                 <div className="mb-5">
//                   <label className="block text-sm font-medium mb-2">📁 Upload Files</label>
//                   <label className="block w-full border-2 border-dashed border-[#2A2F5E] rounded-lg p-5 text-center cursor-pointer hover:border-purple-500 transition-colors">
//                     <input type="file" multiple accept=".pdf,.txt,.md,.csv,.doc,.docx,.ppt,.pptx" onChange={onModalFileInput} className="hidden" />
//                     <div className="text-4xl mb-2">📖</div>
//                     <p className="text-sm text-gray-400">
//                       {modalFiles.length > 0 ? `${modalFiles.length} file(s) selected` : "Upload PDFs or training docs"}
//                     </p>
//                     <p className="mt-1 text-xs text-gray-500">Tip: you can click again to add more files.</p>
//                   </label>

//                   {modalFiles.length > 0 && (
//                     <div className="mt-3 space-y-2">
//                       {modalFiles.map((f) => {
//                         const k = fileKey(f);
//                         const row = disclosures.find((d) => d.key === k) ?? { key: k, name: f.name, disclose: false };
//                         return (
//                           <div key={k} className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-lg border border-[#2A2F5E] bg-[#0F1430] px-3 py-2">
//                             <div className="flex items-center gap-2 shrink min-w-0">
//                               <span className="text-emerald-400">✓</span>
//                               <span className="text-sm text-gray-200 truncate">{f.name}</span>
//                               <span className="text-xs text-gray-500 hidden sm:inline">({(f.size / 1024).toFixed(1)} KB)</span>
//                             </div>

//                             <div className="flex items-center gap-2">
//                               <span className="text-xs text-gray-400">Selective Disclosure</span>
//                               <div className="flex rounded-lg overflow-hidden border border-[#2A2F5E]">
//                                 <button type="button" onClick={() => setDisclose(k, true)} className={`px-3 py-1 text-sm ${row.disclose ? "bg-purple-600 text-white" : "bg-transparent text-gray-300 hover:bg-purple-600/10"}`} title="Yes = keep PRIVATE">
//                                   Yes
//                                 </button>
//                                 <button type="button" onClick={() => setDisclose(k, false)} className={`px-3 py-1 text-sm ${!row.disclose ? "bg-purple-600 text-white" : "bg-transparent text-gray-300 hover:bg-purple-600/10"}`} title="No = make PUBLIC">
//                                   No
//                                 </button>
//                               </div>
//                               <button type="button" onClick={() => removeModalFile(k)} className="ml-2 px-2 py-1 text-xs rounded bg-red-500/15 text-red-300 hover:bg-red-500/25" aria-label="Remove file">
//                                 Remove
//                               </button>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>

//                 {/* URLs */}
//                 <div className="mb-5">
//                   <label className="block text-sm font-medium mb-2">🌐 Website URLs</label>
//                   <div className="space-y-2">
//                     {modalUrls.map((url, idx) => (
//                       <div key={idx} className="flex gap-2">
//                         <input
//                           type="url"
//                           value={url}
//                           onChange={(e) => setModalUrls((u) => u.map((x, i) => (i === idx ? e.target.value : x)))}
//                           placeholder="https://example.com"
//                           className="flex-1 bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none transition-colors"
//                         />
//                         {modalUrls.length > 1 && (
//                           <button type="button" onClick={() => removeUrlField(idx)} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
//                             ✕
//                           </button>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                   <button type="button" onClick={addUrlField} className="mt-2 text-sm text-purple-400 hover:text-purple-300">
//                     + Add another URL
//                   </button>
//                 </div>

//                 {/* Save to KB */}
//                 <div className="flex justify-end gap-2">
//                   <button type="button" onClick={() => setShowModal(false)} disabled={savingKb} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50">
//                     Cancel
//                   </button>
//                   <button type="button" onClick={saveToKb} disabled={savingKb} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
//                     Save to KB
//                   </button>
//                 </div>

//                 {/* Staged loader */}
//                 {savingKb && (
//                   <div className="mt-5">
//                     <div className="h-2 bg-gray-700 rounded">
//                       <div className="h-2 bg-emerald-500 rounded transition-all" style={{ width: `${savePct}%` }} />
//                     </div>
//                     <div className="mt-2 text-sm text-gray-300">{saveMsg}</div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
//         <h3 className="text-2xl font-bold mb-2">Feed your swarm some brain food</h3>
//         {kbId && (
//           <p className="text-xs text-gray-400">
//             KB: <span className="text-green-400">{kbName}</span> • ID: <span className="text-gray-300">{kbId}</span>
//           </p>
//         )}
//       </motion.div>

//       {/* Asset Lists */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Private */}
//         <div className="rounded-xl border border-[#2A2F5E] p-4">
//           <div className="font-semibold mb-2">🔒 Private Assets</div>
//           {assetsLoading ? (
//             <div className="text-sm text-gray-400">Loading…</div>
//           ) : (data.kbPrivateAssets ?? []).length === 0 ? (
//             <div className="text-sm text-gray-500">No private assets.</div>
//           ) : (
//             <ul className="space-y-2">
//               {(data.kbPrivateAssets as KBAsset[]).map((a) => (
//                 <li key={a.asset_id} className="flex items-center justify-between text-sm bg-[#0F1430] rounded-lg px-3 py-2">
//                   <div className="truncate">
//                     <span className="text-gray-300">{a.name}</span>{" "}
//                     <span className="text-xs text-gray-500">({a.type})</span>
//                   </div>
//                   {/* Verify action will be defined later per your note */}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         {/* Public */}
//         <div className="rounded-xl border border-[#2A2F5E] p-4">
//           <div className="font-semibold mb-2">🌐 Public Assets</div>
//           {assetsLoading ? (
//             <div className="text-sm text-gray-400">Loading…</div>
//           ) : (data.kbPublicAssets ?? []).length === 0 ? (
//             <div className="text-sm text-gray-500">No public assets.</div>
//           ) : (
//             <ul className="space-y-2">
//               {(data.kbPublicAssets as KBAsset[]).map((a) => (
//                 <li key={a.asset_id} className="flex items-center justify-between text-sm bg-[#0F1430] rounded-lg px-3 py-2">
//                   <div className="truncate">
//                     <span className="text-gray-300">{a.name}</span>{" "}
//                     <span className="text-xs text-gray-500">({a.type})</span>
//                   </div>
//                   {a.type === "url" && (
//                     <a href={a.name} target="_blank" rel="noreferrer" className="text-xs text-purple-300 hover:text-purple-200 underline">
//                       open
//                     </a>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>

//       {/* News Filters */}
//       <div>
//         <label className="block text-sm font-medium mb-3">📰 News Categories</label>
//         <Controller
//           name="newsFilters"
//           control={control}
//           defaultValue={Array.isArray(data.newsFilters) ? data.newsFilters : []}
//           render={({ field }) => (
//             <div className="grid grid-cols-2 gap-3">
//               {NEWS_CATEGORIES.map((cat) => {
//                 const checked = field.value?.includes(cat.id);
//                 return (
//                   <label
//                     key={cat.id}
//                     className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
//                       checked ? "border-purple-500 bg-purple-500/10" : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
//                     }`}
//                   >
//                     <input
//                       type="checkbox"
//                       className="hidden"
//                       checked={!!checked}
//                       onChange={(e) => {
//                         const next = e.target.checked
//                           ? [...(field.value || []), cat.id]
//                           : (field.value || []).filter((v: string) => v !== cat.id);
//                         field.onChange(next);
//                         setData({ newsFilters: next });
//                       }}
//                     />
//                     <span className="text-lg">{cat.label}</span>
//                   </label>
//                 );
//               })}
//             </div>
//           )}
//         />
//         {errors.newsFilters && <p className="text-red-400 text-sm mt-1">{String((errors as any).newsFilters?.message || "")}</p>}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAgentFormStore } from "@/stores/agent-form-store";

/* -------------------------------- UI data ------------------------------- */
const NEWS_CATEGORIES = [
  { id: "finance", label: "💰 Finance" },
  { id: "health", label: "🏥 Health" },
  { id: "ai", label: "🤖 AI & Tech" },
  { id: "realestate", label: "🏠 Real Estate" },
  { id: "crypto", label: "₿ Crypto" },
  { id: "politics", label: "🏛️ Politics" },
  { id: "sports", label: "⚽ Sports" },
  { id: "entertainment", label: "🎬 Entertainment" },
];

/* ------------------------------- Types ---------------------------------- */
type KBAsset = { name: string; type: "file" | "url"; asset_id: string };
type KnowledgeDisclosure = { key: string; name: string; disclose: boolean };

/* ------------------------------ Helpers --------------------------------- */
const fileKey = (f: File) => `${f.name}::${f.size}::${(f as any).lastModified ?? "na"}`;

/** Convert a raw asset row from GET /kb/:id/assets to our typed KBAsset */
const toKBAsset = (a: any): KBAsset => ({
  name: (a?.url ?? a?.name ?? a?.original_name ?? a?.filename ?? "").toString(),
  type: (a?.url ? "url" : "file") as "url" | "file",
  asset_id: (a?.asset_id ?? a?.id ?? a?.uuid ?? "").toString(),
});

/* ========================================================================
   COMPONENT
========================================================================= */
export default function KnowledgeStep() {
  const { register, control, setValue, formState: { errors } } = useFormContext();
  const { publicKey } = useWallet();
  const { data, setData } = useAgentFormStore();

  const kbId = (data.kbId ?? "") as string;
  const kbName = (data.kbName ?? "") as string;

  /* Modal orchestration */
  const [showModal, setShowModal] = useState<boolean>(!kbId);
  const [creatingKb, setCreatingKb] = useState(false);
  const [createMsg, setCreateMsg] = useState("storing your preference…");
  const [createPct, setCreatePct] = useState(0);

  /* Modal upload UI state */
  const [modalFiles, setModalFiles] = useState<File[]>([]);
  const [disclosures, setDisclosures] = useState<KnowledgeDisclosure[]>([]);
  const [modalUrls, setModalUrls] = useState<string[]>([""]);

  /* Modal staged upload progress */
  const [savingKb, setSavingKb] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [savePct, setSavePct] = useState(0);

  /* In-step loading assets */
  const [assetsLoading, setAssetsLoading] = useState(false);

  /* Proof modal */
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofModalAssetId, setProofModalAssetId] = useState<string | null>(null);

  /* RHF fields register for non-inputs we sync from store */
  useEffect(() => {
    register("knowledgeFiles");
    register("knowledgeDisclosures");
    register("websiteUrls");
    register("newsFilters");
  }, [register]);

  useEffect(() => {
    if (Array.isArray(data.websiteUrls)) setValue("websiteUrls", data.websiteUrls, { shouldDirty: false });
    if (Array.isArray(data.newsFilters)) setValue("newsFilters", data.newsFilters, { shouldDirty: false });
  }, []); // eslint-disable-line

  useEffect(() => { if (!data.kbId) setShowModal(true); }, [data.kbId]);

  /* ---------------------- API calls (via Next routes) --------------------- */

  const api = {
    create: async (payload: { user_id: string; kb_name: string; is_public: boolean }) => {
      const res = await fetch("/api/kb/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    uploadPrivate: async (fd: FormData) => {
      const res = await fetch("/api/kb/upload/private", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    uploadPublic: async (fd: FormData) => {
      const res = await fetch("/api/kb/upload/public", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    assets: async (kbId: string) => {
      const res = await fetch(`/api/kb/${encodeURIComponent(kbId)}/assets`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    proofGenerate: async (kb_id: string, asset_id: string) => {
      const res = await fetch("/api/kb/proofs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kb_id, asset_id }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    proofDownload: async (kb_id: string, asset_id: string) => {
      const res = await fetch(`/api/kb/proofs/download?kb_id=${encodeURIComponent(kb_id)}&asset_id=${encodeURIComponent(asset_id)}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json(); // we’ll return parsed JSON from route handler
    },
  };

  /* --------------------------- Create KB --------------------------- */
  const createKb = async (isPublicChoice: boolean) => {
    if (!publicKey) return toast.error("Please connect your Solana wallet first.");
    const swarmName = (data.name ?? "").toString().trim();
    if (!swarmName) return toast.error("Swarm name missing (Contact step).");

    setCreatingKb(true);
    setCreatePct(10);
    setCreateMsg("storing your preference…");

    try {
      const userId = `${publicKey.toBase58()}:${swarmName}`;
      const kb_name = `${swarmName}-kb`;
      const out = await api.create({ user_id: userId, kb_name, is_public: isPublicChoice });

      setCreatePct(60);
      setCreateMsg("making amends…");

      if (!out?.kb_id) throw new Error("No kb_id returned");

      setData({
        kbId: out.kb_id,
        kbName: out.name || kb_name,
        isKbPublic: !!out.is_public,
        kbUserId: userId,
      });

      setCreatePct(90);
      setCreateMsg("almost done…");
      setTimeout(() => { setCreatePct(100); setCreatingKb(false); }, 350);
    } catch (e: any) {
      setCreatingKb(false);
      toast.error(e?.message || "KB creation error");
    }
  };

  /* --------------------- Upload + Proof (modal) --------------------- */

  const addModalFiles = (picked: File[]) => {
    if (!picked?.length) return;
    const existing = new Map(modalFiles.map((f) => [fileKey(f), f]));
    const next = [...modalFiles];
    const nextDisclosures = [...disclosures];

    for (const f of picked) {
      const k = fileKey(f);
      if (!existing.has(k)) {
        next.push(f);
        existing.set(k, f);
        nextDisclosures.push({ key: k, name: f.name, disclose: false }); // default NO (public)
      }
    }
    setModalFiles(next);
    setDisclosures(nextDisclosures);
  };

  const onModalFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    addModalFiles(files);
    e.currentTarget.value = "";
  };

  const removeModalFile = (k: string) => {
    setModalFiles((fs) => fs.filter((f) => fileKey(f) !== k));
    setDisclosures((d) => d.filter((x) => x.key !== k));
  };

  const setDisclose = (k: string, val: boolean) => {
    setDisclosures((d) => d.map((x) => (x.key === k ? { ...x, disclose: val } : x)));
  };

  const addUrlField = () => setModalUrls((u) => [...u, ""]);
  const removeUrlField = (i: number) => setModalUrls((u) => u.filter((_, idx) => idx !== i));

  /** auto-download JSON as file */
  const downloadJson = (obj: any, filename: string) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /** generate proofs for a set of assets, also download & store proof JSON for private assets */
  const generateAndStoreProofs = async (kb_id: string, assetIds: string[], isPrivate: boolean) => {
    const proofsToMerge: Record<string, any> = {};
    for (const asset_id of assetIds) {
      try {
        const gen = await api.proofGenerate(kb_id, asset_id);
        proofsToMerge[asset_id] = gen;

        if (isPrivate) {
          // fetch the full proof JSON via /api route that proxies download_url
          const proofJson = await api.proofDownload(kb_id, asset_id);
          proofsToMerge[asset_id] = proofJson;

          // also auto-download locally
          downloadJson(proofJson, `proof_${asset_id}.json`);
        }
      } catch {
        // ignore one-off proof errors; continue other assets
      }
    }
    setData({ kbAssetProofs: { ...(data.kbAssetProofs || {}), ...proofsToMerge } });
  };

  const saveToKb = async () => {
    if (!data.kbId || !data.kbUserId) return toast.error("KB not initialized yet.");

    // Split by disclosure: YES=private, NO=public
    const privateFiles: File[] = [];
    const publicFiles: File[] = [];
    for (const f of modalFiles) {
      const row = disclosures.find((d) => d.key === fileKey(f));
      const isPrivate = !!row?.disclose;
      (isPrivate ? privateFiles : publicFiles).push(f);
    }

    // URLs: default all public (you can add per-url toggles later)
    const cleanedUrls = modalUrls.map((u) => u.trim()).filter(Boolean);
    const privateUrls: string[] = [];
    const publicUrls: string[] = cleanedUrls;

    setSavingKb(true);
    setSavePct(5);
    setSaveMsg("storing your private preferences…");

    // PRIVATE
    let privateIds: string[] = [];
    try {
      if (privateFiles.length || privateUrls.length) {
        const fd = new FormData();
        fd.set("user_id", data.kbUserId!);
        fd.set("kb_id", data.kbId!);
        privateFiles.forEach((f) => fd.append("files", f));
        privateUrls.forEach((u) => fd.append("urls", u));
        const jr = await api.uploadPrivate(fd);
        privateIds = Array.isArray(jr?.created_assets) ? jr.created_assets.map(String) : [];
      }
      setSavePct(25);
      setSaveMsg("generating private proofs…");
      if (privateIds.length) await generateAndStoreProofs(data.kbId!, privateIds, true);
      setSavePct(35);
      setSaveMsg("private upload complete.");
    } catch (e: any) {
      setSavingKb(false);
      return toast.error(e?.message || "Private upload failed");
    }

    // PUBLIC
    setSaveMsg("storing your public preferences…");
    let publicIds: string[] = [];
    try {
      if (publicFiles.length || publicUrls.length) {
        const fd2 = new FormData();
        fd2.set("user_id", data.kbUserId!);
        fd2.set("kb_id", data.kbId!);
        publicFiles.forEach((f) => fd2.append("files", f));
        publicUrls.forEach((u) => fd2.append("urls", u));
        const jr2 = await api.uploadPublic(fd2);
        publicIds = Array.isArray(jr2?.created_assets) ? jr2.created_assets.map(String) : [];
      }
      setSavePct(60);
      setSaveMsg("generating public proofs…");
      if (publicIds.length) await generateAndStoreProofs(data.kbId!, publicIds, false);
      setSavePct(70);
      setSaveMsg("public upload complete.");
    } catch (e: any) {
      setSavingKb(false);
      return toast.error(e?.message || "Public upload failed");
    }

    // Finalize: fetch assets & persist
    try {
      setSavePct(85);
      setSaveMsg("finalizing knowledge base…");
      const raw = await api.assets(data.kbId!); // array
      const byId: Record<string, any> = {};
      if (Array.isArray(raw)) raw.forEach((r) => { const id = (r?.asset_id ?? r?.id ?? r?.uuid)?.toString(); if (id) byId[id] = r; });

      const privAssets: KBAsset[] = (privateIds || []).map((id) => byId[id]).filter(Boolean).map(toKBAsset);
      const pubAssets: KBAsset[] = (publicIds || []).map((id) => byId[id]).filter(Boolean).map(toKBAsset);

      setData({
        kbPrivateAssets: privAssets,
        kbPublicAssets: pubAssets,
        kbPrivateAssetMap: Object.fromEntries(privAssets.map((a) => [a.name, a.asset_id])),
        kbPublicAssetMap: Object.fromEntries(pubAssets.map((a) => [a.name, a.asset_id])),
        kbPrivateUrls: privAssets.filter((a) => a.type === "url").map((a) => a.name),
        kbPublicUrls: pubAssets.filter((a) => a.type === "url").map((a) => a.name),
        knowledgeFiles: modalFiles,
        knowledgeDisclosures: disclosures,
        websiteUrls: cleanedUrls,
        kbReady: true,
      });

      setSavePct(100);
      setSaveMsg("Your knowledge base has been stored. Almost done…");
      setTimeout(() => { setSavingKb(false); setShowModal(false); toast.success("Knowledge base saved"); }, 500);
    } catch (e: any) {
      setSavingKb(false);
      toast.error(e?.message || "Failed to finalize KB");
    }
  };

  /* --------------- In-step: fetch assets if empty --------------- */
  useEffect(() => {
    const needFetch = !!data.kbId &&
      (!Array.isArray(data.kbPublicAssets) || !Array.isArray(data.kbPrivateAssets));
    if (!needFetch) return;
    (async () => {
      try {
        setAssetsLoading(true);
        const raw = await api.assets(data.kbId!);
        const all = (Array.isArray(raw) ? raw : []).map(toKBAsset);
        // We don’t have a reliable is_public flag from the API list; use store content instead
        // Just drop them under public unless they’re already in private map
        setData({ kbPublicAssets: all, kbPrivateAssets: data.kbPrivateAssets || [] });
      } catch {/* ignore */}
      finally { setAssetsLoading(false); }
    })();
  }, [data.kbId]); // eslint-disable-line

  /* ------------------------ Proof Modal data ------------------------ */
  const proofJsonForSelected = useMemo(() => {
    if (!proofModalAssetId) return null;
    return (data.kbAssetProofs || {})[proofModalAssetId] || null;
  }, [proofModalAssetId, data.kbAssetProofs]);

  /* ----------------------------- UI ------------------------------- */

  const publicAssetsList = (data.kbPublicAssets ?? []) as KBAsset[];
  const privateAssetsList = (data.kbPrivateAssets ?? []) as KBAsset[];

  return (
    <div className="relative space-y-6">
      {/* SINGLE MODAL: create → upload → staged loader */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70">
          <div className="w-full max-w-2xl bg-[#0D0F1E] border border-[#2A2F5E] rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            {!data.kbId ? (
              <>
                <h3 className="text-xl font-semibold mb-2">Make your knowledge base public?</h3>
                <p className="text-sm text-gray-400 mb-4">
                  You can still mark individual files as <b>private</b> using the “Selective Disclosure” toggle.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => createKb(true)} disabled={creatingKb} className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                    Yes, make it public
                  </button>
                  <button onClick={() => createKb(false)} disabled={creatingKb} className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50">
                    No, keep it private
                  </button>
                </div>

                {creatingKb && (
                  <div className="mt-5">
                    <div className="h-2 bg-gray-700 rounded">
                      <div className="h-2 bg-purple-500 rounded transition-all" style={{ width: `${createPct}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-gray-400">{createMsg}</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-1">Add knowledge</h3>
                <p className="text-xs text-gray-400 mb-4">
                  KB: <span className="text-green-400">{kbName}</span> • ID: <span className="text-gray-300">{kbId}</span>
                </p>

                {/* Files */}
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2">📁 Upload Files</label>
                  <label className="block w-full border-2 border-dashed border-[#2A2F5E] rounded-lg p-5 text-center cursor-pointer hover:border-purple-500 transition-colors">
                    <input type="file" multiple accept=".pdf,.txt,.md,.csv,.doc,.docx,.ppt,.pptx" onChange={onModalFileInput} className="hidden" />
                    <div className="text-4xl mb-2">📖</div>
                    <p className="text-sm text-gray-400">
                      {modalFiles.length > 0 ? `${modalFiles.length} file(s) selected` : "Upload PDFs or training docs"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Tip: you can click again to add more files.</p>
                  </label>

                  {modalFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {modalFiles.map((f) => {
                        const k = fileKey(f);
                        const row = disclosures.find((d) => d.key === k) ?? { key: k, name: f.name, disclose: false };
                        return (
                          <div key={k} className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-lg border border-[#2A2F5E] bg-[#0F1430] px-3 py-2">
                            <div className="flex items-center gap-2 shrink min-w-0">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-sm text-gray-200 truncate">{f.name}</span>
                              <span className="text-xs text-gray-500 hidden sm:inline">({(f.size / 1024).toFixed(1)} KB)</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Selective Disclosure</span>
                              <div className="flex rounded-lg overflow-hidden border border-[#2A2F5E]">
                                <button type="button" onClick={() => setDisclose(k, true)} className={`px-3 py-1 text-sm ${row.disclose ? "bg-purple-600 text-white" : "bg-transparent text-gray-300 hover:bg-purple-600/10"}`} title="Yes = keep PRIVATE">
                                  Yes
                                </button>
                                <button type="button" onClick={() => setDisclose(k, false)} className={`px-3 py-1 text-sm ${!row.disclose ? "bg-purple-600 text-white" : "bg-transparent text-gray-300 hover:bg-purple-600/10"}`} title="No = make PUBLIC">
                                  No
                                </button>
                              </div>
                              <button type="button" onClick={() => removeModalFile(k)} className="ml-2 px-2 py-1 text-xs rounded bg-red-500/15 text-red-300 hover:bg-red-500/25">
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* URLs */}
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2">🌐 Website URLs</label>
                  <div className="space-y-2">
                    {modalUrls.map((url, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setModalUrls((u) => u.map((x, i) => (i === idx ? e.target.value : x)))}
                          placeholder="https://example.com"
                          className="flex-1 bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none transition-colors"
                        />
                        {modalUrls.length > 1 && (
                          <button type="button" onClick={() => removeUrlField(idx)} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addUrlField} className="mt-2 text-sm text-purple-400 hover:text-purple-300">
                    + Add another URL
                  </button>
                </div>

                {/* Save to KB */}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} disabled={savingKb} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="button" onClick={saveToKb} disabled={savingKb} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                    Save to KB
                  </button>
                </div>

                {/* Staged loader */}
                {savingKb && (
                  <div className="mt-5">
                    <div className="h-2 bg-gray-700 rounded">
                      <div className="h-2 bg-emerald-500 rounded transition-all" style={{ width: `${savePct}%` }} />
                    </div>
                    <div className="mt-2 text-sm text-gray-300">{saveMsg}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Feed your swarm some brain food</h3>
        {kbId && (
          <p className="text-xs text-gray-400">
            KB: <span className="text-green-400">{kbName}</span> • ID: <span className="text-gray-300">{kbId}</span>
          </p>
        )}
      </motion.div>

      {/* Asset Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Private */}
        <div className="rounded-xl border border-[#2A2F5E] p-4">
          <div className="font-semibold mb-2">🔒 Private Assets</div>
          {assetsLoading ? (
            <div className="text-sm text-gray-400">Loading…</div>
          ) : (data.kbPrivateAssets ?? []).length === 0 ? (
            <div className="text-sm text-gray-500">No private assets.</div>
          ) : (
            <ul className="space-y-2">
              {(data.kbPrivateAssets as KBAsset[]).map((a) => (
                <li key={a.asset_id} className="flex items-center justify-between text-sm bg-[#0F1430] rounded-lg px-3 py-2">
                  <div className="truncate">
                    <span className="text-gray-300">{a.name}</span>{" "}
                    <span className="text-xs text-gray-500">({a.type})</span>
                  </div>
                 
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Public */}
        <div className="rounded-xl border border-[#2A2F5E] p-4">
          <div className="font-semibold mb-2">🌐 Public Assets</div>
          {assetsLoading ? (
            <div className="text-sm text-gray-400">Loading…</div>
          ) : (data.kbPublicAssets ?? []).length === 0 ? (
            <div className="text-sm text-gray-500">No public assets.</div>
          ) : (
            <ul className="space-y-2">
              {(data.kbPublicAssets as KBAsset[]).map((a) => (
                <li key={a.asset_id} className="flex items-center justify-between text-sm bg-[#0F1430] rounded-lg px-3 py-2">
                  <div className="truncate">
                    <span className="text-gray-300">{a.name}</span>{" "}
                    <span className="text-xs text-gray-500">({a.type})</span>
                  </div>
                  {a.type === "url" && (
                    <a href={a.name} target="_blank" rel="noreferrer" className="text-xs text-purple-300 hover:text-purple-200 underline">
                      open
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* News Filters */}
      <div>
        <label className="block text-sm font-medium mb-3">📰 News Categories</label>
        <Controller
          name="newsFilters"
          control={control}
          defaultValue={Array.isArray(data.newsFilters) ? data.newsFilters : []}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {NEWS_CATEGORIES.map((cat) => {
                const checked = field.value?.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      checked ? "border-purple-500 bg-purple-500/10" : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={!!checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(field.value || []), cat.id]
                          : (field.value || []).filter((v: string) => v !== cat.id);
                        field.onChange(next);
                        setData({ newsFilters: next });
                      }}
                    />
                    <span className="text-lg">{cat.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        />
        {errors.newsFilters && <p className="text-red-400 text-sm mt-1">{String((errors as any).newsFilters?.message || "")}</p>}
      </div>

      {/* Proof Modal */}
      {showProofModal && proofJsonForSelected && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center bg-black/70" onClick={() => setShowProofModal(false)}>
          <div className="w-full max-w-2xl bg-[#0D0F1E] border border-[#2A2F5E] rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">Proof details</h4>
              <button onClick={() => setShowProofModal(false)} className="text-sm text-gray-300 hover:text-white">Close</button>
            </div>
            <pre className="text-xs bg-[#0B0E22] rounded-lg p-3 overflow-auto max-h-[50vh]">
{JSON.stringify(proofJsonForSelected, null, 2)}
            </pre>
            <div className="flex justify-end mt-3">
              <button
                className="px-3 py-2 text-sm rounded bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  if (!proofModalAssetId) return;
                  const obj = (data.kbAssetProofs || {})[proofModalAssetId];
                  if (!obj) return;
                  const fname = `proof_${proofModalAssetId}.json`;
                  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = fname;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }}
              >
                Download proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
