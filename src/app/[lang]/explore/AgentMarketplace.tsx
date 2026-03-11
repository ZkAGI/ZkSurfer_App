// 'use client';

// import { FC, useState, useCallback, useEffect, useRef, useMemo } from 'react';
// import { Search, ArrowLeft } from 'lucide-react';
// import { CoinCard } from '@/component/ui/CoinCard';
// import { Coin, ApiCoin, ApiResponse } from '@/types/marketplaceTypes';
// import { useWallet } from '@solana/wallet-adapter-react';

// const ITEMS_PER_PAGE = 9; // 3 rows of 3 cards each

// const SkeletonCard: FC = () => (
//     <div className="animate-pulse bg-[#1A1A2E] p-4 rounded-lg shadow-md">
//         <div className="h-24 bg-gray-700 rounded"></div>
//         <div className="h-6 mt-4 bg-gray-600 rounded"></div>
//         <div className="h-4 mt-2 bg-gray-600 rounded"></div>
//     </div>
// );

// const ExploreAgentsPage: FC = () => {
//     const wallet = useWallet();
//     const [searchQuery, setSearchQuery] = useState<string>('');
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

//     // Filter coins where address is null and matches the search query
//     const filteredCoins = useMemo(() => {
//         return allCoins.filter(coin => {
//             const matchesSearch =
//                 coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
//             const matchesAddress = coin.address === null; // Only include coins with null address
//             return matchesSearch && matchesAddress;
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
//                             <input
//                                 type="text"
//                                 placeholder="Search for Agents"
//                                 className="pl-10 !text-white placeholder-gray-400 focus:outline-none bg-transparent w-full"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="px-5 text-center">
//                 <h2 className="text-2xl font-semibold mb-4 font-abeezee text-[#fff] bg-gradient-to-r from-[#2AF698] to-[#5BBFCD] text-transparent bg-clip-text">
//                     Explore AI Agents
//                 </h2>
//                 <p className="text-sm text-gray-300 font-abeezee mb-10 italic">
//                     Disclaimer: This page provides details about AI agents whose coins have not been deployed yet.
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
//                                     <CoinCard coin={coin} />
//                                 </div>
//                             );
//                         } else {
//                             return <CoinCard key={coin.id} coin={coin} />;
//                         }
//                     })}
//             </div>

//             {!hasMore && !isLoading && <div className="text-center text-white mt-4">No more agents to load.</div>}
//         </div>
//     );
// };

// export default ExploreAgentsPage;

'use client';

import { FC, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Search, ArrowLeft, Bot, Users, Sparkles, Filter, Grid, List } from 'lucide-react';
import { CoinCard } from '@/component/ui/CoinCard';
import { Coin, ApiCoin, ApiResponse } from '@/types/marketplaceTypes';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter, useParams } from 'next/navigation';
import { Dictionary } from '@/app/i18n/types';

export interface ExploreAgentsPageProps {
    dictionary: Dictionary;
}

const ITEMS_PER_PAGE = 9;

const SkeletonCard: FC = () => (
    <div className="ds-card animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-dsBorder skeleton" />
            <div className="flex-1">
                <div className="h-5 w-32 bg-dsBorder skeleton rounded mb-2" />
                <div className="h-4 w-20 bg-dsBorder skeleton rounded mb-3" />
                <div className="h-3 w-full bg-dsBorder skeleton rounded" />
                <div className="h-3 w-3/4 bg-dsBorder skeleton rounded mt-2" />
            </div>
        </div>
    </div>
);

