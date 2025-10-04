// // components/agent/steps/VoiceStep.tsx
// "use client";
// import { useFormContext, Controller } from "react-hook-form";
// import { motion } from "framer-motion";
// import { useState } from "react";

// const PRESET_VOICES = [
//   { id: "male-professional", label: "Male Professional", description: "Clear and authoritative" },
//   { id: "female-professional", label: "Female Professional", description: "Warm and confident" },
//   { id: "male-friendly", label: "Male Friendly", description: "Casual and approachable" },
//   { id: "female-friendly", label: "Female Friendly", description: "Energetic and welcoming" },
//   { id: "neutral-tech", label: "Neutral Tech", description: "Modern AI voice" },
//   { id: "neutral-smooth", label: "Neutral Smooth", description: "Calm and soothing" },
// ];

// export default function VoiceStep() {
//   const { control, watch, setValue, formState: { errors } } = useFormContext();
//   const [uploadedVoice, setUploadedVoice] = useState<File | null>(null);
  
//   const voiceType = watch("voiceType");

//   const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setUploadedVoice(file);
//       setValue("voiceSample", file);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-center mb-8"
//       >
//         {/* <div className="text-6xl mb-4">🐯🎤🌊</div> */}
//         <h3 className="text-2xl font-bold mb-2">What does your ZEE sound like?</h3>
//         {/* <p className="text-gray-400">Cub with microphone, glowing sound waves ripple</p> */}
//       </motion.div>

//       {/* Type Selection */}
//       <Controller
//         name="voiceType"
//         control={control}
//         defaultValue="preset"
//         render={({ field }) => (
//           <div className="grid grid-cols-2 gap-4">
//             <button
//               type="button"
//               onClick={() => field.onChange("preset")}
//               className={`p-4 rounded-lg border-2 transition-all ${
//                 field.value === "preset"
//                   ? "border-purple-500 bg-purple-500/10"
//                   : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
//               }`}
//             >
//               <div className="text-3xl mb-2">🎤</div>
//               <div className="font-semibold">Select Preset Voice</div>
//             </button>
//             <button
//               type="button"
//               onClick={() => field.onChange("upload")}
//               className={`p-4 rounded-lg border-2 transition-all ${
//                 field.value === "upload"
//                   ? "border-purple-500 bg-purple-500/10"
//                   : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
//               }`}
//             >
//               <div className="text-3xl mb-2">🗣️</div>
//               <div className="font-semibold">Upload Sample</div>
//             </button>
//           </div>
//         )}
//       />

//       {/* Preset Voices */}
//       {voiceType === "preset" && (
//         <motion.div
//           initial={{ opacity: 0, height: 0 }}
//           animate={{ opacity: 1, height: "auto" }}
//           exit={{ opacity: 0, height: 0 }}
//           className="space-y-3"
//         >
//           <Controller
//             name="presetVoice"
//             control={control}
//             render={({ field }) => (
//               <>
//                 {PRESET_VOICES.map((voice) => (
//                   <button
//                     key={voice.id}
//                     type="button"
//                     onClick={() => field.onChange(voice.id)}
//                     className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
//                       field.value === voice.id
//                         ? "border-purple-500 bg-purple-500/10"
//                         : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <div className="font-semibold mb-1">{voice.label}</div>
//                         <div className="text-sm text-gray-400">{voice.description}</div>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           // Play sample
//                         }}
//                         className="px-3 py-1 bg-purple-500/20 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
//                       >
//                         ▶️ Preview
//                       </button>
//                     </div>
//                   </button>
//                 ))}
//               </>
//             )}
//           />
//         </motion.div>
//       )}

//       {/* Upload Voice */}
//       {voiceType === "upload" && (
//         <motion.div
//           initial={{ opacity: 0, height: 0 }}
//           animate={{ opacity: 1, height: "auto" }}
//           exit={{ opacity: 0, height: 0 }}
//         >
//           <label className="block w-full border-2 border-dashed border-[#2A2F5E] rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
//             <input
//               type="file"
//               accept="audio/*"
//               onChange={handleVoiceUpload}
//               className="hidden"
//             />
//             {uploadedVoice ? (
//               <div className="space-y-3">
//                 <div className="text-4xl">✓</div>
//                 <p className="text-sm text-green-400">Voice sample uploaded</p>
//                 <p className="text-xs text-gray-400">{uploadedVoice.name}</p>
//                 <p className="text-xs text-gray-500">Click to change</p>
//               </div>
//             ) : (
//               <>
//                 <div className="text-4xl mb-2">🎵</div>
//                 <p className="text-sm text-gray-400">Upload a voice sample (15-30 seconds)</p>
//                 <p className="text-xs text-gray-500 mt-1">(MP3, WAV, or M4A)</p>
//               </>
//             )}
//           </label>
          
//           {!uploadedVoice && (
//             <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
//               <h4 className="font-semibold mb-2 text-yellow-300">📌 Voice Sample Tips:</h4>
//               <ul className="text-sm text-gray-300 space-y-1">
//                 <li>• Record in a quiet environment</li>
//                 <li>• Speak naturally and clearly</li>
//                 <li>• Include varied intonation</li>
//                 <li>• Minimum 15 seconds, maximum 30 seconds</li>
//               </ul>
//             </div>
//           )}
//         </motion.div>
//       )}
//     </div>
//   );
// }

"use client";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAgentFormStore } from "@/stores/agent-form-store";

