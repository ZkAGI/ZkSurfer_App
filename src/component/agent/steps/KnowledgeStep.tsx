// components/agent/steps/KnowledgeStep.tsx
"use client";
import { useFormContext, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from 'next/image';

const NEWS_CATEGORIES = [
  { id: "finance", label: "💰 Finance", color: "text-green-400" },
  { id: "health", label: "🏥 Health", color: "text-red-400" },
  { id: "ai", label: "🤖 AI & Tech", color: "text-purple-400" },
  { id: "realestate", label: "🏠 Real Estate", color: "text-blue-400" },
  { id: "crypto", label: "₿ Crypto", color: "text-orange-400" },
  { id: "politics", label: "🏛️ Politics", color: "text-yellow-400" },
  { id: "sports", label: "⚽ Sports", color: "text-teal-400" },
  { id: "entertainment", label: "🎬 Entertainment", color: "text-pink-400" },
];

export default function KnowledgeStep() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext();
  const [urls, setUrls] = useState<string[]>([""]);
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([]);

  const addUrlField = () => setUrls([...urls, ""]);
  const removeUrlField = (idx: number) => {
    const newUrls = urls.filter((_, i) => i !== idx);
    setUrls(newUrls);
  };

  const handleKnowledgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setKnowledgeFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        {/* <div className="text-6xl mb-4">🐯📚✨</div> */}
         {/* <Image src="/images/cubs/prediction.png" width={20} height={20} alt="bd"/> */}
        <h3 className="text-2xl font-bold mb-2">Feed your swarm some brain food</h3>
      </motion.div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">📁 Upload Knowledge Files</label>
        <label className="block w-full border-2 border-dashed border-[#2A2F5E] rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors">
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleKnowledgeUpload}
            className="hidden"
          />
          <div className="text-4xl mb-2">📖</div>
          <p className="text-sm text-gray-400">
            {knowledgeFiles.length > 0 
              ? `${knowledgeFiles.length} file(s) uploaded` 
              : "Upload PDFs, docs, or training materials"}
          </p>
        </label>
        {knowledgeFiles.length > 0 && (
          <div className="mt-2 space-y-1">
            {knowledgeFiles.map((file, idx) => (
              <div key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                <span>✓</span>
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Website URLs */}
      <div>
        <label className="block text-sm font-medium mb-2">🌐 Website URLs</label>
        <p className="text-xs text-gray-400 mb-3">Add websites for your ZEE to learn from</p>
        <div className="space-y-2">
          {urls.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  const newUrls = [...urls];
                  newUrls[idx] = e.target.value;
                  setUrls(newUrls);
                }}
                placeholder="https://example.com"
                className="flex-1 bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none transition-colors"
              />
              {urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrlField(idx)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addUrlField}
          className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          + Add another URL
        </button>
      </div>

      {/* News Filters */}
      <div>
        <label className="block text-sm font-medium mb-3">📰 News Categories</label>
        <p className="text-xs text-gray-400 mb-3">Select topics your ZEE should track</p>
        <Controller
          name="newsFilters"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {NEWS_CATEGORIES.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    field.value?.includes(cat.id)
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={field.value?.includes(cat.id)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...(field.value || []), cat.id]
                        : (field.value || []).filter((v: string) => v !== cat.id);
                      field.onChange(newValue);
                    }}
                    className="hidden"
                  />
                  <span className={`text-lg ${cat.color}`}>{cat.label}</span>
                </label>
              ))}
            </div>
          )}
        />
      </div>
    </div>
  );
}