const ExploreAgentsPage: FC<ExploreAgentsPageProps> = ({ dictionary }) => {
    const wallet = useWallet();
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as string || 'en';
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [allCoins, setAllCoins] = useState<Coin[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        id: apiCoin._id,
        name: apiCoin.coin_name,
        symbol: apiCoin.ticker,
        description: apiCoin.description,
        image: apiCoin.image_base64.startsWith('data:image/png;base64,')
            ? apiCoin.image_base64
            : `data:image/png;base64,${apiCoin.image_base64}`,
        address: apiCoin.memecoin_address,
        marketCap: undefined,
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

    // Filter coins where address is null and matches the search query
    const filteredCoins = useMemo(() => {
        return allCoins.filter(coin => {
            const matchesSearch =
                coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesAddress = coin.address === null; // Only include coins with null address
            return matchesSearch && matchesAddress;
        });
    }, [allCoins, searchQuery]);

    return (
        <div className="min-h-screen bg-dsBg">
            {/* Header */}
            <div className="ds-topbar sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/${lang}/home`)}
                        className="w-9 h-9 rounded-lg bg-dsBorder/50 flex items-center justify-center
                                   text-dsMuted hover:text-white hover:bg-dsBorder transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dsGreen to-teal-500
                                        flex items-center justify-center shadow-lg shadow-dsGreen/20">
                            <Users size={16} className="text-white" />
                        </div>
                        <h1 className="ds-heading-md">Explore AI Agents</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-dsBorder/30 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all
                                       ${viewMode === 'grid' ? 'bg-dsPurple text-white' : 'text-dsMuted hover:text-white'}`}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all
                                       ${viewMode === 'list' ? 'bg-dsPurple text-white' : 'text-dsMuted hover:text-white'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                    bg-dsGreen/10 border border-dsGreen/20 mb-6">
                        <Sparkles size={14} className="text-dsGreen" />
                        <span className="text-sm font-dmMono text-dsGreen">Autonomous AI Agents</span>
                    </div>
                    <h2 className="ds-heading-lg mb-4">
                        Discover <span className="ds-gradient-text">AI Agents</span>
                    </h2>
                    <p className="ds-body max-w-2xl mx-auto">
                        Explore AI agents with unique personalities and capabilities.
                        These agents are awaiting token deployment.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dsMuted" size={20} />
                        <input
                            type="text"
                            placeholder="Search agents by name or ticker..."
                            className="ds-input pl-12 pr-12"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-dsMuted hover:text-white transition-colors"
                            >
                                <span className="text-xs">Clear</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Count */}
                {!isLoading && (
                    <div className="flex items-center justify-between mb-6">
                        <p className="ds-body text-sm">
                            Showing <span className="text-white font-medium">{filteredCoins.length}</span> agents
                        </p>
                    </div>
                )}

                {/* Agents Grid */}
                <div className={`grid gap-5 ${
                    viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                }`}>
                    {isLoading && page === 1
                        ? Array.from({ length: 9 }).map((_, index) => (
                            <SkeletonCard key={`skeleton-${index}`} />
                        ))
                        : filteredCoins.map((coin, index) => {
                            if (filteredCoins.length === index + 1) {
                                return (
                                    <div ref={lastCoinElementRef} key={coin.id}>
                                        <CoinCard coin={coin} />
                                    </div>
                                );
                            } else {
                                return <CoinCard key={coin.id} coin={coin} />;
                            }
                        })}
                </div>

                {/* Loading More */}
                {isLoading && page > 1 && (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-3 text-dsMuted">
                            <div className="w-5 h-5 border-2 border-dsPurple/30 border-t-dsPurple rounded-full animate-spin" />
                            Loading more agents...
                        </div>
                    </div>
                )}

                {/* No More Results */}
                {!hasMore && !isLoading && filteredCoins.length > 0 && (
                    <div className="text-center py-8">
                        <p className="ds-body">You've reached the end of the list</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredCoins.length === 0 && (
                    <div className="empty-state py-16">
                        <div className="w-20 h-20 rounded-2xl bg-dsBorder/30 flex items-center justify-center mb-6">
                            <Bot size={36} className="text-dsMuted/50" />
                        </div>
                        <h4 className="empty-state-title">No Agents Found</h4>
                        <p className="empty-state-description">
                            {searchQuery
                                ? `No agents match "${searchQuery}". Try a different search term.`
                                : 'No AI agents are available at the moment. Check back later!'}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="ds-btn-secondary mt-6"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExploreAgentsPage;