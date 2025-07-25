// import React, { useState } from 'react';

// interface HourlyForecast {
//   time: string;
//   signal: 'LONG' | 'SHORT' | 'HOLD';
//   entry_price: number | null;
//   stop_loss: number | null;
//   take_profit: number | null;
//   forecast_price: number;
//   current_price: number;
//   deviation_percent: number | string;
//   accuracy_percent: number | string;
//   risk_reward_ratio: number;
//   sentiment_score: number;
//   confidence_50: [number, number];
//   confidence_80: [number, number];
//   confidence_90: [number, number];
// }

// interface PnLData {
//   pnl: number;
//   pnlPercentage: number;
//   status: 'pending' | 'calculated';
//   predictedPrice?: number;
//   actualPrice?: number;
// }

// interface HourlyPredictionsTableProps {
//   hourlyForecast: HourlyForecast[];
//   className?: string;
// }

// const HourlyPredictionsTable: React.FC<HourlyPredictionsTableProps> = ({
//   hourlyForecast = [],
//   className = ""
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   // Function to extract time from UTC timestamp
//   const formatTime = (utcTime: string) => {
//     const date = new Date(utcTime);
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//       timeZone: 'UTC'
//     });
//   };

//   // Function to calculate PnL
//   const calculatePnL = (currentIndex: number): PnLData => {
//     if (currentIndex >= hourlyForecast.length - 1) {
//       return {
//         pnl: 0,
//         pnlPercentage: 0,
//         status: 'pending' as const,
//         predictedPrice: undefined,
//         actualPrice: undefined
//       };
//     }

//     const currentForecast = hourlyForecast[currentIndex];
//     const nextActual = hourlyForecast[currentIndex + 1];

//     if (!currentForecast || !nextActual) {
//       return {
//         pnl: 0,
//         pnlPercentage: 0,
//         status: 'pending' as const,
//         predictedPrice: undefined,
//         actualPrice: undefined
//       };
//     }

//     // PnL = Actual price (next hour) - Predicted price (current hour)
//     const pnl = nextActual.current_price - currentForecast.forecast_price;
//     const pnlPercentage = (pnl / currentForecast.forecast_price) * 100;

//     return {
//       pnl,
//       pnlPercentage,
//       status: 'calculated' as const,
//       predictedPrice: currentForecast.forecast_price,
//       actualPrice: nextActual.current_price
//     };
//   };

//   // Function to get signal color and icon
//   const getSignalDisplay = (signal: string) => {
//     switch (signal) {
//       case 'LONG':
//         return {
//           color: 'text-green-400',
//           bgColor: 'bg-green-400/20',
//           icon: '↗',
//           text: 'LONG'
//         };
//       case 'SHORT':
//         return {
//           color: 'text-red-400',
//           bgColor: 'bg-red-400/20',
//           icon: '↘',
//           text: 'SHORT'
//         };
//       case 'HOLD':
//         return {
//           color: 'text-yellow-400',
//           bgColor: 'bg-yellow-400/20',
//           icon: '→',
//           text: 'HOLD'
//         };
//       default:
//         return {
//           color: 'text-gray-400',
//           bgColor: 'bg-gray-400/20',
//           icon: '?',
//           text: 'N/A'
//         };
//     }
//   };

//   // Function to get PnL color
//   const getPnLColor = (pnlPercentage: number) => {
//     if (pnlPercentage > 0) return 'text-green-400';
//     if (pnlPercentage < 0) return 'text-red-400';
//     return 'text-gray-400';
//   };

//   // Compact table for the sidebar
//   const CompactTable = () => (
//     <div className="h-80 overflow-y-auto">
//       <div className="space-y-2">
//         {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
//           // Calculate original index for PnL calculation
//           const originalIndex = hourlyForecast.length - 1 - reverseIndex;
//           const signalDisplay = getSignalDisplay(forecast.signal);
//           const pnlData = calculatePnL(originalIndex);

//           return (
//             <div key={forecast.time} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
//               <div className="flex items-center space-x-3">
//                 <div className="font-mono text-sm text-white font-medium min-w-[45px]">
//                   {formatTime(forecast.time)}
//                 </div>
//                 <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color} min-w-[55px] justify-center`}>
//                   <span>{signalDisplay.icon}</span>
//                   <span>{signalDisplay.text}</span>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <div className="font-mono text-sm text-white">
//                   ${forecast.forecast_price.toLocaleString(undefined, {
//                     minimumFractionDigits: 0,
//                     maximumFractionDigits: 0
//                   })}
//                 </div>
//                 {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                   <div className={`font-mono text-xs font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
//                     {pnlData.pnlPercentage >= 0 ? '+' : ''}
//                     {pnlData.pnlPercentage.toFixed(2)}%
//                   </div>
//                 ) : (
//                   <div className="text-gray-400 text-xs">Pending</div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );

//   // Full table for the popup
//   const FullTable = () => (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="border-b border-gray-600">
//             <th className="text-left py-3 px-4 text-gray-400 font-medium">TIME</th>
//             <th className="text-left py-3 px-4 text-gray-400 font-medium">SIGNAL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PREDICTED</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">ACTUAL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL %</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">ACCURACY</th>
//           </tr>
//         </thead>
//         <tbody>
//           {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
//             // Calculate original index for PnL calculation
//             const originalIndex = hourlyForecast.length - 1 - reverseIndex;
//             const signalDisplay = getSignalDisplay(forecast.signal);
//             const pnlData = calculatePnL(originalIndex);

//             return (
//               <tr key={forecast.time} className="border-b border-gray-700/50 hover:bg-gray-800/30">
//                 <td className="py-3 px-4">
//                   <div className="font-mono text-white font-medium">
//                     {formatTime(forecast.time)}
//                   </div>
//                 </td>

//                 <td className="py-3 px-4">
//                   <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color}`}>
//                     <span>{signalDisplay.icon}</span>
//                     <span>{signalDisplay.text}</span>
//                   </div>
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   <div className="font-mono text-white">
//                     ${forecast.forecast_price.toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2
//                     })}
//                   </div>
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                     <div className="font-mono text-white">
//                       ${pnlData.actualPrice.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2
//                       })}
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">Pending</div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                     <div className={`font-mono font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
//                       {pnlData.pnl >= 0 ? '+' : ''}
//                       ${pnlData.pnl.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2
//                       })}
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">-</div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                     <div className={`font-mono font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
//                       {pnlData.pnlPercentage >= 0 ? '+' : ''}
//                       {pnlData.pnlPercentage.toFixed(3)}%
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">-</div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   <div className="text-white">
//                     {forecast.accuracy_percent && forecast.accuracy_percent !== 'N/A'
//                       ? `${forecast.accuracy_percent}%`
//                       : 'N/A'}
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );

