"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  jurisdictionSchema,
  contactSchema,
  knowledgeSchema,
  characterSchema,
  visualSchema,
  voiceSchema,
  agentSetupSchema,
  fullZeeSchema,
} from "@/schema/agent-schemas";

import { useAgentFormStore } from "@/stores/agent-form-store";
import ProgressIndicator from "./ProgressIndicator";
import SuccessModal from "./SuccessModal";

import JurisdictionStep from "./steps/JurisdictionStep";
import ContactStep from "./steps/ContactStep";
import KnowledgeStep from "./steps/KnowledgeStep";
import CharacterStep from "./steps/CharacterStep";
import VisualStep from "./steps/VisualStep";
import VoiceStep from "./steps/VoiceStep";
import AgentSetupStep from "./steps/AgentSetupStep";
import ReviewStep from "./steps/ReviewStep";

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

const perStepSchema: Record<StepKey, any> = {
  Jurisdiction: jurisdictionSchema,
  Contact: contactSchema,
  Knowledge: knowledgeSchema,
  Character: characterSchema,
  Visual: visualSchema,
  Voice: voiceSchema,
  Agents: agentSetupSchema,
  Review: fullZeeSchema,
};

// field → step (used to jump to the exact failing step)
const FIELD_TO_STEP: Record<string, StepKey> = {
  jurisdictionType: "Jurisdiction",
  country: "Jurisdiction",
  email: "Contact",
  telegram: "Contact",
  website: "Contact",
  knowledgeFiles: "Knowledge",
  websiteUrls: "Knowledge",
  newsFilters: "Knowledge",
  masterPrompt: "Character",
  twitterAccounts: "Character",
  spokespersonType: "Visual",
  spokespersonUpload: "Visual",
  presetAvatar: "Visual",
  voiceType: "Voice",
  presetVoice: "Voice",
  voiceSample: "Voice",
  tradingModel: "Agents",
  predictionMarkets: "Agents",
  selectedAgents: "Agents",
  agreeToTerms: "Review",
};

function firstInvalidFieldFromZod(error: any): string | null {
  if (!error?.issues?.length) return null;
  for (const issue of error.issues) {
    if (Array.isArray(issue.path) && issue.path.length) {
      const last = issue.path[issue.path.length - 1];
      if (typeof last === "string") return last;
    }
  }
  return null;
}

