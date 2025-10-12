// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

// import {
//   jurisdictionSchema,
//   contactSchema,
//   knowledgeSchema,
//   characterSchema,
//   visualSchema,
//   voiceSchema,
//   agentSetupSchema,
//   fullZeeSchema,
// } from "@/schema/agent-schemas";

// import { useAgentFormStore } from "@/stores/agent-form-store";
// import ProgressIndicator from "./ProgressIndicator";
// import SuccessModal from "./SuccessModal";

// import JurisdictionStep from "./steps/JurisdictionStep";
// import ContactStep from "./steps/ContactStep";
// import KnowledgeStep from "./steps/KnowledgeStep";
// import CharacterStep from "./steps/CharacterStep";
// import VisualStep from "./steps/VisualStep";
// import VoiceStep from "./steps/VoiceStep";
// import AgentSetupStep from "./steps/AgentSetupStep";
// import ReviewStep from "./steps/ReviewStep";

// const STEPS = [
//   "Jurisdiction",
//   "Contact",
//   "Knowledge",
//   "Character",
//   "Visual",
//   "Voice",
//   "Agents",
//   "Review",
// ] as const;

// type StepKey = (typeof STEPS)[number];

// const perStepSchema: Record<StepKey, any> = {
//   Jurisdiction: jurisdictionSchema,
//   Contact: contactSchema,
//   Knowledge: knowledgeSchema,
//   Character: characterSchema,
//   Visual: visualSchema,
//   Voice: voiceSchema,
//   Agents: agentSetupSchema,
//   Review: fullZeeSchema,
// };

// // field → step (used to jump to the exact failing step)
// const FIELD_TO_STEP: Record<string, StepKey> = {
//   jurisdictionType: "Jurisdiction",
//   country: "Jurisdiction",
//   email: "Contact",
//   telegram: "Contact",
//   website: "Contact",
//   knowledgeFiles: "Knowledge",
//   websiteUrls: "Knowledge",
//   newsFilters: "Knowledge",
//   masterPrompt: "Character",
//   twitterAccounts: "Character",
//   spokespersonType: "Visual",
//   spokespersonUpload: "Visual",
//   presetAvatar: "Visual",
//   voiceType: "Voice",
//   presetVoice: "Voice",
//   voiceSample: "Voice",
//   tradingModel: "Agents",
//   predictionMarkets: "Agents",
//   selectedAgents: "Agents",
//   agreeToTerms: "Review",
// };

// function firstInvalidFieldFromZod(error: any): string | null {
//   if (!error?.issues?.length) return null;
//   for (const issue of error.issues) {
//     if (Array.isArray(issue.path) && issue.path.length) {
//       const last = issue.path[issue.path.length - 1];
//       if (typeof last === "string") return last;
//     }
//   }
//   return null;
// }

// /** Build FormData for backend */
// function buildReviewFormData(values: any) {
//   const fd = new FormData();

//   // Jurisdiction + Contact
//   if (values.jurisdictionType) fd.append("jurisdictionType", values.jurisdictionType);
//   if (values.country)          fd.append("country", values.country);
//   if (values.email)            fd.append("email", values.email);
//   if (values.telegram)         fd.append("telegram", values.telegram);
//   if (values.website)          fd.append("website", values.website);

//   // Knowledge files
//   const files: File[] = Array.isArray(values.knowledgeFiles) ? values.knowledgeFiles : [];
//   for (const f of files) fd.append("knowledgeFiles", f);

//   // Knowledge URLs as JSON - backend might expect "websiteUrls" not "knowledgeFileUrls"
//   if (Array.isArray(values.websiteUrls) && values.websiteUrls.length) {
//     fd.append("websiteUrls", JSON.stringify(values.websiteUrls));
//   }

//   // Character
//   if (values.masterPrompt)     fd.append("masterPrompt", values.masterPrompt);
//   if (values.twitterAccounts)  fd.append("twitterAccounts", values.twitterAccounts);

//   // Visual - Only send if actually configured
//   if (values.spokespersonType === "upload" && values.spokespersonUpload instanceof File) {
//     fd.append("spokespersonType", values.spokespersonType);
//     fd.append("spokespersonUpload", values.spokespersonUpload);
//     // Also add as uploadedPhoto for schema validation
//     values.uploadedPhoto = values.spokespersonUpload;
//   } else if (values.spokespersonType === "preset" && values.presetAvatar) {
//     fd.append("spokespersonType", values.spokespersonType);
//     fd.append("presetAvatar", values.presetAvatar);
//   }
//   // Don't send spokespersonType at all if not selected or incomplete

//   // Voice - Only send if actually configured
//   if (values.voiceType === "preset" && values.presetVoice) {
//     fd.append("voiceType", "preset");
//     fd.append("presetVoice", values.presetVoice);
//   } else if (values.voiceType === "upload" && values.voiceSample instanceof File) {
//     fd.append("voiceType", "custom");                      // map "upload" → "custom"
//     fd.append("voiceCustomUpload", values.voiceSample);    // backend expects this field name!
//   }
//   // Don't send voiceType at all if not selected or incomplete