//   if (hourlyForecast.length === 0) {
//     return (
//       <div className={`bg-[#1a2332] rounded-lg p-4 ${className}`}>
//         <h3 className="font-bold mb-4 flex items-center space-x-2">
//           <span className="text-lg">⏰</span>
//           <span>HOURLY PREDICTIONS</span>
//         </h3>
//         <div className="text-center text-gray-400 py-8">
//           <div className="text-4xl mb-2">📊</div>
//           <p>No hourly predictions available</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className={`bg-[#1a2332] rounded-lg p-4 relative ${className}`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-bold flex items-center space-x-2">
//             <span className="text-lg">⏰</span>
//             <span>HOURLY PREDICTIONS</span>
//           </h3>

//           {/* Expand Button */}
//           <button
//             onClick={() => setIsExpanded(true)}
//             className="text-gray-400 hover:text-white transition-colors p-1 rounded"
//             title="Expand table"
//           >
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//               <path d="M1 1h6v2H3v4H1V1zm8 0h6v6h-2V3h-4V1zM3 9v4h4v2H1V9h2zm12 0v6H9v-2h4V9h2z" />
//             </svg>
//           </button>
//         </div>

//         <CompactTable />

//         {/* Summary Stats */}
//         <div className="mt-4 pt-3 border-t border-gray-600">
//           <div className="flex justify-between items-center text-xs">
//             <span className="text-gray-400">
//               Total: {hourlyForecast.length}
//             </span>
//             <span className="text-gray-400">
//               Completed: {hourlyForecast.length - 1}/{hourlyForecast.length}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Expanded Modal */}
//       {isExpanded && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-[#0a1628] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-700">
//               <h2 className="text-xl font-bold flex items-center space-x-2">
//                 <span className="text-lg">⏰</span>
//                 <span>HOURLY PREDICTIONS - DETAILED VIEW</span>
//               </h2>
//               <button
//                 onClick={() => setIsExpanded(false)}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
//                 </svg>
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//               <FullTable />

//               {/* Enhanced Summary Stats */}
//               <div className="mt-6 pt-4 border-t border-gray-600">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                   <div className="text-center">
//                     <div className="text-gray-400">Total Predictions</div>
//                     <div className="text-white font-bold text-lg">{hourlyForecast.length}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Completed</div>
//                     <div className="text-white font-bold text-lg">{hourlyForecast.length - 1}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Avg PnL%</div>
//                     <div className="text-white font-bold text-lg">
//                       {(() => {
//                         const validPnLs = hourlyForecast.slice(0, -1).map((_, index) => calculatePnL(index))
//                           .filter(p => p.status === 'calculated');
//                         if (validPnLs.length === 0) return 'N/A';
//                         const avgPnL = validPnLs.reduce((sum, p) => sum + p.pnlPercentage, 0) / validPnLs.length;
//                         return `${avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(2)}%`;
//                       })()}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Success Rate</div>
//                     <div className="text-white font-bold text-lg">
//                       {(() => {
//                         const validPnLs = hourlyForecast.slice(0, -1).map((_, index) => calculatePnL(index))
//                           .filter(p => p.status === 'calculated');
//                         if (validPnLs.length === 0) return 'N/A';
//                         const successCount = validPnLs.filter(p => p.pnlPercentage >= 0).length;
//                         return `${((successCount / validPnLs.length) * 100).toFixed(1)}%`;
//                       })()}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default HourlyPredictionsTable;

// import React, { useState } from 'react';

// interface HourlyForecast {
//   time: string;
//   signal: 'LONG' | 'SHORT' | 'HOLD';
//   entry_price: number | null;
//   stop_loss: number | null;
//   take_profit: number | null;
//   forecast_price: number;
//   current_price: number;
//   deviation_percent: number | string;
//   accuracy_percent: number | string;
//   risk_reward_ratio: number;
//   sentiment_score: number;
//   confidence_50: [number, number];
//   confidence_80: [number, number];
//   confidence_90: [number, number];
// }

// interface PnLData {
//   pnl: number;
//   pnlPercentage: number;
//   status: 'pending' | 'calculated';
//   predictedPrice?: number;
//   actualPrice?: number;
// }

// interface HourlyPredictionsTableProps {
//   hourlyForecast: HourlyForecast[];
//   className?: string;
// }

// const HourlyPredictionsTable: React.FC<HourlyPredictionsTableProps> = ({
//   hourlyForecast = [],
//   className = ""
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   // Function to extract time from UTC timestamp
//   const formatTime = (utcTime: string) => {
//     const date = new Date(utcTime);
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//       timeZone: 'UTC'
//     });
//   };

//   // Function to calculate PnL
//   const calculatePnL = (currentIndex: number): PnLData => {
//     if (currentIndex >= hourlyForecast.length - 1) {
//       return {
//         pnl: 0,
//         pnlPercentage: 0,
//         status: 'pending' as const,
//         predictedPrice: undefined,
//         actualPrice: undefined
//       };
//     }

//     const currentForecast = hourlyForecast[currentIndex];
//     const nextActual = hourlyForecast[currentIndex + 1];

//     if (!currentForecast || !nextActual) {
//       return {
//         pnl: 0,
//         pnlPercentage: 0,
//         status: 'pending' as const,
//         predictedPrice: undefined,
//         actualPrice: undefined
//       };
//     }

//     // PnL = Actual price (next hour) - Predicted price (current hour)
//     const pnl = nextActual.current_price - currentForecast.forecast_price;
//     const pnlPercentage = (pnl / currentForecast.forecast_price) * 100;

//     return {
//       pnl,
//       pnlPercentage,
//       status: 'calculated' as const,
//       predictedPrice: currentForecast.forecast_price,
//       actualPrice: nextActual.current_price
//     };
//   };

//   // Function to get signal color and icon
//   const getSignalDisplay = (signal: string) => {
//     switch (signal) {
//       case 'LONG':
//         return {
//           color: 'text-green-400',
//           bgColor: 'bg-green-400/20',
//           icon: '↗',
//           text: 'LONG'
//         };
//       case 'SHORT':
//         return {
//           color: 'text-red-400',
//           bgColor: 'bg-red-400/20',
//           icon: '↘',
//           text: 'SHORT'
//         };
//       case 'HOLD':
//         return {
//           color: 'text-yellow-400',
//           bgColor: 'bg-yellow-400/20',
//           icon: '→',
//           text: 'HOLD'
//         };
//       default:
//         return {
//           color: 'text-gray-400',
//           bgColor: 'bg-gray-400/20',
//           icon: '?',
//           text: 'N/A'
//         };
//     }
//   };

