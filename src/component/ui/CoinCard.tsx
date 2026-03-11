'use client';
import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Coin } from '@/types/marketplaceTypes';
import { toast } from 'sonner';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface CoinCardProps {
    coin: Coin;
    onClick?: () => void;
}

const Description: FC<{ text: string }> = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (descriptionRef.current) {
            const element = descriptionRef.current;
            setIsOverflowing(element.scrollHeight > element.offsetHeight);
        }
    }, [text]);

    return (
        <div className="text-sm text-dsMuted leading-relaxed">
            <p
                ref={descriptionRef}
                className={`transition-all ${!isExpanded ? 'line-clamp-2' : ''}`}
            >
                {text}
            </p>
            {isOverflowing && (
                <button
                    className="text-dsPurple-light text-xs font-medium mt-1 hover:text-dsPurple transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                >
                    {isExpanded ? 'Show less' : 'Read more'}
                </button>
            )}
        </div>
    );
};

export const CoinCard: FC<CoinCardProps> = ({ coin }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };

        card.addEventListener('mousemove', handleMouseMove);
        return () => card.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleClick = () => {
        if (coin.address) {
            window.open(`https://pump.fun/coin/${coin.address}`, '_blank');
        } else {
            toast.error('This agent has not been launched yet!', {
                duration: 3000,
            });
        }
    };

    return (
        <div
            ref={cardRef}
            onClick={handleClick}
            className={`ds-card group cursor-pointer ${
                !coin.address ? 'opacity-80' : ''
            }`}
        >
            <div className="flex items-start gap-4">
                {/* Agent Image */}
                <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden
                                bg-gradient-to-br from-dsPurple/20 to-dsPurple-dark/20 border border-dsBorder">
                    <Image
                        src={coin.image || '/api/placeholder/64/64'}
                        alt={coin.name}
                        className="object-cover"
                        width={64}
                        height={64}
                    />
                    {!coin.address && (
                        <div className="absolute inset-0 bg-dsBg/60 flex items-center justify-center">
                            <AlertCircle size={20} className="text-amber-400" />
                        </div>
                    )}
                </div>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-base font-semibold text-white truncate
                                       group-hover:text-dsPurple-light transition-colors">
                            {coin.name}
                        </h3>
                        {coin.address ? (
                            <ExternalLink size={14} className="text-dsMuted flex-shrink-0
                                           group-hover:text-dsPurple-light transition-colors" />
                        ) : (
                            <span className="ds-badge text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/30 flex-shrink-0">
                                Pending
                            </span>
                        )}
                    </div>

                    {coin.symbol && (
                        <span className="ds-badge-number text-xs mb-2 block">
                            ${coin.symbol}
                        </span>
                    )}

                    <Description text={coin.description} />
                </div>
            </div>

            {/* Bottom Action Hint */}
            <div className={`mt-4 pt-3 border-t border-dsBorder/50 flex items-center justify-between
                            opacity-0 group-hover:opacity-100 transition-opacity`}>
                <span className="text-xs text-dsMuted">
                    {coin.address ? 'View on Pump.fun' : 'Not yet deployed'}
                </span>
                {coin.address && (
                    <div className="w-6 h-6 rounded-md bg-dsPurple/15 flex items-center justify-center">
                        <ExternalLink size={12} className="text-dsPurple-light" />
                    </div>
                )}
            </div>
        </div>
    );
};