//   // Agents
//   if (values.tradingModel) fd.append("tradingModel", values.tradingModel);
//   if (Array.isArray(values.predictionMarkets)) {
//     fd.append("predictionMarkets", JSON.stringify(values.predictionMarkets));
//   }
//   if (Array.isArray(values.selectedAgents)) {
//     fd.append("selectedAgents", JSON.stringify(values.selectedAgents));
//   }

//   // Review
//   if (values.agreeToTerms) fd.append("agreeToTerms", String(!!values.agreeToTerms));

//   return fd;
// }

// export default function MultiStepAgentForm({
//   onClose,
//   onSuccess,
// }: {
//   onClose?: () => void;
//   onSuccess?: (result: any) => void;
// }) {
//   const { data, setData, reset } = useAgentFormStore();
//   const [stepIndex, setStepIndex] = useState(0);
//   const step = STEPS[stepIndex];
//   const syncingRef = useRef(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [successResult, setSuccessResult] = useState<any>(null); // Store the API result

//   const resolver = useMemo(() => zodResolver(perStepSchema[step]), [step]);
//   const methods = useForm({ resolver, mode: "onBlur", defaultValues: data });

//   // RHF → Zustand (live mirror)
//   useEffect(() => {
//     const sub = methods.watch((value) => {
//       if (!syncingRef.current) setData(value);
//     });
//     return () => sub.unsubscribe();
//   }, [methods, setData]);

//   // Zustand → RHF (on step change) - FIXED: ensure all fields are synced
//   useEffect(() => {
//     syncingRef.current = true;
//     // Instead of just resetting with current data, merge all accumulated data
//     const currentFormValues = methods.getValues();
//     const mergedData = { ...data, ...currentFormValues };
//     methods.reset(mergedData, { keepDirty: true, keepValues: true });
//     syncingRef.current = false;
//   }, [step, methods, data]);

//   const next = async () => {
//     setSubmitError(null);
//     const valid = await methods.trigger(undefined, { shouldFocus: true });
//     if (!valid) return;
    
//     // Store current step data to Zustand before moving to next step
//     const currentValues = methods.getValues();
//     setData(currentValues);
    
//     setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
//   };

//   const back = () => {
//     setSubmitError(null);
    
//     // Store current step data to Zustand before moving back
//     const currentValues = methods.getValues();
//     setData(currentValues);
    
//     setStepIndex((i) => Math.max(0, i - 1));
//   };

//   const jumpToField = (field: string) => {
//     const s = FIELD_TO_STEP[field];
//     if (s) setStepIndex(STEPS.indexOf(s));
//   };

//   // Final submit - FIXED: merge Zustand data with form values
//   const handleSubmit = methods.handleSubmit(async (formValues) => {
//     setSubmitError(null);
//     setSubmitting(true);
//     try {
//       // CRITICAL FIX: Merge Zustand store data with current form values
//       // This ensures contact details and all other step data are included
//       const mergedValues = { ...data, ...formValues };
      
//       // Map voice "upload" to "custom" BEFORE validation if your zod expects custom
//       const normalized = { ...mergedValues };
//       if (normalized.voiceType === "upload") {
//         // keep as "upload" for UI, but full schema may allow it; if not:
//         // normalized.voiceType = "custom";
//       }

//       const parsed = fullZeeSchema.safeParse(normalized);
//       if (!parsed.success) {
//         const bad = firstInvalidFieldFromZod(parsed.error);
//         if (bad) jumpToField(bad);
//         setSubmitError("Please complete the highlighted fields.");
//         setSubmitting(false);
//         return;
//       }

//       // Use merged values for building form data
//       const fd = buildReviewFormData(mergedValues);

//       // Debug: Log what we're sending
//       console.log("Sending to backend:");
//       for (const [key, value] of fd.entries()) {
//         if (value instanceof File) {
//           console.log(`${key}: [File: ${value.name}, ${value.size} bytes]`);
//         } else {
//           console.log(`${key}: ${value}`);
//         }
//       }

//       const res = await fetch("/api/reviews", { method: "POST", body: fd });
//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         // Try to parse FastAPI-style 422 to jump to field
//         try {
//           const j = JSON.parse(text);
//           if (Array.isArray(j.detail) && j.detail[0]?.loc) {
//             const loc = j.detail[0].loc;
//             const f = Array.isArray(loc) ? String(loc[loc.length - 1]) : null;
//             if (f) jumpToField(f);
//           }
//         } catch {}
//         throw new Error(`Backend error (${res.status}): ${text || "Unknown"}`);
//       }

//       const result = await res.json().catch(() => ({}));
      
//       // CRITICAL FIX: Store the result and show modal - DO NOT reset or call onSuccess yet!
//       console.log("Success! Showing modal with result:", result);
//       setSuccessResult(result);
//       setShowSuccessModal(true);
//       // NO setTimeout, NO reset(), NO onSuccess() here!
      
//     } catch (e: any) {
//       console.error(e);
//       setSubmitError(e?.message || "Failed to launch. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   });

//   // Handle modal close - this is where we clean up and notify parent
//   const handleModalClose = () => {
//     console.log("Modal closing, running cleanup...");
//     setShowSuccessModal(false);
    
//     // Reset form after user acknowledges success
//     reset();
    
//     // Call parent callbacks with the stored result
//     if (successResult) {
//       console.log("Calling onSuccess with result:", successResult);
//       onSuccess?.(successResult);
//     }
//     onClose?.();
    