const PRESET_VOICES = [
  { id: "male-professional", label: "Male Professional", description: "Clear and authoritative" },
  { id: "female-professional", label: "Female Professional", description: "Warm and confident" },
  { id: "male-friendly", label: "Male Friendly", description: "Casual and approachable" },
  { id: "female-friendly", label: "Female Friendly", description: "Energetic and welcoming" },
  { id: "neutral-tech", label: "Neutral Tech", description: "Modern AI voice" },
  { id: "neutral-smooth", label: "Neutral Smooth", description: "Calm and soothing" },
];

export default function VoiceStep() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const { data } = useAgentFormStore();

  // Register the fields properly
  register("voiceType");
  register("presetVoice");
  register("voiceSample");

  const voiceType = watch("voiceType");
  const presetVoice = watch("presetVoice");
  const voiceSample = watch("voiceSample");

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Initialize from Zustand on mount
  useEffect(() => {
    if (data.voiceType) setValue("voiceType", data.voiceType);
    if (data.presetVoice) setValue("presetVoice", data.presetVoice);
    if (data.voiceSample) {
      setValue("voiceSample", data.voiceSample);
      setUploadedFileName(data.voiceSample.name);
    }
  }, []);

  const selectPreset = () => {
    setValue("voiceType", "preset", { shouldDirty: true, shouldValidate: true });
    // Clear upload fields
    setValue("voiceSample", null, { shouldDirty: true, shouldValidate: true });
    setUploadedFileName(null);
  };

  const selectUpload = () => {
    setValue("voiceType", "upload", { shouldDirty: true, shouldValidate: true });
    // Clear preset fields
    setValue("presetVoice", "", { shouldDirty: true, shouldValidate: true });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFileName(file.name);
    setValue("voiceSample", file, { shouldDirty: true, shouldValidate: true });
  };

  const clearSelection = () => {
    setValue("voiceType", "", { shouldDirty: true, shouldValidate: true });
    setValue("presetVoice", "", { shouldDirty: true, shouldValidate: true });
    setValue("voiceSample", null, { shouldDirty: true, shouldValidate: true });
    setUploadedFileName(null);
  };

  // If nothing selected yet, default to showing both options
  const showOptions = !voiceType;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">What does your ZEE sound like?</h3>
        <p className="text-sm text-gray-400">Choose a voice for your AI agent (Optional)</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={selectPreset}
          className={`p-4 rounded-lg border-2 transition-all ${
            voiceType === "preset"
              ? "border-purple-500 bg-purple-500/10"
              : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
          }`}
        >
          <div className="text-3xl mb-2">🎤</div>
          <div className="font-semibold">Select Preset Voice</div>
        </button>
        <button
          type="button"
          onClick={selectUpload}
          className={`p-4 rounded-lg border-2 transition-all ${
            voiceType === "upload"
              ? "border-purple-500 bg-purple-500/10"
              : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
          }`}
        >
          <div className="text-3xl mb-2">🗣️</div>
          <div className="font-semibold">Upload Voice Sample</div>
        </button>
      </div>

      {voiceType === "preset" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-400">Select a preset voice:</p>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Clear selection
            </button>
          </div>
          {PRESET_VOICES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setValue("presetVoice", v.id, { shouldDirty: true, shouldValidate: true })}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                presetVoice === v.id
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold mb-1">{v.label}</div>
                  <div className="text-sm text-gray-400">{v.description}</div>
                </div>
                {presetVoice === v.id && <span className="text-purple-400">✓</span>}
              </div>
            </button>
          ))}
        </motion.div>
      )}

      {voiceType === "upload" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">Upload your voice sample:</p>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Clear selection
            </button>
          </div>
          <label className="block w-full border-2 border-dashed border-[#2A2F5E] rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
            <input 
              type="file" 
              accept="audio/*,.mp3,.wav,.m4a,.ogg" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            {!uploadedFileName ? (
              <>
                <div className="text-4xl mb-2">🎵</div>
                <p className="text-sm text-gray-400">Click to upload a voice sample</p>
                <p className="text-xs text-gray-400 mt-2">MP3, WAV, M4A, OGG (15-30 seconds recommended)</p>
              </>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl text-green-400">✓</div>
                <p className="text-sm text-green-400">Voice sample selected</p>
                <p className="text-xs text-gray-400">{uploadedFileName}</p>
                <p className="text-xs text-gray-500 mt-2">Click to change file</p>
              </div>
            )}
          </label>
          {errors.voiceSample && (
            <p className="mt-2 text-sm text-red-400">{String(errors.voiceSample.message || "Please upload a voice sample")}</p>
          )}
        </motion.div>
      )}

      {showOptions && (
        <div className="mt-6 p-4 bg-[#1A1F3A] rounded-lg">
          <p className="text-xs text-gray-400 text-center">
            💡 <strong>Tip:</strong> Voice selection is optional. You can skip this step if you don't need voice functionality for your agent.
          </p>
        </div>
      )}

      {voiceType && !showOptions && (
        <div className="mt-6 p-3 bg-[#1A1F3A] rounded-lg">
          <p className="text-xs text-gray-400">
            {voiceType === "preset" && !presetVoice && "Please select a preset voice from the options above"}
            {voiceType === "preset" && presetVoice && `Selected: ${PRESET_VOICES.find(v => v.id === presetVoice)?.label}`}
            {voiceType === "upload" && !uploadedFileName && "Please upload a voice sample file"}
            {voiceType === "upload" && uploadedFileName && `File ready: ${uploadedFileName}`}
          </p>
        </div>
      )}
    </div>
  );
}