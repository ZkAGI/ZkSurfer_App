// 'use client';

// import { FC, useState, useCallback, useEffect } from 'react';
// import { Search, ArrowLeft } from 'lucide-react';
// import { Card } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { CoinCard } from '@/component/ui/CoinCard';
// import { CoinDetail } from '@/component/ui/CoinDetails';
// import { Coin, ApiCoin, ApiResponse } from '@/types/marketplaceTypes';
// import { useWallet } from '@solana/wallet-adapter-react';

// const tags: string[] = ['DeFi', 'Gaming', 'NFT', 'Metaverse', 'Web3'];

// const MarketplacePage: FC = () => {
//     const wallet = useWallet();
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
//     const [selectedTags, setSelectedTags] = useState<string[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [allCoins, setAllCoins] = useState<Coin[]>([]);
//     const [memeCoins, setMemeCoins] = useState<Coin[]>([]);

//     // Convert API coin format to UI coin format
//     const convertApiCoinToUiCoin = (apiCoin: ApiCoin): Coin => ({
//         id: apiCoin._id,
//         name: apiCoin.coin_name,
//         symbol: apiCoin.ticker,
//         description: apiCoin.description,
//         // image: apiCoin.image_base64,
//         image: apiCoin.image_base64.startsWith('data:image/png;base64,')
//             ? apiCoin.image_base64
//             : `data:image/png;base64,${apiCoin.image_base64}`,
//         address: apiCoin.memecoin_address,
//         marketCap: undefined
//     });

//     useEffect(() => {
//         const fetchCoins = async () => {
//             if (!wallet.publicKey) {
//                 setError('Please connect your wallet.');
//                 setIsLoading(false);
//                 return;
//             }
//             try {
//                 const response = await fetch('https://zynapse.zkagi.ai/api/coins', {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'api-key': 'zk-123321'
//                     }
//                 });

//                 if (!response.ok) {
//                     throw new Error(`API call failed: ${response.statusText}`);
//                 }

//                 const data: ApiResponse = await response.json();

//                 if (data.success) {
//                     // Convert all coins to UI format
//                     const convertedCoins = data.data.map(convertApiCoinToUiCoin);
//                     console.log('wallet.publicKey?.toString()', wallet.publicKey?.toString())

//                     // Filter memecoins (coins with valid memecoin_address)
//                     // const validMemecoins = convertedCoins.filter(coin =>
//                     //     coin.address &&
//                     //     coin.address !== "0x1234567890abcdef" &&
//                     //     wallet.publicKey?.toString() === coin.address
//                     // );
//                     const validMemecoins = convertedCoins.filter(coin => {
//                         console.log('Checking coin:', coin); // Log each coin
//                         return (
//                             coin.address &&
//                             coin.address !== "0x1234567890abcdef" &&
//                             wallet.publicKey?.toString() === coin.address
//                         );
//                     });


//                     setAllCoins(convertedCoins);
//                     setMemeCoins(validMemecoins);
//                 } else {
//                     throw new Error('API returned unsuccessful response');
//                 }
//             } catch (err) {
//                 console.error('Error fetching coins:', err);
//                 setError(err instanceof Error ? err.message : 'Failed to fetch coins');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchCoins();
//     }, []);

//     const handleTagClick = useCallback((tag: string) => {
//         setSelectedTags(prev =>
//             prev.includes(tag)
//                 ? prev.filter(t => t !== tag)
//                 : [...prev, tag]
//         );
//     }, []);

//     const filteredMemeCoins = memeCoins.filter(coin => {
//         const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
//         const matchesTags = selectedTags.length === 0;
//         return matchesSearch && matchesTags;
//     });

//     const filteredOtherCoins = allCoins
//         .filter(coin => !memeCoins.some(memeCoin => memeCoin.id === coin.id))
//         .filter(coin => {
//             const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
//             const matchesTags = selectedTags.length === 0;
//             return matchesSearch && matchesTags;
//         });

//     if (selectedCoin) {
//         return <CoinDetail coin={selectedCoin} onBack={() => setSelectedCoin(null)} />;
//     }

