// import React, { useState, useEffect } from 'react';
// import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// interface PastNewsItem {
//   news_id: string;
//   title: string;
//   link: string;
//   analysis: string;
//   sentimentScore?: number;
//   sentimentTag?: 'bearish' | 'neutral' | 'bullish';
//   advice?: 'Buy' | 'Hold' | 'Sell';
//   reason?: string;
//   rationale?: string;
// }

// interface PastCryptoNews extends PastNewsItem { }

// interface PastMacroNews extends PastNewsItem {
//   description?: string;
// }

// interface PastPredictionData {
//   fetched_date: string;
//   crypto_news: PastCryptoNews[];
//   macro_news: PastMacroNews[];
// }

// interface PastPredictionsResponse {
//   past_news: PastPredictionData[];
//   price_history_last_7_days: Array<{
//     date: string;
//     price: number;
//   }>;
//   latest_forecast: any[];
// }

// interface PredictionCardProps {
//   data: PastPredictionData;
//   onViewReport: (data: PastPredictionData) => void;
//   isMobile?: boolean;
// }

// const PredictionCard: React.FC<PredictionCardProps> = ({ data, onViewReport, isMobile = false }) => {
//   // Calculate sentiment summary
//   const allNews = [...data.crypto_news, ...data.macro_news];
//   const sentimentScores = allNews
//     .map(item => item.sentimentScore)
//     .filter((score): score is number =>
//       typeof score === 'number' &&
//       !Number.isNaN(score)
//     );

//   const avgSentiment = sentimentScores.length > 0
//     ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
//     : null;

//   const getSentimentInfo = (score: number | null) => {
//     if (score === null) {
//       return {
//         label: 'NEUTRAL',
//         color: 'text-yellow-500',
//         icon: Minus,
//         bgColor: 'bg-yellow-500/10'
//       };
//     }
//     if (score <= 1.6) return { label: 'BEARISH', color: 'text-red-500', icon: TrendingDown, bgColor: 'bg-red-500/10' };
//     if (score <= 3.2) return { label: 'NEUTRAL', color: 'text-yellow-500', icon: Minus, bgColor: 'bg-yellow-500/10' };
//     return { label: 'BULLISH', color: 'text-green-500', icon: TrendingUp, bgColor: 'bg-green-500/10' };
//   };

//   const sentimentInfo = getSentimentInfo(avgSentiment);
//   const IconComponent = sentimentInfo.icon;

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div
//       className={`bg-[#1a2332] rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer hover:bg-[#1e2636] ${isMobile ? '' : 'text-sm'}`}
//       onClick={() => onViewReport(data)}
//     >
//       {/* Header with date */}
//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center space-x-2">
//           <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-gray-400`} />
//           <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-300`}>{formatDate(data.fetched_date)}</span>
//         </div>
//         <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${sentimentInfo.bgColor}`}>
//           <IconComponent className={`${isMobile ? 'w-3 h-3' : 'w-2 h-2'} ${sentimentInfo.color}`} />
//           <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} font-medium ${sentimentInfo.color}`}>
//             {sentimentInfo.label}
//           </span>
//         </div>
//       </div>

//       {/* News summary */}
//       <div className="space-y-1">
//         <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
//           <span className="text-gray-400">Crypto:</span>
//           <span className="text-white">{data.crypto_news.length}</span>
//         </div>
//         <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
//           <span className="text-gray-400">Macro:</span>
//           <span className="text-white">{data.macro_news.length}</span>
//         </div>
//       </div>

//       {/* Top news preview */}
//       {allNews.length > 0 && (
//         <div className="mt-2 pt-2 border-t border-gray-700">
//           <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-400 mb-1`}>Top Story:</p>
//           <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-white line-clamp-2 leading-tight`}>
//             {allNews[0]?.title || 'No news available'}
//           </p>
//         </div>
//       )}

//       {/* Sentiment score */}
//       <div className="mt-2 pt-2 border-t border-gray-700">
//         <div className="flex justify-between items-center">
//           <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-400`}>Sentiment:</span>
//           <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium ${sentimentInfo.color}`}>
//             {/* {avgSentiment.toFixed(1)}/5 */}
//             {avgSentiment !== null
//               ? `${avgSentiment.toFixed(1)}/5`
//               : '—/5'
//             }
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// interface PastPredictionsProps {
//   onViewReport: (data: PastPredictionData) => void;
//   isMobile?: boolean;
// }

// const PastPredictions: React.FC<PastPredictionsProps> = ({ onViewReport, isMobile = false }) => {
//   const [pastData, setPastData] = useState<PastPredictionData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPastPredictions = async () => {
//       try {
//         setLoading(true);

//         if (!process.env.NEXT_PUBLIC_PAST_PREDICTION_API) {
//           throw new Error('API URL not configured');
//         }

//         // const response = await fetch(process.env.NEXT_PUBLIC_PAST_PREDICTION_API, {
//         //   method: 'GET',
//         //   headers: {
//         //     'accept': 'application/json'
//         //   }
//         // });

//         const response = await fetch("/api/past-prediction");

//         if (!response.ok) {
//           throw new Error(`Failed to fetch past predictions: ${response.statusText}`);
//         }

//         const data: PastPredictionsResponse = await response.json();

//         // Process the data to add sentiment analysis to each news item
//         const processedData = data.past_news.map(dayData => ({
//           ...dayData,
//           crypto_news: dayData.crypto_news.map(item => processNewsItem(item)),
//           macro_news: dayData.macro_news.map(item => processNewsItem(item))
//         }));