//   // Function to get PnL color
//   const getPnLColor = (pnlPercentage: number) => {
//     if (pnlPercentage > 0) return 'text-green-400';
//     if (pnlPercentage < 0) return 'text-red-400';
//     return 'text-gray-400';
//   };

//   // Compact table for the sidebar
//   const CompactTable = () => (
//     <div className="max-h-[500px] overflow-y-scroll">
//       <div className="space-y-2">
//         {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
//           // Calculate original index for PnL calculation
//           const originalIndex = hourlyForecast.length - 1 - reverseIndex;
//           const signalDisplay = getSignalDisplay(forecast.signal);
//           const pnlData = calculatePnL(originalIndex);

//           return (
//             <div key={forecast.time} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
//               <div className="flex items-center space-x-3">
//                 <div className="font-mono text-sm text-white font-medium min-w-[45px]">
//                   {formatTime(forecast.time)}
//                 </div>
//                 <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color} min-w-[55px] justify-center`}>
//                   <span>{signalDisplay.icon}</span>
//                   <span>{signalDisplay.text}</span>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <div className="font-mono text-sm text-white">
//                   ${forecast.forecast_price.toLocaleString(undefined, {
//                     minimumFractionDigits: 0,
//                     maximumFractionDigits: 0
//                   })}
//                 </div>
//                 {/* Hide PnL for HOLD signals */}
//                 {forecast.signal !== 'HOLD' && (
//                   <>
//                     {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                       <div className={`font-mono text-xs font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
//                         {pnlData.pnlPercentage >= 0 ? '+' : ''}
//                         {pnlData.pnlPercentage.toFixed(2)}%
//                       </div>
//                     ) : (
//                       <div className="text-gray-400 text-xs">Pending</div>
//                     )}
//                   </>
//                 )}
//                 {forecast.signal === 'HOLD' && (
//                   <div className="text-gray-400 text-xs">-</div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );

//   // Full table for the popup
//   const FullTable = () => (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="border-b border-gray-600">
//             <th className="text-left py-3 px-4 text-gray-400 font-medium">TIME</th>
//             <th className="text-left py-3 px-4 text-gray-400 font-medium">SIGNAL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PREDICTED</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">ACTUAL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL %</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">ACCURACY</th>
//           </tr>
//         </thead>
//         <tbody>
//           {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
//             // Calculate original index for PnL calculation
//             const originalIndex = hourlyForecast.length - 1 - reverseIndex;
//             const signalDisplay = getSignalDisplay(forecast.signal);
//             const pnlData = calculatePnL(originalIndex);

//             return (
//               <tr key={forecast.time} className="border-b border-gray-700/50 hover:bg-gray-800/30">
//                 <td className="py-3 px-4">
//                   <div className="font-mono text-white font-medium">
//                     {formatTime(forecast.time)}
//                   </div>
//                 </td>

//                 <td className="py-3 px-4">
//                   <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color}`}>
//                     <span>{signalDisplay.icon}</span>
//                     <span>{signalDisplay.text}</span>
//                   </div>
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   <div className="font-mono text-white">
//                     ${forecast.forecast_price.toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2
//                     })}
//                   </div>
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                     <div className="font-mono text-white">
//                       ${pnlData.actualPrice.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2
//                       })}
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">Pending</div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {/* Hide PnL for HOLD signals */}
//                   {forecast.signal !== 'HOLD' && (
//                     <>
//                       {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                         <div className={`font-mono font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
//                           {pnlData.pnl >= 0 ? '+' : ''}
//                           ${pnlData.pnl.toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2
//                           })}
//                         </div>
//                       ) : (
//                         <div className="text-gray-400 text-xs">-</div>
//                       )}
//                     </>
//                   )}
//                   {forecast.signal === 'HOLD' && (
//                     <div className="text-gray-400 text-xs">-</div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {/* Hide PnL % for HOLD signals */}
//                   {forecast.signal !== 'HOLD' && (
//                     <>
//                       {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                         <div className={`font-mono font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
//                           {pnlData.pnlPercentage >= 0 ? '+' : ''}
//                           {pnlData.pnlPercentage.toFixed(3)}%
//                         </div>
//                       ) : (
//                         <div className="text-gray-400 text-xs">-</div>
//                       )}
//                     </>
//                   )}
//                   {forecast.signal === 'HOLD' && (
//                     <div className="text-gray-400 text-xs">-</div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   <div className="text-white">
//                     {forecast.accuracy_percent && forecast.accuracy_percent !== 'N/A'
//                       ? `${forecast.accuracy_percent}%`
//                       : 'N/A'}
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );

//   if (hourlyForecast.length === 0) {
//     return (
//       <div className={`bg-[#1a2332] rounded-lg p-4 ${className}`}>
//         <h3 className="font-bold mb-4 flex items-center space-x-2">
//           <span className="text-lg">⏰</span>
//           <span>HOURLY PREDICTIONS</span>
//         </h3>
//         <div className="text-center text-gray-400 py-8">
//           <div className="text-4xl mb-2">📊</div>
//           <p>No hourly predictions available</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className={`bg-[#1a2332] rounded-lg p-4 relative ${className}`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-bold flex items-center space-x-2">
//             <span className="text-lg">⏰</span>
//             <span>HOURLY PREDICTIONS</span>
//           </h3>

//           {/* Expand Button */}
//           <button
//             onClick={() => setIsExpanded(true)}
//             className="text-gray-400 hover:text-white transition-colors p-1 rounded"
//             title="Expand table"
//           >
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//               <path d="M1 1h6v2H3v4H1V1zm8 0h6v6h-2V3h-4V1zM3 9v4h4v2H1V9h2zm12 0v6H9v-2h4V9h2z" />
//             </svg>
//           </button>
//         </div>

//         <CompactTable />

//         {/* Summary Stats */}
//         <div className="mt-4 pt-3 border-t border-gray-600">
//           <div className="flex justify-between items-center text-xs">
//             <span className="text-gray-400">
//               Total: {hourlyForecast.length}
//             </span>
//             <span className="text-gray-400">
//               Completed: {hourlyForecast.length - 1}/{hourlyForecast.length}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Expanded Modal */}
//       {isExpanded && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-[#0a1628] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-700">
//               <h2 className="text-xl font-bold flex items-center space-x-2">
//                 <span className="text-lg">⏰</span>
//                 <span>HOURLY PREDICTIONS - DETAILED VIEW</span>
//               </h2>
//               <button
//                 onClick={() => setIsExpanded(false)}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
//                 </svg>
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//               <FullTable />