//     // Clear the stored result
//     setSuccessResult(null);
//   };

//   return (
//     <div className="w-full max-w-3xl mx-auto">
//       <div className="bg-[#0D0F1E] rounded-xl border border-[#2A2F5E] p-0 h-[80vh] flex flex-col">
//         {/* Sticky header */}
//         <div className="sticky top-0 z-10 px-6 py-4 bg-[#0D0F1E] border-b border-[#2A2F5E]">
//           <ProgressIndicator
//             currentStep={stepIndex}
//             totalSteps={STEPS.length}
//             stepNames={STEPS as unknown as string[]}
//           />
//         </div>

//         {/* Wrap content & footer in a form so Review can submit */}
//         <form onSubmit={handleSubmit} className="contents">
//           {/* Scrollable content */}
//           <div className="flex-1 overflow-y-auto px-6 py-6" style={{ WebkitOverflowScrolling: "touch" }}>
//             <FormProvider key={step} {...methods}>
//               {step === "Jurisdiction" && <JurisdictionStep />}
//               {step === "Contact" && <ContactStep />}
//               {step === "Knowledge" && <KnowledgeStep />}
//               {step === "Character" && <CharacterStep />}
//               {step === "Visual" && <VisualStep />}
//               {step === "Voice" && <VoiceStep />}
//               {step === "Agents" && <AgentSetupStep />}
//               {step === "Review" && (
//                 <ReviewStep
//                   onEditStep={(name) => {
//                     const idx = STEPS.indexOf(name as StepKey);
//                     if (idx !== -1) setStepIndex(idx);
//                   }}
//                 />
//               )}
//             </FormProvider>
//           </div>

//           {/* Sticky footer */}
//           <div className="sticky bottom-0 z-10 px-6 py-4 bg-[#0D0F1E] border-t border-[#2A2F5E]">
//             {submitError && <div className="mb-3 text-sm text-red-400">{submitError}</div>}
//             <div className="flex justify-between">
//               <button
//                 type="button"
//                 onClick={back}
//                 disabled={stepIndex === 0 || submitting}
//                 className="px-6 py-3 bg-gray-700 rounded-xl disabled:opacity-30 hover:bg-gray-600 transition-colors"
//               >
//                 Back
//               </button>

//               {step !== "Review" ? (
//                 <button
//                   type="button"
//                   onClick={next}
//                   disabled={submitting}
//                   className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity"
//                 >
//                   Next
//                 </button>
//               ) : (
//                 <button
//                   type="button"  // Changed from "submit" to "button"
//                   onClick={async () => {
//                     console.log("Launch button clicked!");
//                     console.log("Form errors before trigger:", methods.formState.errors);
//                     console.log("Form values:", methods.getValues());
                    
//                     // Manually trigger validation
//                     const isValid = await methods.trigger();
//                     console.log("Is form valid after trigger?", isValid);
//                     console.log("Form errors after trigger:", methods.formState.errors);
                    
//                     if (isValid) {
//                       console.log("Form is valid, calling handleSubmit...");
//                       await handleSubmit(methods.getValues());
//                     } else {
//                       console.log("Form validation failed!");
//                     }
//                   }}
//                   disabled={submitting || !methods.watch("agreeToTerms")}
//                   className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-opacity ${
//                     methods.watch("agreeToTerms") 
//                       ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90" 
//                       : "bg-gray-600 opacity-50 cursor-not-allowed"
//                   }`}
//                 >
//                   {submitting ? "Launching…" : "🚀 Launch My ZEE"}
//                 </button>
//               )}
//             </div>
//           </div>
//         </form>
//       </div>
      
//       {/* Success Modal - now with proper close handler */}
//       <SuccessModal 
//         isOpen={showSuccessModal} 
//         onClose={handleModalClose}  // Use the handler that manages cleanup properly
//       />
//     </div>
//   );
// }

// components/agent/MultiStepAgentForm.tsx
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   jurisdictionSchema,
//   contactSchema,
//   knowledgeSchema,
//   characterSchema,
//   visualSchema,
//   voiceSchema,
//   agentSetupSchema,
//   fullZeeSchema
// } from "@/schema/agent-schemas";
// import { z } from "zod";
// import { useAgentFormStore } from "@/stores/agent-form-store";

// import ProgressIndicator from "./ProgressIndicator";
// import JurisdictionStep from "./steps/JurisdictionStep";
// import ContactStep from "./steps/ContactStep";
// import KnowledgeStep from "./steps/KnowledgeStep";
// import CharacterStep from "./steps/CharacterStep";
// import VisualStep from "./steps/VisualStep";
// import VoiceStep from "./steps/VoiceStep";
// import AgentSetupStep from "./steps/AgentSetupStep";
// import ReviewStep from "./steps/ReviewStep";
// import SuccessModal from "./SuccessModal";
// import PaymentsModal from "./PaymentsModal";

// /* ------------------ helpers ------------------ */
// const STEPS = [
//   "Jurisdiction",
//   "Contact",
//   "Knowledge",
//   "Character",
//   "Visual",
//   "Voice",
//   "Agents",
//   "Review",
// ] as const;
// type StepKey = (typeof STEPS)[number];