//         // Sort by date (most recent first)
//         processedData.sort((a, b) => new Date(b.fetched_date).getTime() - new Date(a.fetched_date).getTime());

//         setPastData(processedData);
//       } catch (err) {
//         console.error('Error fetching past predictions:', err);
//         setError(err instanceof Error ? err.message : 'Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPastPredictions();
//   }, []);

//   const processNewsItem = (item: any) => {
//     // Extract sentiment data from the analysis field
//     const match = item.analysis?.match(/```json\s*([\s\S]*?)```/);
//     let parsed: any = {};

//     if (match) {
//       try {
//         parsed = JSON.parse(match[1]);
//       } catch (e) {
//         console.warn('Failed to parse analysis JSON for item:', item.news_id);
//       }
//     }

//     const normalizeSentiment = (score: number): 'bearish' | 'neutral' | 'bullish' => {
//       if (score <= 1.6) return 'bearish';
//       if (score <= 3.3) return 'neutral';
//       return 'bullish';
//     };

//     return {
//       ...item,
//       sentimentScore: parsed.sentiment_score || 2.5,
//       sentimentTag: parsed.sentiment_score ? normalizeSentiment(parsed.sentiment_score) : 'neutral',
//       advice: parsed.investment?.advice || 'Hold',
//       reason: parsed.investment?.reason || '',
//       rationale: parsed.rationale || ''
//     };
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
//         <span className="ml-2 text-gray-300">Loading past predictions...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
//         <p className="text-red-400">Error loading past predictions</p>
//         <p className="text-sm text-gray-400 mt-1">{error}</p>
//         <button
//           onClick={() => window.location.reload()}
//           className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   if (pastData.length === 0) {
//     return (
//       <div className="bg-gray-800/50 rounded-lg p-8 text-center">
//         <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//         <p className="text-gray-400 mb-2">No past predictions available</p>
//         <p className="text-sm text-gray-500">Check back later for historical reports</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-3">
//       {!isMobile && (
//         <div className="flex items-center space-x-2 mb-3">
//           <Calendar className="w-4 h-4 text-blue-400" />
//           <h3 className="text-sm font-bold text-white">Historical Reports</h3>
//           <span className="text-xs text-gray-400">({pastData.length})</span>
//         </div>
//       )}

//       {isMobile && (
//         <div className="flex items-center space-x-2 mb-4">
//           <Calendar className="w-5 h-5 text-blue-400" />
//           <h3 className="text-lg font-bold text-white">Past Prediction Reports</h3>
//           <span className="text-sm text-gray-400">({pastData.length} reports)</span>
//         </div>
//       )}

//       <div className={`
//         ${isMobile
//           ? 'grid grid-cols-1 gap-3'
//           : 'space-y-2'
//         }
//       `}>
//         {pastData.map((dayData, index) => (
//           <PredictionCard
//             key={`${dayData.fetched_date}-${index}`}
//             data={dayData}
//             onViewReport={onViewReport}
//             isMobile={isMobile}
//           />
//         ))}
//       </div>

//       {pastData.length > 0 && (
//         <div className={`text-center mt-4 p-3 bg-gray-800/30 rounded-lg ${isMobile ? '' : 'text-xs'}`}>
//           <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-400`}>
//             {isMobile ? `Showing ${pastData.length} past prediction reports` : `${pastData.length} reports available`}
//           </p>
//           {isMobile && (
//             <p className="text-xs text-gray-500 mt-1">
//               Click on any card to view the detailed report
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PastPredictions;

// import React, { useState, useEffect } from 'react';
// import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// interface PastNewsItem {
//   news_id: string;
//   title: string;
//   link: string;
//   analysis: string;
//   sentimentScore?: number;
//   sentimentTag?: 'bearish' | 'neutral' | 'bullish';
//   advice?: 'Buy' | 'Hold' | 'Sell';
//   reason?: string;
//   rationale?: string;
//   description?: string;
// }

// interface PastCryptoNews extends PastNewsItem { }

// interface PastMacroNews extends PastNewsItem {
//   description?: string;
// }

// interface HourlyEntry {
//   time: string;                       // e.g. "2025-07-17T00:00:00+00:00"
//   signal: 'LONG' | 'SHORT' | 'HOLD';
//   entry_price: number | null;
//   stop_loss: number | null;
//   take_profit: number | null;
//   forecast_price: number;
//   current_price: number;
//   deviation_percent: number;
//   accuracy_percent: number;
//   risk_reward_ratio: number;
//   sentiment_score: number;
//   confidence_50: [number, number];
//   confidence_80: [number, number];
//   confidence_90: [number, number];
// }


// interface PastPredictionData {
//   fetched_date: string;
//   crypto_news: PastCryptoNews[];
//   macro_news: PastMacroNews[];
//   hourlyForecast?: HourlyEntry[];
// }

// // interface PastPredictionsResponse {
// //   past_news_last_3_days: PastPredictionData[];
// //   forecast_hourly_last_3_days?: any[];
// // }

// interface PastPredictionsResponse {
//   past_news_last_30_days: PastPredictionData[];  // Changed from past_news_last_3_days
//   forecast_hourly_last_30_days?: {  // Changed from forecast_hourly_last_3_days
//     BTC: HourlyEntry[];
//     ETH: HourlyEntry[];
//     SOL: HourlyEntry[];
//   };
// }

