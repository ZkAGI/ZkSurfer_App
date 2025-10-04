// // "use client";
// // import { useAgentFormStore } from "@/stores/agent-form-store";

// // export default function ReviewStep({
// //   onEditStep,
// // }: {
// //   onEditStep?: (stepName: "Basics" | "Persona" | "Media" | "Socials") => void;
// // }) {
// //   const { data } = useAgentFormStore();

// //   const Section = ({ title, onEdit, children }: any) => (
// //     <div className="bg-[#0f1530] border border-[#2A2F5E] rounded-lg p-4">
// //       <div className="flex items-center justify-between mb-2">
// //         <h4 className="font-semibold">{title}</h4>
// //         {onEdit && (
// //           <button type="button" onClick={onEdit} className="text-sm text-blue-400 hover:text-blue-300">
// //             Edit
// //           </button>
// //         )}
// //       </div>
// //       {children}
// //     </div>
// //   );

// //   return (
// //     <div className="space-y-4">
// //       <Section title="Basics" onEdit={() => onEditStep?.("Basics")}>
// //         <div className="text-sm space-y-1">
// //           <div><span className="text-gray-400">Name:</span> {data.name}</div>
// //           <div><span className="text-gray-400">Ticker:</span> {data.ticker}</div>
// //           <div><span className="text-gray-400">Category:</span> {data.category || "—"}</div>
// //           <div><span className="text-gray-400">Short Description:</span> {data.shortDescription}</div>
// //         </div>
// //       </Section>

// //       <Section title="Persona" onEdit={() => onEditStep?.("Persona")}>
// //         <div className="text-sm space-y-1">
// //           <div><span className="text-gray-400">Voice Tone:</span> {data.voiceTone || "—"}</div>
// //           <div><span className="text-gray-400">Bio:</span> {data.bio || "—"}</div>
// //           <div><span className="text-gray-400">Traits:</span> {(data.coreTraits || []).join(", ") || "—"}</div>
// //           <div className="whitespace-pre-wrap"><span className="text-gray-400">System Prompt:</span> {" "}{data.systemPrompt || "—"}</div>
// //         </div>
// //       </Section>

// //       <Section title="Media" onEdit={() => onEditStep?.("Media")}>
// //         <div className="text-sm space-y-2">
// //           <div><span className="text-gray-400">Avatar Alt:</span> {data.avatarAlt || "—"}</div>
// //           <div className="flex gap-4">
// //             {data.avatar && (
// //               // eslint-disable-next-line @next/next/no-img-element
// //               <img
// //                 src={URL.createObjectURL(data.avatar)}
// //                 alt="avatar"
// //                 className="h-24 w-24 rounded-lg object-cover border border-gray-700"
// //               />
// //             )}
// //             {data.banner && (
// //               // eslint-disable-next-line @next/next/no-img-element
// //               <img
// //                 src={URL.createObjectURL(data.banner)}
// //                 alt="banner"
// //                 className="h-24 rounded-lg object-cover border border-gray-700"
// //               />
// //             )}
// //           </div>
// //         </div>
// //       </Section>

// //       <Section title="Socials & Launch" onEdit={() => onEditStep?.("Socials")}>
// //         <div className="text-sm space-y-1">
// //           <div><span className="text-gray-400">Twitter:</span> {data.twitter || "—"}</div>
// //           <div><span className="text-gray-400">Website:</span> {data.website || "—"}</div>
// //           <div><span className="text-gray-400">Discord:</span> {data.discord || "—"}</div>
// //           <div><span className="text-gray-400">Launch Type:</span> {data.launchType || "—"}</div>
// //           <div><span className="text-gray-400">Agreed to Terms:</span> {data.agreeToTerms ? "Yes" : "No"}</div>
// //         </div>
// //       </Section>
// //     </div>
// //   );
// // }


// "use client";
// import { useMemo, useEffect } from "react";
// import { useAgentFormStore } from "@/stores/agent-form-store";

// type StepName = "Basics" | "Persona" | "Media" | "Socials";

// export default function ReviewStep({
//   onEditStep,
// }: {
//   onEditStep?: (s: StepName) => void;
// }) {
//   const data = useAgentFormStore((s) => s.data);

//   // Safe previews for File objects
//   const avatarUrl = useMemo(
//     () => (data.avatar ? URL.createObjectURL(data.avatar) : ""),
//     [data.avatar]
//   );
//   const bannerUrl = useMemo(
//     () => (data.banner ? URL.createObjectURL(data.banner) : ""),
//     [data.banner]
//   );

//   useEffect(() => {
//     return () => {
//       if (avatarUrl) URL.revokeObjectURL(avatarUrl);
//     };
//   }, [avatarUrl]);

//   useEffect(() => {
//     return () => {
//       if (bannerUrl) URL.revokeObjectURL(bannerUrl);
//     };
//   }, [bannerUrl]);

//   const Section = ({
//     title,
//     onEdit,
//     children,
//   }: {
//     title: string;
//     onEdit?: () => void;
//     children: React.ReactNode;
//   }) => (
//     <div className="bg-[#0f1530] border border-[#2A2F5E] rounded-lg p-4">
//       <div className="flex items-center justify-between mb-2">
//         <h4 className="font-semibold">{title}</h4>
//         {onEdit && (
//           <button
//             type="button"
//             onClick={onEdit}
//             className="text-sm text-blue-400 hover:text-blue-300"
//           >
//             Edit
//           </button>
//         )}
//       </div>
//       {children}
//     </div>
//   );

