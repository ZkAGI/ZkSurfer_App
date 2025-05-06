// // components/FileUploadSection.tsx
// import React, { ChangeEvent } from 'react';

// export interface FileUploadSectionProps {
//     trainingPdfs: File[];
//     trainingImages: File[];
//     urls: string[];
//     maxSizeMB: number;
//     totalSizeMB: number;
//     onPdfUpload: (file: File) => void;
//     onImageUpload: (file: File) => void;
//     onRemovePdf: (idx: number) => void;
//     onRemoveImage: (idx: number) => void;
//     onAddUrl: () => void;
//     onChangeUrl: (idx: number, val: string) => void;
//     onRemoveUrl: (idx: number) => void;
// }

// export default function FileUploadSection({
//     trainingPdfs,
//     trainingImages,
//     urls,
//     maxSizeMB,
//     totalSizeMB,
//     onPdfUpload,
//     onImageUpload,
//     onRemovePdf,
//     onRemoveImage,
//     onAddUrl,
//     onChangeUrl,
//     onRemoveUrl,
// }: FileUploadSectionProps) {
//     return (
//         <div className="border-2 border-[#B9B9B9] rounded-lg bg-[#343B4F] p-4 space-y-4">
//             <h3 className="text-xl text-[#7E7CCF]">TRAIN YOUR AGENT</h3>
//             <p className="text-xs text-[#B9B9B9]">
//                 Total upload: {totalSizeMB.toFixed(2)} MB / {maxSizeMB} MB
//             </p>

//             <div className="flex space-x-2">
//                 <input
//                     type="file"
//                     accept=".pdf"
//                     id="pdf-upload"
//                     className="hidden"
//                     onChange={(e: ChangeEvent<HTMLInputElement>) => {
//                         if (e.target.files?.[0]) onPdfUpload(e.target.files[0]);
//                         e.target.value = '';
//                     }}
//                 />
//                 <label
//                     htmlFor="pdf-upload"
//                     className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded cursor-pointer"
//                 >
//                     + PDF
//                 </label>

//                 <input
//                     type="file"
//                     accept="image/*"
//                     id="image-upload"
//                     className="hidden"
//                     onChange={(e: ChangeEvent<HTMLInputElement>) => {
//                         if (e.target.files?.[0]) onImageUpload(e.target.files[0]);
//                         e.target.value = '';
//                     }}
//                 />
//                 <label
//                     htmlFor="image-upload"
//                     className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded cursor-pointer"
//                 >
//                     + IMAGE
//                 </label>

//                 <button
//                     type="button"
//                     onClick={onAddUrl}
//                     className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
//                 >
//                     + URL
//                 </button>
//             </div>

//             <div>
//                 {trainingPdfs.map((file, i) => (
//                     <div key={i} className="flex items-center text-sm">
//                         📄 {file.name}
//                         <button
//                             onClick={() => onRemovePdf(i)}
//                             className="ml-2 text-red-500 hover:text-red-700"
//                         >
//                             ✕
//                         </button>
//                     </div>
//                 ))}
//                 {trainingImages.map((file, i) => (
//                     <div key={i} className="flex items-center text-sm">
//                         🖼 {file.name}
//                         <button
//                             onClick={() => onRemoveImage(i)}
//                             className="ml-2 text-red-500 hover:text-red-700"
//                         >
//                             ✕
//                         </button>
//                     </div>
//                 ))}
//                 {urls.map((url, i) => (
//                     <div key={i} className="flex items-center text-sm mt-1">
//                         🔗
//                         <input
//                             type="text"
//                             value={url}
//                             onChange={e => onChangeUrl(i, e.target.value)}
//                             className="ml-2 flex-1 bg-gray-800 p-1 rounded"
//                             placeholder="https://…"
//                         />
//                         <button
//                             onClick={() => onRemoveUrl(i)}
//                             className="ml-2 text-red-500 hover:text-red-700"
//                         >
//                             ✕
//                         </button>
//                     </div>
//                 ))}
//             </div>

//             <div className="w-full bg-gray-700 h-2 rounded overflow-hidden">
//                 <div
//                     className="bg-blue-500 h-full"
//                     style={{ width: Math.min((totalSizeMB / maxSizeMB) * 100, 100) + '%' }}
//                 />
//             </div>
//         </div>
//     );
// }

// components/TrainingDataForm.tsx
'use client';

import React, { useState } from 'react';
import { CloudUpload, ImageIcon, Link2 } from 'lucide-react';

