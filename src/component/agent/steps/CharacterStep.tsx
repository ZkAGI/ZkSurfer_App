// components/agent/steps/CharacterStep.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

export default function CharacterStep() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        {/* <div className="text-6xl mb-4">🐯💬✨</div> */}
        
        <h3 className="text-2xl font-bold mb-2">How should your ZEE talk?</h3>
        {/* <p className="text-gray-400">Cub typing on glowing terminal, tweets floating around</p> */}
      </motion.div>

      <div>
        <label className="block text-sm font-medium mb-2">🎭 Master Personality Prompt</label>
        <p className="text-xs text-gray-400 mb-3">
          Describe your ZEE&apos;s personality, tone, and communication style
        </p>
        <textarea
          {...register("masterPrompt")}
          rows={8}
          placeholder="Example: You are a professional, witty, and insightful AI agent. You speak with confidence but remain approachable. You use occasional humor and always provide actionable insights. Your tone is conversational yet authoritative..."
          className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors resize-none"
        />
        {errors.masterPrompt && (
          <p className="text-red-400 text-sm mt-1">{errors.masterPrompt.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">𝕏 Twitter/X Style Reference (Optional)</label>
        <p className="text-xs text-gray-400 mb-3">
          Paste Twitter/X handles to clone their content style (e.g., @elonmusk, @pmarca)
        </p>
        <textarea
          {...register("twitterAccounts")}
          rows={3}
          placeholder="@username1, @username2, @username3"
          className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Your ZEE will analyze these accounts to match their writing style and tone
        </p>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <h4 className="font-semibold mb-2 text-purple-300">💡 Pro Tips:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Be specific about tone (formal, casual, humorous, serious)</li>
          <li>• Define how technical your ZEE should be</li>
          <li>• Mention any words or phrases to avoid</li>
          <li>• Include examples of ideal responses</li>
        </ul>
      </div>
    </div>
  );
}