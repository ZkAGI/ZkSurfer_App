// "use client";
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
//   fullZeeSchema,
// } from "@/schema/agent-schemas";
// import { useAgentFormStore } from "@/stores/agent-form-store";
// import { useEffect, useMemo, useState, useRef } from "react";
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

//   const resolver = useMemo(() => zodResolver(perStepSchema[step]), [step]);

//   const methods = useForm({
//     resolver,
//     mode: "onBlur",
//     defaultValues: data,
//   });

//   // Feed RHF changes into Zustand
//   useEffect(() => {
//     const sub = methods.watch((value) => {
//       if (!syncingRef.current) {
//         setData(value);
//       }
//     });
//     return () => sub.unsubscribe();
//   }, [methods, setData]);

//   // Sync store to form when step changes
//   useEffect(() => {
//     syncingRef.current = true;
//     methods.reset(data, { keepDirty: true });
//     syncingRef.current = false;
//   }, [step, methods]);

//   const next = async () => {
//     const valid = await methods.trigger(undefined, { shouldFocus: true });
//     if (!valid) return;
//     setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
//   };

//   const back = () => setStepIndex((i) => Math.max(0, i - 1));

//   const onSubmit = methods.handleSubmit(async (values) => {
//     const parsed = fullZeeSchema.safeParse(values);
//     if (!parsed.success) {
//       console.error(parsed.error);
//       setStepIndex(0);
//       return;
//     }

//     const fd = new FormData();
//     // Add all your form data to FormData
//     Object.entries(values).forEach(([key, value]) => {
//       if (value !== undefined && value !== null) {
//         if (Array.isArray(value)) {
//           value.forEach((v) => fd.append(`${key}[]`, v));
//         } else {
//           fd.append(key, value);
//         }
//       }
//     });

//     const res = await fetch("/api/agents", { method: "POST", body: fd });
//     if (!res.ok) throw new Error("Failed to create ZEE");
//     const result = await res.json();

//     reset();
//     onSuccess?.(result);
//     onClose?.();
//   });

//   return (
//   <div className="w-full max-w-3xl mx-auto">
//     {/* Card */}
//     <div className="bg-[#0D0F1E] rounded-xl border border-[#2A2F5E] p-0
//                     h-[80vh] flex flex-col"> {/* <- fixed height & column layout */}

//       {/* Sticky header: Progress */}
//       <div className="sticky top-0 z-10 px-6 py-4 bg-[#0D0F1E] border-b border-[#2A2F5E]">
//         <ProgressIndicator
//           currentStep={stepIndex}
//           totalSteps={STEPS.length}
//           stepNames={STEPS as unknown as string[]}
//         />
//       </div>

//       {/* Scrollable content */}
//       <div
//         className="flex-1 overflow-y-auto px-6 py-6"
//         style={{ WebkitOverflowScrolling: 'touch' }} // iOS momentum scrolling
//       >
//         <FormProvider key={step} {...methods}>
//           {step === "Jurisdiction" && <JurisdictionStep />}
//           {step === "Contact" && <ContactStep />}
//           {step === "Knowledge" && <KnowledgeStep />}
//           {step === "Character" && <CharacterStep />}
//           {step === "Visual" && <VisualStep />}
//           {step === "Voice" && <VoiceStep />}
//           {step === "Agents" && <AgentSetupStep />}
//           {step === "Review" && (
//             <ReviewStep
//               onEditStep={(name) => {
//                 const idx = STEPS.indexOf(name as StepKey);
//                 if (idx !== -1) setStepIndex(idx);
//               }}
//             />
//           )}
//         </FormProvider>
//       </div>

//       {/* Sticky footer: Nav buttons */}
//       <div className="sticky bottom-0 z-10 px-6 py-4 bg-[#0D0F1E] border-t border-[#2A2F5E]">
//         <div className="flex justify-between">
//           <button
//             onClick={back}
//             disabled={stepIndex === 0}
//             className="px-6 py-3 bg-gray-700 rounded-xl disabled:opacity-30 hover:bg-gray-600 transition-colors"
//           >
//             Back
//           </button>

