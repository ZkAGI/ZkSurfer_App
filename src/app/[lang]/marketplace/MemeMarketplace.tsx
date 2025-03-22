// 'use client';

// import { FC, useState, useCallback, useEffect, useRef, useMemo } from 'react';
// import { Search, ArrowLeft } from 'lucide-react';
// import { CoinCard } from '@/component/ui/CoinCard';
// import { Coin, ApiCoin, ApiResponse } from '@/types/marketplaceTypes';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { Input } from '@/components/ui/input';

// const ITEMS_PER_PAGE = 9;

// const SkeletonCard: FC = () => (
//     <div className="animate-pulse bg-[#1A1A2E] p-4 rounded-lg shadow-md">
//         <div className="h-24 bg-gray-700 rounded"></div>
//         <div className="h-6 mt-4 bg-gray-600 rounded"></div>
//         <div className="h-4 mt-2 bg-gray-600 rounded"></div>
//     </div>
// );

// const MarketplacePage: FC = () => {
//     const wallet = useWallet();
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
//     const [allCoins, setAllCoins] = useState<Coin[]>([]);
//     const [page, setPage] = useState<number>(0);
//     const [hasMore, setHasMore] = useState<boolean>(true);
//     const [isLoading, setIsLoading] = useState<boolean>(true);

//     const observer = useRef<IntersectionObserver | null>(null);

//     const lastCoinElementRef = useCallback(
//         (node: HTMLElement | null) => {
//             if (isLoading || !hasMore) return;
//             if (observer.current) observer.current.disconnect();

//             observer.current = new IntersectionObserver(entries => {
//                 if (entries[0].isIntersecting) {
//                     setPage(prevPage => prevPage + 1);
//                 }
//             });

//             if (node) observer.current.observe(node);
//         },
//         [isLoading, hasMore]
//     );

//     const convertApiCoinToUiCoin = (apiCoin: ApiCoin): Coin => ({
//         id: apiCoin._id,
//         name: apiCoin.coin_name,
//         symbol: apiCoin.ticker,
//         description: apiCoin.description,
//         image: apiCoin.image_base64.startsWith('data:image/png;base64,')
//             ? apiCoin.image_base64
//             : `data:image/png;base64,${apiCoin.image_base64}`,
//         address: apiCoin.memecoin_address,
//         marketCap: undefined,
//     });

//     useEffect(() => {
//         const fetchCoins = async () => {
//             if (!wallet.publicKey) return;

//             setIsLoading(true);

//             try {
//                 const response = await fetch(
//                     `https://zynapse.zkagi.ai/api/coins?limit=${ITEMS_PER_PAGE}&offset=${page * ITEMS_PER_PAGE}`,
//                     {
//                         method: 'GET',
//                         headers: {
//                             'Content-Type': 'application/json',
//                             'api-key': 'zk-123321',
//                         },
//                     }
//                 );

//                 if (!response.ok) {
//                     throw new Error(`API call failed: ${response.statusText}`);
//                 }

//                 const data: ApiResponse = await response.json();

//                 if (data.success) {
//                     const convertedCoins = data.data.map(convertApiCoinToUiCoin);

//                     setAllCoins(prevCoins => [
//                         ...prevCoins,
//                         ...convertedCoins.filter(coin => !prevCoins.find(c => c.id === coin.id)),
//                     ]);

//                     if (convertedCoins.length < ITEMS_PER_PAGE) {
//                         setHasMore(false);
//                     }
//                 } else {
//                     throw new Error('API returned unsuccessful response');
//                 }
//             } catch (err) {
//                 console.error('Error fetching coins:', err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchCoins();
//     }, [page, wallet.publicKey]);

//     const filteredCoins = useMemo(() => {
//         return allCoins.filter(coin => {
//             const matchesSearch =
//                 coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
//             return matchesSearch;
//         });
//     }, [allCoins, searchQuery]);

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
//                                 className="pl-10 !text-white placeholder-gray-400 focus:outline-none bg-transparent w-full"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="px-5 text-center">
//                 <h2 className="text-2xl font-semibold mb-4 font-abeezee text-[#fff] bg-gradient-to-r from-[#2AF698] to-[#5BBFCD] text-transparent bg-clip-text">Explore AI Coins</h2>
//                 <p className="text-sm text-gray-300 font-abeezee mb-10 italic">
//                     Disclaimer: ZkAGI provides tools and infrastructure for the marketplace but does not endorse or guarantee
//                     the value, quality, or legitimacy of any AI coins listed or built on the platform.
//                 </p>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {isLoading && page === 0
//                     ? Array.from({ length: 9 }).map((_, index) => (
//                         <SkeletonCard key={`skeleton-${index}`} />
//                     ))
//                     : filteredCoins.map((coin, index) => {
//                         if (filteredCoins.length === index + 1) {
//                             return (
//                                 <div ref={lastCoinElementRef} key={coin.id}>
//                                     <CoinCard
//                                         coin={coin}
//                                         onClick={() => setSelectedCoin(coin)}
//                                     />
//                                 </div>
//                             );
//                         } else {
//                             return (
//                                 <CoinCard
//                                     key={coin.id}
//                                     coin={coin}
//                                     onClick={() => setSelectedCoin(coin)}
//                                 />
//                             );
//                         }
//                     })}
//             </div>