// const perStepSchema: Record<StepKey, z.ZodTypeAny> = {
//   Jurisdiction: jurisdictionSchema,
//   Contact: contactSchema,
//   Knowledge: knowledgeSchema,
//   Character: characterSchema,
//   Visual: visualSchema,
//   Voice: voiceSchema,
//   Agents: agentSetupSchema,
//   Review: fullZeeSchema,
// };

// const FIELD_TO_STEP: Record<string, StepKey> = {
//   jurisdictionType: "Jurisdiction",
//   country: "Jurisdiction",
//   email: "Contact",
//   telegram: "Contact",
//   website: "Contact",
//   documents: "Contact",
//   knowledgeFiles: "Knowledge",
//   websiteUrls: "Knowledge",
//   newsFilters: "Knowledge",
//   masterPrompt: "Character",
//   twitterAccounts: "Character",
//   spokespersonType: "Visual",
//   uploadedPhoto: "Visual",
//   presetAvatar: "Visual",
//   voiceType: "Voice",
//   presetVoice: "Voice",
//   voiceSample: "Voice",
//   tradingModel: "Agents",
//   predictionMarkets: "Agents",
//   selectedAgents: "Agents",
//   agreeToTerms: "Review",
// };

// const stepOfIssuePath = (path: (string | number)[]): StepKey | null => {
//   const firstKey = path.find((p) => typeof p === "string") as string | undefined;
//   return firstKey ? FIELD_TO_STEP[firstKey] ?? null : null;
// };

// // Build a FormData payload for /api/reviews
// export function toFormData(values: Partial<any>) {
//   const fd = new FormData();

//   const appendIfTruthy = (key: string, val: any) => {
//     if (val === undefined || val === null) return;
//     if (typeof val === "string" && val.trim() === "") return;
//     fd.append(key, val as any);
//   };

//   const appendJSON = (key: string, val: unknown) => {
//     if (val === undefined || val === null) return;
//     fd.append(key, JSON.stringify(val));
//   };

//   /* ───────── Jurisdiction & Contact ───────── */
//   appendIfTruthy("jurisdictionType", values.jurisdictionType);
//   appendIfTruthy("country", values.country);

//   // If the UI allows empty email/website, keep the key but send empty string only when user touched it.
//   if ("email" in (values ?? {})) fd.append("email", (values.email as string) || "");
//   appendIfTruthy("telegram", values.telegram);
//   if ("website" in (values ?? {})) fd.append("website", (values.website as string) || "");

//   /* ───────── Knowledge ───────── */
//   // knowledgeFiles may be File | File[] | FileList | undefined
//   const kf: any = values.knowledgeFiles;
//   let files: File[] = [];
//   if (kf instanceof File) files = [kf];
//   else if (Array.isArray(kf)) files = kf.filter(Boolean);
//   else if (kf && typeof (kf as FileList).length === "number") {
//     try {
//       files = Array.from(kf as FileList);
//     } catch {}
//   }
//   for (const f of files) {
//     if (f instanceof File) fd.append("knowledgeFiles", f);
//   }

//   // URLs: server expects websiteUrls as JSON array (if your server uses `knowledgeFileUrls`, swap key)
//   if (Array.isArray(values.websiteUrls) && values.websiteUrls.length > 0) {
//     appendJSON("websiteUrls", values.websiteUrls);
//     // If your backend still expects this legacy key, uncomment next line:
//     // appendJSON("knowledgeFileUrls", values.websiteUrls);
//   }

//   /* ───────── Character ───────── */
//   appendIfTruthy("masterPrompt", values.masterPrompt);
//   appendIfTruthy("twitterAccounts", values.twitterAccounts);

//   /* ───────── Visual (spokesperson) ─────────
//      - If spokespersonType is "upload", you MUST send either `spokespersonUpload` (File) or `spokespersonUrl`.
//      - If "preset", send `spokespersonPreset`.
//   */
//   if (values.spokespersonType === "upload") {
//     const file = values.uploadedPhoto;
//     const url = typeof values.spokespersonUrl === "string" ? values.spokespersonUrl.trim() : "";

//     if (file instanceof File) {
//       fd.append("spokespersonType", "upload");
//       fd.append("spokespersonUpload", file);
//     } else if (url) {
//       fd.append("spokespersonType", "upload");
//       fd.append("spokespersonUrl", url);
//     }
//     // If neither file nor url is present, do NOT append spokespersonType=upload
//     // (your zod/superRefine should block submission before it gets here).
//   } else if (values.spokespersonType === "preset" && values.presetAvatar) {
//     fd.append("spokespersonType", "preset");
//     fd.append("spokespersonPreset", String(values.presetAvatar));
//   }
//   // If no valid visual choice, don't append any visual keys.

//   /* ───────── Voice ─────────
//      Backend accepts voiceType: "preset" or "custom"
//      - UI "preset" -> send voiceType=preset + presetVoice
//      - UI "upload" -> map to voiceType=custom + voiceCustomUpload (File)
//   */
//   if (values.voiceType === "preset" && values.presetVoice) {
//     fd.append("voiceType", "preset");
//     fd.append("presetVoice", String(values.presetVoice));
//   } else if (
//     (values.voiceType === "upload" || values.voiceType === "custom") &&
//     values.voiceSample instanceof File
//   ) {
//     fd.append("voiceType", "custom");               // map upload → custom
//     fd.append("voiceCustomUpload", values.voiceSample);
//   }
//   // If voiceType=upload but no file, don't append voice fields (client validation should catch it).

