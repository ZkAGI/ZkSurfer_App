// "use client";
// import { useFormContext } from "react-hook-form";
// import { useState, KeyboardEvent } from "react";
// import { useAgentFormStore } from "@/stores/agent-form-store";

// export default function PersonaStep() {
//   const { register, setValue, getValues, formState: { errors } } = useFormContext();
//   const { data, setData } = useAgentFormStore();
//   const [traitInput, setTraitInput] = useState("");

//   const addTrait = () => {
//     const cleaned = traitInput.trim();
//     if (!cleaned) return;
//     const next = Array.from(new Set([...(getValues("coreTraits") || []), cleaned])).slice(0, 5);
//     setValue("coreTraits", next, { shouldValidate: true, shouldDirty: true });
//   setData({ coreTraits: next });
//     setTraitInput("");
//   };

//   const removeTrait = (i: number) => {
//     const next = (getValues("coreTraits") || []).filter((_: string, idx: number) => idx !== i);
//     setValue("coreTraits", next, { shouldValidate: true, shouldDirty: true });
//   setData({ coreTraits: next });
//   };

//   const onTraitsKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault();
//       addTrait();
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <label className="block">
//         <span>Voice Tone</span>
//         <select
//           {...register("voiceTone")}
//           className="mt-1 w-full bg-gray-800 rounded p-2"
//           defaultValue={data.voiceTone || ""}
//           onChange={(e) => {
//           setData({ voiceTone: e.target.value as any });
//           }}
//         >
//           <option value="">Select…</option>
//           <option value="playful">Playful</option>
//           <option value="serious">Serious</option>
//           <option value="degenerate">Degenerate</option>
//           <option value="wholesome">Wholesome</option>
//           <option value="analyst">Analyst</option>
//         </select>
//         {errors.voiceTone && <p className="text-red-400 text-sm">{String(errors.voiceTone.message)}</p>}
//       </label>

//       <label className="block">
//         <span>Bio</span>
//         <textarea
//           {...register("bio")}
//           rows={6}
//           className="mt-1 w-full bg-gray-800 rounded p-2"
//           defaultValue={data.bio}
//           onChange={(e) => set({ bio: e.target.value })}
//         />
//         {errors.bio && <p className="text-red-400 text-sm">{String(errors.bio.message)}</p>}
//       </label>

//       <div className="block">
//         <span>Core Traits (max 5)</span>
//         <div className="mt-1 flex gap-2">
//           <input
//             value={traitInput}
//             onChange={(e) => setTraitInput(e.target.value)}
//             onKeyDown={onTraitsKeyDown}
//             placeholder="Type a trait and press Enter"
//             className="flex-1 bg-gray-800 rounded p-2"
//           />
//           <button type="button" onClick={addTrait} className="px-3 py-2 bg-gray-700 rounded">
//             Add
//           </button>
//         </div>
//         <div className="mt-2 flex flex-wrap gap-2">
//           {(getValues("coreTraits") || []).map((t: string, i: number) => (
//             <span key={`${t}-${i}`} className="px-2 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2">
//               {t}
//               <button type="button" onClick={() => removeTrait(i)} className="text-gray-300 hover:text-white">✕</button>
//             </span>
//           ))}
//         </div>
//         {errors.coreTraits && <p className="text-red-400 text-sm mt-1">{String(errors.coreTraits.message)}</p>}
//       </div>

//       <label className="block">
//         <span>System Prompt</span>
//         <textarea
//           {...register("systemPrompt")}
//           rows={6}
//           className="mt-1 w-full bg-gray-800 rounded p-2"
//           defaultValue={data.systemPrompt}
//           onChange={(e) => set({ systemPrompt: e.target.value })}
//         />
//         {errors.systemPrompt && <p className="text-red-400 text-sm">{String(errors.systemPrompt.message)}</p>}
//       </label>
//     </div>
//   );
// }

"use client";
import { useFormContext } from "react-hook-form";
import { useState, KeyboardEvent } from "react";
import { useAgentFormStore } from "@/stores/agent-form-store";

export default function PersonaStep() {
  const { register, setValue, getValues, formState: { errors } } = useFormContext();
  const data = useAgentFormStore(s => s.data);
  const setData = useAgentFormStore(s => s.setData);
  const [traitInput, setTraitInput] = useState("");

  const addTrait = () => {
    const cleaned = traitInput.trim();
    if (!cleaned) return;
    const next = Array.from(new Set([...(getValues("coreTraits") || []), cleaned])).slice(0, 5);
    setValue("coreTraits", next, { shouldValidate: true, shouldDirty: true });
    setData({ coreTraits: next });
    setTraitInput("");
  };

  const removeTrait = (i: number) => {
    const next = (getValues("coreTraits") || []).filter((_: string, idx: number) => idx !== i);
    setValue("coreTraits", next, { shouldValidate: true, shouldDirty: true });
    setData({ coreTraits: next });
  };

  const onTraitsKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTrait();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span>Voice Tone</span>
        <select
          {...register("voiceTone", {
            onChange: (e) => setData({ voiceTone: e.target.value as any }),
          })}
          className="mt-1 w-full bg-gray-800 rounded p-2"
          defaultValue={data.voiceTone || ""}
        >
          <option value="">Select…</option>
          <option value="playful">Playful</option>
          <option value="serious">Serious</option>
          <option value="degenerate">Degenerate</option>
          <option value="wholesome">Wholesome</option>
          <option value="analyst">Analyst</option>
        </select>
        {errors.voiceTone && <p className="text-red-400 text-sm">{String(errors.voiceTone.message)}</p>}
      </label>

      <label className="block">
        <span>Bio</span>
        <textarea
          {...register("bio", {
            onChange: (e) => setData({ bio: e.target.value }),
          })}
          rows={6}
          className="mt-1 w-full bg-gray-800 rounded p-2"
          defaultValue={data.bio}
        />
        {errors.bio && <p className="text-red-400 text-sm">{String(errors.bio.message)}</p>}
      </label>

      <div className="block">
        <span>Core Traits (max 5)</span>
        <div className="mt-1 flex gap-2">
          <input
            value={traitInput}
            onChange={(e) => setTraitInput(e.target.value)}
            onKeyDown={onTraitsKeyDown}
            placeholder="Type a trait and press Enter"
            className="flex-1 bg-gray-800 rounded p-2"
          />
          <button type="button" onClick={addTrait} className="px-3 py-2 bg-gray-700 rounded">
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(getValues("coreTraits") || []).map((t: string, i: number) => (
            <span key={`${t}-${i}`} className="px-2 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2">
              {t}
              <button type="button" onClick={() => removeTrait(i)} className="text-gray-300 hover:text-white">✕</button>
            </span>
          ))}
        </div>
        {errors.coreTraits && <p className="text-red-400 text-sm mt-1">{String(errors.coreTraits.message)}</p>}
      </div>

      <label className="block">
        <span>System Prompt</span>
        <textarea
          {...register("systemPrompt", {
            onChange: (e) => setData({ systemPrompt: e.target.value }),
          })}
          rows={6}
          className="mt-1 w-full bg-gray-800 rounded p-2"
          defaultValue={data.systemPrompt}
        />
        {errors.systemPrompt && <p className="text-red-400 text-sm">{String(errors.systemPrompt.message)}</p>}
      </label>
    </div>
  );
}
