import React from 'react';
import CollapsibleCitations from './CollapsableCitations';

interface Citation {
    citation_id: number;
    chunk_id: string;
    text: string;
    metadata?: {
        filename?: string;
        asset_id?: string;
    };
}

interface MedicalAnswerProps {
    answer: string;
    citations?: Citation[];
}

const MedicalAnswer: React.FC<MedicalAnswerProps> = ({ answer, citations }) => {
    return (
        <div className="w-full">
            <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {answer}
            </div>

            {citations && citations.length > 0 && (
                <CollapsibleCitations citations={citations} />
            )}
        </div>
    );
};

export default MedicalAnswer;