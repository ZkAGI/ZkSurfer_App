import React from 'react';

export default function JsonPreviewModal({
  open,
  onClose,
  json,
  title = 'Proof JSON',
}: {
  open: boolean;
  onClose: () => void;
  json: unknown;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#171D3D] rounded-lg border border-gray-700 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-white font-semibold">{title}</h3>
          <button className="text-gray-300 hover:text-white" onClick={onClose}>✕</button>
        </div>
        <pre className="p-4 text-xs text-gray-200 overflow-auto max-h-[70vh]">
{JSON.stringify(json, null, 2)}
        </pre>
      </div>
    </div>
  );
}
