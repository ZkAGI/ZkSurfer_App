// components/agent/steps/JurisdictionStep.tsx
"use client";
import { useFormContext } from "react-hook-form";
import Image from 'next/image';

export default function JurisdictionStep() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        {/* <Image src="/images/cubs/notary.png" width={20} height={20} alt="notary"/> */}
        <h3 className="text-2xl font-bold mb-2">Where&apos;s your home base? 🌍</h3>
      </div>



      <div>
        <label className="block text-sm font-medium mb-2">I am a...</label>
        <select
          {...register("jurisdictionType")}
          className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none"
        >
          <option value="">Select...</option>
          <option value="business">Business (Registered Entity)</option>
          <option value="individual">Individual</option>
        </select>
        {errors.jurisdictionType && (
          <p className="text-red-400 text-sm mt-1">{errors.jurisdictionType.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Country</label>
        <select
          {...register("country")}
          className="w-full bg-[#1A1F3A] border border-[#2A2F5E] rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none"
        >
          <option value="">Select country...</option>
          <option value="US">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="SG">Singapore</option>
          <option value="AE">UAE</option>
          <option value="EU">European Union</option>
          <option value="SW">Switzerland</option>
         <option value="BVI"> British Virgin Islands</option>
          {/* Add more countries */}
        </select>
        {errors.country && (
          <p className="text-red-400 text-sm mt-1">{errors.country.message as string}</p>
        )}
      </div>
    </div>
  );
}