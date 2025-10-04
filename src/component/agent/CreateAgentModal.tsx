// // components/agent/CreateAgentModal.tsx
// 'use client';
// import dynamic from 'next/dynamic';
// import { useAgentCart } from '@/stores/agent-cart-store';

// const MultiStepAgentForm = dynamic(() => import('./MultiStepAgentForm'), { ssr: false });

// export default function CreateAgentModal() {
//   const { isFormOpen, setFormOpen, clear } = useAgentCart();

//   if (!isFormOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
//       <div className="w-full max-w-4xl bg-[#171D3D] rounded-2xl border border-[#2A2F5E] p-4">
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="text-lg font-semibold">Create Agent</h3>
//           <button onClick={() => setFormOpen(false)} className="opacity-70 hover:opacity-100">Close</button>
//         </div>

//         <MultiStepAgentForm
//           onClose={() => setFormOpen(false)}
//           onSuccess={() => {
//             clear();
//             setFormOpen(false);
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// components/agent/CreateAgentModal.tsx
'use client';
import dynamic from 'next/dynamic';
import { useAgentCart } from '@/stores/agent-cart-store';

const MultiStepAgentForm = dynamic(() => import('./MultiStepAgentForm'), { ssr: false });

export default function CreateAgentModal() {
  // ✅ use the correct store field name
  const { formOpen, setFormOpen, clear } = useAgentCart();

  if (!formOpen) return null;

  return (
    // ✅ higher z-index than other modals (they use z-50)
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
      onClick={() => setFormOpen(false)} // optional: close on backdrop
    >
      <div
        className="w-full max-w-4xl bg-[#171D3D] rounded-2xl border border-[#2A2F5E] p-4"
        onClick={(e) => e.stopPropagation()}  // ✅ don't close when clicking inside
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Create Agent</h3>
          <button onClick={() => setFormOpen(false)} className="opacity-70 hover:opacity-100">
            Close
          </button>
        </div>

        <MultiStepAgentForm
          onClose={() => setFormOpen(false)}
          onSuccess={() => {
            clear();
            setFormOpen(false);
          }}
        />
      </div>
    </div>
  );
}