// interface EnhancedPastPredictionData extends PastPredictionData {
//   hourlyForecast?: {
//     BTC: HourlyEntry[];
//     ETH: HourlyEntry[];
//     SOL: HourlyEntry[];
//   };
// }

// interface PredictionCardProps {
//   data: PastPredictionData;
//   onViewReport: (data: PastPredictionData) => void;
//   isMobile?: boolean;
// }

// const PredictionCard: React.FC<PredictionCardProps> = ({ data, onViewReport, isMobile = false }) => {
//   // Calculate sentiment summary
//   const allNews = [...data.crypto_news, ...data.macro_news];
//   const sentimentScores = allNews
//     .map(item => item.sentimentScore)
//     .filter((score): score is number =>
//       typeof score === 'number' &&
//       !Number.isNaN(score)
//     );

//   const avgSentiment = sentimentScores.length > 0
//     ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
//     : null;

//   const getSentimentInfo = (score: number | null) => {
//     if (score === null) {
//       return {
//         label: 'NEUTRAL',
//         color: 'text-yellow-500',
//         icon: Minus,
//         bgColor: 'bg-yellow-500/10'
//       };
//     }
//     if (score <= 1.6) return { label: 'BEARISH', color: 'text-red-500', icon: TrendingDown, bgColor: 'bg-red-500/10' };
//     if (score <= 3.2) return { label: 'NEUTRAL', color: 'text-yellow-500', icon: Minus, bgColor: 'bg-yellow-500/10' };
//     return { label: 'BULLISH', color: 'text-green-500', icon: TrendingUp, bgColor: 'bg-green-500/10' };
//   };

//   const sentimentInfo = getSentimentInfo(avgSentiment);
//   const IconComponent = sentimentInfo.icon;

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div
//       className={`bg-[#1a2332] rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer hover:bg-[#1e2636] ${isMobile ? '' : 'text-sm'}`}
//       onClick={() => onViewReport(data)}
//     >
//       {/* Header with date */}
//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center space-x-2">
//           <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-gray-400`} />
//           <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-300`}>{formatDate(data.fetched_date)}</span>
//         </div>
//         <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${sentimentInfo.bgColor}`}>
//           <IconComponent className={`${isMobile ? 'w-3 h-3' : 'w-2 h-2'} ${sentimentInfo.color}`} />
//           <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} font-medium ${sentimentInfo.color}`}>
//             {sentimentInfo.label}
//           </span>
//         </div>
//       </div>

//       {/* News summary */}
//       {/* <div className="space-y-1">
//         <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
//           <span className="text-gray-400">Crypto:</span>
//           <span className="text-white">{data.crypto_news.length}</span>
//         </div>
//         <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
//           <span className="text-gray-400">Macro:</span>
//           <span className="text-white">{data.macro_news.length}</span>
//         </div>
//       </div> */}

//       <div className="space-y-1">
//   <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
//     <span className="text-gray-400">Crypto:</span>
//     <span className="text-white">{data.crypto_news.length}</span>
//   </div>
//   <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
//     <span className="text-gray-400">Macro:</span>
//     <span className="text-white">{data.macro_news.length}</span>
//   </div>
//   {/* Add forecast data summary */}
//   {/* {data.hourlyForecast && (
//     <>
//       <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
//         <span className="text-gray-400">BTC Forecasts:</span>
//         <span className="text-white">{data.hourlyForecast.BTC?.length || 0}</span>
//       </div>
//       <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
//         <span className="text-gray-400">ETH Forecasts:</span>
//         <span className="text-white">{data.hourlyForecast.ETH?.length || 0}</span>
//       </div>
//       <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
//         <span className="text-gray-400">SOL Forecasts:</span>
//         <span className="text-white">{data.hourlyForecast.SOL?.length || 0}</span>
//       </div>
//     </>
//   )} */}
// </div>

//       {/* Top news preview */}
//       {allNews.length > 0 && (
//         <div className="mt-2 pt-2 border-t border-gray-700">
//           <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-400 mb-1`}>Top Story:</p>
//           <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-white line-clamp-2 leading-tight`}>
//             {allNews[0]?.title || 'No news available'}
//           </p>
//         </div>
//       )}

//       {/* Sentiment score */}
//       <div className="mt-2 pt-2 border-t border-gray-700">
//         <div className="flex justify-between items-center">
//           <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-400`}>Sentiment:</span>
//           <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium ${sentimentInfo.color}`}>
//             {avgSentiment !== null
//               ? `${avgSentiment.toFixed(1)}/5`
//               : '—/5'
//             }
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// interface PastPredictionsProps {
//   onViewReport: (data: PastPredictionData) => void;
//   isMobile?: boolean;
// }

// const PastPredictions: React.FC<PastPredictionsProps> = ({ onViewReport, isMobile = false }) => {
//   const [pastData, setPastData] = useState<EnhancedPastPredictionData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPastPredictions = async () => {
//       try {
//         setLoading(true);

//         const response = await fetch("/api/past-prediction");

//         if (!response.ok) {
//           throw new Error(`Failed to fetch past predictions: ${response.statusText}`);
//         }

//         const data: PastPredictionsResponse = await response.json();
        
//         // Updated to use new API structure
//         const { past_news_last_30_days, forecast_hourly_last_30_days } = data;

//         // Check if the expected data structure exists
//         if (!data) {
//           throw new Error('No data received from API');
//         }

//         if (!past_news_last_30_days) {
//           throw new Error('API response missing past_news_last_30_days property');
//         }

