// components/agent/steps/ContactStep.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from 'next/image';

export default function ContactStep() {
  const { register, formState: { errors }, watch } = useFormContext();
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedDocs(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        {/* <Image src="/images/cubs/bd.png" width={20} height={20} alt="bd"/> */}
        <h3 className="text-2xl font-bold mb-2">How can your swarm reach you?</h3>
      </motion.div>

      <div>
        <label className="block text-sm font-medium mb-2">📧 Official Email</label>
        <input
          type="email"
          {...register("email")}
          placeholder="your@email.com"
          className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">📱 Telegram Handle</label>
        <input
          type="text"
          {...register("telegram")}
          placeholder="@yourusername"
          className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors"
        />
        {errors.telegram && (
          <p className="text-red-400 text-sm mt-1">{errors.telegram.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">🌐 Website (Optional)</label>
        <input
          type="url"
          {...register("website")}
          placeholder="https://yoursite.com"
          className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors"
        />
        {errors.website && (
          <p className="text-red-400 text-sm mt-1">{errors.website.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">📄 Upload Documents (Optional)</label>
        <p className="text-xs text-gray-400 mb-2">Pitch decks, whitepapers, or other relevant docs (PDF)</p>
        <label className="block w-full border-2 border-dashed border-[#2A2F5E] rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors">
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="text-4xl mb-2">📎</div>
          <p className="text-sm text-gray-400">
            {uploadedDocs.length > 0 
              ? `${uploadedDocs.length} file(s) selected` 
              : "Click to upload PDFs"}
          </p>
        </label>
        {uploadedDocs.length > 0 && (
          <div className="mt-2 space-y-1">
            {uploadedDocs.map((file, idx) => (
              <div key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                <span>✓</span>
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 italic">* At least one contact method (Email or Telegram) is required</p>
    </div>
  );
}