//     return (
//         <div className="min-h-screen flex flex-col max-w-full mx-auto px-5 py-10 space-y-6 bg-[#000A19]">
//             <div className="flex items-center h-full gap-4 bg-[#000A19]">
//                 <button
//                     onClick={() => window.history.back()}
//                     className="text-white hover:text-blue-800"
//                     type="button"
//                 >
//                     <ArrowLeft size={20} />
//                 </button>
//                 <div className="bg-gradient-to-tr from-[#000D33] via-[#582CFF] to-[#9a9a9a] flex flex-col w-full rounded-xl">
//                     <div className="h-full bg-[#0F132C] m-0.5 rounded-xl py-1 flex flex-col justify-between">
//                         <div className="relative flex-1">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                             <Input
//                                 type="text"
//                                 placeholder="Search for AI Coins Created on ZkTerminal"
//                                 className="pl-10 !text-white placeholder-gray-400 focus:outline-none bg-transparent"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>



//             {isLoading ? (
//                 <div className="text-center text-white">Loading coins...</div>
//             ) : error ? (
//                 <div className="text-center text-red-500">{error}</div>
//             ) : (
//                 <>
//                     {/* <div className="px-5">
//                         <h2 className="text-xl font-semibold mb-4 font-ttfirs text-[#fff]">Meme Coins</h2>
//                         <div className="space-y-4">
//                             {filteredMemeCoins.map(coin => (
//                                 <CoinCard
//                                     key={coin.id}
//                                     coin={coin}
//                                     onClick={() => setSelectedCoin(coin)}
//                                 />
//                             ))}
//                         </div>
//                     </div>

//                     <Separator /> */}

//                     <div className="px-5 text-center">
//                         <h2 className="text-2xl font-semibold mb-4 font-abeezee text-[#fff] bg-gradient-to-r from-[#2AF698] to-[#5BBFCD] text-transparent bg-clip-text">Explore AI Coins</h2>
//                         <p className="text-sm text-gray-300 font-abeezee mb-10 italic">Disclaimer: ZkAGI provides tools and infrastructure for the marketplace but does not endorse or guarantee the value, quality, or legitimacy of any AI coins listed or built on the platform. Transactions are conducted solely at the discretion of buyers and sellers.</p>
//                         {/* <div className="flex flex-wrap gap-2 mb-4">
//                             {tags.map(tag => (
//                                 <Badge
//                                     key={tag}
//                                     className={`cursor-pointer ${selectedTags.includes(tag)
//                                         ? 'bg-blue-600'
//                                         : 'bg-[#5D7285]'
//                                         }`}
//                                     onClick={() => handleTagClick(tag)}
//                                 >
//                                     {tag}
//                                 </Badge>
//                             ))}
//                         </div> */}

//                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                             {filteredOtherCoins.map(coin => (
//                                 <CoinCard
//                                     key={coin.id}
//                                     coin={coin}
//                                 // onClick={() => setSelectedCoin(coin)}
//                                 />
//                             ))}
//                         </div>

//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default MarketplacePage;

'use client';

import { FC, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CoinCard } from '@/component/ui/CoinCard';
import { CoinDetail } from '@/component/ui/CoinDetails';
import { Coin, ApiCoin, ApiResponse } from '@/types/marketplaceTypes';
import { useWallet } from '@solana/wallet-adapter-react';

const tags: string[] = ['DeFi', 'Gaming', 'NFT', 'Metaverse', 'Web3'];

const ITEMS_PER_PAGE = 10; // Number of coins to fetch per request

const SkeletonCard: FC = () => (
    <div className="animate-pulse bg-[#1A1A2E] p-4 rounded-lg shadow-md">
        <div className="h-32 bg-gray-700 rounded"></div>
        <div className="h-6 mt-4 bg-gray-600 rounded"></div>
        <div className="h-4 mt-2 bg-gray-600 rounded"></div>
    </div>
);