//         if (!Array.isArray(past_news_last_30_days)) {
//           throw new Error('past_news_last_30_days is not an array');
//         }

//         // Process and enhance the data with hourly forecasts
//         const processedData = past_news_last_30_days.map((dayData, index) => {
//           if (!dayData) {
//             console.warn(`Skipping null/undefined day data at index ${index}`);
//             return null;
//           }

//           // Get the hourly forecast for this date if available
//           let hourlyForecastForDate: { BTC: HourlyEntry[]; ETH: HourlyEntry[]; SOL: HourlyEntry[] } | undefined;
          
//           if (forecast_hourly_last_30_days) {
//             const dateStr = dayData.fetched_date;
            
//             // Filter hourly forecasts for this specific date
//             hourlyForecastForDate = {
//               BTC: forecast_hourly_last_30_days.BTC?.filter(entry => 
//                 entry.time.startsWith(dateStr)
//               ) || [],
//               ETH: forecast_hourly_last_30_days.ETH?.filter(entry => 
//                 entry.time.startsWith(dateStr)
//               ) || [],
//               SOL: forecast_hourly_last_30_days.SOL?.filter(entry => 
//                 entry.time.startsWith(dateStr)
//               ) || []
//             };
//           }

//           const processedDayData: EnhancedPastPredictionData = {
//             fetched_date: dayData.fetched_date || new Date().toISOString().split('T')[0],
//             crypto_news: Array.isArray(dayData.crypto_news)
//               ? dayData.crypto_news.map(item => processNewsItem(item)).filter(Boolean)
//               : [],
//             macro_news: Array.isArray(dayData.macro_news)
//               ? dayData.macro_news.map(item => processNewsItem(item)).filter(Boolean)
//               : [],
//             hourlyForecast: hourlyForecastForDate
//           };

//           return processedDayData;
//         }).filter(Boolean) as EnhancedPastPredictionData[];

//         // Sort by date (most recent first)
//         processedData.sort((a, b) => 
//           new Date(b.fetched_date).getTime() - new Date(a.fetched_date).getTime()
//         );

//         setPastData(processedData);
//       } catch (err) {
//         console.error('Error fetching past predictions:', err);
//         setError(err instanceof Error ? err.message : 'Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPastPredictions();
//   }, []);