//             {!hasMore && !isLoading && <div className="text-center text-white mt-4">No more coins to load.</div>}
//         </div>
//     );
// };

// export default MarketplacePage;

// 'use client';

// import { FC, useState, useCallback, useEffect, useRef, useMemo } from 'react';
// import { Search, ArrowLeft } from 'lucide-react';
// import { CoinCard } from '@/component/ui/CoinCard';
// import { Coin, ApiCoin, ApiResponse } from '@/types/marketplaceTypes';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { Input } from '@/components/ui/input';

// const ITEMS_PER_PAGE = 9;

// const SkeletonCard: FC = () => (
//     <div className="animate-pulse bg-[#1A1A2E] p-4 rounded-lg shadow-md">
//         <div className="h-24 bg-gray-700 rounded"></div>
//         <div className="h-6 mt-4 bg-gray-600 rounded"></div>
//         <div className="h-4 mt-2 bg-gray-600 rounded"></div>
//     </div>
// );

// const MarketplacePage: FC = () => {
//     const wallet = useWallet();
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
//     const [allCoins, setAllCoins] = useState<Coin[]>([]);
//     const [page, setPage] = useState<number>(0);
//     const [hasMore, setHasMore] = useState<boolean>(true);
//     const [isLoading, setIsLoading] = useState<boolean>(true);

//     const observer = useRef<IntersectionObserver | null>(null);

//     const lastCoinElementRef = useCallback(
//         (node: HTMLElement | null) => {
//             if (isLoading || !hasMore) return;
//             if (observer.current) observer.current.disconnect();

//             observer.current = new IntersectionObserver(entries => {
//                 if (entries[0].isIntersecting) {
//                     setPage(prevPage => prevPage + 1);
//                 }
//             });

//             if (node) observer.current.observe(node);
//         },
//         [isLoading, hasMore]
//     );

//     const convertApiCoinToUiCoin = (apiCoin: ApiCoin): Coin => ({
//         id: apiCoin._id,
//         name: apiCoin.coin_name,
//         symbol: apiCoin.ticker,
//         description: apiCoin.description,
//         image: apiCoin.image_base64.startsWith('data:image/png;base64,')
//             ? apiCoin.image_base64
//             : `data:image/png;base64,${apiCoin.image_base64}`,
//         address: apiCoin.memecoin_address,
//         marketCap: undefined,
//     });

//     useEffect(() => {
//         const fetchCoins = async () => {
//             if (!wallet.publicKey) return;

//             setIsLoading(true);

//             try {
//                 const response = await fetch(
//                     `https://zynapse.zkagi.ai/api/coins?page=${page}&limit=${ITEMS_PER_PAGE}`,
//                     {
//                         method: 'GET',
//                         headers: {
//                             'Content-Type': 'application/json',
//                             'api-key': 'zk-123321',
//                         },
//                     }
//                 );

//                 if (!response.ok) {
//                     throw new Error(`API call failed: ${response.statusText}`);
//                 }

//                 const data: ApiResponse = await response.json();

//                 if (data.success) {
//                     const convertedCoins = data.data.map(convertApiCoinToUiCoin);

//                     setAllCoins(prevCoins => [
//                         ...prevCoins,
//                         ...convertedCoins.filter(coin => !prevCoins.find(c => c.id === coin.id)),
//                     ]);

//                     if (convertedCoins.length < ITEMS_PER_PAGE) {
//                         setHasMore(false);
//                     }
//                 } else {
//                     throw new Error('API returned unsuccessful response');
//                 }
//             } catch (err) {
//                 console.error('Error fetching coins:', err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchCoins();
//     }, [page, wallet.publicKey]);

//     // Filter out coins with null address and match the search query
//     const filteredCoins = useMemo(() => {
//         return allCoins.filter(coin => {
//             const matchesSearch =
//                 coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
//             const hasValidAddress = coin.address !== null; // Exclude coins with null address
//             return matchesSearch && hasValidAddress;
//         });
//     }, [allCoins, searchQuery]);

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
//                                 className="pl-10 !text-white placeholder-gray-400 focus:outline-none bg-transparent w-full"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="px-5 text-center">
//                 <h2 className="text-2xl font-semibold mb-4 font-abeezee text-[#fff] bg-gradient-to-r from-[#2AF698] to-[#5BBFCD] text-transparent bg-clip-text">Explore AI Coins</h2>
//                 <p className="text-sm text-gray-300 font-abeezee mb-10 italic">
//                     Disclaimer: ZkAGI provides tools and infrastructure for the marketplace but does not endorse or guarantee
//                     the value, quality, or legitimacy of any AI coins listed or built on the platform.
//                 </p>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {isLoading && page === 0
//                     ? Array.from({ length: 9 }).map((_, index) => (
//                         <SkeletonCard key={`skeleton-${index}`} />
//                     ))
//                     : filteredCoins.map((coin, index) => {
//                         if (filteredCoins.length === index + 1) {
//                             return (
//                                 <div ref={lastCoinElementRef} key={coin.id}>
//                                     <CoinCard
//                                         coin={coin}
//                                         onClick={() => setSelectedCoin(coin)}
//                                     />
//                                 </div>
//                             );
//                         } else {
//                             return (
//                                 <CoinCard
//                                     key={coin.id}
//                                     coin={coin}
//                                     onClick={() => setSelectedCoin(coin)}
//                                 />
//                             );
//                         }
//                     })}
//             </div>