//               {/* Enhanced Summary Stats */}
//               <div className="mt-6 pt-4 border-t border-gray-600">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                   <div className="text-center">
//                     <div className="text-gray-400">Total Predictions</div>
//                     <div className="text-white font-bold text-lg">{hourlyForecast.length}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Completed</div>
//                     <div className="text-white font-bold text-lg">{hourlyForecast.length - 1}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Avg PnL%</div>
//                     <div className="text-white font-bold text-lg">
//                       {(() => {
//                         // Only calculate PnL for non-HOLD signals
//                         const validPnLs = hourlyForecast.slice(0, -1)
//                           .filter(forecast => forecast.signal !== 'HOLD')
//                           .map((_, index) => calculatePnL(index))
//                           .filter(p => p.status === 'calculated');
//                         if (validPnLs.length === 0) return 'N/A';
//                         const avgPnL = validPnLs.reduce((sum, p) => sum + p.pnlPercentage, 0) / validPnLs.length;
//                         return `${avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(2)}%`;
//                       })()}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Success Rate</div>
//                     <div className="text-white font-bold text-lg">
//                       {(() => {
//                         // Only calculate success rate for non-HOLD signals
//                         const validPnLs = hourlyForecast.slice(0, -1)
//                           .filter(forecast => forecast.signal !== 'HOLD')
//                           .map((_, index) => calculatePnL(index))
//                           .filter(p => p.status === 'calculated');
//                         if (validPnLs.length === 0) return 'N/A';
//                         const successCount = validPnLs.filter(p => p.pnlPercentage >= 0).length;
//                         return `${((successCount / validPnLs.length) * 100).toFixed(1)}%`;
//                       })()}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default HourlyPredictionsTable;

// import React, { useState } from 'react';

// interface HourlyForecast {
//   time: string;
//   signal: 'LONG' | 'SHORT' | 'HOLD';
//   entry_price: number | null;
//   stop_loss: number | null;
//   take_profit: number | null;
//   forecast_price: number;
//   current_price: number;
//   deviation_percent: number | string;
//   accuracy_percent: number | string;
//   risk_reward_ratio: number;
//   sentiment_score: number;
//   confidence_50: [number, number];
//   confidence_80: [number, number];
//   confidence_90: [number, number];
// }

// interface TradePnLData {
//   entryPrice: number;
//   exitPrice: number;
//   pnl: number;
//   pnlPercentage: number;
//   exitReason: 'next_hour' | 'take_profit' | 'stop_loss';
//   status: 'pending' | 'calculated';
// }

// interface HourlyPredictionsTableProps {
//   hourlyForecast: HourlyForecast[];
//   className?: string;
// }

// const HourlyPredictionsTable: React.FC<HourlyPredictionsTableProps> = ({
//   hourlyForecast = [],
//   className = ""
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   // Function to extract time from UTC timestamp
//   const formatTime = (utcTime: string) => {
//     const date = new Date(utcTime);
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//       timeZone: 'UTC'
//     });
//   };

//   // Enhanced PnL calculation based on actual trading logic
//   const calculateTradePnL = (currentIndex: number): TradePnLData => {
//     if (currentIndex >= hourlyForecast.length - 1) {
//       return {
//         entryPrice: 0,
//         exitPrice: 0,
//         pnl: 0,
//         pnlPercentage: 0,
//         exitReason: 'next_hour',
//         status: 'pending' as const
//       };
//     }

//     const currentForecast = hourlyForecast[currentIndex];
//     const nextForecast = hourlyForecast[currentIndex + 1];

//     if (!currentForecast || !nextForecast || 
//         currentForecast.signal === 'HOLD' || 
//         !currentForecast.entry_price) {
//       return {
//         entryPrice: 0,
//         exitPrice: 0,
//         pnl: 0,
//         pnlPercentage: 0,
//         exitReason: 'next_hour',
//         status: 'pending' as const
//       };
//     }

//     const entryPrice = currentForecast.entry_price;
//     const stopLoss = currentForecast.stop_loss;
//     const takeProfit = currentForecast.take_profit;
//     const nextPrice = nextForecast.current_price;

//     let exitPrice = nextPrice;
//     let exitReason: 'next_hour' | 'take_profit' | 'stop_loss' = 'next_hour';

//     // Determine exit price based on which level was hit first
//     if (currentForecast.signal === 'LONG') {
//       if (stopLoss && nextPrice <= stopLoss) {
//         exitPrice = stopLoss;
//         exitReason = 'stop_loss';
//       } else if (takeProfit && nextPrice >= takeProfit) {
//         exitPrice = takeProfit;
//         exitReason = 'take_profit';
//       }
//     } else if (currentForecast.signal === 'SHORT') {
//       if (stopLoss && nextPrice >= stopLoss) {
//         exitPrice = stopLoss;
//         exitReason = 'stop_loss';
//       } else if (takeProfit && nextPrice <= takeProfit) {
//         exitPrice = takeProfit;
//         exitReason = 'take_profit';
//       }
//     }

//     // Calculate PnL based on position type
//     let pnl = 0;
//     if (currentForecast.signal === 'LONG') {
//       pnl = exitPrice - entryPrice;
//     } else if (currentForecast.signal === 'SHORT') {
//       pnl = entryPrice - exitPrice;
//     }

//     const pnlPercentage = (pnl / entryPrice) * 100;

//     return {
//       entryPrice,
//       exitPrice,
//       pnl,
//       pnlPercentage,
//       exitReason,
//       status: 'calculated' as const
//     };
//   };

//   // Function to get signal color and icon
//   const getSignalDisplay = (signal: string) => {
//     switch (signal) {
//       case 'LONG':
//         return {
//           color: 'text-green-400',
//           bgColor: 'bg-green-400/20',
//           icon: '↗',
//           text: 'LONG'
//         };
//       case 'SHORT':
//         return {
//           color: 'text-red-400',
//           bgColor: 'bg-red-400/20',
//           icon: '↘',
//           text: 'SHORT'
//         };
//       case 'HOLD':
//         return {
//           color: 'text-yellow-400',
//           bgColor: 'bg-yellow-400/20',
//           icon: '→',
//           text: 'HOLD'
//         };
//       default:
//         return {
//           color: 'text-gray-400',
//           bgColor: 'bg-gray-400/20',
//           icon: '?',
//           text: 'N/A'
//         };
//     }
//   };

//   // Function to get PnL color
//   const getPnLColor = (pnlPercentage: number) => {
//     if (pnlPercentage > 0) return 'text-green-400';
//     if (pnlPercentage < 0) return 'text-red-400';
//     return 'text-gray-400';
//   };

//   // Compact table for the sidebar
//   const CompactTable = () => (
//     <div className="max-h-[500px] overflow-y-scroll">
//       <div className="space-y-2">
//         {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
//           // Calculate original index for PnL calculation
//           const originalIndex = hourlyForecast.length - 1 - reverseIndex;
//           const signalDisplay = getSignalDisplay(forecast.signal);
//           const tradePnL = calculateTradePnL(originalIndex);

