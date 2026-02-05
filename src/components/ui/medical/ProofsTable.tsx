import React from 'react';

interface ProofItem {
    proof_id: string;
    proof_name: string;
    filename: string;
    kb_id: string;
    created_at: string;
    has_proof: boolean;
    visibility: string;
}

interface ProofsTableProps {
    proofs: ProofItem[];
    onSelect: (index: number) => void;
}

const ProofsTable: React.FC<ProofsTableProps> = ({ proofs, onSelect }) => {
    return (
        <div className="w-full">
            <p className="text-white font-semibold text-lg mb-3">📋 Available Proofs</p>

            <div className="rounded-xl overflow-hidden border border-gray-700/50">
                {/* Header */}
                <div className="grid grid-cols-[40px_1fr_1fr_120px_80px_80px] gap-2 px-4 py-3 bg-[#1a1f3d] text-gray-400 text-xs font-medium uppercase tracking-wider">
                    <span>#</span>
                    <span>Proof Name</span>
                    <span>File</span>
                    <span>KB ID</span>
                    <span>Created</span>
                    <span>Status</span>
                </div>

                {/* Rows */}
                {proofs.map((proof, index) => {
                    const date = new Date(proof.created_at).toLocaleDateString();
                    const kbShort = proof.kb_id.slice(0, 8) + '...';
                    // Shorten proof name: show first 16 chars + last 8
                    const shortName = proof.proof_name.length > 28
                        ? proof.proof_name.slice(0, 16) + '...' + proof.proof_name.slice(-8)
                        : proof.proof_name;

                    return (
                        <button
                            key={proof.proof_id}
                            onClick={() => onSelect(index + 1)}
                            className="grid grid-cols-[40px_1fr_1fr_120px_80px_80px] gap-2 px-4 py-3 items-center text-sm
                                       border-t border-gray-700/30
                                       hover:bg-purple-500/10 transition-colors cursor-pointer text-left w-full"
                        >
                            <span className="text-purple-400 font-bold">{index + 1}</span>
                            <span className="text-gray-200 truncate" title={proof.proof_name}>
                                {shortName}
                            </span>
                            <span className="text-gray-400 truncate" title={proof.filename}>
                                📄 {proof.filename}
                            </span>
                            <span className="text-gray-500 font-mono text-xs">{kbShort}</span>
                            <span className="text-gray-500 text-xs">{date}</span>
                            <span>
                                {proof.has_proof ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                                        ✅ Ready
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-400">
                                        ⏳ Pending
                                    </span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>

            <p className="text-gray-400 text-sm mt-3">
                🔢 Click a row or type the number to select a proof.
            </p>
        </div>
    );
};

export default ProofsTable;