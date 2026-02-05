import React, { useState } from 'react';

interface Citation {
    citation_id: number;
    chunk_id: string;
    text: string;
    metadata?: {
        filename?: string;
        asset_id?: string;
    };
}

interface CollapsibleCitationsProps {
    citations: Citation[];
}

const CollapsibleCitations: React.FC<CollapsibleCitationsProps> = ({ citations }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!citations || citations.length === 0) return null;

    return (
        <div className="mt-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>📎 {citations.length} Citation{citations.length > 1 ? 's' : ''}</span>
            </button>

            {isOpen && (
                <div className="mt-2 space-y-2 pl-2 border-l-2 border-purple-500/30">
                    {citations.map((citation) => (
                        <div
                            key={citation.citation_id}
                            className="bg-[#171D3D] rounded-lg p-3 text-sm"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                                    {citation.citation_id}
                                </span>
                                {citation.metadata?.filename && (
                                    <span className="text-gray-500 text-xs">
                                        📄 {citation.metadata.filename}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">
                                &quot;{citation.text.length > 200
                                    ? citation.text.slice(0, 200) + '...'
                                    : citation.text}&quot;
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CollapsibleCitations;