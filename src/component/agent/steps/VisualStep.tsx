// // components/agent/steps/VisualStep.tsx
// "use client";
// import { useFormContext, Controller } from "react-hook-form";
// import { motion } from "framer-motion";
// import { useState } from "react";
// import Image from "next/image";

// const PRESET_AVATARS = [
//   { id: "tiger1", label: "Professional Tiger", url: "/images/avatars/tiger1.png" },
//   { id: "tiger2", label: "Friendly Tiger", url: "/images/avatars/tiger2.png" },
//   { id: "tiger3", label: "Tech Tiger", url: "/images/avatars/tiger3.png" },
//   { id: "robot1", label: "Modern AI", url: "/images/avatars/robot1.png" },
//   { id: "robot2", label: "Futuristic Bot", url: "/images/avatars/robot2.png" },
//   { id: "abstract1", label: "Abstract Geometric", url: "/images/avatars/abstract1.png" },
// ];

// export default function VisualStep() {
//   const { control, watch, setValue, formState: { errors } } = useFormContext();
//   const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
//   const spokespersonType = watch("spokespersonType");

//   const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setUploadedPhoto(file);
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);
//       setValue("uploadedPhoto", file);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-center mb-8"
//       >
//         {/* <div className="text-6xl mb-4">🐯🎨✨</div> */}
//         <h3 className="text-2xl font-bold mb-2">Who&apos;s the face of your enterprise?</h3>
//         {/* <p className="text-gray-400">Cub painting on glowing easel, image appears above</p> */}
//       </motion.div>

//       {/* Type Selection */}
//       <Controller
//         name="spokespersonType"
//         control={control}
//         defaultValue="preset"
//         render={({ field }) => (
//           <div className="grid grid-cols-2 gap-4">
//             <button
//               type="button"
//               onClick={() => field.onChange("upload")}
//               className={`p-4 rounded-lg border-2 transition-all ${
//                 field.value === "upload"
//                   ? "border-purple-500 bg-purple-500/10"
//                   : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
//               }`}
//             >
//               <div className="text-3xl mb-2">📷</div>
//               <div className="font-semibold">Upload Photo</div>
//             </button>
//             <button
//               type="button"
//               onClick={() => field.onChange("preset")}
//               className={`p-4 rounded-lg border-2 transition-all ${
//                 field.value === "preset"
//                   ? "border-purple-500 bg-purple-500/10"
//                   : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
//               }`}
//             >
//               <div className="text-3xl mb-2">🤖</div>
//               <div className="font-semibold">Choose Preset</div>
//             </button>
//           </div>
//         )}
//       />

//       {/* Upload Section */}
//       {spokespersonType === "upload" && (
//         <motion.div
//           initial={{ opacity: 0, height: 0 }}
//           animate={{ opacity: 1, height: "auto" }}
//           exit={{ opacity: 0, height: 0 }}
//         >
//           <label className="block w-full border-2 border-dashed border-[#2A2F5E] rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handlePhotoUpload}
//               className="hidden"
//             />
//             {previewUrl ? (
//               <div className="space-y-3">
//                 <Image
//                   src={previewUrl}
//                   alt="Preview"
//                   width={200}
//                   height={200}
//                   className="mx-auto rounded-lg"
//                 />
//                 <p className="text-sm text-green-400">✓ Photo uploaded</p>
//                 <p className="text-xs text-gray-400">Click to change</p>
//               </div>
//             ) : (
//               <>
//                 <div className="text-4xl mb-2">📸</div>
//                 <p className="text-sm text-gray-400">Click to upload your spokesperson photo</p>
//                 <p className="text-xs text-gray-500 mt-1">(PNG, JPG, or WebP)</p>
//               </>
//             )}
//           </label>
//         </motion.div>
//       )}

//       {/* Preset Selection */}
//       {spokespersonType === "preset" && (
//         <motion.div
//           initial={{ opacity: 0, height: 0 }}
//           animate={{ opacity: 1, height: "auto" }}
//           exit={{ opacity: 0, height: 0 }}
//         >
//           <Controller
//             name="presetAvatar"
//             control={control}
//             render={({ field }) => (
//               <div className="grid grid-cols-3 gap-4">
//                 {PRESET_AVATARS.map((avatar) => (
//                   <button
//                     key={avatar.id}
//                     type="button"
//                     onClick={() => field.onChange(avatar.id)}
//                     className={`p-4 rounded-lg border-2 transition-all ${
//                       field.value === avatar.id
//                         ? "border-purple-500 bg-purple-500/10"
//                         : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
//                     }`}
//                   >
//                     <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg mb-2 flex items-center justify-center text-4xl">
//                       {avatar.id.includes("tiger") ? "🐯" : avatar.id.includes("robot") ? "🤖" : "✨"}
//                     </div>
//                     <p className="text-xs font-medium">{avatar.label}</p>
//                   </button>
//                 ))}
//               </div>
//             )}
//           />
//         </motion.div>
//       )}

