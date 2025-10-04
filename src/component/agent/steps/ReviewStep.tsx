"use client";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/stores/agent-form-store";

type ReviewStepProps = {
  onEditStep: (step: string) => void;
};

export default function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { watch, register, formState: { errors } } = useFormContext();
  const { data: storeData } = useAgentFormStore();

  // Merge: store is the source of truth; RHF watch() may have the latest keystrokes.
  // RHF values take precedence when present.
  const rhf = watch();
  const formData = { ...storeData, ...rhf };

  const knowledgeFiles = (formData.knowledgeFiles ?? []) as File[];
  const websiteUrls = (formData.websiteUrls ?? []) as string[];
  const newsFilters = (formData.newsFilters ?? []) as string[];
  const predictionMarkets = (formData.predictionMarkets ?? []) as string[];
  const selectedAgents = (formData.selectedAgents ?? []) as string[];

  // Voice summary
  let voiceSummary = "—";
  if (formData.voiceType === "preset") {
    voiceSummary = `Preset (${formData.presetVoice ?? "not selected"})`;
  } else if (formData.voiceType === "upload" || formData.voiceType === "custom") {
    // you’re normalizing upload→custom in API, but for display we show what the user did
    voiceSummary = "Custom Sample";
  }

  // Visual summary
  const visualSummary =
    formData.spokespersonType === "upload"
      ? "Custom Photo"
      : formData.spokespersonType === "preset"
      ? `Preset (${formData.presetAvatar ?? "not selected"})`
      : "—";

  const sections = [
    {
      step: "Jurisdiction",
      icon: "🌍",
      fields: [
        { label: "Type", value: formData.jurisdictionType === "business" ? "Business" : formData.jurisdictionType === "individual" ? "Individual" : "—" },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-9">
          <div className="text-sm">
            <span className="text-gray-500">Files Uploaded:</span>{" "}
            <span className="text-gray-300">{knowledgeFiles.length}</span>
            {knowledgeFiles.length > 0 && (
              <ul className="mt-1 text-xs text-gray-400 list-disc list-inside">
                {knowledgeFiles.map((f, i) => (
                  <li key={i}>{f.name}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Website URLs:</span>{" "}
            <span className="text-gray-300">{websiteUrls.length}</span>
            {websiteUrls.length > 0 && (
              <ul className="mt-1 text-xs text-gray-400 list-disc list-inside break-all">
                {websiteUrls.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="text-sm md:col-span-2">
            <span className="text-gray-500">News Filters:</span>{" "}
            <span className="text-gray-300">{newsFilters.length}</span>
            {newsFilters.length > 0 && (
              <span className="ml-2 text-xs text-gray-400">
                {newsFilters.join(", ")}
              </span>
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
  ];

  return (
    <div className="space-y-6">
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

            {/* Either render custom block or simple key/values */}
            {section.custom ? (
              section.custom
            ) : (
              <div className="grid grid-cols-2 gap-3 ml-9">
                {(section.fields ?? []).map((field, i) => (
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