const MarketplacePage: FC = () => {
    const wallet = useWallet();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [allCoins, setAllCoins] = useState<Coin[]>([]);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastCoinElementRef = useCallback(
        (node: HTMLElement | null) => {
            if (isLoading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage(prevPage => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [isLoading, hasMore]
    );

    // Convert API coin format to UI coin format
    const convertApiCoinToUiCoin = (apiCoin: ApiCoin): Coin => ({
        id: apiCoin._id,
        name: apiCoin.coin_name,
        symbol: apiCoin.ticker,
        description: apiCoin.description,
        image: apiCoin.image_base64.startsWith('data:image/png;base64,')
            ? apiCoin.image_base64
            : `data:image/png;base64,${apiCoin.image_base64}`,
        address: apiCoin.memecoin_address,
        marketCap: undefined
    });

    useEffect(() => {
        const fetchCoins = async () => {
            if (!wallet.publicKey) {
                setError('Please connect your wallet.');
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://zynapse.zkagi.ai/api/coins?limit=${ITEMS_PER_PAGE}&offset=${page * ITEMS_PER_PAGE}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': 'zk-123321'
                    }
                });

                if (!response.ok) {
                    throw new Error(`API call failed: ${response.statusText}`);
                }

                const data: ApiResponse = await response.json();

                if (data.success) {
                    const convertedCoins = data.data.map(convertApiCoinToUiCoin);

                    setAllCoins(prevCoins => [...prevCoins, ...convertedCoins]);

                    // Determine if there are more coins to load
                    if (convertedCoins.length < ITEMS_PER_PAGE) {
                        setHasMore(false);
                    }
                } else {
                    throw new Error('API returned unsuccessful response');
                }
            } catch (err) {
                console.error('Error fetching coins:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch coins');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoins();
    }, [page, wallet.publicKey]);

    const handleTagClick = useCallback((tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    }, []);

    // Memoize filtered coins to optimize performance
    const filteredCoins = useMemo(() => {
        return allCoins.filter(coin => {
            const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => coin.description.includes(tag));
            return matchesSearch && matchesTags;
        });
    }, [allCoins, searchQuery, selectedTags]);

    if (selectedCoin) {
        return <CoinDetail coin={selectedCoin} onBack={() => setSelectedCoin(null)} />;
    }

    return (
        <div className="min-h-screen flex flex-col max-w-full mx-auto px-5 py-10 space-y-6 bg-[#000A19]">
            <div className="flex items-center h-full gap-4 bg-[#000A19]">
                <button
                    onClick={() => window.history.back()}
                    className="text-white hover:text-blue-800"
                    type="button"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="bg-gradient-to-tr from-[#000D33] via-[#582CFF] to-[#9a9a9a] flex flex-col w-full rounded-xl">
                    <div className="h-full bg-[#0F132C] m-0.5 rounded-xl py-1 flex flex-col justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                type="text"
                                placeholder="Search for AI Coins Created on ZkTerminal"
                                className="pl-10 !text-white placeholder-gray-400 focus:outline-none bg-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="text-center text-red-500">{error}</div>}

            <div className="px-5 text-center">
                <h2 className="text-2xl font-semibold mb-4 font-abeezee text-[#fff] bg-gradient-to-r from-[#2AF698] to-[#5BBFCD] text-transparent bg-clip-text">Explore AI Coins</h2>
                <p className="text-sm text-gray-300 font-abeezee mb-10 italic">Disclaimer: ZkAGI provides tools and infrastructure for the marketplace but does not endorse or guarantee the value, quality, or legitimacy of any AI coins listed or built on the platform. Transactions are conducted solely at the discretion of buyers and sellers.</p>

                {/* Tags (Uncomment if needed)
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map(tag => (
                        <Badge
                            key={tag}
                            className={`cursor-pointer ${selectedTags.includes(tag)
                                ? 'bg-blue-600'
                                : 'bg-[#5D7285]'
                                }`}
                            onClick={() => handleTagClick(tag)}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
                */}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCoins.map((coin, index) => {
                        if (filteredCoins.length === index + 1) {
                            return (
                                <div ref={lastCoinElementRef} key={coin.id}>
                                    <CoinCard
                                        coin={coin}
                                        onClick={() => setSelectedCoin(coin)}
                                    />
                                </div>
                            );
                        } else {
                            return (
                                <CoinCard
                                    key={coin.id}
                                    coin={coin}
                                    onClick={() => setSelectedCoin(coin)}
                                />
                            );
                        }
                    })}
                </div>

                {isLoading &&
                    Array.from({ length: 9 })
                        .map((_, index) => (
                            <SkeletonCard key={`skeleton-${index}`} />
                        ))}
                {!hasMore && <div className="text-center text-white mt-4">No more coins to load.</div>}
            </div>
        </div>
    );
};

export default MarketplacePage;