// // const PastPredictions: React.FC<PastPredictionsProps> = ({ onViewReport, isMobile = false }) => {
// //   const [pastData, setPastData] = useState<PastPredictionData[]>([]);
// //   const [hourlyByDate, setHourlyByDate] = useState<Record<string, HourlyEntry[]>>({});
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   useEffect(() => {
// //     const fetchPastPredictions = async () => {
// //       try {
// //         setLoading(true);

// //         if (!process.env.NEXT_PUBLIC_PAST_PREDICTION_API) {
// //           throw new Error('API URL not configured');
// //         }

// //         // const response = await fetch(process.env.NEXT_PUBLIC_PAST_PREDICTION_API, {
// //         //   method: 'GET',
// //         //   headers: {
// //         //     'accept': 'application/json'
// //         //   }
// //         // });

// //         const response = await fetch("/api/past-prediction");

// //         if (!response.ok) {
// //           throw new Error(`Failed to fetch past predictions: ${response.statusText}`);
// //         }

// //         const data: PastPredictionsResponse = await response.json();
// //         const { past_news_last_3_days, forecast_hourly_last_3_days = [] } = data;

// //         const byDate: Record<string, HourlyEntry[]> = {};
// //         forecast_hourly_last_3_days.forEach(entry => {
// //           const day = entry.time.slice(0, 10);
// //           byDate[day] = byDate[day] || [];
// //           byDate[day].push(entry);
// //         });
// //         setHourlyByDate(byDate);

// //         // Check if the expected data structure exists
// //         if (!data) {
// //           throw new Error('No data received from API');
// //         }

// //         if (!data.past_news_last_3_days) {
// //           throw new Error('API response missing past_news_last_3_days property. Available keys: ' + Object.keys(data).join(', '));
// //         }

// //         if (!Array.isArray(data.past_news_last_3_days)) {
// //           throw new Error('past_news_last_3_days is not an array, got: ' + typeof data.past_news_last_3_days);
// //         }

// //         // Process the data to add sentiment analysis to each news item
// //         const processedData = data.past_news_last_3_days.map((dayData, index) => {
// //           if (!dayData) {
// //             console.warn(`Skipping null/undefined day data at index ${index}`);
// //             return null;
// //           }

// //           // Ensure required properties exist
// //           const processedDayData = {
// //             fetched_date: dayData.fetched_date || new Date().toISOString().split('T')[0],
// //             crypto_news: Array.isArray(dayData.crypto_news)
// //               ? dayData.crypto_news.map(item => processNewsItem(item)).filter(Boolean)
// //               : [],
// //             macro_news: Array.isArray(dayData.macro_news)
// //               ? dayData.macro_news.map(item => processNewsItem(item)).filter(Boolean)
// //               : []
// //           };

// //           return processedDayData;
// //         }).filter(Boolean) as PastPredictionData[];

// //         // Sort by date (most recent first)
// //         processedData.sort((a, b) => new Date(b.fetched_date).getTime() - new Date(a.fetched_date).getTime());

// //         if (processedData.length === 0) {
// //           console.warn('No valid data found after processing');
// //         }

// //         setPastData(processedData);
// //       } catch (err) {
// //         console.error('Error fetching past predictions:', err);

// //         // Provide more detailed error information
// //         let errorMessage = 'Failed to fetch data';
// //         if (err instanceof Error) {
// //           errorMessage = err.message;
// //         } else if (typeof err === 'string') {
// //           errorMessage = err;
// //         }

// //         // Log the full error for debugging
// //         console.error('Full error details:', {
// //           error: err,
// //           timestamp: new Date().toISOString(),
// //           apiUrl: process.env.NEXT_PUBLIC_PAST_PREDICTION_API || '/api/past-prediction'
// //         });

// //         setError(errorMessage);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchPastPredictions();
// //   }, []);

// //   const processNewsItem = (item: any): PastNewsItem | null => {
// //     // Handle case where item is null/undefined
// //     if (!item) {
// //       return null;
// //     }

// //     // Ensure required fields exist
// //     const baseItem = {
// //       news_id: item.news_id || `unknown-${Date.now()}-${Math.random()}`,
// //       title: item.title || 'Unknown Title',
// //       link: item.link || '',
// //       analysis: item.analysis || '',
// //       description: item.description || undefined
// //     };

// //     // Extract sentiment data from the analysis field
// //     let parsed: any = {};

// //     if (item.analysis && typeof item.analysis === 'string') {
// //       const match = item.analysis.match(/```json\s*([\s\S]*?)```/);

// //       if (match) {
// //         try {
// //           parsed = JSON.parse(match[1]);
// //         } catch (e) {
// //           console.warn('Failed to parse analysis JSON for item:', baseItem.news_id);
// //         }
// //       }
// //     }

// //     const normalizeSentiment = (score: number): 'bearish' | 'neutral' | 'bullish' => {
// //       if (typeof score !== 'number' || isNaN(score)) return 'neutral';
// //       if (score <= 1.6) return 'bearish';
// //       if (score <= 3.3) return 'neutral';
// //       return 'bullish';
// //     };

// //     const sentimentScore = (typeof parsed.sentiment_score === 'number' && !isNaN(parsed.sentiment_score))
// //       ? parsed.sentiment_score
// //       : 2.5;

// //     return {
// //       ...baseItem,
// //       sentimentScore,
// //       sentimentTag: normalizeSentiment(sentimentScore),
// //       advice: parsed.investment?.advice || 'Hold',
// //       reason: parsed.investment?.reason || '',
// //       rationale: parsed.rationale || ''
// //     };
// //   };

// //   const handleRetry = () => {
// //     setError(null);
// //     setLoading(true);
// //     // Re-trigger the useEffect by updating a dependency
// //     window.location.reload();
// //   };

// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center py-8">
// //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
// //         <span className="ml-2 text-gray-300">Loading past predictions...</span>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
// //         <p className="text-red-400">Error loading past predictions</p>
// //         <p className="text-sm text-gray-400 mt-1">{error}</p>
// //         <div className="mt-3 space-y-2">
// //           <button
// //             onClick={handleRetry}
// //             className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
// //           >
// //             Retry
// //           </button>
// //           <p className="text-xs text-gray-500">
// //             If the issue persists, the API response structure may have changed
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (pastData.length === 0) {
// //     return (
// //       <div className="bg-gray-800/50 rounded-lg p-8 text-center">
// //         <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
// //         <p className="text-gray-400 mb-2">No past predictions available</p>
// //         <p className="text-sm text-gray-500 mb-4">
// //           {loading ? 'Loading...' : 'Check back later for historical reports'}
// //         </p>
// //         {process.env.NODE_ENV === 'development' && (
// //           <button
// //             onClick={() => {
// //               console.log('Current state:', { pastData, loading, error });
// //               console.log('Environment:', {
// //                 NODE_ENV: process.env.NODE_ENV,
// //                 API_URL: process.env.NEXT_PUBLIC_PAST_PREDICTION_API
// //               });
// //             }}
// //             className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
// //           >
// //             Debug Info
// //           </button>
// //         )}
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-3">
// //       {!isMobile && (
// //         <div className="flex items-center space-x-2 mb-3">
// //           <Calendar className="w-4 h-4 text-blue-400" />
// //           <h3 className="text-sm font-bold text-white">Historical Reports</h3>
// //           <span className="text-xs text-gray-400">({pastData.length})</span>
// //         </div>
// //       )}

// //       {isMobile && (
// //         <div className="flex items-center space-x-2 mb-4">
// //           <Calendar className="w-5 h-5 text-blue-400" />
// //           <h3 className="text-lg font-bold text-white">Past Prediction Reports</h3>
// //           <span className="text-sm text-gray-400">({pastData.length} reports)</span>
// //         </div>
// //       )}

// //       <div className={`
// //         ${isMobile
// //           ? 'grid grid-cols-1 gap-3'
// //           : 'space-y-2'
// //         }
// //       `}>
// //         {pastData.map((dayData, index) => (
// //           <PredictionCard
// //             key={`${dayData.fetched_date}-${index}`}
// //             data={dayData}
// //             // onViewReport={onViewReport}
// //             onViewReport={() =>
// //               onViewReport({
// //                 ...dayData,
// //                 hourlyForecast: hourlyByDate[dayData.fetched_date] || []
// //               })
// //             }
// //             isMobile={isMobile}
// //           />
// //         ))}
// //       </div>

// //       {pastData.length > 0 && (
// //         <div className={`text-center mt-4 p-3 bg-gray-800/30 rounded-lg ${isMobile ? '' : 'text-xs'}`}>
// //           <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-400`}>
// //             {isMobile ? `Showing ${pastData.length} past prediction reports` : `${pastData.length} reports available`}
// //           </p>
// //           {isMobile && (
// //             <p className="text-xs text-gray-500 mt-1">
// //               Click on any card to view the detailed report
// //             </p>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// export default PastPredictions;

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PastNewsItem {
  news_id: string;
  title: string;
  link: string;
  analysis: string;
  sentimentScore?: number;
  sentimentTag?: 'bearish' | 'neutral' | 'bullish';
  advice?: 'Buy' | 'Hold' | 'Sell';
  reason?: string;
  rationale?: string;
  description?: string;
}

interface PastCryptoNews extends PastNewsItem { }

interface PastMacroNews extends PastNewsItem {
  description?: string;
}

interface HourlyEntry {
  time: string;
  signal: 'LONG' | 'SHORT' | 'HOLD';
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  forecast_price: number;
  current_price: number;
  deviation_percent: number;
  accuracy_percent: number;
  risk_reward_ratio: number;
  sentiment_score: number;
  confidence_50: [number, number];
  confidence_80: [number, number];
  confidence_90: [number, number];
}

interface PastPredictionData {
  fetched_date: string;
  crypto_news: PastCryptoNews[];
  macro_news: PastMacroNews[];
  hourlyForecast?: HourlyEntry[] | {
    BTC: HourlyEntry[];
    ETH: HourlyEntry[];
    SOL: HourlyEntry[];
  };
}

interface PastPredictionsResponse {
  past_news_last_30_days: PastPredictionData[];
  forecast_hourly_last_30_days?: {
    BTC: HourlyEntry[];
    ETH: HourlyEntry[];
    SOL: HourlyEntry[];
  };
}

interface EnhancedPastPredictionData {
  fetched_date: string;
  crypto_news: PastCryptoNews[];
  macro_news: PastMacroNews[];
  hourlyForecast?: {
    BTC: HourlyEntry[];
    ETH: HourlyEntry[];
    SOL: HourlyEntry[];
  };
}

interface PredictionCardProps {
  data: EnhancedPastPredictionData;
  onViewReport: (data: EnhancedPastPredictionData) => void;
  isMobile?: boolean;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ data, onViewReport, isMobile = false }) => {
  // Calculate sentiment summary
  const allNews = [...data.crypto_news, ...data.macro_news];
  const sentimentScores = allNews
    .map(item => item.sentimentScore)
    .filter((score): score is number =>
      typeof score === 'number' &&
      !Number.isNaN(score)
    );

  let avgSentiment: number | null = sentimentScores.length > 0
    ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
    : null;

  // Fallback: compute a per-day score from hourly forecast metrics when no news sentiment is available
  if (avgSentiment === null && data.hourlyForecast) {
    const forecast = data.hourlyForecast;
    const allEntries = [
      ...(forecast.BTC || []),
      ...(forecast.ETH || []),
      ...(forecast.SOL || []),
    ].filter(entry => entry && typeof entry.accuracy_percent === 'number');

    if (allEntries.length > 0) {
      // Use accuracy_percent (0-100) and deviation_percent to compute a day-specific score
      const avgAccuracy = allEntries.reduce((sum, e) => sum + (e.accuracy_percent ?? 0), 0) / allEntries.length;
      const avgDeviation = allEntries.reduce((sum, e) => sum + Math.abs(e.deviation_percent ?? 0), 0) / allEntries.length;
      const avgSentimentRaw = allEntries.reduce((sum, e) => sum + (e.sentiment_score ?? 2.5), 0) / allEntries.length;

      // Blend: 40% accuracy-based (0-5), 30% deviation-based (lower deviation = better), 30% raw sentiment
      const accuracyComponent = (avgAccuracy / 100) * 5; // 0-5 scale
      const deviationComponent = Math.max(0, Math.min(5, 5 - (avgDeviation / 10))); // lower deviation = higher score
      const sentimentComponent = avgSentimentRaw > 5 ? avgSentimentRaw / 20 : avgSentimentRaw;

      avgSentiment = Math.round(
        (accuracyComponent * 0.4 + deviationComponent * 0.3 + sentimentComponent * 0.3) * 10
      ) / 10;

      // Clamp to 0-5 range
      avgSentiment = Math.max(0, Math.min(5, avgSentiment));
    } else {
      // Last resort: use sentiment_score directly if no accuracy data
      const forecastScores = [
        ...(forecast.BTC || []),
        ...(forecast.ETH || []),
        ...(forecast.SOL || []),
      ]
        .map(entry => entry.sentiment_score)
        .filter((s): s is number => typeof s === 'number' && !Number.isNaN(s));

      if (forecastScores.length > 0) {
        const rawAvg = forecastScores.reduce((sum, s) => sum + s, 0) / forecastScores.length;
        avgSentiment = rawAvg > 5 ? rawAvg / 20 : rawAvg;
      }
    }
  }

  const getSentimentInfo = (score: number | null) => {
    if (score === null) {
      return {
        label: 'NEUTRAL',
        color: 'text-yellow-500',
        icon: Minus,
        bgColor: 'bg-yellow-500/10'
      };
    }
    if (score <= 1.6) return { label: 'BEARISH', color: 'text-red-500', icon: TrendingDown, bgColor: 'bg-red-500/10' };
    if (score <= 3.2) return { label: 'NEUTRAL', color: 'text-yellow-500', icon: Minus, bgColor: 'bg-yellow-500/10' };
    return { label: 'BULLISH', color: 'text-green-500', icon: TrendingUp, bgColor: 'bg-green-500/10' };
  };

  const sentimentInfo = getSentimentInfo(avgSentiment);
  const IconComponent = sentimentInfo.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`bg-[#1a2332] rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer hover:bg-[#1e2636] ${isMobile ? '' : 'text-sm'}`}
      onClick={() => onViewReport(data)}
    >
      {/* Header with date */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-gray-400`} />
          <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-300`}>{formatDate(data.fetched_date)}</span>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${sentimentInfo.bgColor}`}>
          <IconComponent className={`${isMobile ? 'w-3 h-3' : 'w-2 h-2'} ${sentimentInfo.color}`} />
          <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} font-medium ${sentimentInfo.color}`}>
            {sentimentInfo.label}
          </span>
        </div>
      </div>

      {/* News summary */}
      <div className="space-y-1">
        <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
          <span className="text-gray-400">Crypto:</span>
          <span className="text-white">{data.crypto_news.length}</span>
        </div>
        <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
          <span className="text-gray-400">Macro:</span>
          <span className="text-white">{data.macro_news.length}</span>
        </div>
        {/* Add forecast data summary */}
        {data.hourlyForecast && (
          <>
            <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
              <span className="text-gray-400">BTC Forecasts:</span>
              <span className="text-white">{data.hourlyForecast.BTC?.length || 0}</span>
            </div>
            <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
              <span className="text-gray-400">ETH Forecasts:</span>
              <span className="text-white">{data.hourlyForecast.ETH?.length || 0}</span>
            </div>
            <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
              <span className="text-gray-400">SOL Forecasts:</span>
              <span className="text-white">{data.hourlyForecast.SOL?.length || 0}</span>
            </div>
          </>
        )}
      </div>

      {/* Top news preview */}
      {allNews.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-400 mb-1`}>Top Story:</p>
          <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-white line-clamp-2 leading-tight`}>
            {allNews[0]?.title || 'No news available'}
          </p>
        </div>
      )}

      {/* Sentiment score */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-400`}>Sentiment:</span>
          <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium ${sentimentInfo.color}`}>
            {avgSentiment !== null
              ? `${avgSentiment.toFixed(1)}/5`
              : '—/5'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

interface PastPredictionsProps {
  onViewReport: (data: PastPredictionData) => void;
  isMobile?: boolean;
}

const PastPredictions: React.FC<PastPredictionsProps> = ({ onViewReport, isMobile = false }) => {
  const [pastData, setPastData] = useState<EnhancedPastPredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to process news items
  const processNewsItem = (item: any): PastNewsItem | null => {
    if (!item) {
      return null;
    }

    const baseItem = {
      news_id: item.news_id || `unknown-${Date.now()}-${Math.random()}`,
      title: item.title || 'Unknown Title',
      link: item.link || '',
      analysis: item.analysis || '',
      description: item.description || undefined
    };

    let parsed: any = {};

    if (item.analysis && typeof item.analysis === 'string') {
      const match = item.analysis.match(/```json\s*([\s\S]*?)```/);

      if (match) {
        try {
          parsed = JSON.parse(match[1]);
        } catch (e) {
          console.warn('Failed to parse analysis JSON for item:', baseItem.news_id);
        }
      }

      // Fallback: try parsing the analysis string directly as JSON
      if (Object.keys(parsed).length === 0) {
        try {
          const directParsed = JSON.parse(item.analysis);
          if (directParsed && typeof directParsed === 'object') {
            parsed = directParsed;
          }
        } catch {
          // Not valid JSON, ignore
        }
      }
    }

    // Also check for sentiment_score directly on the item (from API)
    if (parsed.sentiment_score == null && typeof item.sentiment_score === 'number') {
      parsed.sentiment_score = item.sentiment_score;
    }
    // Check common alternative key names for sentiment score
    if (parsed.sentiment_score == null) {
      const altScore = parsed.sentimentScore ?? parsed.sentiment ?? parsed.score ?? parsed.Sentiment_Score;
      if (typeof altScore === 'number' && !isNaN(altScore)) {
        parsed.sentiment_score = altScore;
      }
    }

    const normalizeSentiment = (score: number): 'bearish' | 'neutral' | 'bullish' => {
      if (typeof score !== 'number' || isNaN(score)) return 'neutral';
      if (score <= 1.6) return 'bearish';
      if (score <= 3.3) return 'neutral';
      return 'bullish';
    };

    let sentimentScore: number | undefined = undefined;
    if (typeof parsed.sentiment_score === 'number' && !isNaN(parsed.sentiment_score)) {
      // Normalize to 0-5 scale if the score appears to be on a 0-100 scale
      sentimentScore = parsed.sentiment_score > 5
        ? parsed.sentiment_score / 20
        : parsed.sentiment_score;
    }

    return {
      ...baseItem,
      sentimentScore,
      sentimentTag: sentimentScore !== undefined ? normalizeSentiment(sentimentScore) : 'neutral',
      advice: parsed.investment?.advice || 'Hold',
      reason: parsed.investment?.reason || '',
      rationale: parsed.rationale || ''
    };
  };

  useEffect(() => {
    const fetchPastPredictions = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/past-prediction");

        if (!response.ok) {
          throw new Error(`Failed to fetch past predictions: ${response.statusText}`);
        }

        const data: PastPredictionsResponse = await response.json();
        
        // Updated to use new API structure
        const { past_news_last_30_days, forecast_hourly_last_30_days } = data;

        // Check if the expected data structure exists
        if (!data) {
          throw new Error('No data received from API');
        }

        // Collect all unique dates from both news and forecast data
        const allDatesSet = new Set<string>();

        // Add dates from past_news_last_30_days
        if (Array.isArray(past_news_last_30_days)) {
          past_news_last_30_days.forEach(dayData => {
            if (dayData?.fetched_date) {
              allDatesSet.add(dayData.fetched_date);
            }
          });
        }

        // Add dates from forecast_hourly_last_30_days (extract date part from time strings)
        if (forecast_hourly_last_30_days) {
          const addForecastDates = (entries: HourlyEntry[] | undefined) => {
            entries?.forEach(entry => {
              if (entry.time) {
                const dateStr = entry.time.split('T')[0];
                allDatesSet.add(dateStr);
              }
            });
          };
          addForecastDates(forecast_hourly_last_30_days.BTC);
          addForecastDates(forecast_hourly_last_30_days.ETH);
          addForecastDates(forecast_hourly_last_30_days.SOL);
        }

        if (allDatesSet.size === 0) {
          throw new Error('No dates found in API response');
        }

        // Build a lookup map for news data by date
        const newsByDate = new Map<string, { crypto_news: any[]; macro_news: any[] }>();
        if (Array.isArray(past_news_last_30_days)) {
          past_news_last_30_days.forEach(dayData => {
            if (dayData?.fetched_date) {
              newsByDate.set(dayData.fetched_date, {
                crypto_news: dayData.crypto_news || [],
                macro_news: dayData.macro_news || []
              });
            }
          });
        }

        // Process all dates, merging news + forecast data
        const processedData = Array.from(allDatesSet).map(dateStr => {
          const newsData = newsByDate.get(dateStr);

          // Get the hourly forecast for this date if available
          let hourlyForecastForDate: { BTC: HourlyEntry[]; ETH: HourlyEntry[]; SOL: HourlyEntry[] } | undefined;

          if (forecast_hourly_last_30_days) {
            hourlyForecastForDate = {
              BTC: forecast_hourly_last_30_days.BTC?.filter(entry =>
                entry.time.startsWith(dateStr)
              ) || [],
              ETH: forecast_hourly_last_30_days.ETH?.filter(entry =>
                entry.time.startsWith(dateStr)
              ) || [],
              SOL: forecast_hourly_last_30_days.SOL?.filter(entry =>
                entry.time.startsWith(dateStr)
              ) || []
            };
          }

          const processedDayData: EnhancedPastPredictionData = {
            fetched_date: dateStr,
            crypto_news: Array.isArray(newsData?.crypto_news)
              ? newsData.crypto_news.map(item => processNewsItem(item)).filter(Boolean) as PastCryptoNews[]
              : [],
            macro_news: Array.isArray(newsData?.macro_news)
              ? newsData.macro_news.map(item => processNewsItem(item)).filter(Boolean) as PastMacroNews[]
              : [],
            hourlyForecast: hourlyForecastForDate
          };

          // Debug: log per-day score breakdown
          const newsScores = [...processedDayData.crypto_news, ...processedDayData.macro_news]
            .map(n => n.sentimentScore)
            .filter((s): s is number => typeof s === 'number');
          const forecastScoresDebug = hourlyForecastForDate
            ? [...(hourlyForecastForDate.BTC || []), ...(hourlyForecastForDate.ETH || []), ...(hourlyForecastForDate.SOL || [])]
              .map(e => e.sentiment_score)
            : [];
          console.log(`[PastPredictions] ${dateStr}: newsScores=[${newsScores.join(',')}], forecastScores=[${forecastScoresDebug.join(',')}]`);

          return processedDayData;
        });

        // Sort by date (most recent first)
        processedData.sort((a, b) => 
          new Date(b.fetched_date).getTime() - new Date(a.fetched_date).getTime()
        );

        setPastData(processedData);
      } catch (err) {
        console.error('Error fetching past predictions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchPastPredictions();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-2 text-gray-300">Loading past predictions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
        <p className="text-red-400">Error loading past predictions</p>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
        <div className="mt-3 space-y-2">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
          <p className="text-xs text-gray-500">
            If the issue persists, the API response structure may have changed
          </p>
        </div>
      </div>
    );
  }

  if (pastData.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400 mb-2">No past predictions available</p>
        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Loading...' : 'Check back later for historical reports'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!isMobile && (
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Historical Reports (30 Days)</h3>
          <span className="text-xs text-gray-400">({pastData.length})</span>
        </div>
      )}

      {isMobile && (
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Past 30 Days Reports</h3>
          <span className="text-sm text-gray-400">({pastData.length} reports)</span>
        </div>
      )}

      <div className={`
        ${isMobile
          ? 'grid grid-cols-1 gap-3'
          : 'space-y-2'
        }
      `}>
        {pastData.map((dayData, index) => (
          <PredictionCard
            key={`${dayData.fetched_date}-${index}`}
            data={dayData}
            onViewReport={onViewReport}
            isMobile={isMobile}
          />
        ))}
      </div>

      {pastData.length > 0 && (
        <div className={`text-center mt-4 p-3 bg-gray-800/30 rounded-lg ${isMobile ? '' : 'text-xs'}`}>
          <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-400`}>
            {isMobile ? `Showing ${pastData.length} past prediction reports` : `${pastData.length} reports available`}
          </p>
          {isMobile && (
            <p className="text-xs text-gray-500 mt-1">
              Click on any card to view the detailed report
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PastPredictions;