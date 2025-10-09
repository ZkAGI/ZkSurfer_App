// "use client";
// import { useFormContext } from "react-hook-form";
// import { motion } from "framer-motion";
// import { useState, useEffect } from "react";
// import { useAgentFormStore } from "@/stores/agent-form-store";

// export default function ContactStep() {
//   const { register, formState: { errors }, watch, setValue } = useFormContext();
//   const { data, setData } = useAgentFormStore();
//   const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);

//   // Watch form values and sync to Zustand
//   const watchedEmail = watch("email");
//   const watchedTelegram = watch("telegram");
//   const watchedWebsite = watch("website");

//   useEffect(() => {
//     if (watchedEmail !== undefined) setData({ email: watchedEmail });
//   }, [watchedEmail, setData]);

//   useEffect(() => {
//     if (watchedTelegram !== undefined) setData({ telegram: watchedTelegram });
//   }, [watchedTelegram, setData]);

//   useEffect(() => {
//     if (watchedWebsite !== undefined) setData({ website: watchedWebsite });
//   }, [watchedWebsite, setData]);

//   // Initialize form values from Zustand on mount
//   useEffect(() => {
//     if (data.email) setValue("email", data.email);
//     if (data.telegram) setValue("telegram", data.telegram);
//     if (data.website) setValue("website", data.website);
//   }, []);

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) setUploadedDocs(Array.from(e.target.files));
//   };

//   return (
//     <div className="space-y-6">
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
//         <h3 className="text-2xl font-bold mb-2">How can your swarm reach you?</h3>
//       </motion.div>

//       <div>
//         <label className="block text-sm font-medium mb-2">📧 Official Email</label>
//         <input
//           type="email"
//           {...register("email")}
//           placeholder="your@email.com"
//           className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors"
//         />
//         {errors.email && <p className="text-red-400 text-sm mt-1">{String(errors.email.message)}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-2">📱 Telegram Handle</label>
//         <input
//           type="text"
//           {...register("telegram")}
//           placeholder="@yourusername"
//           className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors"
//         />
//         {errors.telegram && <p className="text-red-400 text-sm mt-1">{String(errors.telegram.message)}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-2">🌐 Website (Optional)</label>
//         <input
//           type="url"
//           {...register("website")}
//           placeholder="https://yoursite.com"
//           className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors"
//         />
//         {errors.website && <p className="text-red-400 text-sm mt-1">{String(errors.website.message)}</p>}
//       </div>

//       {/* Optional local-only docs preview */}
//       <div>
//         <label className="block text-sm font-medium mb-2">📄 Upload Documents (Optional)</label>
//         <p className="text-xs text-gray-400 mb-2">Pitch decks, whitepapers, or other relevant docs (PDF)</p>
//         <label className="block w-full border-2 border-dashed border-[#2A2F5E] rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors">
//           <input type="file" multiple accept=".pdf" onChange={handleFileUpload} className="hidden" />
//           <div className="text-4xl mb-2">📎</div>
//           <p className="text-sm text-gray-400">
//             {uploadedDocs.length > 0 ? `${uploadedDocs.length} file(s) selected` : "Click to upload PDFs"}
//           </p>
//         </label>
//         {uploadedDocs.length > 0 && (
//           <div className="mt-2 space-y-1">
//             {uploadedDocs.map((f, i) => (
//               <div key={i} className="text-sm text-gray-400 flex items-center gap-2">
//                 <span>✓</span><span>{f.name}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <p className="text-xs text-gray-500 italic">* At least one contact method (Email or Telegram) is required</p>
//     </div>
//   );
// }

"use client";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAgentFormStore } from "@/stores/agent-form-store";

export default function ContactStep() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const { data, setData } = useAgentFormStore();
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);

  // Watch form values and sync to Zustand
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedTelegram = watch("telegram");
  const watchedWebsite = watch("website");

  useEffect(() => {
    if (watchedName !== undefined) setData({ name: watchedName });
  }, [watchedName, setData]);

  useEffect(() => {
    if (watchedEmail !== undefined) setData({ email: watchedEmail });
  }, [watchedEmail, setData]);

  useEffect(() => {
    if (watchedTelegram !== undefined) setData({ telegram: watchedTelegram });
  }, [watchedTelegram, setData]);

  useEffect(() => {
    if (watchedWebsite !== undefined) setData({ website: watchedWebsite });
  }, [watchedWebsite, setData]);

  // Initialize form values from Zustand on mount
  useEffect(() => {
    if (data.name) setValue("name", data.name);
    if (data.email) setValue("email", data.email);
    if (data.telegram) setValue("telegram", data.telegram);
    if (data.website) setValue("website", data.website);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadedDocs(Array.from(e.target.files));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl font-bold mb-2">How can your swarm reach you?</h3>
      </motion.div>

      {/* Required Swarm Name */}
      <div>
        <label className="block text-sm font-medium mb-2">🧠 Swarm Name <span className="text-red-400">*</span></label>
        <input
          type="text"
          {...register("name", {
            required: "Swarm name is required",
            minLength: { value: 2, message: "Name must be at least 2 characters" },
            maxLength: { value: 64, message: "Name must be 64 characters or fewer" },
            setValueAs: (v: string) => (typeof v === "string" ? v.trim() : v),
          })}
          placeholder="e.g., ZEE Alpha Research"
          className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{String(errors.name.message)}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">This is the public display name of your swarm. It’s required.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">📧 Official Email <span className="text-red-400">*</span></label>
        <input
          type="email"
          {...register("email")}
          placeholder="your@email.com"
          className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{String(errors.email.message)}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">📱 Telegram Handle  <span className="text-red-400">*</span></label>
        <input
          type="text"
          {...register("telegram")}
          placeholder="@yourusername"
          className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors"
        />
        {errors.telegram && (
          <p className="text-red-400 text-sm mt-1">{String(errors.telegram.message)}</p>
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
          <p className="text-red-400 text-sm mt-1">{String(errors.website.message)}</p>
        )}
      </div>

      {/* Optional local-only docs preview */}
      {/* <div>
        <label className="block text-sm font-medium mb-2">📄 Upload Documents (Optional)</label>
        <p className="text-xs text-gray-400 mb-2">
          Pitch decks, whitepapers, or other relevant docs (PDF)
        </p>
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
            {uploadedDocs.map((f, i) => (
              <div key={i} className="text-sm text-gray-400 flex items-center gap-2">
                <span>✓</span>
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        )}
      </div> */}

      {/* <p className="text-xs text-gray-500 italic">
        * At least one contact method (Email or Telegram) is required
      </p> */}
    </div>
  );
}