type FileUploadSectionProps = {
    title: string;
    accept: string;
    icon: React.ReactNode;
    height?: string;
    onFile: (file: File) => void;
};

function FileUploadSection({
    title,
    accept,
    icon,
    onFile,
    height = 'h-48',
}: FileUploadSectionProps) {
    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <label
                htmlFor={`${title}-input`}
                className={`
          relative flex flex-col items-center justify-center
          w-full ${height}
          border-2 border-dashed border-gray-300
          rounded-lg cursor-pointer
          hover:border-gray-400 transition
        `}
            >
                {icon}
                <span className="mt-2 text-gray-500">
                    Drag &amp; drop here, or click to select
                </span>
                <input
                    id={`${title}-input`}
                    type="file"
                    accept={accept}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) onFile(file);
                        e.target.value = '';
                    }}
                />
            </label>
        </div>
    );
}

type LinkSectionProps = {
    onAddUrl: (url: string) => void;
};

function LinkSection({ onAddUrl }: LinkSectionProps) {
    const [tempUrl, setTempUrl] = useState('');
    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">Add URL</h2>
            <div className="flex space-x-2">
                <button
                    onClick={() => {
                        const url = prompt('Enter website URL');
                        if (url) onAddUrl(url);
                    }}
                    className="
            flex-1 flex items-center justify-center py-2 px-4 rounded-lg
            border border-gray-300 hover:bg-gray-100 transition
          "
                >
                    <Link2 className="mr-2 w-5 h-5" /> Website
                </button>
                <button
                    onClick={() => {
                        const url = prompt('Enter YouTube URL');
                        if (url) onAddUrl(url);
                    }}
                    className="
            flex-1 flex items-center justify-center py-2 px-4 rounded-lg
            border border-gray-300 hover:bg-gray-100 transition
          "
                >
                    <Link2 className="mr-2 w-5 h-5" /> YouTube
                </button>
            </div>
        </div>
    );
}

export default function TrainingDataForm() {
    const [pdfs, setPdfs] = useState<File[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [urls, setUrls] = useState<string[]>([]);

    const handlePdf = (file: File) => {
        setPdfs(prev => [...prev, file]);
    };
    const handleImage = (file: File) => {
        setImages(prev => [...prev, file]);
    };
    const handleAddUrl = (url: string) => {
        setUrls(prev => [...prev, url]);
    };

    const handleRemovePdf = (idx: number) =>
        setPdfs(prev => prev.filter((_, i) => i !== idx));
    const handleRemoveImage = (idx: number) =>
        setImages(prev => prev.filter((_, i) => i !== idx));
    const handleRemoveUrl = (idx: number) =>
        setUrls(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 👇 send off to your API or parent component:
        console.log({ pdfs, images, urls });
        alert('Check console for form data!');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-4 max-w-2xl mx-auto">
            {/* PDF */}
            <FileUploadSection
                title="Add PDF"
                accept=".pdf"
                icon={<CloudUpload className="w-8 h-8 text-gray-400" />}
                onFile={handlePdf}
            />
            {pdfs.length > 0 && (
                <ul className="list-disc list-inside text-sm">
                    {pdfs.map((f, i) => (
                        <li key={i} className="flex justify-between items-center">
                            {f.name}
                            <button
                                type="button"
                                onClick={() => handleRemovePdf(i)}
                                className="text-red-500 hover:underline ml-2"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* IMAGE */}
            <FileUploadSection
                title="Add Image"
                accept="image/*"
                icon={<ImageIcon className="w-8 h-8 text-gray-400" />}
                onFile={handleImage}
                height="h-40"
            />
            {images.length > 0 && (
                <ul className="list-disc list-inside text-sm">
                    {images.map((f, i) => (
                        <li key={i} className="flex justify-between items-center">
                            {f.name}
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(i)}
                                className="text-red-500 hover:underline ml-2"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* URL */}
            <LinkSection onAddUrl={handleAddUrl} />
            {urls.length > 0 && (
                <ul className="list-disc list-inside text-sm">
                    {urls.map((u, i) => (
                        <li key={i} className="flex justify-between items-center">
                            <a href={u} target="_blank" rel="noopener noreferrer" className="underline">
                                {u}
                            </a>
                            <button
                                type="button"
                                onClick={() => handleRemoveUrl(i)}
                                className="text-red-500 hover:underline ml-2"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <button
                type="submit"
                className="
          w-full py-3 bg-blue-600 text-white font-semibold rounded-lg
          hover:bg-blue-700 transition
        "
            >
                Submit Training Data
            </button>
        </form>
    );
}