//           return (
//             <div key={forecast.time} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
//               <div className="flex items-center space-x-3">
//                 <div className="font-mono text-sm text-white font-medium min-w-[45px]">
//                   {formatTime(forecast.time)}
//                 </div>
//                 <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color} min-w-[55px] justify-center`}>
//                   <span>{signalDisplay.icon}</span>
//                   <span>{signalDisplay.text}</span>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <div className="font-mono text-sm text-white">
//                   Entry: ${forecast.entry_price?.toLocaleString() || 'N/A'}
//                 </div>
//                 {/* Show trading PnL instead of forecast accuracy */}
//                 {forecast.signal !== 'HOLD' && (
//                   <>
//                     {tradePnL.status === 'calculated' ? (
//                       <div className={`font-mono text-xs font-medium ${getPnLColor(tradePnL.pnlPercentage)}`}>
//                         {tradePnL.pnlPercentage >= 0 ? '+' : ''}
//                         {tradePnL.pnlPercentage.toFixed(2)}% 
//                         <span className="ml-1 text-gray-400">
//                           ({tradePnL.exitReason === 'take_profit' ? 'TP' : 
//                             tradePnL.exitReason === 'stop_loss' ? 'SL' : 'NH'})
//                         </span>
//                       </div>
//                     ) : (
//                       <div className="text-gray-400 text-xs">Pending</div>
//                     )}
//                   </>
//                 )}
//                 {forecast.signal === 'HOLD' && (
//                   <div className="text-gray-400 text-xs">-</div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );

//   // Full table for the popup
//   const FullTable = () => (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="border-b border-gray-600">
//             <th className="text-left py-3 px-4 text-gray-400 font-medium">TIME</th>
//             <th className="text-left py-3 px-4 text-gray-400 font-medium">SIGNAL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">ENTRY</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">EXIT</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">EXIT REASON</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL %</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">R:R</th>
//           </tr>
//         </thead>
//         <tbody>
//           {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
//             // Calculate original index for PnL calculation
//             const originalIndex = hourlyForecast.length - 1 - reverseIndex;
//             const signalDisplay = getSignalDisplay(forecast.signal);
//             const tradePnL = calculateTradePnL(originalIndex);

//             return (
//               <tr key={forecast.time} className="border-b border-gray-700/50 hover:bg-gray-800/30">
//                 <td className="py-3 px-4">
//                   <div className="font-mono text-white font-medium">
//                     {formatTime(forecast.time)}
//                   </div>
//                 </td>

//                 <td className="py-3 px-4">
//                   <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color}`}>
//                     <span>{signalDisplay.icon}</span>
//                     <span>{signalDisplay.text}</span>
//                   </div>
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   <div className="font-mono text-white">
//                     {forecast.entry_price ? 
//                       `$${forecast.entry_price.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2
//                       })}` : 'N/A'
//                     }
//                   </div>
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
//                     <div className="font-mono text-white">
//                       ${tradePnL.exitPrice.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2
//                       })}
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">
//                       {forecast.signal === 'HOLD' ? '-' : 'Pending'}
//                     </div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
//                     <div className={`text-xs font-medium ${
//                       tradePnL.exitReason === 'take_profit' ? 'text-green-400' :
//                       tradePnL.exitReason === 'stop_loss' ? 'text-red-400' : 'text-blue-400'
//                     }`}>
//                       {tradePnL.exitReason === 'take_profit' ? 'Take Profit' :
//                        tradePnL.exitReason === 'stop_loss' ? 'Stop Loss' : 'Next Hour'}
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">
//                       {forecast.signal === 'HOLD' ? '-' : 'Pending'}
//                     </div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
//                     <div className={`font-mono font-medium ${getPnLColor(tradePnL.pnlPercentage)}`}>
//                       {tradePnL.pnl >= 0 ? '+' : ''}
//                       ${tradePnL.pnl.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2
//                       })}
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">
//                       {forecast.signal === 'HOLD' ? '-' : 'Pending'}
//                     </div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
//                     <div className={`font-mono font-medium ${getPnLColor(tradePnL.pnlPercentage)}`}>
//                       {tradePnL.pnlPercentage >= 0 ? '+' : ''}
//                       {tradePnL.pnlPercentage.toFixed(3)}%
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">
//                       {forecast.signal === 'HOLD' ? '-' : 'Pending'}
//                     </div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   <div className="text-white">
//                     {forecast.risk_reward_ratio ? `1:${forecast.risk_reward_ratio.toFixed(2)}` : 'N/A'}
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );

//   if (hourlyForecast.length === 0) {
//     return (
//       <div className={`bg-[#1a2332] rounded-lg p-4 ${className}`}>
//         <h3 className="font-bold mb-4 flex items-center space-x-2">
//           <span className="text-lg">⏰</span>
//           <span>HOURLY PREDICTIONS</span>
//         </h3>
//         <div className="text-center text-gray-400 py-8">
//           <div className="text-4xl mb-2">📊</div>
//           <p>No hourly predictions available</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className={`bg-[#1a2332] rounded-lg p-4 relative ${className}`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-bold flex items-center space-x-2">
//             <span className="text-lg">📈</span>
//             <span>TRADING PERFORMANCE</span>
//           </h3>

//           {/* Expand Button */}
//           <button
//             onClick={() => setIsExpanded(true)}
//             className="text-gray-400 hover:text-white transition-colors p-1 rounded"
//             title="Expand table"
//           >
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//               <path d="M1 1h6v2H3v4H1V1zm8 0h6v6h-2V3h-4V1zM3 9v4h4v2H1V9h2zm12 0v6H9v-2h4V9h2z" />
//             </svg>
//           </button>
//         </div>

//         <CompactTable />

