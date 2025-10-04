// components/agent/steps/BasicsStep.tsx
import { useFormContext } from 'react-hook-form';

export default function BasicsStep() {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-3">
      <label className="block">
        <span>Name</span>
        <input {...register('name')} className="mt-1 w-full bg-gray-800 rounded p-2" />
        {errors.name && <p className="text-red-400 text-sm">{String(errors.name.message)}</p>}
      </label>

      <label className="block">
        <span>Ticker</span>
        <input {...register('ticker')} className="mt-1 w-full bg-gray-800 rounded p-2 uppercase" />
        {errors.ticker && <p className="text-red-400 text-sm">{String(errors.ticker.message)}</p>}
      </label>

      <label className="block">
        <span>Short Description</span>
        <textarea {...register('shortDescription')} rows={3} className="mt-1 w-full bg-gray-800 rounded p-2" />
        {errors.shortDescription && <p className="text-red-400 text-sm">{String(errors.shortDescription.message)}</p>}
      </label>

      <label className="block">
        <span>Category</span>
        <select {...register('category')} className="mt-1 w-full bg-gray-800 rounded p-2">
          <option value="">Select…</option>
          <option value="meme">Meme</option>
          <option value="research">Research</option>
          <option value="defi">DeFi</option>
          <option value="nft">NFT</option>
          <option value="social">Social</option>
          <option value="other">Other</option>
        </select>
        {errors.category && <p className="text-red-400 text-sm">{String(errors.category.message)}</p>}
      </label>
    </div>
  );
}
