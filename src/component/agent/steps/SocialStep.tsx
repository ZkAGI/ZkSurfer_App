// "use client";
// import { useFormContext } from "react-hook-form";
// import { useAgentFormStore } from "@/stores/agent-form-store";

// export default function SocialsStep() {
//   const { register, setValue, formState: { errors } } = useFormContext();
//   const { data, setData } = useAgentFormStore();

//   return (
//     <div className="space-y-4">
//       <label className="block">
//         <span>Twitter URL</span>
//         <input
//           {...register("twitter")}
//           className="mt-1 w-full bg-gray-800 rounded p-2"
//           placeholder="https://twitter.com/yourhandle"
//           defaultValue={data.twitter}
//           onChange={(e) => setData({ twitter: e.target.value })}
//         />
//         {errors.twitter && <p className="text-red-400 text-sm">{String(errors.twitter.message)}</p>}
//       </label>

//       <label className="block">
//         <span>Website</span>
//         <input
//           {...register("website")}
//           className="mt-1 w-full bg-gray-800 rounded p-2"
//           placeholder="https://example.com"
//           defaultValue={data.website}
//           onChange={(e) => setData({ website: e.target.value })}
//         />
//         {errors.website && <p className="text-red-400 text-sm">{String(errors.website.message)}</p>}
//       </label>

//       <label className="block">
//         <span>Discord URL</span>
//         <input
//           {...register("discord")}
//           className="mt-1 w-full bg-gray-800 rounded p-2"
//           placeholder="https://discord.gg/..."
//           defaultValue={data.discord}
//           onChange={(e) => setData({ discord: e.target.value })}
//         />
//         {errors.discord && <p className="text-red-400 text-sm">{String(errors.discord.message)}</p>}
//       </label>

//       <label className="block">
//         <span>Launch Type</span>
//         <select
//           {...register("launchType")}
//           className="mt-1 w-full bg-gray-800 rounded p-2"
//           defaultValue={data.launchType || ""}
//           onChange={(e) => setData({ launchType: e.target.value as any })}
//         >
//           <option value="">Select…</option>
//           <option value="create-only">Create agent only</option>
//           <option value="create-then-coin">Create agent then memecoin later</option>
//         </select>
//         {errors.launchType && <p className="text-red-400 text-sm">{String(errors.launchType.message)}</p>}
//       </label>

//       <label className="flex items-center gap-2">
//         <input
//           type="checkbox"
//           {...register("agreeToTerms")}
//           defaultChecked={data.agreeToTerms}
//           onChange={(e) => setData({ agreeToTerms: e.target.checked })}
//           className="h-4 w-4"
//         />
//         <span>I agree to the Terms</span>
//       </label>
//       {errors.agreeToTerms && <p className="text-red-400 text-sm">{String(errors.agreeToTerms.message)}</p>}
//     </div>
//   );
// }


"use client";
import { useFormContext } from "react-hook-form";
import { useAgentFormStore } from "@/stores/agent-form-store";

export default function SocialsStep() {
  const { register, formState: { errors } } = useFormContext();
  const data = useAgentFormStore(s => s.data);
  const setData = useAgentFormStore(s => s.setData);

  return (
    <div className="space-y-4">
      <label className="block">
        <span>Twitter URL</span>
        <input
          {...register("twitter", { onChange: (e) => setData({ twitter: e.target.value }) })}
          className="mt-1 w-full bg-gray-800 rounded p-2"
          placeholder="https://twitter.com/yourhandle"
          defaultValue={data.twitter}
        />
        {errors.twitter && <p className="text-red-400 text-sm">{String(errors.twitter.message)}</p>}
      </label>

      <label className="block">
        <span>Website</span>
        <input
          {...register("website", { onChange: (e) => setData({ website: e.target.value }) })}
          className="mt-1 w-full bg-gray-800 rounded p-2"
          placeholder="https://example.com"
          defaultValue={data.website}
        />
        {errors.website && <p className="text-red-400 text-sm">{String(errors.website.message)}</p>}
      </label>

      <label className="block">
        <span>Discord URL</span>
        <input
          {...register("discord", { onChange: (e) => setData({ discord: e.target.value }) })}
          className="mt-1 w-full bg-gray-800 rounded p-2"
          placeholder="https://discord.gg/..."
          defaultValue={data.discord}
        />
        {errors.discord && <p className="text-red-400 text-sm">{String(errors.discord.message)}</p>}
      </label>

      <label className="block">
        <span>Launch Type</span>
        <select
          {...register("launchType", { onChange: (e) => setData({ launchType: e.target.value as any }) })}
          className="mt-1 w-full bg-gray-800 rounded p-2"
          defaultValue={data.launchType || ""}
        >
          <option value="">Select…</option>
          <option value="create-only">Create agent only</option>
          <option value="create-then-coin">Create agent then memecoin later</option>
        </select>
        {errors.launchType && <p className="text-red-400 text-sm">{String(errors.launchType.message)}</p>}
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("agreeToTerms", { onChange: (e) => setData({ agreeToTerms: e.target.checked }) })}
          defaultChecked={data.agreeToTerms}
          className="h-4 w-4"
        />
        <span>I agree to the Terms</span>
      </label>
      {errors.agreeToTerms && <p className="text-red-400 text-sm">{String(errors.agreeToTerms.message)}</p>}
    </div>
  );
}