//         {/* Enhanced Summary Stats with Trading Metrics */}
//         <div className="mt-4 pt-3 border-t border-gray-600">
//           <div className="grid grid-cols-3 gap-4 text-xs">
//             <div className="text-center">
//               <div className="text-gray-400">Total Trades</div>
//               <div className="text-white font-bold text-lg">
//                 {hourlyForecast.filter(h => h.signal !== 'HOLD').length}
//               </div>
//             </div>
//             <div className="text-center">
//               <div className="text-gray-400">Win Rate</div>
//               <div className="text-green-400 font-bold text-lg">
//                 {(() => {
//                   const trades = hourlyForecast.slice(0, -1)
//                     .filter(h => h.signal !== 'HOLD')
//                     .map((_, i) => calculateTradePnL(i))
//                     .filter(t => t.status === 'calculated');
//                   if (trades.length === 0) return 'N/A';
//                   const wins = trades.filter(t => t.pnl > 0).length;
//                   return `${((wins / trades.length) * 100).toFixed(1)}%`;
//                 })()}
//               </div>
//             </div>
//             <div className="text-center">
//               <div className="text-gray-400">Avg PnL</div>
//               <div className="text-blue-400 font-bold text-lg">
//                 {(() => {
//                   const trades = hourlyForecast.slice(0, -1)
//                     .filter(h => h.signal !== 'HOLD')
//                     .map((_, i) => calculateTradePnL(i))
//                     .filter(t => t.status === 'calculated');
//                   if (trades.length === 0) return 'N/A';
//                   const avgPnL = trades.reduce((sum, t) => sum + t.pnlPercentage, 0) / trades.length;
//                   return `${avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(2)}%`;
//                 })()}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Expanded Modal */}
//       {isExpanded && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-[#0a1628] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-700">
//               <h2 className="text-xl font-bold flex items-center space-x-2">
//                 <span className="text-lg">📈</span>
//                 <span>TRADING PERFORMANCE - DETAILED VIEW</span>
//               </h2>
//               <button
//                 onClick={() => setIsExpanded(false)}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
//                 </svg>
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//               <FullTable />

//               {/* Enhanced Summary Stats for Modal */}
//               <div className="mt-6 pt-4 border-t border-gray-600">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                   <div className="text-center">
//                     <div className="text-gray-400">Total Signals</div>
//                     <div className="text-white font-bold text-lg">{hourlyForecast.length}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Active Trades</div>
//                     <div className="text-blue-400 font-bold text-lg">
//                       {hourlyForecast.filter(h => h.signal !== 'HOLD').length}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Profitable Trades</div>
//                     <div className="text-green-400 font-bold text-lg">
//                       {(() => {
//                         const trades = hourlyForecast.slice(0, -1)
//                           .filter(h => h.signal !== 'HOLD')
//                           .map((_, i) => calculateTradePnL(i))
//                           .filter(t => t.status === 'calculated');
//                         return trades.filter(t => t.pnl > 0).length;
//                       })()}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Total PnL</div>
//                     <div className="text-white font-bold text-lg">
//                       {(() => {
//                         const trades = hourlyForecast.slice(0, -1)
//                           .filter(h => h.signal !== 'HOLD')
//                           .map((_, i) => calculateTradePnL(i))
//                           .filter(t => t.status === 'calculated');
//                         if (trades.length === 0) return 'N/A';
//                         const totalPnL = trades.reduce((sum, t) => sum + t.pnlPercentage, 0);
//                         return `${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}%`;
//                       })()}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default HourlyPredictionsTable;

import React, { useState } from 'react';

interface HourlyForecast {
  time: string;
  signal: 'LONG' | 'SHORT' | 'HOLD';
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  forecast_price: number;
  current_price: number;
  deviation_percent: number | string;
  accuracy_percent: number | string;
  risk_reward_ratio: number;
  sentiment_score: number;
  confidence_50: [number, number];
  confidence_80: [number, number];
  confidence_90: [number, number];
}

interface TradePnLData {
  entryPrice: number;
  entryTime: string;
  exitPrice: number;
  exitTime: string;
  exactHitTime: string; // Exact UTC time when TP/SL was hit
  pnl: number;
  pnlPercentage: number;
  exitReason: 'next_hour' | 'take_profit' | 'stop_loss';
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  status: 'pending' | 'calculated';
}

interface HourlyPredictionsTableProps {
  hourlyForecast: HourlyForecast[];
  className?: string;
}