//   /* ───────── Agents / Extras ───────── */
//   appendIfTruthy("tradingModel", values.tradingModel);
//   if (Array.isArray(values.predictionMarkets)) appendJSON("predictionMarkets", values.predictionMarkets);
//   if (Array.isArray(values.selectedAgents)) appendJSON("selectedAgents", values.selectedAgents);

//   /* ───────── Terms ───────── */
//   if (typeof values.agreeToTerms === "boolean") {
//     fd.append("agreeToTerms", String(values.agreeToTerms));
//   }

//   return fd;
// }

// /* --------------------------------------------- */

// export default function MultiStepAgentForm({
//   onClose,
//   onSuccess,
// }: {
//   onClose?: () => void;
//   onSuccess?: (result: any) => void;
// }) {
//   const { data, setData, reset } = useAgentFormStore();

//   const [stepIndex, setStepIndex] = useState(0);
//   const step = STEPS[stepIndex];

//   const [submitting, setSubmitting] = useState(false);
//   const [submitErr, setSubmitErr] = useState<string | null>(null);

//   // New: payments & success
//   const [paymentsOpen, setPaymentsOpen] = useState(false);
//   const [successOpen, setSuccessOpen] = useState(false);
//   const [submitResult, setSubmitResult] = useState<any>(null);

//   const syncingRef = useRef(false);
//   const resolver = useMemo(() => zodResolver(perStepSchema[step]), [step]);

//   const methods = useForm<any>({
//     resolver,
//     mode: "onBlur",
//     defaultValues: { agreeToTerms: false, ...(data as Partial<any>) },
//   });

//   // RHF → Zustand
//   useEffect(() => {
//     const sub = methods.watch((value) => {
//       if (!syncingRef.current) setData(value as Partial<any>);
//     });
//     return () => sub.unsubscribe();
//   }, [methods, setData]);

//   // Zustand → RHF on step switch
//   useEffect(() => {
//     syncingRef.current = true;
//     methods.reset({ agreeToTerms: false, ...(data as Partial<any>) }, { keepDirty: true });
//     syncingRef.current = false;
//   }, [step, data, methods]);

//   const next = async () => {
//     setSubmitErr(null);
//     const valid = await methods.trigger(undefined, { shouldFocus: true });
//     if (!valid) return;
//     setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
//   };
//   const back = () => {
//     setSubmitErr(null);
//     setStepIndex((i) => Math.max(0, i - 1));
//   };

//   const handleSubmit = methods.handleSubmit(async (raw) => {
//     setSubmitErr(null);

//     const parsed = fullZeeSchema.safeParse(raw);
//     if (!parsed.success) {
//       const first = parsed.error.issues[0];
//       const target = stepOfIssuePath(first.path) ?? "Jurisdiction";
//       setStepIndex(STEPS.indexOf(target));
//       setSubmitErr(first.message || "Please complete required fields.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const fd = toFormData(parsed.data);
//       const res = await fetch("/api/reviews", { method: "POST", body: fd });
//       const text = await res.text().catch(() => "");
//       if (!res.ok) throw new Error(text || `Backend error (${res.status})`);

//       let result: any = {};
//       try { result = JSON.parse(text); } catch { result = { ok: true, raw: text }; }
//       setSubmitResult(result);

//       // OPEN PAYMENTS instead of success
//       setPaymentsOpen(true);
//     } catch (err: any) {
//       setSubmitErr(err?.message || "Failed to submit.");
//     } finally {
//       setSubmitting(false);
//     }
//   });

//   /* When all payments are done */
//   const handleAllPaid = () => {
//     setPaymentsOpen(false);
//     setSuccessOpen(true);
//   };

//   return (
//     <>
//       {/* Success after payments */}
//       <SuccessModal
//         isOpen={successOpen}
//         onClose={() => {
//           setSuccessOpen(false);
//           reset();
//           onSuccess?.(submitResult);
//           onClose?.();
//         }}
//       />

//       {/* Payments modal */}
//       <PaymentsModal
//         open={paymentsOpen}
//         onClose={() => setPaymentsOpen(false)}
//         selectedAgents={(data.selectedAgents as string[]) ?? []}
//         onAllPaid={handleAllPaid}
//       />

//       <div className="w-full max-w-3xl mx-auto">
//         <div className="bg-[#0D0F1E] rounded-xl border border-[#2A2F5E] p-0 h-[80vh] flex flex-col">
//           <div className="sticky top-0 z-10 px-6 py-4 bg-[#0D0F1E] border-b border-[#2A2F5E]">
//             <ProgressIndicator
//               currentStep={stepIndex}
//               totalSteps={STEPS.length}
//               stepNames={STEPS as unknown as string[]}
//             />
//           </div>

//           {/* Keep the form so submit fires on Review */}
//           <form onSubmit={handleSubmit} className="contents">
//             <div className="flex-1 overflow-y-auto px-6 py-6" style={{ WebkitOverflowScrolling: "touch" }}>
//               <FormProvider key={step} {...methods}>
//                 {step === "Jurisdiction" && <JurisdictionStep />}
//                 {step === "Contact" && <ContactStep />}
//                 {step === "Knowledge" && <KnowledgeStep />}
//                 {step === "Character" && <CharacterStep />}
//                 {step === "Visual" && <VisualStep />}
//                 {step === "Voice" && <VoiceStep />}
//                 {step === "Agents" && <AgentSetupStep />}
//                 {step === "Review" && (
//                   <ReviewStep
//                     onEditStep={(name) => {
//                       const idx = STEPS.indexOf(name as StepKey);
//                       if (idx !== -1) setStepIndex(idx);
//                     }}
//                   />
//                 )}
//               </FormProvider>
//             </div>

//             <div className="sticky bottom-0 z-10 px-6 py-4 bg-[#0D0F1E] border-t border-[#2A2F5E]">
//               {submitErr && <div className="mb-3 text-sm text-red-400">{submitErr}</div>}
//               <div className="flex justify-between">
//                 <button
//                   type="button"
//                   onClick={back}
//                   disabled={stepIndex === 0 || submitting}
//                   className="px-6 py-3 bg-gray-700 rounded-xl disabled:opacity-30 hover:bg-gray-600 transition-colors"
//                 >
//                   Back
//                 </button>

//                 {step !== "Review" ? (
//                   <button
//                     type="button"
//                     onClick={next}
//                     disabled={submitting}
//                     className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity"
//                   >
//                     Next
//                   </button>
//                 ) : (
//                   <button
//                     type="submit"
//                     disabled={submitting || !methods.watch("agreeToTerms")}
//                     className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-opacity ${
//                       methods.watch("agreeToTerms")
//                         ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
//                         : "bg-gray-600 opacity-50 cursor-not-allowed"
//                     }`}
//                   >
//                     {submitting ? "Submitting…" : "🚀 Launch My ZEE"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }

// components/agent/MultiStepAgentForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  jurisdictionSchema,
  contactSchema,
  knowledgeSchema,
  characterSchema,
  visualSchema,
  voiceSchema,
  agentSetupSchema,
  fullZeeSchema
} from "@/schema/agent-schemas";
import { z } from "zod";
import { useAgentFormStore } from "@/stores/agent-form-store";

import ProgressIndicator from "./ProgressIndicator";
import JurisdictionStep from "./steps/JurisdictionStep";
import ContactStep from "./steps/ContactStep";
import KnowledgeStep from "./steps/KnowledgeStep";
import CharacterStep from "./steps/CharacterStep";
import VisualStep from "./steps/VisualStep";
import VoiceStep from "./steps/VoiceStep";
import AgentSetupStep from "./steps/AgentSetupStep";
import ReviewStep from "./steps/ReviewStep";
import SuccessModal from "./SuccessModal";
import PaymentsModal from "./PaymentsModal";
import { useWallet } from "@solana/wallet-adapter-react";

/* ------------------ helpers ------------------ */
const STEPS = [
  "Jurisdiction",
  "Contact",
  "Knowledge",
  "Character",
  "Visual",
  "Voice",
  "Agents",
  "Review",
] as const;
type StepKey = (typeof STEPS)[number];

const perStepSchema: Record<StepKey, z.ZodTypeAny> = {
  Jurisdiction: jurisdictionSchema,
  Contact: contactSchema,
  Knowledge: knowledgeSchema,
  Character: characterSchema,
  Visual: visualSchema,
  Voice: voiceSchema,
  Agents: agentSetupSchema,
  Review: fullZeeSchema,
};

const FIELD_TO_STEP: Record<string, StepKey> = {
  jurisdictionType: "Jurisdiction",
  country: "Jurisdiction",
  name: "Contact",
  email: "Contact",
  telegram: "Contact",
  website: "Contact",
  documents: "Contact",
  knowledgeFiles: "Knowledge",
  websiteUrls: "Knowledge",
  newsFilters: "Knowledge",
  masterPrompt: "Character",
  twitterAccounts: "Character",
  spokespersonType: "Visual",
  uploadedPhoto: "Visual",
  presetAvatar: "Visual",
  voiceType: "Voice",
  presetVoice: "Voice",
  voiceSample: "Voice",
  tradingModel: "Agents",
  predictionMarkets: "Agents",
  selectedAgents: "Agents",
  agreeToTerms: "Review",
};

const stepOfIssuePath = (path: (string | number)[]): StepKey | null => {
  const firstKey = path.find((p) => typeof p === "string") as string | undefined;
  return firstKey ? FIELD_TO_STEP[firstKey] ?? null : null;
};