/** Build FormData for backend */
function buildReviewFormData(values: any) {
  const fd = new FormData();

  // Jurisdiction + Contact
  if (values.jurisdictionType) fd.append("jurisdictionType", values.jurisdictionType);
  if (values.country)          fd.append("country", values.country);
  if (values.email)            fd.append("email", values.email);
  if (values.telegram)         fd.append("telegram", values.telegram);
  if (values.website)          fd.append("website", values.website);

  // Knowledge files
  const files: File[] = Array.isArray(values.knowledgeFiles) ? values.knowledgeFiles : [];
  for (const f of files) fd.append("knowledgeFiles", f);

  // Knowledge URLs as JSON - backend might expect "websiteUrls" not "knowledgeFileUrls"
  if (Array.isArray(values.websiteUrls) && values.websiteUrls.length) {
    fd.append("websiteUrls", JSON.stringify(values.websiteUrls));
  }

  // Character
  if (values.masterPrompt)     fd.append("masterPrompt", values.masterPrompt);
  if (values.twitterAccounts)  fd.append("twitterAccounts", values.twitterAccounts);

  // Visual - Only send if actually configured
  if (values.spokespersonType === "upload" && values.spokespersonUpload instanceof File) {
    fd.append("spokespersonType", values.spokespersonType);
    fd.append("spokespersonUpload", values.spokespersonUpload);
    // Also add as uploadedPhoto for schema validation
    values.uploadedPhoto = values.spokespersonUpload;
  } else if (values.spokespersonType === "preset" && values.presetAvatar) {
    fd.append("spokespersonType", values.spokespersonType);
    fd.append("presetAvatar", values.presetAvatar);
  }
  // Don't send spokespersonType at all if not selected or incomplete

  // Voice - Only send if actually configured
  if (values.voiceType === "preset" && values.presetVoice) {
    fd.append("voiceType", "preset");
    fd.append("presetVoice", values.presetVoice);
  } else if (values.voiceType === "upload" && values.voiceSample instanceof File) {
    fd.append("voiceType", "custom");                      // map "upload" → "custom"
    fd.append("voiceCustomUpload", values.voiceSample);    // backend expects this field name!
  }
  // Don't send voiceType at all if not selected or incomplete

  // Agents
  if (values.tradingModel) fd.append("tradingModel", values.tradingModel);
  if (Array.isArray(values.predictionMarkets)) {
    fd.append("predictionMarkets", JSON.stringify(values.predictionMarkets));
  }
  if (Array.isArray(values.selectedAgents)) {
    fd.append("selectedAgents", JSON.stringify(values.selectedAgents));
  }

  // Review
  if (values.agreeToTerms) fd.append("agreeToTerms", String(!!values.agreeToTerms));

  return fd;
}

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
  const syncingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null); // Store the API result

  const resolver = useMemo(() => zodResolver(perStepSchema[step]), [step]);
  const methods = useForm({ resolver, mode: "onBlur", defaultValues: data });

  // RHF → Zustand (live mirror)
  useEffect(() => {
    const sub = methods.watch((value) => {
      if (!syncingRef.current) setData(value);
    });
    return () => sub.unsubscribe();
  }, [methods, setData]);

  // Zustand → RHF (on step change) - FIXED: ensure all fields are synced
  useEffect(() => {
    syncingRef.current = true;
    // Instead of just resetting with current data, merge all accumulated data
    const currentFormValues = methods.getValues();
    const mergedData = { ...data, ...currentFormValues };
    methods.reset(mergedData, { keepDirty: true, keepValues: true });
    syncingRef.current = false;
  }, [step, methods, data]);

  const next = async () => {
    setSubmitError(null);
    const valid = await methods.trigger(undefined, { shouldFocus: true });
    if (!valid) return;
    
    // Store current step data to Zustand before moving to next step
    const currentValues = methods.getValues();
    setData(currentValues);
    
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const back = () => {
    setSubmitError(null);
    
    // Store current step data to Zustand before moving back
    const currentValues = methods.getValues();
    setData(currentValues);
    
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const jumpToField = (field: string) => {
    const s = FIELD_TO_STEP[field];
    if (s) setStepIndex(STEPS.indexOf(s));
  };

  // Final submit - FIXED: merge Zustand data with form values
  const handleSubmit = methods.handleSubmit(async (formValues) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      // CRITICAL FIX: Merge Zustand store data with current form values
      // This ensures contact details and all other step data are included
      const mergedValues = { ...data, ...formValues };
      
      // Map voice "upload" to "custom" BEFORE validation if your zod expects custom
      const normalized = { ...mergedValues };
      if (normalized.voiceType === "upload") {
        // keep as "upload" for UI, but full schema may allow it; if not:
        // normalized.voiceType = "custom";
      }

      const parsed = fullZeeSchema.safeParse(normalized);
      if (!parsed.success) {
        const bad = firstInvalidFieldFromZod(parsed.error);
        if (bad) jumpToField(bad);
        setSubmitError("Please complete the highlighted fields.");
        setSubmitting(false);
        return;
      }

      // Use merged values for building form data
      const fd = buildReviewFormData(mergedValues);

      // Debug: Log what we're sending
      console.log("Sending to backend:");
      for (const [key, value] of fd.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [File: ${value.name}, ${value.size} bytes]`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        // Try to parse FastAPI-style 422 to jump to field
        try {
          const j = JSON.parse(text);
          if (Array.isArray(j.detail) && j.detail[0]?.loc) {
            const loc = j.detail[0].loc;
            const f = Array.isArray(loc) ? String(loc[loc.length - 1]) : null;
            if (f) jumpToField(f);
          }
        } catch {}
        throw new Error(`Backend error (${res.status}): ${text || "Unknown"}`);
      }

      const result = await res.json().catch(() => ({}));
      
      // CRITICAL FIX: Store the result and show modal - DO NOT reset or call onSuccess yet!
      console.log("Success! Showing modal with result:", result);
      setSuccessResult(result);
      setShowSuccessModal(true);
      // NO setTimeout, NO reset(), NO onSuccess() here!
      
    } catch (e: any) {
      console.error(e);
      setSubmitError(e?.message || "Failed to launch. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  // Handle modal close - this is where we clean up and notify parent
  const handleModalClose = () => {
    console.log("Modal closing, running cleanup...");
    setShowSuccessModal(false);
    
    // Reset form after user acknowledges success
    reset();
    
    // Call parent callbacks with the stored result
    if (successResult) {
      console.log("Calling onSuccess with result:", successResult);
      onSuccess?.(successResult);
    }
    onClose?.();
    
    // Clear the stored result
    setSuccessResult(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-[#0D0F1E] rounded-xl border border-[#2A2F5E] p-0 h-[80vh] flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-[#0D0F1E] border-b border-[#2A2F5E]">
          <ProgressIndicator
            currentStep={stepIndex}
            totalSteps={STEPS.length}
            stepNames={STEPS as unknown as string[]}
          />
        </div>

        {/* Wrap content & footer in a form so Review can submit */}
        <form onSubmit={handleSubmit} className="contents">
          {/* Scrollable content */}
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

          {/* Sticky footer */}
          <div className="sticky bottom-0 z-10 px-6 py-4 bg-[#0D0F1E] border-t border-[#2A2F5E]">
            {submitError && <div className="mb-3 text-sm text-red-400">{submitError}</div>}
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
                <button
                  type="button"
                  onClick={next}
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"  // Changed from "submit" to "button"
                  onClick={async () => {
                    console.log("Launch button clicked!");
                    console.log("Form errors before trigger:", methods.formState.errors);
                    console.log("Form values:", methods.getValues());
                    
                    // Manually trigger validation
                    const isValid = await methods.trigger();
                    console.log("Is form valid after trigger?", isValid);
                    console.log("Form errors after trigger:", methods.formState.errors);
                    
                    if (isValid) {
                      console.log("Form is valid, calling handleSubmit...");
                      await handleSubmit(methods.getValues());
                    } else {
                      console.log("Form validation failed!");
                    }
                  }}
                  disabled={submitting || !methods.watch("agreeToTerms")}
                  className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-opacity ${
                    methods.watch("agreeToTerms") 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90" 
                      : "bg-gray-600 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Launching…" : "🚀 Launch My ZEE"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      
      {/* Success Modal - now with proper close handler */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleModalClose}  // Use the handler that manages cleanup properly
      />
    </div>
  );
}

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

//   const resolver = useMemo(() => zodResolver(perStepSchema[step]), [step]);
//   const methods = useForm({ resolver, mode: "onBlur", defaultValues: data });

//   const [successResult, setSuccessResult] = useState<any>(null);

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
//       setShowSuccessModal(true); // Show success modal instead of immediately closing
//       setTimeout(() => {
//   reset();
//   onSuccess?.(result);
// }, 100);
//     } catch (e: any) {
//       console.error(e);
//       setSubmitError(e?.message || "Failed to launch. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   });

//   const handleModalClose = () => {
//      setShowSuccessModal(false);
//      reset();  // Reset form after user sees success
//      if (successResult) {
//        onSuccess?.(successResult);  // Navigate/cleanup here
//      }
//      onClose?.();
//      setSuccessResult(null);
//    };

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
      
//       {/* Success Modal */}
//       <SuccessModal 
//         isOpen={showSuccessModal} 
//         onClose={handleModalClose} 
//       />
//     </div>
//   );
// }

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
//       reset();
//       onSuccess?.(result);
//       onClose?.();
//     } catch (e: any) {
//       console.error(e);
//       setSubmitError(e?.message || "Failed to launch. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   });

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
//                   type="submit"
//                   disabled={submitting}
//                   className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
//                 >
//                   {submitting ? "Launching…" : "🚀 Launch My ZEE"}
//                 </button>
//               )}
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
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

//   // Knowledge URLs as JSON
//   if (Array.isArray(values.websiteUrls) && values.websiteUrls.length) {
//     fd.append("knowledgeFileUrls", JSON.stringify(values.websiteUrls));
//   }

//   // Character
//   if (values.masterPrompt)     fd.append("masterPrompt", values.masterPrompt);
//   if (values.twitterAccounts)  fd.append("twitterAccounts", values.twitterAccounts);

//   // Visual
//   if (values.spokespersonType) fd.append("spokespersonType", values.spokespersonType);
//   if (values.spokespersonType === "upload" && values.spokespersonUpload instanceof File) {
//     fd.append("spokespersonUpload", values.spokespersonUpload);
//   }
//   if (values.spokespersonType === "preset" && values.presetAvatar) {
//     fd.append("presetAvatar", values.presetAvatar);
//   }

//   // Voice (backend only accepts file uploads)
//   if (values.voiceType === "preset" && values.presetVoice) {
//     fd.append("voiceType", "preset");
//     fd.append("presetVoice", values.presetVoice);
//   } else if (values.voiceType === "upload" && values.voiceSample instanceof File) {
//     fd.append("voiceType", "custom");              // map "upload" → "custom"
//     fd.append("voiceSample", values.voiceSample);  // file the backend will receive
//   }

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
//         return;
//       }

//       // Use merged values for building form data
//       const fd = buildReviewFormData(mergedValues);

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
//       reset();
//       onSuccess?.(result);
//       onClose?.();
//     } catch (e: any) {
//       console.error(e);
//       setSubmitError(e?.message || "Failed to launch. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   });

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
//                   type="submit"
//                   disabled={submitting}
//                   className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
//                 >
//                   {submitting ? "Launching…" : "🚀 Launch My ZEE"}
//                 </button>
//               )}
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }