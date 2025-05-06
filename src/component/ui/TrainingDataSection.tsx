// // components/TrainingDataSection.tsx
// import React from 'react';
// import { CloudUpload, ImageIcon, Link2 } from 'lucide-react';

// type Props = {
//   trainingPdfs: File[];
//   trainingImages: File[];
//   urls: string[];
//   maxSizeMB: number;
//   totalSizeMB: number;
//   onPdfUpload: (file: File) => void;
//   onImageUpload: (file: File) => void;
//   onRemovePdf: (idx: number) => void;
//   onRemoveImage: (idx: number) => void;
//   onAddUrl: () => void;
//   onChangeUrl: (idx: number, newUrl: string) => void;
//   onRemoveUrl: (idx: number) => void;
// };

// export function TrainingDataSection({
//   trainingPdfs,
//   trainingImages,
//   urls,
//   maxSizeMB,
//   totalSizeMB,
//   onPdfUpload,
//   onImageUpload,
//   onRemovePdf,
//   onRemoveImage,
//   onAddUrl,
//   onChangeUrl,
//   onRemoveUrl,
// }: Props) {
//   return (
//     <div className="space-y-6 p-4 border rounded-lg bg-[#09090B]">
//       {/* Heading */}
//       <h2 className="text-2xl font-semibold">Upload Training Data</h2>

//       {/* Size Meter */}
//       <div className="text-sm">
//         Total size:{' '}
//         <span className={totalSizeMB > maxSizeMB ? 'text-red-500' : ''}>
//           {totalSizeMB.toFixed(2)} MB
//         </span>{' '}
//         / {maxSizeMB} MB
//       </div>

//       {/* PDF Section */}
//       <div className="space-y-2">
//         <h3 className="text-xl font-medium">Add PDF</h3>
//         <label
//           className="
//             flex flex-col items-center justify-center
//             h-40 border-2 border-dashed rounded-lg cursor-pointer
//             hover:border-gray-400 transition
//           "
//         >
//           <CloudUpload className="w-8 h-8 text-gray-400" />
//           <span className="mt-2 text-gray-500">
//             Drag &amp; drop or click to upload
//           </span>
//           <input
//             type="file"
//             accept=".pdf"
//             className="absolute inset-0 w-full h-full opacity-0"
//             onChange={e => {
//               const f = e.target.files?.[0];
//               if (f) onPdfUpload(f);
//               e.target.value = '';
//             }}
//           />
//         </label>
//         {trainingPdfs.length > 0 && (
//           <ul className="list-disc list-inside text-sm">
//             {trainingPdfs.map((f, i) => (
//               <li key={i} className="flex justify-between">
//                 {f.name}{' '}
//                 <button
//                   type="button"
//                   onClick={() => onRemovePdf(i)}
//                   className="text-red-500 hover:underline"
//                 >
//                   Remove
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* Image Section */}
//       <div className="space-y-2">
//         <h3 className="text-xl font-medium">Add Image</h3>
//         <label
//           className="
//             flex flex-col items-center justify-center
//             h-32 border-2 border-dashed rounded-lg cursor-pointer
//             hover:border-gray-400 transition
//           "
//         >
//           <ImageIcon className="w-8 h-8 text-gray-400" />
//           <span className="mt-2 text-gray-500">
//             Drag &amp; drop or click to upload
//           </span>
//           <input
//             type="file"
//             accept="image/*"
//             className="absolute inset-0 w-full h-full opacity-0"
//             onChange={e => {
//               const f = e.target.files?.[0];
//               if (f) onImageUpload(f);
//               e.target.value = '';
//             }}
//           />
//         </label>
//         {trainingImages.length > 0 && (
//           <ul className="list-disc list-inside text-sm">
//             {trainingImages.map((f, i) => (
//               <li key={i} className="flex justify-between">
//                 {f.name}{' '}
//                 <button
//                   type="button"
//                   onClick={() => onRemoveImage(i)}
//                   className="text-red-500 hover:underline"
//                 >
//                   Remove
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* URL Section */}
//       <div className="space-y-2">
//         <h3 className="text-xl font-medium">Add URL</h3>
//         <div className="flex space-x-2">
//           <button
//             type="button"
//             onClick={onAddUrl}
//             className="
//               flex-1 flex items-center justify-center py-2 px-4 rounded-lg
//               border border-gray-300 hover:bg-gray-100 transition
//             "
//           >
//             <Link2 className="mr-2 w-5 h-5" /> New URL
//           </button>
//         </div>
//         {urls.map((u, idx) => (
//           <div key={idx} className="flex items-center space-x-2">
//             <input
//               type="text"
//               value={u}
//               onChange={e => onChangeUrl(idx, e.target.value)}
//               className="flex-1 p-2 border rounded"
//               placeholder="https://..."
//             />
//             <button
//               type="button"
//               onClick={() => onRemoveUrl(idx)}
//               className="text-red-500 hover:underline"
//             >
//               Remove
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


// components/TrainingDataSection.tsx
import React from 'react';
import { CloudUpload, ImageIcon, Link2, X as XIcon } from 'lucide-react';

type Props = {
  trainingPdfs: File[];
  trainingImages: File[];
  urls: string[];
  maxSizeMB: number;
  totalSizeMB: number;
  onPdfUpload: (file: File) => void;
  onImageUpload: (file: File) => void;
  onRemovePdf: (idx: number) => void;
  onRemoveImage: (idx: number) => void;
  onAddUrl: () => void;
  onChangeUrl: (idx: number, newUrl: string) => void;
  onRemoveUrl: (idx: number) => void;
};

export function TrainingDataSection({
  trainingPdfs,
  trainingImages,
  urls,
  maxSizeMB,
  totalSizeMB,
  onPdfUpload,
  onImageUpload,
  onRemovePdf,
  onRemoveImage,
  onAddUrl,
  onChangeUrl,
  onRemoveUrl,
}: Props) {
  return (
    <div className="space-y-6 p-4 border rounded-lg bg-[#343B4F]">
      {/* Heading */}
      <h2  className="text-[#7E7CCF] font-ttfirs text-xl">UPLOAD TRAINING DATA</h2>

      {/* Size Meter */}
      <div className="text-sm text-gray-200">
        Total size:{' '}
        <span className={totalSizeMB > maxSizeMB ? 'text-red-500' : ''}>
          {totalSizeMB.toFixed(2)} MB
        </span>{' '}
        / {maxSizeMB} MB
      </div>

      {/* PDF Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-ttfirs text-white">Add PDF</h3>
        <label
          className="
            relative flex flex-col items-center justify-center
            h-40 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer
            hover:border-gray-500 transition
          "
        >
          <CloudUpload className="w-8 h-8 text-gray-400" />
          <span className="mt-2 text-gray-400">
            Drag &amp; drop or click to upload
          </span>
          <input
            type="file"
            accept=".pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) onPdfUpload(f);
              e.currentTarget.value = '';
            }}
          />
        </label>
        {trainingPdfs.length > 0 && (
          <ul className="list-disc list-inside text-sm text-gray-200">
            {trainingPdfs.map((f, i) => (
              <li key={i} className="flex justify-between">
                <span>{f.name}</span>
                <button
                  type="button"
                  onClick={() => onRemovePdf(i)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Image Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-ttfirs text-white">Add Image</h3>
        <label
          className="
            relative flex flex-col items-center justify-center
            h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer
            hover:border-gray-500 transition
          "
        >
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <span className="mt-2 text-gray-400">
            Drag &amp; drop or click to upload
          </span>
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) onImageUpload(f);
              e.currentTarget.value = '';
            }}
          />
        </label>
        {trainingImages.length > 0 && (
          <ul className="list-disc list-inside text-sm text-gray-200">
            {trainingImages.map((f, i) => (
              <li key={i} className="flex justify-between">
                <span>{f.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveImage(i)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* URL Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-ttfirs text-white">Add URL</h3>

        {/* Buttons row */}
        <div className="flex space-x-2">
          {/* X button */}
          <button
            type="button"
            onClick={onAddUrl}
            className="
              flex-1 flex items-center justify-center
              py-2 px-4 rounded-lg border border-gray-600
              hover:bg-gray-700 transition
            "
          >
            <XIcon className="mr-2 w-5 h-5 text-white" />
            (Formerly Twitter)
          </button>

          {/* Disabled Website */}
          <button
            type="button"
            disabled
            className="
              flex-1 flex items-center justify-center
              py-2 px-4 rounded-lg border border-gray-600
              bg-gray-800 text-gray-500 cursor-not-allowed
            "
          >
            <Link2 className="mr-2 w-5 h-5 text-gray-500" />
            Website
          </button>
        </div>

        {/* Dynamic URL inputs */}
        {urls.map((u, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <input
              type="text"
              value={u}
              onChange={e => onChangeUrl(idx, e.target.value)}
              className="flex-1 p-2 border border-gray-600 rounded bg-gray-900 text-white"
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={() => onRemoveUrl(idx)}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