// Build a FormData payload for /api/reviews (handles voice/upload rules)
function toFormData(values: Partial<any>) {
  const fd = new FormData();

  const appendIfTruthy = (key: string, val: any) => {
    if (val === undefined || val === null) return;
    if (typeof val === "string" && val.trim() === "") return;
    fd.append(key, val as any);
  };
  const appendJSON = (key: string, val: unknown) => {
    if (val === undefined || val === null) return;
    fd.append(key, JSON.stringify(val));
  };

  appendIfTruthy("walletAddress", (values as any).walletAddress);
  appendIfTruthy("name", (values as any).name);  

  /* ── Jurisdiction & Contact ── */
  appendIfTruthy("jurisdictionType", values.jurisdictionType);
  appendIfTruthy("country", values.country);

  if ("email" in (values ?? {})) fd.append("email", (values.email as string) || "");
  appendIfTruthy("telegram", values.telegram);
  if ("website" in (values ?? {})) fd.append("website", (values.website as string) || "");

  /* ── Knowledge (PUBLIC ONLY) ──
     We no longer send full KB. Only public URLs (those that answered “No” to selective disclosure).
     Priority:
     1) If you stored kbPublicUrls in the store/values, use those.
     2) Else, if you have websiteUrls + knowledgeDisclosures for files only, we’ll still send just websiteUrls as-is,
        OR filter by an optional urlDisclosures list if you decided to add it later.
  */
  const kbPublicUrls = (values as any).kbPublicUrls as string[] | undefined;
  if (Array.isArray(kbPublicUrls) && kbPublicUrls.length > 0) {
    appendJSON("websiteUrls", kbPublicUrls);
  } else {
    // fallback: send websiteUrls only if you haven't split yet (assumed public),
    // OR add your own urlDisclosures logic here if implemented.
    const rawUrls = Array.isArray(values.websiteUrls) ? values.websiteUrls : [];
    if (rawUrls.length > 0) appendJSON("websiteUrls", rawUrls);
  }

  /* ── Character ── */
  appendIfTruthy("masterPrompt", values.masterPrompt);
  appendIfTruthy("twitterAccounts", values.twitterAccounts);

  /* ── Visual (spokesperson) ── */
  if (values.spokespersonType === "upload") {
    const file = values.uploadedPhoto;
    const url = typeof values.spokespersonUrl === "string" ? values.spokespersonUrl.trim() : "";
    if (file instanceof File) {
      fd.append("spokespersonType", "upload");
      fd.append("spokespersonUpload", file);
    } else if (url) {
      fd.append("spokespersonType", "upload");
      fd.append("spokespersonUrl", url);
    }
  } else if (values.spokespersonType === "preset" && values.presetAvatar) {
    fd.append("spokespersonType", "preset");
    fd.append("spokespersonPreset", String(values.presetAvatar));
  }

  /* ── Voice (map upload → custom) ── */
  if (values.voiceType === "preset" && values.presetVoice) {
    fd.append("voiceType", "preset");
    fd.append("presetVoice", String(values.presetVoice));
  } else if (
    (values.voiceType === "upload" || values.voiceType === "custom") &&
    values.voiceSample instanceof File
  ) {
    fd.append("voiceType", "custom");
    fd.append("voiceCustomUpload", values.voiceSample);
  }

  /* ── Agents / Extras ── */
  appendIfTruthy("tradingModel", values.tradingModel);
  if (Array.isArray(values.predictionMarkets)) appendJSON("predictionMarkets", values.predictionMarkets);
  if (Array.isArray(values.selectedAgents)) appendJSON("selectedAgents", values.selectedAgents);

  if (values.zeeType) fd.append("zeeType", values.zeeType);
  if (typeof values.paymentStatus === "boolean") {
  fd.append("paymentStatus", String(values.paymentStatus)); // "true" | "false"
}

  /* ── Terms ── */
  if (typeof values.agreeToTerms === "boolean") {
    fd.append("agreeToTerms", String(values.agreeToTerms));
  }

  return fd;
}


/* --------------------------------------------- */

