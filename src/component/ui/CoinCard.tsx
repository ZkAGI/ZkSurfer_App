// 'use client';
// import { FC, useEffect, useRef, useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import Image from 'next/image';
// import { Coin } from '@/types/marketplaceTypes';

// interface CoinCardProps {
//     coin: Coin;
// }

// const Description: FC<{ text: string }> = ({ text }) => {
//     const [isExpanded, setIsExpanded] = useState(false);
//     const [isOverflowing, setIsOverflowing] = useState(false);
//     const descriptionRef = useRef<HTMLParagraphElement>(null);

//     useEffect(() => {
//         // Check if the text overflows 3 lines
//         if (descriptionRef.current) {
//             const element = descriptionRef.current;
//             setIsOverflowing(element.scrollHeight > element.offsetHeight);
//         }
//     }, [text]);

//     return (
//         <div className="text-xs text-white font-abeezee">
//             <p
//                 ref={descriptionRef}
//                 className={`transition-all ${!isExpanded ? 'line-clamp-3' : ''
//                     }`}
//             >
//                 {text}
//             </p>
//             {isOverflowing && (
//                 <button
//                     className="text-[#7E83A9] font-bold mt-1"
//                     onClick={(e) => {
//                         e.stopPropagation(); // Prevent click event propagation to the card
//                         setIsExpanded(!isExpanded);
//                     }}
//                 >
//                     {isExpanded ? 'Read Less...' : 'Read More...'}
//                 </button>
//             )}
//         </div>
//     );
// };

// export const CoinCard: FC<CoinCardProps> = ({ coin }) => (
//     <Card
//         className="w-full cursor-pointer transition-colors relative overflow-hidden rounded-xl border-[#7E83A9]"
//         onClick={() => {
//             window.open(`https://pump.fun/coin/${coin.address}`, '_blank');
//         }}
//     >
//         <div className="absolute inset-0 bg-gradient-to-bl from-[#643ADE] via-[#070121] to-[#283081] hover:bg-[#3DF9FF]/20 opacity-95" />
//         <div className="absolute inset-0 backdrop-blur-sm" />
//         <CardContent className="relative z-10 p-4">
//             <div className="flex items-center gap-4">
//                 {/* Image */}
//                 <div className="relative w-16 h-16 flex-shrink-0">
//                     <Image
//                         src={coin.image || "/api/placeholder/40/40"}
//                         alt={coin.name}
//                         className="rounded-md object-cover"
//                         width={64}
//                         height={64}
//                     />
//                 </div>

//                 <div className="flex-1">
//                     <h3
//                         className="text-lg font-ttfirs bg-gradient-to-r from-[#A4C8FF] via-[#A992ED] to-[#643ADE] text-transparent bg-clip-text"
//                     >
//                         {coin.name}
//                     </h3>

//                     <Description text={coin.description} />
//                 </div>
//             </div>
//         </CardContent>
//     </Card>

// );

'use client';
import { FC, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Coin } from '@/types/marketplaceTypes';
import { toast } from 'sonner'; // Import Sonner's toast

interface CoinCardProps {
    coin: Coin;
    onClick?: () => void;
}

const Description: FC<{ text: string }> = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        // Check if the text overflows 3 lines
        if (descriptionRef.current) {
            const element = descriptionRef.current;
            setIsOverflowing(element.scrollHeight > element.offsetHeight);
        }
    }, [text]);

    return (
        <div className="text-xs text-white font-abeezee">
            <p
                ref={descriptionRef}
                className={`transition-all ${!isExpanded ? 'line-clamp-3' : ''
                    }`}
            >
                {text}
            </p>
            {isOverflowing && (
                <button
                    className="text-[#7E83A9] font-bold mt-1 italic"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent click event propagation to the card
                        setIsExpanded(!isExpanded);
                    }}
                >
                    {isExpanded ? 'Read Less...' : 'Read More...'}
                </button>
            )}
        </div>
    );
};

export const CoinCard: FC<CoinCardProps> = ({ coin }) => (
    <Card
        className={`text-left w-full cursor-pointer transition-colors relative overflow-hidden rounded-xl border-[#7E83A9] ${!coin.address ? 'cursor-not-allowed' : ''
            }`}
        onClick={() => {
            if (coin.address) {
                // Redirect to the coin URL
                window.open(`https://pump.fun/coin/${coin.address}`, '_blank');
            } else {
                // Show toast if the address is null
                toast.error('This coin has not been launched on pump.fun yet!', {
                    duration: 3000,
                });
            }
        }}
    >
        <div className="absolute inset-0 bg-gradient-to-bl from-[#643ADE] via-[#070121] to-[#283081] hover:bg-[#3DF9FF]/20 opacity-95" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        <CardContent className="relative z-10 p-4">
            <div className="flex items-center gap-4">
                {/* Image */}
                <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                        src={coin.image || '/api/placeholder/40/40'}
                        alt={coin.name}
                        className="rounded-md object-cover"
                        width={64}
                        height={64}
                    />
                </div>

                <div className="flex-1">
                    <h3
                        className="text-lg font-ttfirs bg-gradient-to-r from-[#A4C8FF] via-[#A992ED] to-[#643ADE] text-transparent bg-clip-text"
                    >
                        {coin.name}
                    </h3>

                    <Description text={coin.description} />
                </div>
            </div>
        </CardContent>
    </Card>
);