//           {step !== "Review" ? (
//             <button
//               onClick={next}
//               className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity"
//             >
//               Next
//             </button>
//           ) : (
//             <button
//               onClick={onSubmit}
//               className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
//             >
//               🚀 Launch My ZEE
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   </div>
// );

// }

// "use client";
// import { useEffect, useRef, useMemo, useState } from "react";
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

// /* ----------------------- Starfield (same style as FlowGate) ----------------------- */
// function Starfield() {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const rafRef = useRef<number | null>(null);
//   const starsRef = useRef<{x:number;y:number;z:number;r:number;vx:number;vy:number;color:string}[]>([]);

//   useEffect(() => {
//     const canvas = canvasRef.current!;
//     const ctx = canvas.getContext("2d")!;
//     const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
//     let w = 0, h = 0;
//     const palette = ['#c084fc','#a78bfa','#f0abfc','#818cf8','#e879f9'];

//     const resize = () => {
//       w = window.innerWidth; h = window.innerHeight;
//       canvas.width = Math.floor(w * dpr);
//       canvas.height = Math.floor(h * dpr);
//       canvas.style.width = `${w}px`;
//       canvas.style.height = `${h}px`;
//       ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

//       const target = Math.floor((w * h) / 1200);
//       const stars = starsRef.current; stars.length = 0;
//       for (let i=0;i<target;i++){
//         stars.push({
//           x: Math.random()*w, y: Math.random()*h, z: 0.5+Math.random()*1.5,
//           r: 0.4+Math.random()*1.2, vx: (Math.random()*0.08+0.02)*(Math.random()<0.5?-1:1),
//           vy: Math.random()*0.12+0.02, color: palette[(Math.random()*palette.length)|0],
//         });
//       }
//     };

//     const draw = () => {
//       const g = ctx.createRadialGradient(w*0.5,h*0.5,0,w*0.5,h*0.5,Math.max(w,h)*0.75);
//       g.addColorStop(0,'rgba(88,28,135,0.35)');
//       g.addColorStop(0.45,'rgba(30,27,75,0.45)');
//       g.addColorStop(1,'rgba(2,6,23,0.7)');
//       ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

//       for (let i=0;i<starsRef.current.length;i++){
//         const s = starsRef.current[i];
//         s.x += s.vx*s.z; s.y += s.vy*s.z;
//         if (s.x<-5) s.x=w+5; if (s.x>w+5) s.x=-5;
//         if (s.y>h+5){ s.y=-5; s.x=Math.random()*w; }

//         const t = (Math.sin((Date.now()*0.002 + i) * s.z) + 1)*0.5;
//         const r = s.r*(0.7+t*0.6);

//         ctx.globalAlpha = 0.65 + t*0.35;
//         ctx.beginPath(); ctx.arc(s.x,s.y,r,0,Math.PI*2);
//         ctx.fillStyle = s.color; ctx.fill();

//         ctx.globalAlpha = 0.15 + t*0.15;
//         ctx.beginPath(); ctx.arc(s.x,s.y,r*2.2,0,Math.PI*2);
//         ctx.fillStyle = s.color; ctx.fill();
//       }
//       ctx.globalAlpha = 1;
//       rafRef.current = requestAnimationFrame(draw);
//     };

//     resize(); draw();
//     const onResize = () => resize();
//     window.addEventListener("resize", onResize);
//     return () => { window.removeEventListener("resize", onResize); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
//   }, []);

//   return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[100]" aria-hidden />;
// }
// /* ----------------------------------------------------------------------------------- */

// const STEPS = [
//   "Jurisdiction","Contact","Knowledge","Character","Visual","Voice","Agents","Review",
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

// export default function MultiStepAgentForm({
//   onClose,
//   onSuccess,
// }: { onClose?: () => void; onSuccess?: (result: any) => void; }) {
//   const { data, setData, reset } = useAgentFormStore();
//   const [stepIndex, setStepIndex] = useState(0);
//   const step = STEPS[stepIndex];
//   const syncingRef = useRef(false);

//   const resolver = useMemo(() => zodResolver(perStepSchema[step]), [step]);
//   const methods = useForm({ resolver, mode: "onBlur", defaultValues: data });

//   useEffect(() => {
//     const sub = methods.watch((value) => {
//       if (!syncingRef.current) setData(value);
//     });
//     return () => sub.unsubscribe();
//   }, [methods, setData]);

//   useEffect(() => {
//     syncingRef.current = true;
//     methods.reset(data, { keepDirty: true });
//     syncingRef.current = false;
//   }, [step, methods, data]);

//   const next = async () => {
//     const valid = await methods.trigger(undefined, { shouldFocus: true });
//     if (valid) setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
//   };
//   const back = () => setStepIndex((i) => Math.max(0, i - 1));

//   const onSubmit = methods.handleSubmit(async (values) => {
//     const parsed = fullZeeSchema.safeParse(values);
//     if (!parsed.success) { console.error(parsed.error); setStepIndex(0); return; }

//     const fd = new FormData();
//     Object.entries(values).forEach(([k,v]) => {
//       if (v == null) return;
//       if (Array.isArray(v)) v.forEach((x) => fd.append(`${k}[]`, x as any));
//       else fd.append(k, v as any);
//     });

//     const res = await fetch("/api/agents", { method: "POST", body: fd });
//     if (!res.ok) throw new Error("Failed to create ZEE");
//     const result = await res.json();
//     reset(); onSuccess?.(result); onClose?.();
//   });

//   return (
//     <>
//       {/* Star backdrop & dimmer — covers the whole app (no navbar bleed) */}
//       <Starfield />
//       <div className="fixed inset-0 z-[110] flex items-center justify-center" onClick={onClose}>
//         <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
//         {/* FORM CARD */}
//         <div
//           className="relative z-[120] w-full max-w-3xl mx-auto"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="bg-[#0D0F1E]/95 rounded-xl border border-[#2A2F5E] p-0 h-[80vh] flex flex-col">
//             {/* Sticky header */}
//             <div className="sticky top-0 z-10 px-6 py-4 bg-[#0D0F1E]/95 border-b border-[#2A2F5E]">
//               <ProgressIndicator
//                 currentStep={stepIndex}
//                 totalSteps={STEPS.length}
//                 stepNames={STEPS as unknown as string[]}
//               />
//             </div>

//             {/* Scrollable content */}
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

//             {/* Sticky footer */}
//             <div className="sticky bottom-0 z-10 px-6 py-4 bg-[#0D0F1E]/95 border-t border-[#2A2F5E]">
//               <div className="flex justify-between">
//                 <button
//                   onClick={back}
//                   disabled={stepIndex === 0}
//                   className="px-6 py-3 bg-gray-700 rounded-xl disabled:opacity-30 hover:bg-gray-600 transition-colors"
//                 >
//                   Back
//                 </button>
//                 {step !== "Review" ? (
//                   <button
//                     onClick={next}
//                     className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity"
//                   >
//                     Next
//                   </button>
//                 ) : (
//                   <button
//                     onClick={onSubmit}
//                     className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
//                   >
//                     🚀 Launch My ZEE
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

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
  fullZeeSchema,
} from "@/schema/agent-schemas";
import { useAgentFormStore } from "@/stores/agent-form-store";
import { useEffect, useMemo, useState, useRef } from "react";
import ProgressIndicator from "./ProgressIndicator";

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