export default function MultiStepAgentForm({
  onClose,
  onSuccess,
}: {
  onClose?: () => void;
  onSuccess?: (result: any) => void;
}) {
  const { data, setData, reset } = useAgentFormStore();

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  // payments & success
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  // ⬇️ capture the agents to charge from the validated submit, not the store
  const [paymentAgents, setPaymentAgents] = useState<string[]>([]);

  const { publicKey } = useWallet();

  const syncingRef = useRef(false);
  const resolver = useMemo(() => zodResolver(perStepSchema[step]), [step]);

  const methods = useForm<any>({
    resolver,
    mode: "onBlur",
    defaultValues: { agreeToTerms: false,paymentStatus: false, ...(data as Partial<any>) },
  });

  // RHF → Zustand
  useEffect(() => {
    const sub = methods.watch((value) => {
      if (!syncingRef.current) setData(value as Partial<any>);
    });
    return () => sub.unsubscribe();
  }, [methods, setData]);

  // Zustand → RHF on step switch
  useEffect(() => {
    syncingRef.current = true;
    methods.reset({ agreeToTerms: false, ...(data as Partial<any>) }, { keepDirty: true });
    syncingRef.current = false;
  }, [step, data, methods]);

  const next = async () => {
    setSubmitErr(null);
    const valid = await methods.trigger(undefined, { shouldFocus: true });
    if (!valid) { console.log('RHF errors', methods.formState.errors);};
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };
  const back = () => {
    setSubmitErr(null);
    setStepIndex((i) => Math.max(0, i - 1));
  };

    const blockKnowledge = step === "Knowledge" && !data.kbReady;

  const handleSubmit = methods.handleSubmit(async (raw) => {
    setSubmitErr(null);

    const parsed = fullZeeSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const target = stepOfIssuePath(first.path) ?? "Jurisdiction";
      setStepIndex(STEPS.indexOf(target));
      setSubmitErr(first.message || "Please complete required fields.");
      return;
    }

      const walletAddress = publicKey?.toBase58();
  if (!walletAddress) {
    setSubmitErr("Please connect your wallet before launching your ZEE.");
    return;
  }

  const name = parsed.data.name ?? data.name;
  if (!name || String(name).trim() === "") {
    setSubmitErr("Your swarm name is missing. Please add it in the Contact step.");
    setStepIndex(STEPS.indexOf("Contact"));
    return;
  }
  const valuesWithRequired = {
    ...parsed.data,
    walletAddress,
    name,
  };


    setSubmitting(true);
    try {
      const fd = toFormData(valuesWithRequired);
      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      const text = await res.text().catch(() => "");
      if (!res.ok) throw new Error(text || `Backend error (${res.status})`);

      let result: any = {};
      try { result = JSON.parse(text); } catch { result = { ok: true, raw: text }; }
      setSubmitResult(result);

      // ⬇️ take fresh validated agents for payment
      setPaymentAgents(Array.isArray(parsed.data.selectedAgents) ? parsed.data.selectedAgents : []);

      // open payments (do NOT open success here)
      setPaymentsOpen(true);
    } catch (err: any) {
      setSubmitErr(err?.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  });

  /* When all payments are done */
    /* When all payments are done */
  // const handleAllPaid = () => {
  //   setPaymentsOpen(false);
  //   setSuccessOpen(true);
  // };


  // replace your existing handleAllPaid with this
const handleAllPaid = async () => {
  try {
    const { lastReviewId, clearLastReviewId } = useAgentFormStore.getState();

    if (!lastReviewId) {
      // if nothing stored, we can still show success, but log it
      console.warn("No lastReviewId in store; skipping payment PATCH");
    } else {
      const fd = new FormData();
      fd.append("paymentStatus", "true");

      const patchRes = await fetch(
        `http://127.0.0.1:8001/reviews/${encodeURIComponent(lastReviewId)}/payment`,
        { method: "PATCH", body: fd }
      );

      if (!patchRes.ok) {
        const errText = await patchRes.text().catch(() => "");
        throw new Error(errText || `Payment PATCH failed (${patchRes.status})`);
      }

      // clear the saved id so the next review uses a fresh one
      clearLastReviewId();

      // optionally reflect paid in the current RHF form state (not required)
      methods.setValue("paymentStatus", true as any, { shouldDirty: true });
    }

    // close payments → open success
    setPaymentsOpen(false);
    setSuccessOpen(true);
  } catch (e: any) {
    setSubmitErr(e?.message || "Failed to mark payment as complete.");
  }
};


  // ⬇️ The return MUST be inside the component function (still within the same `{ ... }`)
  return (
    <>
      {/* Success after payments */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          reset();
          onSuccess?.(submitResult);
          onClose?.();
        }}
      />

      {/* Payments modal */}
      <PaymentsModal
        open={paymentsOpen}
        onClose={() => setPaymentsOpen(false)}
        // use the validated list you stored for payments
        selectedAgents={paymentAgents}
        onAllPaid={() => { void handleAllPaid(); }}
      />

      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-[#0D0F1E] rounded-xl border border-[#2A2F5E] p-0 h-[80vh] flex flex-col">
          <div className="sticky top-0 z-10 px-6 py-4 bg-[#0D0F1E] border-b border-[#2A2F5E]">
            <ProgressIndicator
              currentStep={stepIndex}
              totalSteps={STEPS.length}
              stepNames={STEPS as unknown as string[]}
            />
          </div>

          <form onSubmit={handleSubmit} className="contents">
            <div className="flex-1 overflow-y-auto px-6 py-6" style={{ WebkitOverflowScrolling: "touch" }}>
              <FormProvider key={step} {...methods}>
                {step === "Jurisdiction" && <JurisdictionStep />}
                {step === "Contact" && <ContactStep />}
                {step === "Knowledge" && <KnowledgeStep />}
                {step === "Character" && <CharacterStep />}
                {step === "Visual" && <VisualStep />}
                {step === "Voice" && <VoiceStep />}
                {step === "Agents" && <AgentSetupStep />}
                {step === "Review" && (
                  <ReviewStep
                    onEditStep={(name) => {
                      const idx = STEPS.indexOf(name as StepKey);
                      if (idx !== -1) setStepIndex(idx);
                    }}
                  />
                )}
              </FormProvider>
            </div>

            <div className="sticky bottom-0 z-10 px-6 py-4 bg-[#0D0F1E] border-t border-[#2A2F5E]">
              {submitErr && <div className="mb-3 text-sm text-red-400">{submitErr}</div>}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={back}
                  disabled={stepIndex === 0 || submitting}
                  className="px-6 py-3 bg-gray-700 rounded-xl disabled:opacity-30 hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>

                {step !== "Review" ? (
                  // <button
                  //   type="button"
                  //   onClick={next}
                  //   disabled={submitting}
                  //   className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity"
                  // >
                  //   Next
                  // </button>
                  <button
  type="button"
  onClick={next}
  disabled={submitting || blockKnowledge}
  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
>
  {blockKnowledge ? "Complete Knowledge step…" : "Next"}
</button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting || !methods.watch("agreeToTerms")}
                    className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-opacity ${
                      methods.watch("agreeToTerms")
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                        : "bg-gray-600 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {submitting ? "Submitting…" : "🚀 Launch My ZEE"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