//   return (
//     <div className="space-y-4">
//       {/* BASICS */}
//       <Section title="Basics" onEdit={() => onEditStep?.("Basics")}>
//         <div className="text-sm space-y-1">
//           <div>
//             <span className="text-gray-400">Name:</span> {data.name || "—"}
//           </div>
//           <div>
//             <span className="text-gray-400">Ticker:</span> {data.ticker || "—"}
//           </div>
//           <div>
//             <span className="text-gray-400">Category:</span>{" "}
//             {data.category || "—"}
//           </div>
//           <div>
//             <span className="text-gray-400">Short Description:</span>{" "}
//             {data.shortDescription || "—"}
//           </div>
//         </div>
//       </Section>

//       {/* PERSONA */}
//       <Section title="Persona" onEdit={() => onEditStep?.("Persona")}>
//         <div className="text-sm space-y-1">
//           <div>
//             <span className="text-gray-400">Voice Tone:</span>{" "}
//             {data.voiceTone || "—"}
//           </div>
//           <div>
//             <span className="text-gray-400">Bio:</span> {data.bio || "—"}
//           </div>
//           <div>
//             <span className="text-gray-400">Traits:</span>{" "}
//             {(data.coreTraits || []).join(", ") || "—"}
//           </div>
//           <div className="whitespace-pre-wrap">
//             <span className="text-gray-400">System Prompt:</span>{" "}
//             {data.systemPrompt || "—"}
//           </div>
//         </div>
//       </Section>

//       {/* MEDIA */}
//       <Section title="Media" onEdit={() => onEditStep?.("Media")}>
//         <div className="text-sm space-y-2">
//           <div>
//             <span className="text-gray-400">Avatar Alt:</span>{" "}
//             {data.avatarAlt || "—"}
//           </div>

//           <div className="flex gap-4">
//             {avatarUrl && (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img
//                 src={avatarUrl}
//                 alt="avatar preview"
//                 className="h-24 w-24 rounded-lg object-cover border border-gray-700"
//               />
//             )}
//             {bannerUrl && (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img
//                 src={bannerUrl}
//                 alt="banner preview"
//                 className="h-24 rounded-lg object-cover border border-gray-700"
//               />
//             )}
//             {!avatarUrl && !bannerUrl && (
//               <div className="text-gray-500">No media selected.</div>
//             )}
//           </div>
//         </div>
//       </Section>

//       {/* SOCIALS & LAUNCH */}
//       <Section title="Socials & Launch" onEdit={() => onEditStep?.("Socials")}>
//         <div className="text-sm space-y-1">
//           <div>
//             <span className="text-gray-400">Twitter:</span>{" "}
//             {data.twitter || "—"}
//           </div>
//           <div>
//             <span className="text-gray-400">Website:</span>{" "}
//             {data.website || "—"}
//           </div>
//           <div>
//             <span className="text-gray-400">Discord:</span>{" "}
//             {data.discord || "—"}
//           </div>
//           <div>
//             <span className="text-gray-400">Launch Type:</span>{" "}
//             {data.launchType || "—"}
//           </div>
//           <div>
//             <span className="text-gray-400">Agreed to Terms:</span>{" "}
//             {data.agreeToTerms ? "Yes" : "No"}
//           </div>
//         </div>
//       </Section>
//     </div>
//   );
// }


// components/agent/steps/ReviewStep.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

type ReviewStepProps = {
  onEditStep: (step: string) => void;
};

export default function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { watch, register, formState: { errors } } = useFormContext();
  const formData = watch();

  const sections = [
    {
      step: "Jurisdiction",
      icon: "🌍",
      fields: [
        { label: "Type", value: formData.jurisdictionType === "business" ? "Business" : "Individual" },
        { label: "Country", value: formData.country },
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
      fields: [
        { label: "Files Uploaded", value: formData.knowledgeFiles?.length || 0 },
        { label: "Website URLs", value: formData.websiteUrls?.length || 0 },
        { label: "News Filters", value: formData.newsFilters?.length || 0 },
      ],
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
      fields: [
        { label: "Spokesperson", value: formData.spokespersonType === "upload" ? "Custom Photo" : "Preset Avatar" },
      ],
    },
    {
      step: "Voice",
      icon: "🎤",
      fields: [
        { label: "Voice Type", value: formData.voiceType === "preset" ? "Preset Voice" : "Custom Sample" },
      ],
    },
    {
      step: "Agents",
      icon: "🤖",
      fields: [
        { label: "Trading Model", value: formData.tradingModel === "foundational" ? "ZkAGI Foundational" : "Custom" },
        { label: "Prediction Markets", value: formData.predictionMarkets?.length || 0 },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-4">🐯🚀✨</div>
        <h3 className="text-2xl font-bold mb-2">Review & Launch Your ZEE</h3>
        <p className="text-gray-400">Cub waving a flag, rocket lifting off</p>
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
            <div className="grid grid-cols-2 gap-3 ml-9">
              {section.fields.map((field, i) => (
                <div key={i} className="text-sm">
                  <span className="text-gray-500">{field.label}:</span>{" "}
                  <span className="text-gray-300">{field.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Terms & Conditions */}
      <div className="bg-[#1A1F3A] rounded-lg p-4 border border-[#2A2F5E]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("agreeToTerms")}
            className="mt-1"
          />
          <span className="text-sm text-gray-300">
            I agree to the{" "}
            <a href="/terms" className="text-purple-400 hover:underline" target="_blank">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-purple-400 hover:underline" target="_blank">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-red-400 text-sm mt-2">{errors.agreeToTerms.message as string}</p>
        )}
      </div>

      {/* Final CTA Message */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6 text-center">
        <h4 className="text-lg font-semibold mb-2">🎉 Ready to Launch!</h4>
        <p className="text-sm text-gray-300">
          Your ZEE is configured and ready to go. Click &apos;Launch My ZEE&apos; below to bring it to life!
        </p>
      </div>
    </div>
  );
}