/** Build FormData exactly like your cURL example expects */
function buildReviewFormData(values: any) {
  const fd = new FormData();

  // 1) Required / core (map your field names -> API keys)
  if (values.jurisdictionType) fd.append("jurisdictionType", values.jurisdictionType);
  if (values.email)            fd.append("email", values.email);
  if (values.telegram)         fd.append("telegram", values.telegram);

  // 2) Knowledge inputs (files + urls)
  //   RHF file inputs usually give File | File[] | FileList — normalize to array:
  const fileList: File[] = (() => {
    if (!values.knowledgeFiles) return [];
    if (values.knowledgeFiles instanceof File) return [values.knowledgeFiles];
    if (Array.isArray(values.knowledgeFiles))   return values.knowledgeFiles;
    // FileList
    return Array.from(values.knowledgeFiles as FileList);
  })();

  fileList.forEach((f: File) => fd.append("knowledgeFiles", f));

  const urlArray =
    values.knowledgeFileUrls ??
    values.websiteUrls ?? // in case your schema used websiteUrls
    [];
  if (Array.isArray(urlArray) && urlArray.length > 0) {
    // Backend example shows stringified JSON
    fd.append("knowledgeFileUrls", JSON.stringify(urlArray));
  }

  // 3) Visual / Spokesperson
  if (values.spokespersonType) fd.append("spokespersonType", values.spokespersonType);
  if (values.spokespersonType === "upload" && values.spokespersonUpload instanceof File) {
    fd.append("spokespersonUpload", values.spokespersonUpload);
  }
  // If you also support preset: fd.append("spokespersonPreset", values.spokespersonPreset)

  // 4) Voice
  if (values.voiceType) fd.append("voiceType", values.voiceType);
  if (values.voiceType === "custom" && values.voiceCustomUrl) {
    fd.append("voiceCustomUrl", values.voiceCustomUrl);
  }
  // If you also support preset voices: fd.append("voicePreset", values.voicePreset)

  // 5) (Optional) Anything else you want the backend to receive:
  //    trading model, chosen agents, markets, etc. (only if useful on your side)
  if (values.tradingModel) fd.append("tradingModel", values.tradingModel);
  if (Array.isArray(values.predictionMarkets)) {
    fd.append("predictionMarkets", JSON.stringify(values.predictionMarkets));
  }
  if (Array.isArray(values.selectedAgents)) {
    fd.append("selectedAgents", JSON.stringify(values.selectedAgents));
  }

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

  const resolver = useMemo(() => zodResolver(perStepSchema[step]), [step]);

  const methods = useForm({
    resolver,
    mode: "onBlur",
    defaultValues: data,
  });

  // Feed RHF changes into Zustand (guard against loop)
  useEffect(() => {
    const sub = methods.watch((value) => {
      if (!syncingRef.current) setData(value);
    });
    return () => sub.unsubscribe();
  }, [methods, setData]);

  // Sync store to form when step changes
  useEffect(() => {
    syncingRef.current = true;
    methods.reset(data, { keepDirty: true });
    syncingRef.current = false;
  }, [step, methods, data]);

  const next = async () => {
    const valid = await methods.trigger(undefined, { shouldFocus: true });
    if (!valid) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  const onSubmit = methods.handleSubmit(async (values) => {
    // Validate the whole thing with your full schema
    const parsed = fullZeeSchema.safeParse(values);
    if (!parsed.success) {
      console.error(parsed.error);
      // send user back to the first invalid step if you want (optional)
      setStepIndex(0);
      return;
    }

    // Build FormData to match your curl
    const fd = buildReviewFormData(values);

    // POST to your backend
   const res = await fetch("/api/reviews", {
  method: "POST",
  body: fd, // DON'T set Content-Type; the browser will add the boundary
});
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to create review (${res.status}): ${text}`);
    }
    const result = await res.json().catch(() => ({}));

    reset();               // clear local store
    onSuccess?.(result);   // bubble up
    onClose?.();           // close modal
  });

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
          <div className="flex justify-between">
            <button
              onClick={back}
              disabled={stepIndex === 0}
              className="px-6 py-3 bg-gray-700 rounded-xl disabled:opacity-30 hover:bg-gray-600 transition-colors"
            >
              Back
            </button>

            {step !== "Review" ? (
              <button
                onClick={next}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onSubmit}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                🚀 Launch My ZEE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