const HourlyPredictionsTable: React.FC<HourlyPredictionsTableProps> = ({
  hourlyForecast = [],
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to extract time from UTC timestamp with seconds
  const formatTimeWithSeconds = (utcTime: string) => {
    const date = new Date(utcTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  // Function to extract time from UTC timestamp
  const formatTime = (utcTime: string) => {
    const date = new Date(utcTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  // Function to calculate exact hit time for TP/SL
  const calculateExactHitTime = (entryTime: string, exitTime: string, exitReason: string): string => {
    if (exitReason === 'next_hour') {
      return exitTime; // For next hour, it's the scheduled close time
    }

    // ⚠️ REAL IMPLEMENTATION NOTE:
    // In production, this exact timestamp comes from Binance WebSocket data
    // when the price actually crosses your TP/SL levels
    // This is simulated data for demonstration purposes

    const entry = new Date(entryTime);
    const exit = new Date(exitTime);

    // Simulate realistic hit times within the trading hour
    const hourDurationMs = exit.getTime() - entry.getTime();

    // TP typically hits faster (25-75% through the hour)
    // SL can hit anytime (10-90% through the hour)
    let hitPercentage: number;
    if (exitReason === 'take_profit') {
      hitPercentage = 0.25 + Math.random() * 0.5; // 25-75%
    } else {
      hitPercentage = 0.1 + Math.random() * 0.8; // 10-90%
    }

    const hitTimeMs = entry.getTime() + (hourDurationMs * hitPercentage);
    return new Date(hitTimeMs).toISOString();
  };

  // Function to determine Time in Force based on exit reason
  const getTimeInForce = (exitReason: string): 'GTC' | 'IOC' | 'FOK' => {
    // In most cases, hourly trades use GTC (Good Till Cancel)
    // IOC would be for immediate fills, FOK for all-or-nothing fills
    switch (exitReason) {
      case 'take_profit':
      case 'stop_loss':
        return 'GTC'; // Most TP/SL orders are GTC
      case 'next_hour':
        return 'GTC'; // Held for full hour
      default:
        return 'GTC';
    }
  };

  // Enhanced PnL calculation with exact hit times
  const calculateTradePnL = (currentIndex: number): TradePnLData => {
    if (currentIndex >= hourlyForecast.length - 1) {
      return {
        entryPrice: 0,
        entryTime: '',
        exitPrice: 0,
        exitTime: '',
        exactHitTime: '',
        pnl: 0,
        pnlPercentage: 0,
        exitReason: 'next_hour',
        timeInForce: 'GTC',
        status: 'pending' as const
      };
    }

    const currentForecast = hourlyForecast[currentIndex];
    const nextForecast = hourlyForecast[currentIndex + 1];

    if (!currentForecast || !nextForecast ||
      currentForecast.signal === 'HOLD' ||
      !currentForecast.entry_price) {
      return {
        entryPrice: 0,
        entryTime: '',
        exitPrice: 0,
        exitTime: '',
        exactHitTime: '',
        pnl: 0,
        pnlPercentage: 0,
        exitReason: 'next_hour',
        timeInForce: 'GTC',
        status: 'pending' as const
      };
    }

    const entryPrice = currentForecast.entry_price;
    const entryTime = currentForecast.time;
    const stopLoss = currentForecast.stop_loss;
    const takeProfit = currentForecast.take_profit;
    const nextPrice = nextForecast.current_price;
    const exitTime = nextForecast.time;

    let exitPrice = nextPrice;
    let exitReason: 'next_hour' | 'take_profit' | 'stop_loss' = 'next_hour';

    // Determine exit price based on which level was hit first
    if (currentForecast.signal === 'LONG') {
      if (stopLoss && nextPrice <= stopLoss) {
        exitPrice = stopLoss;
        exitReason = 'stop_loss';
      } else if (takeProfit && nextPrice >= takeProfit) {
        exitPrice = takeProfit;
        exitReason = 'take_profit';
      }
    } else if (currentForecast.signal === 'SHORT') {
      if (stopLoss && nextPrice >= stopLoss) {
        exitPrice = stopLoss;
        exitReason = 'stop_loss';
      } else if (takeProfit && nextPrice <= takeProfit) {
        exitPrice = takeProfit;
        exitReason = 'take_profit';
      }
    }

    // Calculate PnL based on position type
    let pnl = 0;
    if (currentForecast.signal === 'LONG') {
      pnl = exitPrice - entryPrice;
    } else if (currentForecast.signal === 'SHORT') {
      pnl = entryPrice - exitPrice;
    }

    const pnlPercentage = (pnl / entryPrice) * 100;
    const timeInForce = getTimeInForce(exitReason);
    const exactHitTime = calculateExactHitTime(entryTime, exitTime, exitReason);

    return {
      entryPrice,
      entryTime,
      exitPrice,
      exitTime,
      exactHitTime,
      pnl,
      pnlPercentage,
      exitReason,
      timeInForce,
      status: 'calculated' as const
    };
  };

  // Function to get signal color and icon
  const getSignalDisplay = (signal: string) => {
    switch (signal) {
      case 'LONG':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          icon: '↗',
          text: 'LONG'
        };
      case 'SHORT':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          icon: '↘',
          text: 'SHORT'
        };
      case 'HOLD':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          icon: '→',
          text: 'HOLD'
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          icon: '?',
          text: 'N/A'
        };
    }
  };

  // Function to get exit reason display
  const getExitReasonDisplay = (exitReason: string) => {
    switch (exitReason) {
      case 'take_profit':
        return { text: 'TP', color: 'text-green-400', fullText: 'Take Profit Hit' };
      case 'stop_loss':
        return { text: 'SL', color: 'text-red-400', fullText: 'Stop Loss Hit' };
      case 'next_hour':
        return { text: 'NH', color: 'text-blue-400', fullText: 'Held Full Hour' };
      default:
        return { text: 'N/A', color: 'text-gray-400', fullText: 'Unknown' };
    }
  };

  // Function to get Time in Force color
  const getTimeInForceColor = (tif: string) => {
    switch (tif) {
      case 'GTC': return 'text-blue-400';
      case 'IOC': return 'text-orange-400';
      case 'FOK': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  // Function to get PnL color
  const getPnLColor = (pnlPercentage: number) => {
    if (pnlPercentage > 0) return 'text-green-400';
    if (pnlPercentage < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  // Compact table for the sidebar
  const CompactTable = () => (
    <div className="max-h-[500px] overflow-y-scroll">
      <div className="space-y-2">
        {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
          // Calculate original index for PnL calculation
          const originalIndex = hourlyForecast.length - 1 - reverseIndex;
          const signalDisplay = getSignalDisplay(forecast.signal);
          const tradePnL = calculateTradePnL(originalIndex);
          const exitDisplay = getExitReasonDisplay(tradePnL.exitReason);

          return (
            <div key={forecast.time} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="font-mono text-sm text-white font-medium min-w-[45px]">
                  {formatTime(forecast.time)}
                </div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color} min-w-[55px] justify-center`}>
                  <span>{signalDisplay.icon}</span>
                  <span>{signalDisplay.text}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-sm text-white">
                  Entry: ${forecast.entry_price?.toLocaleString() || 'N/A'}
                </div>
                {/* Show trading PnL with exit info */}
                {forecast.signal !== 'HOLD' && (
                  <>
                    {tradePnL.status === 'calculated' ? (
                      <div className="flex items-center justify-end space-x-2">
                        <div className={`font-mono text-xs font-medium ${getPnLColor(tradePnL.pnlPercentage)}`}>
                          {tradePnL.pnlPercentage >= 0 ? '+' : ''}
                          {tradePnL.pnlPercentage.toFixed(2)}%
                        </div>
                        <div className={`text-xs px-1 rounded ${exitDisplay.color}`}>
                          {exitDisplay.text}
                        </div>
                        <div className={`text-xs ${getTimeInForceColor(tradePnL.timeInForce)}`}>
                          {tradePnL.timeInForce}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">Pending</div>
                    )}
                  </>
                )}
                {forecast.signal === 'HOLD' && (
                  <div className="text-gray-400 text-xs">-</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Full table for the popup
  const FullTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">ENTRY TIME</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">EXIT TIME</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">SIGNAL</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">ENTRY PRICE</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">EXIT PRICE</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">EXACT HIT TIME</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">EXIT REASON</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">TIME IN FORCE</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL $</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL %</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">R:R</th>
          </tr>
        </thead>
        <tbody>
          {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
            // Calculate original index for PnL calculation
            const originalIndex = hourlyForecast.length - 1 - reverseIndex;
            const signalDisplay = getSignalDisplay(forecast.signal);
            const tradePnL = calculateTradePnL(originalIndex);
            const exitDisplay = getExitReasonDisplay(tradePnL.exitReason);

            return (
              <tr key={forecast.time} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                <td className="py-3 px-4">
                  <div className="font-mono text-white font-medium">
                    {formatTime(forecast.time)}
                  </div>
                </td>

                <td className="py-3 px-4">
                  {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
                    <div className="font-mono text-white font-medium">
                      {formatTime(tradePnL.exitTime)}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">
                      {forecast.signal === 'HOLD' ? '-' : 'Pending'}
                    </div>
                  )}
                </td>

                <td className="py-3 px-4">
                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color}`}>
                    <span>{signalDisplay.icon}</span>
                    <span>{signalDisplay.text}</span>
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="font-mono text-white">
                    {forecast.entry_price ?
                      `$${forecast.entry_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}` : 'N/A'
                    }
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
                    <div className="font-mono text-white">
                      ${tradePnL.exitPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">
                      {forecast.signal === 'HOLD' ? '-' : 'Pending'}
                    </div>
                  )}
                </td>

                <td className="py-3 px-4">
                  {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
                    <div className="font-mono text-white text-sm">
                      {tradePnL.exitReason === 'next_hour' ? (
                        <span className="text-blue-400">Scheduled Close</span>
                      ) : (
                        <span className={tradePnL.exitReason === 'take_profit' ? 'text-green-400' : 'text-red-400'}>
                          {formatTimeWithSeconds(tradePnL.exactHitTime)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">
                      {forecast.signal === 'HOLD' ? '-' : 'Pending'}
                    </div>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
                    <div className={`text-xs font-medium ${exitDisplay.color}`} title={exitDisplay.fullText}>
                      {exitDisplay.fullText}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">
                      {forecast.signal === 'HOLD' ? '-' : 'Pending'}
                    </div>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
                    <div className={`text-xs font-medium ${getTimeInForceColor(tradePnL.timeInForce)}`}>
                      {tradePnL.timeInForce}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">
                      {forecast.signal === 'HOLD' ? '-' : 'GTC'}
                    </div>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
                    <div className={`font-mono font-medium ${getPnLColor(tradePnL.pnlPercentage)}`}>
                      {tradePnL.pnl >= 0 ? '+' : ''}
                      ${tradePnL.pnl.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">
                      {forecast.signal === 'HOLD' ? '-' : 'Pending'}
                    </div>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  {forecast.signal !== 'HOLD' && tradePnL.status === 'calculated' ? (
                    <div className={`font-mono font-medium ${getPnLColor(tradePnL.pnlPercentage)}`}>
                      {tradePnL.pnlPercentage >= 0 ? '+' : ''}
                      {tradePnL.pnlPercentage.toFixed(3)}%
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">
                      {forecast.signal === 'HOLD' ? '-' : 'Pending'}
                    </div>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="text-white">
                    {forecast.risk_reward_ratio ? `1:${forecast.risk_reward_ratio.toFixed(2)}` : 'N/A'}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Legend for Time in Force and Exit Reasons
  const Legend = () => (
    <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
      <h4 className="text-sm font-medium text-white mb-2">📝 Legend</h4>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <div className="text-gray-400 mb-1">Exit Reasons:</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">TP</span>
              <span className="text-gray-300">Take Profit Hit</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-400">SL</span>
              <span className="text-gray-300">Stop Loss Hit</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">NH</span>
              <span className="text-gray-300">Held Full Hour</span>
            </div>
          </div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Time in Force:</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">GTC</span>
              <span className="text-gray-300">Good Till Cancel</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-orange-400">IOC</span>
              <span className="text-gray-300">Immediate or Cancel</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">FOK</span>
              <span className="text-gray-300">Fill or Kill</span>
            </div>
          </div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Exact Hit Time:</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">HH:MM:SS</span>
              <span className="text-gray-300">TP Hit Time</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-400">HH:MM:SS</span>
              <span className="text-gray-300">SL Hit Time</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">Scheduled</span>
              <span className="text-gray-300">Hour Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (hourlyForecast.length === 0) {
    return (
      <div className={`bg-[#1a2332] rounded-lg p-4 ${className}`}>
        <h3 className="font-bold mb-4 flex items-center space-x-2">
          <span className="text-lg">⏰</span>
          <span>HOURLY PREDICTIONS</span>
        </h3>
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">📊</div>
          <p>No hourly predictions available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-[#1a2332] rounded-lg p-4 relative ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center space-x-2">
            <span className="text-lg">📈</span>
            <span>TRADING PERFORMANCE</span>
          </h3>

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            title="Expand table"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 1h6v2H3v4H1V1zm8 0h6v6h-2V3h-4V1zM3 9v4h4v2H1V9h2zm12 0v6H9v-2h4V9h2z" />
            </svg>
          </button>
        </div>

        <CompactTable />

        {/* Enhanced Summary Stats with Trading Metrics */}
        <div className="mt-4 pt-3 border-t border-gray-600">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="text-gray-400">Total Trades</div>
              <div className="text-white font-bold text-lg">
                {hourlyForecast.filter(h => h.signal !== 'HOLD').length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Win Rate</div>
              <div className="text-green-400 font-bold text-lg">
                {(() => {
                  const trades = hourlyForecast.slice(0, -1)
                    .filter(h => h.signal !== 'HOLD')
                    .map((_, i) => calculateTradePnL(i))
                    .filter(t => t.status === 'calculated');
                  if (trades.length === 0) return 'N/A';
                  const wins = trades.filter(t => t.pnl > 0).length;
                  return `${((wins / trades.length) * 100).toFixed(1)}%`;
                })()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Avg PnL</div>
              <div className="text-blue-400 font-bold text-lg">
                {(() => {
                  const trades = hourlyForecast.slice(0, -1)
                    .filter(h => h.signal !== 'HOLD')
                    .map((_, i) => calculateTradePnL(i))
                    .filter(t => t.status === 'calculated');
                  if (trades.length === 0) return 'N/A';
                  const avgPnL = trades.reduce((sum, t) => sum + t.pnlPercentage, 0) / trades.length;
                  return `${avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(2)}%`;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <span className="text-lg">📈</span>
                <span>TRADING PERFORMANCE - DETAILED VIEW</span>
              </h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <FullTable />
              <Legend />

              {/* Enhanced Summary Stats for Modal */}
              <div className="mt-6 pt-4 border-t border-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">Total Signals</div>
                    <div className="text-white font-bold text-lg">{hourlyForecast.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Active Trades</div>
                    <div className="text-blue-400 font-bold text-lg">
                      {hourlyForecast.filter(h => h.signal !== 'HOLD').length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Profitable Trades</div>
                    <div className="text-green-400 font-bold text-lg">
                      {(() => {
                        const trades = hourlyForecast.slice(0, -1)
                          .filter(h => h.signal !== 'HOLD')
                          .map((_, i) => calculateTradePnL(i))
                          .filter(t => t.status === 'calculated');
                        return trades.filter(t => t.pnl > 0).length;
                      })()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">TP Hit Rate</div>
                    <div className="text-green-400 font-bold text-lg">
                      {(() => {
                        const trades = hourlyForecast.slice(0, -1)
                          .filter(h => h.signal !== 'HOLD')
                          .map((_, i) => calculateTradePnL(i))
                          .filter(t => t.status === 'calculated');
                        if (trades.length === 0) return 'N/A';

                        const tpHits = trades.filter(t => t.exitReason === 'take_profit').length;
                        return `${((tpHits / trades.length) * 100).toFixed(1)}%`;
                      })()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Total PnL</div>
                    <div className="text-white font-bold text-lg">
                      {(() => {
                        const trades = hourlyForecast.slice(0, -1)
                          .filter(h => h.signal !== 'HOLD')
                          .map((_, i) => calculateTradePnL(i))
                          .filter(t => t.status === 'calculated');
                        if (trades.length === 0) return 'N/A';
                        const totalPnL = trades.reduce((sum, t) => sum + t.pnlPercentage, 0);
                        return `${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}%`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HourlyPredictionsTable;