//       <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
//         <p className="text-sm text-gray-300">
//           💡 This will be your ZEE&apos;s avatar across all platforms and interactions
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { useState } from "react";

const PRESET_AVATARS = [
  { id: "professional-male", label: "Professional Male", emoji: "👨‍💼" },
  { id: "professional-female", label: "Professional Female", emoji: "👩‍💼" },
  { id: "tech-expert", label: "Tech Expert", emoji: "👨‍💻" },
  { id: "creative", label: "Creative", emoji: "🎨" },
  { id: "friendly-bot", label: "Friendly Bot", emoji: "🤖" },
  { id: "abstract", label: "Abstract", emoji: "✨" },
];

export default function VisualStep() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  // Register fields
  register("spokespersonType");
  register("presetAvatar");
  register("spokespersonUpload");

  const spokespersonType = watch("spokespersonType");
  const presetAvatar = watch("presetAvatar");
  const spokespersonUpload = watch("spokespersonUpload");

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const selectPreset = () => {
    setValue("spokespersonType", "preset", { shouldDirty: true, shouldValidate: true });
    // Clear upload fields
    setValue("spokespersonUpload", null, { shouldDirty: true, shouldValidate: true });
    setUploadedFileName(null);
  };

  const selectUpload = () => {
    setValue("spokespersonType", "upload", { shouldDirty: true, shouldValidate: true });
    // Clear preset fields
    setValue("presetAvatar", "", { shouldDirty: true, shouldValidate: true });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFileName(file.name);
    setValue("spokespersonUpload", file, { shouldDirty: true, shouldValidate: true });
  };

  // If nothing selected yet, default to showing both options
  const showOptions = !spokespersonType;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">What does your ZEE look like?</h3>
        <p className="text-sm text-gray-400">Choose a visual representation for your AI agent (Optional)</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={selectPreset}
          className={`p-4 rounded-lg border-2 transition-all ${
            spokespersonType === "preset"
              ? "border-purple-500 bg-purple-500/10"
              : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
          }`}
        >
          <div className="text-3xl mb-2">👤</div>
          <div className="font-semibold">Select Preset Avatar</div>
        </button>
        <button
          type="button"
          onClick={selectUpload}
          className={`p-4 rounded-lg border-2 transition-all ${
            spokespersonType === "upload"
              ? "border-purple-500 bg-purple-500/10"
              : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
          }`}
        >
          <div className="text-3xl mb-2">📸</div>
          <div className="font-semibold">Upload Custom Image</div>
        </button>
      </div>

      {spokespersonType === "preset" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
          {PRESET_AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => setValue("presetAvatar", avatar.id, { shouldDirty: true, shouldValidate: true })}
              className={`p-4 rounded-lg border-2 transition-all ${
                presetAvatar === avatar.id
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-[#2A2F5E] bg-[#1A1F3A] hover:border-purple-500/50"
              }`}
            >
              <div className="text-4xl mb-2">{avatar.emoji}</div>
              <div className="text-sm font-medium">{avatar.label}</div>
              {presetAvatar === avatar.id && (
                <div className="mt-2 text-purple-400">✓</div>
              )}
            </button>
          ))}
        </motion.div>
      )}

      {spokespersonType === "upload" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <label className="block w-full border-2 border-dashed border-[#2A2F5E] rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            {!uploadedFileName ? (
              <>
                <div className="text-4xl mb-2">📤</div>
                <p className="text-sm text-gray-400">Upload a spokesperson image</p>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG, GIF (Max 5MB)</p>
              </>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">✓</div>
                <p className="text-sm text-green-400">Image selected</p>
                <p className="text-xs text-gray-400">{uploadedFileName}</p>
                <p className="text-xs text-gray-500 mt-2">Click to change image</p>
              </div>
            )}
          </label>
          {errors.spokespersonUpload && (
            <p className="mt-2 text-sm text-red-400">{String(errors.spokespersonUpload.message || "Image required")}</p>
          )}
        </motion.div>
      )}

      {showOptions && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Visual selection is optional. You can skip this step if you don&apost need a visual avatar.
        </p>
      )}
    </div>
  );
}