//             {!hasMore && !isLoading && <div className="text-center text-white mt-4">No more coins to load.</div>}
//         </div>
//     );
// };

// export default MarketplacePage;

'use client';

import { FC, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { CoinCard } from '@/component/ui/CoinCard';
import { Coin, ApiCoin, ApiResponse } from '@/types/marketplaceTypes';
import { useWallet } from '@solana/wallet-adapter-react';
import { Input } from '@/components/ui/input';
import { Dictionary } from '@/app/i18n/types';


export interface MarketplacePageProps {
    dictionary: Dictionary;
}


const ITEMS_PER_PAGE = 9;

const SkeletonCard: FC = () => (
    <div className="animate-pulse bg-[#1A1A2E] p-4 rounded-lg shadow-md">
        <div className="h-24 bg-gray-700 rounded"></div>
        <div className="h-6 mt-4 bg-gray-600 rounded"></div>
        <div className="h-4 mt-2 bg-gray-600 rounded"></div>
    </div>
);

const MarketplacePage: FC<MarketplacePageProps> = ({ dictionary }) => {
    const wallet = useWallet();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
    const [allCoins, setAllCoins] = useState<Coin[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const observer = useRef<IntersectionObserver | null>(null);

    const lastCoinElementRef = useCallback(
        (node: HTMLElement | null) => {
            if (isLoading || !hasMore) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    setPage(prevPage => prevPage + 1);
                }
            });

            if (node) observer.current.observe(node);
        },
        [isLoading, hasMore]
    );

    const convertApiCoinToUiCoin = (apiCoin: ApiCoin): Coin => ({
        id: apiCoin.coin_name, // Assuming coin_name is unique
        name: apiCoin.coin_name,
        symbol: apiCoin.ticker,
        description: apiCoin.description,
        image: apiCoin.image_base64.startsWith('data:image/png;base64,')
            ? apiCoin.image_base64
            : `data:image/png;base64,${apiCoin.image_base64}`,
        address: apiCoin.memecoin_address,
        marketCap: undefined, // No market cap in the API
    });

    useEffect(() => {
        const fetchCoins = async () => {
            if (!wallet.publicKey) return;

            setIsLoading(true);

            try {
                const response = await fetch(
                    `https://zynapse.zkagi.ai/api/coins?page=${page}&limit=${ITEMS_PER_PAGE}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': 'zk-123321',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`API call failed: ${response.statusText}`);
                }

                const data: ApiResponse = await response.json();

                if (data.success && data.pagination) {
                    const convertedCoins = data.data.map(convertApiCoinToUiCoin);

                    setAllCoins(prevCoins => [
                        ...prevCoins,
                        ...convertedCoins.filter(coin => !prevCoins.find(c => c.id === coin.id)),
                    ]);

                    // Update hasMore based on pagination
                    setHasMore(data.pagination.currentPage < data.pagination.totalPages);
                } else {
                    throw new Error('API returned unsuccessful response or missing pagination');
                }
            } catch (err) {
                console.error('Error fetching coins:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoins();
    }, [page, wallet.publicKey]);

    // Filter out coins with null address and match the search query
    const filteredCoins = useMemo(() => {
        return allCoins.filter(coin => {
            const matchesSearch =
                coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
            const hasValidAddress = coin.address !== null; // Exclude coins with null address
            return matchesSearch && hasValidAddress;
        });
    }, [allCoins, searchQuery]);

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
                                className="pl-10 !text-white placeholder-gray-400 focus:outline-none bg-transparent w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 text-center">
                <h2 className="text-2xl font-semibold mb-4 font-abeezee text-[#fff] bg-gradient-to-r from-[#2AF698] to-[#5BBFCD] text-transparent bg-clip-text">Explore AI Coins</h2>
                <p className="text-sm text-gray-300 font-abeezee mb-10 italic">
                    Disclaimer: ZkAGI provides tools and infrastructure for the marketplace but does not endorse or guarantee
                    the value, quality, or legitimacy of any AI coins listed or built on the platform.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading && page === 1
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <SkeletonCard key={`skeleton-${index}`} />
                    ))
                    : filteredCoins.map((coin, index) => {
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

            {!hasMore && !isLoading && <div className="text-center text-white mt-4">No more coins to load.</div>}
        </div>
    );
};

export default MarketplacePage;
