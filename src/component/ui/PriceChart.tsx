// import React, { useState, useRef, useEffect } from 'react';

// interface PriceData {
//   date: string;
//   price: number;
// }

// interface ForecastData {
//   date: string;
//   signal: 'LONG' | 'SHORT';
//   entry: number;
//   stop_loss: number;
//   take_profit: number;
//   confidence_intervals: {
//     50: [number, number];
//     80: [number, number];
//     90: [number, number];
//   };
//   deviation_percent?: number | string;
//   overall_accuracy_percent?: number | string;
// }

// interface PriceChartProps {
//   priceHistory?: PriceData[];
//   forecast?: ForecastData[];
//   className?: string;
// }

// interface TooltipData {
//   x: number;
//   y: number;
//   data: any;
//   visible: boolean;
// }

// // Segmented Control Component
// const SegmentedControl = ({
//   options,
//   selected,
//   onChange,
//   className = ""
// }: {
//   options: { value: string; label: string }[];
//   selected: string;
//   onChange: (value: string) => void;
//   className?: string;
// }) => {
//   return (
//     <div className={`inline-flex bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-1 ${className}`}>
//       {options.map((option) => (
//         <button
//           key={option.value}
//           onClick={() => onChange(option.value)}
//           className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-md transition-all duration-200 ${selected === option.value
//             ? 'bg-blue-600 text-white shadow-md'
//             : 'text-gray-400 hover:text-white hover:bg-[#2a3441]'
//             }`}
//         >
//           {option.label}
//         </button>
//       ))}
//     </div>
//   );
// };

// const PriceChart: React.FC<PriceChartProps> = ({
//   priceHistory = [
//     { date: "2025-07-02", price: 104639.48 },
//     { date: "2025-07-03", price: 104611.16 },
//     { date: "2025-07-04", price: 103296.19 },
//     { date: "2025-07-05", price: 101348.19 },
//     { date: "2025-07-06", price: 101987.11 },
//     { date: "2025-07-07", price: 105436.11 },
//     { date: "2025-07-08", price: 106371.09 }
//   ],
//   forecast = [
//     {
//       date: "2025-07-09",
//       signal: "LONG" as const,
//       entry: 109202,
//       stop_loss: 105305,
//       take_profit: 108872,
//       confidence_intervals: {
//         50: [107000, 111000],
//         80: [106000, 112000],
//         90: [105000, 113000]
//       },
//       deviation_percent: 1.5,
//       overall_accuracy_percent: 98.5
//     },
//     {
//       date: "2025-07-10",
//       signal: "LONG" as const,
//       entry: 108872,
//       stop_loss: 104500,
//       take_profit: 112000,
//       confidence_intervals: {
//         50: [106500, 111500],
//         80: [105500, 112500],
//         90: [104500, 113500]
//       }
//     },
//     {
//       date: "2025-07-11",
//       signal: "LONG" as const,
//       entry: 108435,
//       stop_loss: 104200,
//       take_profit: 111800,
//       confidence_intervals: {
//         50: [106200, 110800],
//         80: [105200, 111800],
//         90: [104200, 112800]
//       }
//     }
//   ],
//   className = "",
// }) => {
//   const [selectedTimeframe, setSelectedTimeframe] = useState<'PAST_7D' | 'NEXT_3D'>('NEXT_3D');
//   const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SOL' | 'ETH'>('BTC');
//   const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: null, visible: false });
//   const [isMobile, setIsMobile] = useState(false);
//   const svgRef = useRef<SVGSVGElement>(null);

//   const [latest, setLatest] = useState<{
//     deviation_percent?: number | string;
//     overall_accuracy_percent?: number | string;
//   } | null>(null);

//   useEffect(() => {
//     fetch("/api/past-prediction", {
//       cache: "no-store",
//       headers: { "Cache-Control": "no-cache" },
//     })
//       .then(r => r.json())
//       .then(past => {
//         const entry = past.latest_forecast?.[0];
//         setLatest({
//           deviation_percent: entry?.deviation_percent,
//           overall_accuracy_percent: entry?.overall_accuracy_percent
//         });
//       })
//       .catch(console.error);
//   }, []);

//   // Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Get simplified date format (MM/DD)
//   const getSimpleDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
//   };

//   // Calculate risk/reward ratio
//   // const getRiskReward = (entry: number, stop: number, target: number) => {
//   //   const risk = Math.abs(entry - stop);
//   //   const reward = Math.abs(target - entry);
//   //   return (reward / risk).toFixed(1);
//   // };

//   const getRiskReward = (entry: number, stop: number, target: number, signal: 'LONG' | 'SHORT' = 'LONG') => {
//     let risk: number;
//     let reward: number;

//     if (signal === 'LONG') {
//       // LONG: Risk down to stop, reward up to target
//       risk = entry - stop;  // Should be positive
//       reward = target - entry;  // Should be positive
//     } else {
//       // SHORT: Risk up to stop, reward down to target  
//       risk = stop - entry;  // Should be positive
//       reward = entry - target;  // Should be positive
//     }

//     // Handle invalid ratios
//     if (risk <= 0 || reward <= 0) {
//       return '0.0';
//     }

//     return (reward / risk).toFixed(1);
//   };

//   // Filter data based on selected timeframe
//   const getFilteredData = () => {
//     if (selectedTimeframe === 'PAST_7D') {
//       return {
//         historical: priceHistory,
//         forecast: []
//       };
//     } else {
//       return {
//         historical: [],
//         forecast: forecast
//       };
//     }
//   };

//   const { historical: displayPriceHistory, forecast: displayForecast } = getFilteredData();

//   // Show/hide tooltip
//   const showTooltip = (event: React.MouseEvent, data: any) => {
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (rect) {
//       setTooltip({
//         x: event.clientX - rect.left,
//         y: event.clientY - rect.top,
//         data: data,
//         visible: true
//       });
//     }
//   };

//   const hideTooltip = () => {
//     setTooltip(prev => ({ ...prev, visible: false }));
//   };

//   // Create SVG chart with filtered data
//   const createSVGChart = () => {
//     const allData = [
//       ...displayPriceHistory.map(item => ({ ...item, type: 'historical' })),
//       ...displayForecast.map(item => ({ ...item, price: item.entry, type: 'forecast' }))
//     ];

//     if (allData.length === 0) {
//       return (
//         <div className="flex items-center justify-center h-full text-gray-400">
//           No data available for selected timeframe
//         </div>
//       );
//     }

//     // Include confidence intervals in price calculation for proper scaling
//     const allPrices = [
//       ...allData.map(item => item.price),
//       ...displayForecast.flatMap(item => [
//         item.confidence_intervals[90][0],
//         item.confidence_intervals[90][1],
//         item.stop_loss,
//         item.take_profit
//       ])
//     ];

//     const minPrice = Math.min(...allPrices) * 0.995;
//     const maxPrice = Math.max(...allPrices) * 1.005;
//     const priceRange = maxPrice - minPrice;

//     // Mobile-responsive dimensions
//     const width = isMobile ? 350 : 500;
//     const height = isMobile ? 200 : 300;
//     const padding = isMobile ? 30 : 50;

//     const xStep = (width - 2 * padding) / Math.max(allData.length - 1, 1);

//     const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);
//     const getX = (index: number) => padding + index * xStep;

//     return (
//       <svg
//         ref={svgRef}
//         width={width}
//         height={height}
//         className="w-full h-full"
//         viewBox={`0 0 ${width} ${height}`}
//         onMouseLeave={hideTooltip}
//       >
//         {/* Grid lines */}
//         {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
//           <line
//             key={i}
//             x1={padding}
//             y1={padding + ratio * (height - 2 * padding)}
//             x2={width - padding}
//             y2={padding + ratio * (height - 2 * padding)}
//             stroke="#1f2937"
//             strokeWidth={1}
//             opacity={0.3}
//           />
//         ))}

//         {/* Confidence Intervals */}
//         {displayForecast.length > 0 && (
//           <>
//             {(() => {
//               const createConfidenceArea = (upperBounds: number[], lowerBounds: number[]) => {
//                 const points = displayForecast.map((_, i) => ({
//                   x: getX(displayPriceHistory.length + i),
//                   upper: upperBounds[i],
//                   lower: lowerBounds[i]
//                 }));

//                 let upperPath = `M ${points[0].x},${points[0].upper}`;
//                 for (let i = 1; i < points.length; i++) {
//                   const prev = points[i - 1];
//                   const curr = points[i];
//                   const cp1x = prev.x + (curr.x - prev.x) / 3;
//                   const cp2x = curr.x - (curr.x - prev.x) / 3;
//                   upperPath += ` C ${cp1x},${prev.upper} ${cp2x},${curr.upper} ${curr.x},${curr.upper}`;
//                 }

//                 let lowerPath = `L ${points[points.length - 1].x},${points[points.length - 1].lower}`;
//                 for (let i = points.length - 2; i >= 0; i--) {
//                   const next = points[i + 1];
//                   const curr = points[i];
//                   const cp1x = next.x - (next.x - curr.x) / 3;
//                   const cp2x = curr.x + (next.x - curr.x) / 3;
//                   lowerPath += ` C ${cp1x},${next.lower} ${cp2x},${curr.lower} ${curr.x},${curr.lower}`;
//                 }

//                 return upperPath + lowerPath + ' Z';
//               };

//               const ci90Upper = displayForecast.map(item => getY(item.confidence_intervals[90][1]));
//               const ci90Lower = displayForecast.map(item => getY(item.confidence_intervals[90][0]));
//               const ci80Upper = displayForecast.map(item => getY(item.confidence_intervals[80][1]));
//               const ci80Lower = displayForecast.map(item => getY(item.confidence_intervals[80][0]));
//               const ci50Upper = displayForecast.map(item => getY(item.confidence_intervals[50][1]));
//               const ci50Lower = displayForecast.map(item => getY(item.confidence_intervals[50][0]));

//               return (
//                 <>
//                   <path
//                     d={createConfidenceArea(ci90Upper, ci90Lower)}
//                     fill="#22c55e"
//                     fillOpacity={0.15}
//                     stroke="none"
//                   />
//                   <path
//                     d={createConfidenceArea(ci80Upper, ci80Lower)}
//                     fill="#f59e0b"
//                     fillOpacity={0.2}
//                     stroke="none"
//                   />
//                   <path
//                     d={createConfidenceArea(ci50Upper, ci50Lower)}
//                     fill="#3b82f6"
//                     fillOpacity={0.25}
//                     stroke="none"
//                   />
//                 </>
//               );
//             })()}

//             {/* Trading lines */}
//             <line
//               x1={getX(displayPriceHistory.length)}
//               y1={getY(displayForecast[0]?.entry || 0)}
//               x2={getX(displayPriceHistory.length + displayForecast.length - 1)}
//               y2={getY(displayForecast[displayForecast.length - 1]?.entry || 0)}
//               stroke="#059669"
//               strokeWidth={isMobile ? 1.5 : 2}
//               strokeDasharray="6,3"
//             />

//             <line
//               x1={getX(displayPriceHistory.length)}
//               y1={getY(displayForecast[0]?.stop_loss || 0)}
//               x2={getX(displayPriceHistory.length + displayForecast.length - 1)}
//               y2={getY(displayForecast[displayForecast.length - 1]?.stop_loss || 0)}
//               stroke="#dc2626"
//               strokeWidth={isMobile ? 1.5 : 2}
//               strokeDasharray="6,3"
//             />

//             <line
//               x1={getX(displayPriceHistory.length)}
//               y1={getY(displayForecast[0]?.take_profit || 0)}
//               x2={getX(displayPriceHistory.length + displayForecast.length - 1)}
//               y2={getY(displayForecast[displayForecast.length - 1]?.take_profit || 0)}
//               stroke="#7c3aed"
//               strokeWidth={isMobile ? 1.5 : 2}
//               strokeDasharray="6,3"
//             />
//           </>
//         )}

//         {/* Price lines */}
//         {displayPriceHistory.length > 0 && (
//           <polyline
//             points={displayPriceHistory.map((item, i) => {
//               const x = getX(i);
//               const y = getY(item.price);
//               return `${x},${y}`;
//             }).join(' ')}
//             fill="none"
//             stroke="#3b82f6"
//             strokeWidth={isMobile ? 2 : 3}
//           />
//         )}

//         {displayForecast.length > 0 && (
//           <polyline
//             points={displayForecast.map((item, i) => {
//               const x = getX(displayPriceHistory.length + i);
//               const y = getY(item.entry);
//               return `${x},${y}`;
//             }).join(' ')}
//             fill="none"
//             stroke="#10b981"
//             strokeWidth={isMobile ? 2 : 3}
//             strokeDasharray="8,4"
//           />
//         )}

//         {/* Data points */}
//         {displayPriceHistory.map((item, i) => {
//           const x = getX(i);
//           const y = getY(item.price);
//           return (
//             <circle
//               key={i}
//               cx={x}
//               cy={y}
//               r={isMobile ? 3 : 4}
//               fill="#3b82f6"
//               stroke="#0a1628"
//               strokeWidth={isMobile ? 1 : 2}
//               style={{ cursor: 'pointer' }}
//               onMouseEnter={(e) => showTooltip(e, { ...item, type: 'historical' })}
//             />
//           );
//         })}

//         {displayForecast.map((item, i) => {
//           const x = getX(displayPriceHistory.length + i);
//           const y = getY(item.entry);
//           const radius = isMobile ? 4 : 5;
//           const arrowSize = isMobile ? 8 : 12;
//           return (
//             <g key={i}>
//               <circle
//                 cx={x}
//                 cy={y}
//                 r={radius}
//                 fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
//                 stroke="#0a1628"
//                 strokeWidth={isMobile ? 1 : 2}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' })}
//               />
//               <polygon
//                 points={item.signal === 'LONG'
//                   ? `${x},${y - arrowSize} ${x - arrowSize / 2},${y - arrowSize / 2} ${x + arrowSize / 2},${y - arrowSize / 2}`
//                   : `${x},${y + arrowSize} ${x - arrowSize / 2},${y + arrowSize / 2} ${x + arrowSize / 2},${y + arrowSize / 2}`
//                 }
//                 fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' })}
//               />
//             </g>
//           );
//         })}

//         {/* Price labels */}
//         <text x={padding - 5} y={padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round(maxPrice).toLocaleString()}
//         </text>
//         <text x={padding - 5} y={height - padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round(minPrice).toLocaleString()}
//         </text>
//         <text x={padding - 5} y={padding + (height - 2 * padding) / 2} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round((maxPrice + minPrice) / 2).toLocaleString()}
//         </text>

//         {/* Date labels */}
//         {allData.length > 1 && (
//           <>
//             <text x={padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               {getSimpleDate(allData[0]?.date)}
//             </text>
//             <text x={width - padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               {getSimpleDate(allData[allData.length - 1]?.date)}
//             </text>
//           </>
//         )}
//       </svg>
//     );
//   };

//   if (!latest) {
//     return (
//       <div className="p-4 text-gray-400">
//         Loading deviation & accuracy…
//       </div>
//     );
//   }
//   const firstForecast = latest;
//    const firstForecasts = displayForecast[0];
//   console.log('firstForecast', firstForecast)
//   const formattedAccuracy = firstForecast?.overall_accuracy_percent
//     ? `${firstForecast.overall_accuracy_percent}%`
//     : '98.50%';

//   console.log('formattedAccuracy', formattedAccuracy)

//   const rawDev = Number(firstForecast?.deviation_percent)
//   const formattedDeviation = firstForecast?.deviation_percent
//     ? `+${firstForecast.deviation_percent}%`
//     : '+1.50%';

//   return (
//     <div className={`bg-[#080b12] rounded-lg p-4 ${className}`}>
//       {/* Header with Accuracy Prominently Displayed */}
//       <div className="flex justify-between items-center mb-4">
//         {/* <div className="flex items-center gap-3">
//           <h2 className="text-white text-lg font-semibold">Accuracy</h2>
//           <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-lg font-bold">
//             {formattedAccuracy}
//           </div>
//         </div> */}
//         {/* {!isMobile && (
//           <div className="flex items-center gap-2 text-sm">
//             <span className="text-gray-400">Premium</span>
//             <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
//           </div>
//         )} */}
//       </div>

//       {/* Controls Section */}
//       <div className="flex justify-between items-center mb-4">
//         {/* Asset Selector */}
//         <select
//           value={selectedAsset}
//           onChange={(e) => setSelectedAsset(e.target.value as 'BTC' | 'SOL' | 'ETH')}
//           className="bg-[#0d1120]/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] focus:border-blue-500 focus:outline-none text-sm"
//         >
//           <option value="BTC">BTC</option>
//           <option value="SOL" disabled>SOL (Soon)</option>
//           <option value="ETH" disabled>ETH (Soon)</option>
//         </select>

//         {/* Segmented Control for Timeframe */}
//         <SegmentedControl
//           options={[
//             { value: 'PAST_7D', label: '7D Past' },
//             { value: 'NEXT_3D', label: '3D Future' }
//           ]}
//           selected={selectedTimeframe}
//           onChange={(value) => setSelectedTimeframe(value as 'PAST_7D' | 'NEXT_3D')}
//         />
//       </div>

//       {/* Main Content - Always Show Key Metrics */}
//       {displayForecast.length > 0 && (
//         <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 mb-4`}>
//           {/* Primary Signal Card */}
//           <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 border-l-4 border-green-500">
//             <div className="flex justify-between items-start mb-2">
//               <span className="text-gray-400 text-sm">Next Signal</span>
//               <span className="text-green-400 font-bold text-lg">LONG</span>
//             </div>
//             <div className="space-y-1">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Buy At:</span>
//                 <span className="text-white font-medium">${firstForecasts.entry.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Target:</span>
//                 <span className="text-green-400">${firstForecasts.take_profit.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Stop:</span>
//                 <span className="text-red-400">${firstForecasts.stop_loss.toLocaleString()}</span>
//               </div>
//             </div>
//           </div>

//           {/* Risk Metrics */}
//           <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4">
//             <div className="text-gray-400 text-sm mb-2">Risk Analysis</div>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">R:R Ratio:</span>
//                 <span className="text-blue-400 font-bold">
//                   1:{getRiskReward(firstForecasts.entry, firstForecasts.stop_loss, firstForecasts.take_profit)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Confidence:</span>
//                 <span className="text-green-400">High (90%)</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Date:</span>
//                 <span className="text-white">{getSimpleDate(firstForecasts.date)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Performance Metrics */}
//           <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4">
//             <div className="text-gray-400 text-sm mb-2">Performance</div>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Success Rate:</span>
//                 <span className="text-green-400">{formattedAccuracy}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Margin:</span>
//                 <span className="text-blue-400">{formattedDeviation}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Trend:</span>
//                 <span className="text-green-400">↗ Bullish</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Chart Container */}
//       <div className="w-full bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-2 mb-4 relative" style={{ height: isMobile ? '180px' : '220px' }}>
//         {createSVGChart()}

//         {/* Enhanced Tooltip */}
//         {tooltip.visible && tooltip.data && (
//           <div
//             className={`absolute bg-[#080b12] border border-[rgba(255,255,255,0.08)] rounded-lg p-3 text-white shadow-xl z-10 ${isMobile ? 'text-xs min-w-48' : 'text-sm min-w-56'}`}
//             style={{
//               left: tooltip.x + 10,
//               top: tooltip.y - 10,
//               transform: tooltip.x > (isMobile ? 200 : 300) ? 'translateX(-100%)' : 'none'
//             }}
//           >
//             <div className="space-y-2">
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Date:</span>
//                 <span>{getSimpleDate(tooltip.data.date)}</span>
//               </div>

//               {tooltip.data.type === 'historical' ? (
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Price:</span>
//                   <span>${Math.round(tooltip.data.price).toLocaleString()}</span>
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Signal:</span>
//                     <span className={tooltip.data.signal === 'LONG' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
//                       {tooltip.data.signal}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Buy At:</span>
//                     <span>${Math.round(tooltip.data.entry).toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Stop:</span>
//                     <span className="text-red-400">${Math.round(tooltip.data.stop_loss).toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Target:</span>
//                     <span className="text-green-400">${Math.round(tooltip.data.take_profit).toLocaleString()}</span>
//                   </div>
//                   <hr className="border-gray-600 my-2" />
//                   {/* <div className="flex justify-between">
//                     <span className="text-gray-400">R:R:</span>
//                     <span className="text-blue-400">1:{getRiskReward(tooltip.data.entry, tooltip.data.stop_loss, tooltip.data.take_profit)}</span>
//                   </div> */}
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Enhanced Legend with Premium Features */}
//       <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 text-xs mb-4`}>
//         <div className="flex items-center space-x-2">
//           <div className="w-3 h-0.5 bg-blue-500"></div>
//           <span className="text-gray-400">Historical</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-3 h-0.5 bg-green-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #10b981 0, #10b981 4px, transparent 4px, transparent 6px)' }}></div>
//           <span className="text-gray-400">Forecast</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-3 h-0.5 bg-red-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #dc2626 0, #dc2626 4px, transparent 4px, transparent 6px)' }}></div>
//           <span className="text-gray-400">Stop Loss</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-3 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
//           <span className="text-gray-400">Take Profit</span>
//         </div>
//       </div>

//       {/* All Predictions Summary */}
//       <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
//         {displayForecast.map((item, i) => (
//           <div key={i} className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
//             <div className="flex justify-between items-center mb-2">
//               <span className={`font-bold text-sm ${item.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
//                 {item.signal}
//               </span>
//               <span className="text-gray-400 text-xs">{getSimpleDate(item.date)}</span>
//             </div>
//             <div className="space-y-1 text-xs">
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Buy:</span>
//                 <span className="text-white">${item.entry.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Target:</span>
//                 <span className="text-green-400">${item.take_profit.toLocaleString()}</span>
//               </div>
//               {/* <div className="flex justify-between">
//                 <span className="text-gray-400">R:R:</span>
//                 <span className="text-blue-400">1:{getRiskReward(item.entry, item.stop_loss, item.take_profit)}</span>
//               </div> */}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Quick Actions for Premium Users */}
//       {/* {!isMobile && (
//         <div className="flex justify-center gap-3 mt-4">
//           <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
//             Set Alert
//           </button>
//           <button className="bg-gray-600 hover:bg-[rgba(255,255,255,0.06)] text-white px-4 py-2 rounded-lg text-sm transition-colors">
//             Download Report
//           </button>
//           <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
//             Share Signal
//           </button>
//         </div>
//       )} */}
//     </div>
//   );
// };

// export default PriceChart;


// import React, { useState, useRef, useEffect } from 'react';
// import { HourlyForecast } from '@/types/types';

// interface PriceData {
//   date: string;
//   price: number;
// }

// interface CandlestickData {
//   timestamp: number;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   volume: number;
// }

// interface ForecastData {
//   date: string;
//   signal: 'LONG' | 'SHORT';
//   entry: number;
//   stop_loss: number;
//   take_profit: number;
//   confidence_intervals: {
//     50: [number, number];
//     80: [number, number];
//     90: [number, number];
//   };
//   deviation_percent?: number | string;
//   overall_accuracy_percent?: number | string;
// }

// interface PriceChartProps {
//   priceHistory?: PriceData[];
//   forecast?: ForecastData[];
//   hourlyForecast?: HourlyForecast[]; 
//   className?: string;
// }

// interface TooltipData {
//   x: number;
//   y: number;
//   data: any;
//   visible: boolean;
// }

// // Segmented Control Component
// const SegmentedControl = ({
//   options,
//   selected,
//   onChange,
//   className = ""
// }: {
//   options: { value: string; label: string }[];
//   selected: string;
//   onChange: (value: string) => void;
//   className?: string;
// }) => {
//   return (
//     <div className={`inline-flex bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-1 ${className}`}>
//       {options.map((option) => (
//         <button
//           key={option.value}
//           onClick={() => onChange(option.value)}
//           className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-md transition-all duration-200 ${selected === option.value
//             ? 'bg-blue-600 text-white shadow-md'
//             : 'text-gray-400 hover:text-white hover:bg-[#2a3441]'
//             }`}
//         >
//           {option.label}
//         </button>
//       ))}
//     </div>
//   );
// };


// const fetchRealBitcoinData = async (
//   setDataSource?: (src: 'real' | 'fallback') => void
// ): Promise<CandlestickData[]> => {
//   try {
//     const res = await fetch(
//       'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60'
//     );
//     if (!res.ok) throw new Error(`Binance returned ${res.status}`);
//     const raw = await res.json() as any[][];
//     setDataSource?.('real');
//     return raw.map(([ts, open, high, low, close, volume]) => ({
//       timestamp: ts,
//       open: +open,
//       high: +high,
//       low: +low,
//       close: +close,
//       volume: +volume,
//     }));
//   } catch (err) {
//     console.error('Failed to fetch real candles, falling back:', err);
//     setDataSource?.('fallback');
//     // you can still call generateFallbackData() here if you want a dummy when Binance is down
//     return generateFallbackData();
//   }
// };

// const fetchCurrentBitcoinPrice = async (): Promise<number> => {
//   const res = await fetch(
//     'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
//   );
//   if (!res.ok) throw new Error(`Binance ticker returned ${res.status}`);
//   const json = await res.json() as { price: string };
//   return parseFloat(json.price);
// };


// // Fallback data generator
// const generateFallbackData = (): CandlestickData[] => {
//   const data: CandlestickData[] = [];
//   let currentPrice = 121008;
//   const now = Date.now();

//   for (let i = 59; i >= 0; i--) {
//     const timestamp = now - (i * 60000); // 1 minute intervals
//     const volatility = 0.002;

//     const open = currentPrice;
//     const change = (Math.random() - 0.5) * volatility * currentPrice;
//     const close = open + change;

//     const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
//     const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;

//     const volume = Math.random() * 1000000 + 500000;

//     data.push({
//       timestamp,
//       open,
//       high,
//       low,
//       close,
//       volume
//     });

//     currentPrice = close + (122306 - 121008) / 60; // Gradual increase to current price
//   }

//   return data;
// };

// const PriceChart: React.FC<PriceChartProps> = ({
//   priceHistory = [
//     { date: "2025-07-02", price: 104639.48 },
//     { date: "2025-07-03", price: 104611.16 },
//     { date: "2025-07-04", price: 103296.19 },
//     { date: "2025-07-05", price: 101348.19 },
//     { date: "2025-07-06", price: 101987.11 },
//     { date: "2025-07-07", price: 105436.11 },
//     { date: "2025-07-08", price: 106371.09 }
//   ],
//   forecast = [
//     {
//       date: "2025-07-14",
//       signal: "LONG" as const,
//       entry: 117498.65,
//       stop_loss: 115287.826,
//       take_profit: 119709.474,
//       confidence_intervals: {
//         50: [117088.88, 117908.414],
//         80: [116154.45, 118842.84],
//         90: [115877.55, 119119.75]
//       },
//       deviation_percent: 1.5,
//       overall_accuracy_percent: 98.5
//     }
//   ],
//   className = "",
//   hourlyForecast = [],  
// }) => {
//   const [selectedTimeframe, setSelectedTimeframe] = useState<'TODAY' | 'PAST_7D' | 'NEXT_3D'>('TODAY');
//   const [selectedSubTimeframe, setSelectedSubTimeframe] = useState<'3D' | '7D'>('3D');
//   const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SOL' | 'ETH'>('BTC');
//   const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: null, visible: false });
//   const [isMobile, setIsMobile] = useState(false);
//   const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
//   const [currentPrice, setCurrentPrice] = useState<number>(0);
//   const [isLoadingData, setIsLoadingData] = useState(true);
//   const [dataSource, setDataSource] = useState<'real' | 'fallback'>('real');
//   const svgRef = useRef<SVGSVGElement>(null);

//   const [latest, setLatest] = useState<{
//     deviation_percent?: number | string;
//     overall_accuracy_percent?: number | string;
//   } | null>(null);

//   useEffect(() => {
//     const mockLatest = {
//       deviation_percent: 1.5,
//       overall_accuracy_percent: 98.5
//     };
//     setLatest(mockLatest);
//   }, []);


//   // 1) One effect to fetch your initial candlestick data, with no interval cleanup needed…
//   useEffect(() => {
//     const initializeRealData = async () => {
//       setIsLoadingData(true);
//       const realData = await fetchRealBitcoinData(setDataSource);
//       setCandlestickData(realData);

//       if (realData.length > 0) {
//         setCurrentPrice(realData[realData.length - 1].close);
//       }

//       setIsLoadingData(false);
//     };

//     initializeRealData();
//     // NO clearInterval here, because you never set one!
//   }, []);

//   useEffect(() => {
//     const id = setInterval(async () => {
//       try {
//         const live = await fetchCurrentBitcoinPrice();
//         setCurrentPrice(live);
//       } catch {
//         // swallow or log
//       }
//     }, 10_000);
//     return () => clearInterval(id);
//   }, []);

//   // Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Get simplified date format (MM/DD)
//   const getSimpleDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
//   };

//   // Calculate risk/reward ratio
//   const getRiskReward = (entry: number, stop: number, target: number, signal: 'LONG' | 'SHORT' = 'LONG') => {
//     let risk: number;
//     let reward: number;

//     if (signal === 'LONG') {
//       risk = entry - stop;
//       reward = target - entry;
//     } else {
//       risk = stop - entry;
//       reward = entry - target;
//     }

//     if (risk <= 0 || reward <= 0) {
//       return '0.0';
//     }

//     return (reward / risk).toFixed(1);
//   };

//   // Filter data based on selected timeframe
//   const getFilteredData = () => {
//     if (selectedTimeframe === 'TODAY') {
//       return {
//         historical: [],
//         forecast: selectedSubTimeframe === '3D' ? forecast : [],
//         showCandlesticks: true
//       };
//     } else if (selectedTimeframe === 'PAST_7D') {
//       return {
//         historical: priceHistory,
//         forecast: [],
//         showCandlesticks: false
//       };
//     } else {
//       return {
//         historical: [],
//         forecast: forecast,
//         showCandlesticks: false
//       };
//     }
//   };

//   // after your useState hooks
// const lastHourly = hourlyForecast && hourlyForecast.length > 0
//   ? hourlyForecast[hourlyForecast.length - 1]
//   : null;


//   const { historical: displayPriceHistory, forecast: displayForecast, showCandlesticks } = getFilteredData();

//   // Renders key metrics + simple line of forecast_price over time
// function renderHourlyChart(data: HourlyForecast[]) {
//   if (data.length === 0) return <div className="p-4 text-gray-400">No hourly data</div>;

//   // Line chart: map each point's time→forecast_price
//   const width = isMobile ? 350 : 500;
//   const height = isMobile ? 200 : 300;
//   const padding = 40;
//   const times = data.map(d => new Date(d.time).getTime());
//   const prices = data.map(d => d.forecast_price);
//   const minT = Math.min(...times), maxT = Math.max(...times);
//   const minP = Math.min(...prices), maxP = Math.max(...prices);
//   const xScale = (t: number) => padding + ((t - minT)/(maxT - minT))*(width - 2*padding);
//   const yScale = (p: number) => padding + (1 - (p - minP)/(maxP - minP))*(height - 2*padding);

//   return (
//     <>
//       {/* ── Key Metrics ── */}
//       {lastHourly && (
//         <div className="grid grid-cols-3 gap-4 mb-4">
//           {/* Signal & Entry/Stop/Target */}
//           <div className="bg-[#0d1120]/60 backdrop-blur-sm p-4 rounded-lg border-l-4 border-blue-400">
//             <div className="font-bold text-sm">Signal</div>
//             <div className="text-xl">{lastHourly.signal}</div>
//             <div className="text-xs mt-2">Entry: {lastHourly.entry_price ?? '–'}</div>
//             <div className="text-xs">Target: {lastHourly.take_profit ?? '–'}</div>
//             <div className="text-xs">Stop: {lastHourly.stop_loss ?? '–'}</div>
//           </div>
//           {/* Deviation */}
//           <div className="bg-[#0d1120]/60 backdrop-blur-sm p-4 rounded-lg">
//             <div className="text-gray-400 text-xs">Deviation</div>
//             <div className="text-lg">{lastHourly.deviation_percent}%</div>
//           </div>
//           {/* Accuracy */}
//           <div className="bg-[#0d1120]/60 backdrop-blur-sm p-4 rounded-lg">
//             <div className="text-gray-400 text-xs">Accuracy</div>
//             <div className="text-lg">{lastHourly.accuracy_percent}%</div>
//           </div>
//         </div>
//       )}

//       {/* ── Forecast Price Line ── */}
//       <svg width={width} height={height} className="w-full h-full">
//         {/* grid lines */}
//         {[0,0.25,0.5,0.75,1].map(r => (
//           <line
//             key={r}
//             x1={padding} y1={padding + r*(height-2*padding)}
//             x2={width-padding} y2={padding + r*(height-2*padding)}
//             stroke="#1f2937" strokeWidth={1} opacity={0.3}
//           />
//         ))}
//         {/* line */}
//         <polyline
//           fill="none"
//           stroke="#3b82f6"
//           strokeWidth={2}
//           points={data.map(d =>
//             `${xScale(new Date(d.time).getTime())},${yScale(d.forcast_price)}`
//           ).join(' ')}
//         />
//         {/* points */}
//         {data.map(d => (
//           <circle
//             key={d.time}
//             cx={xScale(new Date(d.time).getTime())}
//             cy={yScale(d.forecast_price)}
//             r={isMobile ? 3 : 4}
//             fill="#3b82f6"
//           />
//         ))}
//       </svg>
//     </>
//   );
// }


//   // Show/hide tooltip
//   const showTooltip = (event: React.MouseEvent, data: any) => {
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (rect) {
//       setTooltip({
//         x: event.clientX - rect.left,
//         y: event.clientY - rect.top,
//         data: data,
//         visible: true
//       });
//     }
//   };

//   const hideTooltip = () => {
//     setTooltip(prev => ({ ...prev, visible: false }));
//   };

//   // Create candlestick chart with future projections
//   const createCandlestickChart = () => {
//     if (!showCandlesticks || candlestickData.length === 0) {
//       return null;
//     }

//     const width = isMobile ? 200 : 430;
//     const chartHeight = isMobile ? 200 : 260;
//     const volumeHeight = isMobile ? 50 : 70;
//     const padding = isMobile ? 25 : 35;
//     const topPadding = isMobile ? 25 : 35;
//     const bottomPadding = isMobile ? 35 : 45;
//     const height = chartHeight + volumeHeight + topPadding + bottomPadding + 20;

//     // **KEY FIX**: Create future time slots for confidence intervals
//     const futureMinutes = 30; // Show 30 minutes into the future
//     const lastTimestamp = candlestickData[candlestickData.length - 1]?.timestamp || Date.now();
//     const futureTimeSlots = Array.from({ length: futureMinutes }, (_, i) =>
//       lastTimestamp + ((i + 1) * 60000) // Add 1 minute intervals
//     );

//     // **UPDATED**: Total data points including future slots
//     const totalDataPoints = candlestickData.length + futureTimeSlots.length;
//     const candleWidth = Math.max(2, (width - 2 * padding) / totalDataPoints - 1);
//     const xStep = (width - 2 * padding) / Math.max(totalDataPoints - 1, 1);

//     const prices = candlestickData.flatMap(d => [d.open, d.high, d.low, d.close]);

//     // Include forecast prices in range calculation
//     const firstForecast = displayForecast[0];
//     if (firstForecast) {
//       prices.push(
//         firstForecast.entry,
//         firstForecast.stop_loss,
//         firstForecast.take_profit,
//         ...Object.values(firstForecast.confidence_intervals).flat()
//       );
//     }

//     const minPrice = Math.min(...prices) * 0.998;
//     const maxPrice = Math.max(...prices) * 1.002;
//     const priceRange = maxPrice - minPrice;
//     const maxVolume = Math.max(...candlestickData.map(d => d.volume));

//     const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * chartHeight;
//     const getX = (index: number) => padding + index * xStep;
//     const getVolumeY = (volume: number) => chartHeight + padding + 20 + (1 - volume / maxVolume) * volumeHeight;

//     return (
//       <svg
//         ref={svgRef}
//         width={width}
//         height={height}
//         className="w-full h-full"
//         viewBox={`0 0 ${width} ${height}`}
//         onMouseLeave={hideTooltip}
//       >
//         {/* Price chart grid with more Y-axis lines */}
//         {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((ratio, i) => (
//           <line
//             key={i}
//             x1={padding}
//             y1={padding + ratio * chartHeight}
//             x2={width - padding}
//             y2={padding + ratio * chartHeight}
//             stroke="#1f2937"
//             strokeWidth={1}
//             opacity={i % 2 === 0 ? 0.3 : 0.15}
//           />
//         ))}

//         {/* Vertical line to separate historical and forecast */}
//         <line
//           x1={getX(candlestickData.length - 1)}
//           y1={padding}
//           x2={getX(candlestickData.length - 1)}
//           y2={chartHeight + padding}
//           stroke="#374151"
//           strokeWidth={2}
//           strokeDasharray="5,5"
//           opacity={0.6}
//         />

//         {/* Volume chart grid */}
//         <line
//           x1={padding}
//           y1={chartHeight + padding + 20}
//           x2={width - padding}
//           y2={chartHeight + padding + 20}
//           stroke="#1f2937"
//           strokeWidth={1}
//           opacity={0.5}
//         />

//         {/* **UPDATED**: Confidence intervals extending into future */}
//         {firstForecast && (
//           <>
//             {(() => {
//               // Start from the last candlestick position
//               const startX = getX(candlestickData.length - 1);
//               const endX = width - padding;
//               const currentPrice = candlestickData[candlestickData.length - 1]?.close || firstForecast.entry;

//               // Create curved confidence zones extending into the future
//               const createFutureConfidencePath = (upperBound: number, lowerBound: number) => {
//                 const startY = getY(currentPrice);
//                 const midX = startX + (endX - startX) * 0.3;
//                 const endUpperY = getY(upperBound);
//                 const endLowerY = getY(lowerBound);

//                 return `
//                   M ${startX},${startY}
//                   Q ${midX},${startY} ${midX + 20},${(endUpperY + endLowerY) / 2}
//                   L ${endX},${endUpperY}
//                   L ${endX},${endLowerY}
//                   Q ${midX},${(endUpperY + endLowerY) / 2} ${startX},${startY}
//                   Z
//                 `;
//               };

//               return (
//                 <>
//                   {/* 90% Confidence Zone */}
//                   <path
//                     d={createFutureConfidencePath(
//                       firstForecast.confidence_intervals[90][1],
//                       firstForecast.confidence_intervals[90][0]
//                     )}
//                     fill="#22c55e"
//                     fillOpacity={0.1}
//                     stroke="#22c55e"
//                     strokeOpacity={0.3}
//                     strokeWidth={1}
//                   />

//                   {/* 80% Confidence Zone */}
//                   <path
//                     d={createFutureConfidencePath(
//                       firstForecast.confidence_intervals[80][1],
//                       firstForecast.confidence_intervals[80][0]
//                     )}
//                     fill="#f59e0b"
//                     fillOpacity={0.15}
//                     stroke="#f59e0b"
//                     strokeOpacity={0.4}
//                     strokeWidth={1}
//                   />

//                   {/* 50% Confidence Zone (most likely) */}
//                   <path
//                     d={createFutureConfidencePath(
//                       firstForecast.confidence_intervals[50][1],
//                       firstForecast.confidence_intervals[50][0]
//                     )}
//                     fill="#3b82f6"
//                     fillOpacity={0.2}
//                     stroke="#3b82f6"
//                     strokeOpacity={0.5}
//                     strokeWidth={2}
//                   />
//                 </>
//               );
//             })()}

//             {/* Trading lines extending into future */}
//             <line
//               x1={getX(candlestickData.length - 1)}
//               y1={getY(firstForecast.entry)}
//               x2={width - padding}
//               y2={getY(firstForecast.entry)}
//               stroke="#10b981"
//               strokeWidth={2}
//               strokeDasharray="8,4"
//               opacity={0.8}
//             />

//             <line
//               x1={getX(candlestickData.length - 1)}
//               y1={getY(firstForecast.stop_loss)}
//               x2={width - padding}
//               y2={getY(firstForecast.stop_loss)}
//               stroke="#ef4444"
//               strokeWidth={2}
//               strokeDasharray="8,4"
//               opacity={0.8}
//             />

//             <line
//               x1={getX(candlestickData.length - 1)}
//               y1={getY(firstForecast.take_profit)}
//               x2={width - padding}
//               y2={getY(firstForecast.take_profit)}
//               stroke="#8b5cf6"
//               strokeWidth={2}
//               strokeDasharray="8,4"
//               opacity={0.8}
//             />

//             {/* Labels positioned in future area */}
//             <text x={width - padding - 5} y={getY(firstForecast.entry) - 5} fill="#10b981" fontSize="10" textAnchor="end" className="font-bold">
//               ENTRY ${firstForecast.entry.toLocaleString()}
//             </text>
//             <text x={width - padding - 5} y={getY(firstForecast.take_profit) - 5} fill="#8b5cf6" fontSize="10" textAnchor="end" className="font-bold">
//               TARGET ${firstForecast.take_profit.toLocaleString()}
//             </text>
//             <text x={width - padding - 5} y={getY(firstForecast.stop_loss) + 15} fill="#ef4444" fontSize="10" textAnchor="end" className="font-bold">
//               STOP ${firstForecast.stop_loss.toLocaleString()}
//             </text>
//           </>
//         )}

//         {/* Candlesticks (only historical data) */}
//         {candlestickData.map((candle, i) => {
//           const x = getX(i);
//           const openY = getY(candle.open);
//           const closeY = getY(candle.close);
//           const highY = getY(candle.high);
//           const lowY = getY(candle.low);

//           const isGreen = candle.close > candle.open;
//           const bodyHeight = Math.abs(closeY - openY);
//           const bodyY = Math.min(openY, closeY);

//           return (
//             <g key={i}>
//               {/* Wick */}
//               <line
//                 x1={x}
//                 y1={highY}
//                 x2={x}
//                 y2={lowY}
//                 stroke={isGreen ? "#10b981" : "#ef4444"}
//                 strokeWidth={1}
//               />

//               {/* Body */}
//               <rect
//                 x={x - candleWidth / 2}
//                 y={bodyY}
//                 width={candleWidth}
//                 height={Math.max(bodyHeight, 1)}
//                 fill={isGreen ? "#10b981" : "#ef4444"}
//                 stroke={isGreen ? "#10b981" : "#ef4444"}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...candle, type: 'candlestick' })}
//               />

//               {/* Volume bars */}
//               <rect
//                 x={x - candleWidth / 2}
//                 y={getVolumeY(candle.volume)}
//                 width={candleWidth}
//                 height={(candle.volume / maxVolume) * volumeHeight}
//                 fill={isGreen ? "#10b981" : "#ef4444"}
//                 opacity={0.6}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...candle, type: 'volume' })}
//               />
//             </g>
//           );
//         })}

//         {/* Current price indicator */}
//         <line
//           x1={padding}
//           y1={getY(currentPrice)}
//           x2={getX(candlestickData.length - 1)}
//           y2={getY(currentPrice)}
//           stroke="#fbbf24"
//           strokeWidth={2}
//           opacity={0.9}
//         />
//         {/* <text x={getX(candlestickData.length - 1) - 5} y={getY(currentPrice) - 5} fill="#fbbf24" fontSize="12" textAnchor="end" className="font-bold">
//           ${currentPrice.toLocaleString()}
//         </text> */}
//         {currentPrice != null ? (
//           <text
//             x={getX(candlestickData.length - 1) - 5}
//             y={getY(currentPrice) - 5}
//             fill="#fbbf24"
//             fontSize="12"
//             textAnchor="end"
//             className="font-bold"
//           >
//             ${currentPrice.toLocaleString()}
//           </text>
//         ) : (
//           // you could render nothing, or a spinner, or “Loading…”
//           <text
//             x={getX(candlestickData.length - 1) - 5}
//             y={padding - 5}
//             fill="#fbbf24"
//             fontSize="10"
//             textAnchor="end"
//           >
//             Loading…
//           </text>
//         )}


//         {/* **UPDATED**: More granular price labels on Y-axis */}
//         {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
//           const price = minPrice + (maxPrice - minPrice) * (1 - ratio);
//           return (
//             <text key={i} x={padding - 5} y={padding + ratio * chartHeight + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//               ${Math.round(price).toLocaleString()}
//             </text>
//           );
//         })}

//         {/* Volume label */}
//         <text x={padding - 5} y={chartHeight + padding + 35} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="end">
//           Volume
//         </text>

//         {/* **UPDATED**: Enhanced time labels showing current and future */}
//         {candlestickData.length > 1 && (
//           <>
//             <text x={padding} y={height - 10} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               {new Date(candlestickData[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//             </text>
//             <text x={getX(candlestickData.length - 1)} y={height - 10} fill="#fbbf24" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               NOW
//             </text>
//             <text x={width - padding} y={height - 10} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               +30min
//             </text>
//           </>
//         )}

//         {/* Legend for confidence zones */}
//         <g>
//           <text x={padding + 10} y={padding + 20} fill="#9ca3af" fontSize="10" className="font-bold">
//             Confidence Zones:
//           </text>
//           <rect x={padding + 10} y={padding + 25} width={12} height={8} fill="#3b82f6" fillOpacity={0.2} />
//           <text x={padding + 25} y={padding + 32} fill="#9ca3af" fontSize="8">50%</text>

//           <rect x={padding + 50} y={padding + 25} width={12} height={8} fill="#f59e0b" fillOpacity={0.15} />
//           <text x={padding + 65} y={padding + 32} fill="#9ca3af" fontSize="8">80%</text>

//           <rect x={padding + 90} y={padding + 25} width={12} height={8} fill="#22c55e" fillOpacity={0.1} />
//           <text x={padding + 105} y={padding + 32} fill="#9ca3af" fontSize="8">90%</text>
//         </g>
//       </svg>
//     );
//   };

//   // Create regular SVG chart for non-today views
//   const createSVGChart = () => {
// const isToday = selectedTimeframe === 'TODAY';
// const lastHourly = hourlyForecast && hourlyForecast.length
//   ? hourlyForecast[hourlyForecast.length - 1]
//   : null;



//     if (showCandlesticks) {
//       return createCandlestickChart();
//     }

//     const allData = [
//       ...displayPriceHistory.map(item => ({ ...item, type: 'historical' })),
//       ...displayForecast.map(item => ({ ...item, price: item.entry, type: 'forecast' }))
//     ];

//     if (allData.length === 0) {
//       return (
//         <div className="flex items-center justify-center h-full text-gray-400">
//           No data available for selected timeframe
//         </div>
//       );
//     }

//     const allPrices = [
//       ...allData.map(item => item.price),
//       ...displayForecast.flatMap(item => [
//         item.confidence_intervals[90][0],
//         item.confidence_intervals[90][1],
//         item.stop_loss,
//         item.take_profit
//       ])
//     ];

//     const minPrice = Math.min(...allPrices) * 0.995;
//     const maxPrice = Math.max(...allPrices) * 1.005;
//     const priceRange = maxPrice - minPrice;

//     const width = isMobile ? 350 : 500;
//     const height = isMobile ? 200 : 300;
//     const padding = isMobile ? 30 : 50;

//     const xStep = (width - 2 * padding) / Math.max(allData.length - 1, 1);

//     const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);
//     const getX = (index: number) => padding + index * xStep;

//     return (
//       <svg
//         ref={svgRef}
//         width={width}
//         height={height}
//         className="w-full h-full"
//         viewBox={`0 0 ${width} ${height}`}
//         onMouseLeave={hideTooltip}
//       >
//         {/* Grid lines */}
//         {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
//           <line
//             key={i}
//             x1={padding}
//             y1={padding + ratio * (height - 2 * padding)}
//             x2={width - padding}
//             y2={padding + ratio * (height - 2 * padding)}
//             stroke="#1f2937"
//             strokeWidth={1}
//             opacity={0.3}
//           />
//         ))}

//         {/* Confidence Intervals */}
//         {/* ── Today’s hourly CI & lines ── */}
// {isToday && lastHourly && (
//   <>
//     {/* Confidence zones */}
//     {[
//       { bounds: lastHourly.confidence_90, color: '#22c55e', opacity: .1, strokeOp: .3, strokeW: 1 },
//       { bounds: lastHourly.confidence_80, color: '#f59e0b', opacity: .15, strokeOp: .4, strokeW: 1 },
//       { bounds: lastHourly.confidence_50, color: '#3b82f6', opacity: .2, strokeOp: .5, strokeW: 2 },
//     ].map(({ bounds, color, opacity, strokeOp, strokeW }, i) => {
//       const [low, high] = bounds!;
//       const pathD = (() => {
//         // your existing helper logic for a single CI zone,
//         // e.g. reuse createConfidenceArea but adapted:
//         const pts = [
//           { x: getX(i), y: getY(high) },
//           { x: getX(i), y: getY(low) }
//         ];
//         return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y} Z`;
//       })();
//       return (
//         <path
//           key={i}
//           d={pathD}
//           fill={color}
//           fillOpacity={opacity}
//           stroke={color}
//           strokeOpacity={strokeOp}
//           strokeWidth={strokeW}
//         />
//       );
//     })}

//     {/* Entry / Stop / Target */}
//     {[
//       { price: lastHourly.entry_price, key: 'ENTRY',   col: '#10b981' },
//       { price: lastHourly.stop_loss,   key: 'STOP',    col: '#ef4444' },
//       { price: lastHourly.take_profit, key: 'TARGET',  col: '#8b5cf6' },
//     ].map(({ price, key, col }, i) =>
//       price != null && (
//         <React.Fragment key={key}>
//           <line
//             x1={getX(0)} y1={getY(price)}
//             x2={getX(allData.length-1)} y2={getY(price)}
//             stroke={col} strokeWidth={2} strokeDasharray="6,3"
//           />
//           <text
//             x={getX(allData.length-1) - 4} y={getY(price) + (i===1?12:-4)}
//             fill={col} fontSize="10" textAnchor="end" className="font-bold"
//           >
//             {key} ${price.toLocaleString()}
//           </text>
//         </React.Fragment>
//       )
//     )}
//   </>
// )}

//  {!isToday && displayPriceHistory.length > 0 && (
//         <polyline
//           points={displayPriceHistory.map((pt,i) => `${getX(i)},${getY(pt.price)}`).join(' ')}
//           fill="none"
//           stroke="#3b82f6"
//           strokeWidth={isMobile ? 2 : 3}
//         />
//       )}
//       {!isToday && displayForecast.length > 0 && (
//         <polyline
//           points={displayForecast.map((fc,i) => `${getX(displayPriceHistory.length + i)},${getY(fc.entry)}`).join(' ')}
//           fill="none"
//           stroke="#10b981"
//           strokeWidth={isMobile ? 2 : 3}
//           strokeDasharray="8,4"
//         />
//       )}


//         {displayForecast.length > 0 && (
//           <>
//             {(() => {
//               const createConfidenceArea = (upperBounds: number[], lowerBounds: number[]) => {
//                 const points = displayForecast.map((_, i) => ({
//                   x: getX(displayPriceHistory.length + i),
//                   upper: upperBounds[i],
//                   lower: lowerBounds[i]
//                 }));

//                 let upperPath = `M ${points[0].x},${points[0].upper}`;
//                 for (let i = 1; i < points.length; i++) {
//                   const prev = points[i - 1];
//                   const curr = points[i];
//                   const cp1x = prev.x + (curr.x - prev.x) / 3;
//                   const cp2x = curr.x - (curr.x - prev.x) / 3;
//                   upperPath += ` C ${cp1x},${prev.upper} ${cp2x},${curr.upper} ${curr.x},${curr.upper}`;
//                 }

//                 let lowerPath = `L ${points[points.length - 1].x},${points[points.length - 1].lower}`;
//                 for (let i = points.length - 2; i >= 0; i--) {
//                   const next = points[i + 1];
//                   const curr = points[i];
//                   const cp1x = next.x - (next.x - curr.x) / 3;
//                   const cp2x = curr.x + (next.x - curr.x) / 3;
//                   lowerPath += ` C ${cp1x},${next.lower} ${cp2x},${curr.lower} ${curr.x},${curr.lower}`;
//                 }

//                 return upperPath + lowerPath + ' Z';
//               };

//               // const ci90Upper = displayForecast.map(item => getY(item.confidence_intervals[90][1]));
//               // const ci90Lower = displayForecast.map(item => getY(item.confidence_intervals[90][0]));
//               // const ci80Upper = displayForecast.map(item => getY(item.confidence_intervals[80][1]));
//               // const ci80Lower = displayForecast.map(item => getY(item.confidence_intervals[80][0]));
//               // const ci50Upper = displayForecast.map(item => getY(item.confidence_intervals[50][1]));
//               // const ci50Lower = displayForecast.map(item => getY(item.confidence_intervals[50][0]));
//                const ci90Upper = displayForecast.map(item => getY(item.confidence_90[1]));
//                const ci90Lower = displayForecast.map(item => getY(item.confidence_90[0]));
//                const ci80Upper = displayForecast.map(item => getY(item.confidence_80[1]));
//                const ci80Lower = displayForecast.map(item => getY(item.confidence_80[0]));
//                const ci50Upper = displayForecast.map(item => getY(item.confidence_50[1]));
//                const ci50Lower = displayForecast.map(item => getY(item.confidence_50[0]));

//               return (
//                 <>
//                   <path
//                     d={createConfidenceArea(ci90Upper, ci90Lower)}
//                     fill="#22c55e"
//                     fillOpacity={0.15}
//                     stroke="none"
//                   />
//                   <path
//                     d={createConfidenceArea(ci80Upper, ci80Lower)}
//                     fill="#f59e0b"
//                     fillOpacity={0.2}
//                     stroke="none"
//                   />
//                   <path
//                     d={createConfidenceArea(ci50Upper, ci50Lower)}
//                     fill="#3b82f6"
//                     fillOpacity={0.25}
//                     stroke="none"
//                   />
//                 </>
//               );
//             })()}


//             <line
//               x1={getX(displayPriceHistory.length)}
//               y1={getY(displayForecast[0]?.entry || 0)}
//               x2={getX(displayPriceHistory.length + displayForecast.length - 1)}
//               y2={getY(displayForecast[displayForecast.length - 1]?.entry || 0)}
//               stroke="#059669"
//               strokeWidth={isMobile ? 1.5 : 2}
//               strokeDasharray="6,3"
//             />

//             <line
//               x1={getX(displayPriceHistory.length)}
//               y1={getY(displayForecast[0]?.stop_loss || 0)}
//               x2={getX(displayPriceHistory.length + displayForecast.length - 1)}
//               y2={getY(displayForecast[displayForecast.length - 1]?.stop_loss || 0)}
//               stroke="#dc2626"
//               strokeWidth={isMobile ? 1.5 : 2}
//               strokeDasharray="6,3"
//             />

//             <line
//               x1={getX(displayPriceHistory.length)}
//               y1={getY(displayForecast[0]?.take_profit || 0)}
//               x2={getX(displayPriceHistory.length + displayForecast.length - 1)}
//               y2={getY(displayForecast[displayForecast.length - 1]?.take_profit || 0)}
//               stroke="#7c3aed"
//               strokeWidth={isMobile ? 1.5 : 2}
//               strokeDasharray="6,3"
//             />
//           </>
//         )}

//         {/* Price lines */}
//         {displayPriceHistory.length > 0 && (
//           <polyline
//             points={displayPriceHistory.map((item, i) => {
//               const x = getX(i);
//               const y = getY(item.price);
//               return `${x},${y}`;
//             }).join(' ')}
//             fill="none"
//             stroke="#3b82f6"
//             strokeWidth={isMobile ? 2 : 3}
//           />
//         )}

//         {displayForecast.length > 0 && (
//           <polyline
//             points={displayForecast.map((item, i) => {
//               const x = getX(displayPriceHistory.length + i);
//               const y = getY(item.entry);
//               return `${x},${y}`;
//             }).join(' ')}
//             fill="none"
//             stroke="#10b981"
//             strokeWidth={isMobile ? 2 : 3}
//             strokeDasharray="8,4"
//           />
//         )}

//         {/* Data points */}
//         {displayPriceHistory.map((item, i) => {
//           const x = getX(i);
//           const y = getY(item.price);
//           return (
//             <circle
//               key={i}
//               cx={x}
//               cy={y}
//               r={isMobile ? 3 : 4}
//               fill="#3b82f6"
//               stroke="#0a1628"
//               strokeWidth={isMobile ? 1 : 2}
//               style={{ cursor: 'pointer' }}
//               onMouseEnter={(e) => showTooltip(e, { ...item, type: 'historical' })}
//             />
//           );
//         })}

//         {displayForecast.map((item, i) => {
//           const x = getX(displayPriceHistory.length + i);
//           const y = getY(item.entry);
//           const radius = isMobile ? 4 : 5;
//           const arrowSize = isMobile ? 8 : 12;
//           return (
//             <g key={i}>
//               <circle
//                 cx={x}
//                 cy={y}
//                 r={radius}
//                 fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
//                 stroke="#0a1628"
//                 strokeWidth={isMobile ? 1 : 2}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' })}
//               />
//               <polygon
//                 points={item.signal === 'LONG'
//                   ? `${x},${y - arrowSize} ${x - arrowSize / 2},${y - arrowSize / 2} ${x + arrowSize / 2},${y - arrowSize / 2}`
//                   : `${x},${y + arrowSize} ${x - arrowSize / 2},${y + arrowSize / 2} ${x + arrowSize / 2},${y + arrowSize / 2}`
//                 }
//                 fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' })}
//               />
//             </g>
//           );
//         })}

//         {/* Price labels */}
//         <text x={padding - 5} y={padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round(maxPrice).toLocaleString()}
//         </text>
//         <text x={padding - 5} y={height - padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round(minPrice).toLocaleString()}
//         </text>
//         <text x={padding - 5} y={padding + (height - 2 * padding) / 2} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round((maxPrice + minPrice) / 2).toLocaleString()}
//         </text>

//         {/* Date labels */}
//         {allData.length > 1 && (
//           <>
//             <text x={padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               {getSimpleDate(allData[0]?.date)}
//             </text>
//             <text x={width - padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               {getSimpleDate(allData[allData.length - 1]?.date)}
//             </text>
//           </>
//         )}
//       </svg>
//     );
//   };

//   if (!latest) {
//     return (
//       <div className="p-4 text-gray-400">
//         Loading data...
//       </div>
//     );
//   }

//   const firstForecast = latest;
//   const firstForecasts = displayForecast[0] || forecast[0];

//   const formattedAccuracy = firstForecast?.overall_accuracy_percent
//     ? `${firstForecast.overall_accuracy_percent}%`
//     : '98.50%';

//   const formattedDeviation = firstForecast?.deviation_percent
//     ? `+${firstForecast.deviation_percent}%`
//     : '+1.50%';

//   return (
//     <div className={`bg-[#080b12] rounded-lg p-4 ${className}`}>
//       {/* Controls Section */}
//       <div className="flex justify-between items-center mb-4">
//         <select
//           value={selectedAsset}
//           onChange={(e) => setSelectedAsset(e.target.value as 'BTC' | 'SOL' | 'ETH')}
//           className="bg-[#0d1120]/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] focus:border-blue-500 focus:outline-none text-sm"
//         >
//           <option value="BTC">BTC</option>
//           <option value="SOL" disabled>SOL (Soon)</option>
//           <option value="ETH" disabled>ETH (Soon)</option>
//         </select>

//         <SegmentedControl
//           options={[
//             { value: 'TODAY', label: 'Today' },
//            // { value: 'PAST_7D', label: '7D Past' },
//             // { value: 'NEXT_3D', label: '3D Future' }
//           ]}
//           selected={selectedTimeframe}
//           onChange={(value) => setSelectedTimeframe(value as 'TODAY' )} //| 'PAST_7D'| 'NEXT_3D'
//         />
//       </div>

//       {/* Key Metrics */}
//       {(displayForecast.length > 0 || selectedTimeframe === 'TODAY') && firstForecasts && (
//         <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 mb-4`}>
//           <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 border-l-4 border-green-500">
//             <div className="flex justify-between items-start mb-2">
//               <span className="text-gray-400 text-sm">Live Signal</span>
//               <span className="text-green-400 font-bold text-lg">LONG</span>
//             </div>
//             <div className="space-y-1">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Entry:</span>
//                 <span className="text-white font-medium">${firstForecasts.entry.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Target:</span>
//                 <span className="text-green-400">${firstForecasts.take_profit.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Stop:</span>
//                 <span className="text-red-400">${firstForecasts.stop_loss.toLocaleString()}</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4">
//             <div className="text-gray-400 text-sm mb-2">Risk Analysis</div>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">R:R Ratio:</span>
//                 <span className="text-blue-400 font-bold">
//                   1:{getRiskReward(firstForecasts.entry, firstForecasts.stop_loss, firstForecasts.take_profit)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Confidence:</span>
//                 <span className="text-green-400">High (90%)</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Live Update:</span>
//                 <span className="text-white">
//                   {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4">
//             <div className="text-gray-400 text-sm mb-2">Performance</div>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Success Rate:</span>
//                 <span className="text-green-400">{formattedAccuracy}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Margin:</span>
//                 <span className="text-blue-400">{formattedDeviation}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Trend:</span>
//                 <span className="text-green-400">↗ Bullish</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Chart Container */}
//       <div className="w-full bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-2 mb-4 relative"
//         style={{ height: selectedTimeframe === 'TODAY' ? (isMobile ? '320px' : '420px') : (isMobile ? '180px' : '220px') }}>
//          {createSVGChart()} 
//         {/* {isToday
//     ? renderHourlyChart(hourlyForecast || [])
//     : createSVGChart()
//   } */}

//         {/* Tooltip */}
//         {tooltip.visible && tooltip.data && (
//           <div
//             className={`absolute bg-[#080b12] border border-[rgba(255,255,255,0.08)] rounded-lg p-3 text-white shadow-xl z-10 ${isMobile ? 'text-xs min-w-48' : 'text-sm min-w-56'}`}
//             style={{
//               left: tooltip.x + 10,
//               top: tooltip.y - 10,
//               transform: tooltip.x > (isMobile ? 200 : 300) ? 'translateX(-100%)' : 'none'
//             }}
//           >
//             <div className="space-y-2">
//               {tooltip.data.type === 'candlestick' && (
//                 <>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Time:</span>
//                     <span>{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Open:</span>
//                     <span>${Math.round(tooltip.data.open).toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">High:</span>
//                     <span className="text-green-400">${Math.round(tooltip.data.high).toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Low:</span>
//                     <span className="text-red-400">${Math.round(tooltip.data.low).toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Close:</span>
//                     <span>${Math.round(tooltip.data.close).toLocaleString()}</span>
//                   </div>
//                 </>
//               )}

//               {tooltip.data.type === 'volume' && (
//                 <>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Time:</span>
//                     <span>{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Volume:</span>
//                     <span>{Math.round(tooltip.data.volume).toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Price:</span>
//                     <span>${Math.round(tooltip.data.close).toLocaleString()}</span>
//                   </div>
//                 </>
//               )}

//               {tooltip.data.type === 'historical' && (
//                 <>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Date:</span>
//                     <span>{getSimpleDate(tooltip.data.date)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Price:</span>
//                     <span>${Math.round(tooltip.data.price).toLocaleString()}</span>
//                   </div>
//                 </>
//               )}

//               {tooltip.data.type === 'forecast' && (
//                 <>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Date:</span>
//                     <span>{getSimpleDate(tooltip.data.date)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Signal:</span>
//                     <span className={tooltip.data.signal === 'LONG' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
//                       {tooltip.data.signal}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Entry:</span>
//                     <span>${Math.round(tooltip.data.entry).toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Stop:</span>
//                     <span className="text-red-400">${Math.round(tooltip.data.stop_loss).toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Target:</span>
//                     <span className="text-green-400">${Math.round(tooltip.data.take_profit).toLocaleString()}</span>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Legend */}
//       <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-5'} gap-2 text-xs mb-4`}>
//         <div className="flex items-center space-x-2">
//           <div className="w-3 h-0.5 bg-yellow-500"></div>
//           <span className="text-gray-400">Live Price</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-3 h-0.5 bg-blue-500"></div>
//           <span className="text-gray-400">50% Zone</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-3 h-0.5 bg-yellow-600"></div>
//           <span className="text-gray-400">80% Zone</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-3 h-0.5 bg-green-500"></div>
//           <span className="text-gray-400">90% Zone</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-3 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
//           <span className="text-gray-400">Take Profit</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PriceChart;


// import React, { useState, useRef, useEffect } from 'react';

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

// interface PriceData {
//   date: string;
//   price: number;
// }

// interface CandlestickData {
//   timestamp: number;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   volume: number;
// }

// interface ForecastData {
//   date: string;
//   signal: 'LONG' | 'SHORT';
//   entry: number;
//   stop_loss: number;
//   take_profit: number;
//   confidence_intervals: {
//     50: [number, number];
//     80: [number, number];
//     90: [number, number];
//   };
//   deviation_percent?: number | string;
//   overall_accuracy_percent?: number | string;
// }

// interface PriceChartProps {
//   priceHistory?: PriceData[];
//   forecast?: ForecastData[];
//   hourlyForecast?: HourlyForecast[];
//   className?: string;
// }

// interface TooltipData {
//   x: number;
//   y: number;
//   data: any;
//   visible: boolean;
//   type?: 'chart' | 'info';
// }

// // Segmented Control Component
// const SegmentedControl = ({
//   options,
//   selected,
//   onChange,
//   className = ""
// }: {
//   options: { value: string; label: string }[];
//   selected: string;
//   onChange: (value: string) => void;
//   className?: string;
// }) => {
//   return (
//     <div className={`inline-flex bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-1 ${className}`}>
//       {options.map((option) => (
//         <button
//           key={option.value}
//           onClick={() => onChange(option.value)}
//           className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-md transition-all duration-200 ${selected === option.value
//             ? 'bg-blue-600 text-white shadow-md'
//             : 'text-gray-400 hover:text-white hover:bg-[#2a3441]'
//             }`}
//         >
//           {option.label}
//         </button>
//       ))}
//     </div>
//   );
// };

// const fetchRealBitcoinData = async (
//   setDataSource?: (src: 'real' | 'fallback') => void
// ): Promise<CandlestickData[]> => {
//   try {
//     const res = await fetch(
//       'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60'
//     );
//     if (!res.ok) throw new Error(`Binance returned ${res.status}`);
//     const raw = await res.json() as any[][];
//     setDataSource?.('real');
//     return raw.map(([ts, open, high, low, close, volume]) => ({
//       timestamp: ts,
//       open: +open,
//       high: +high,
//       low: +low,
//       close: +close,
//       volume: +volume,
//     }));
//   } catch (err) {
//     console.error('Failed to fetch real candles, falling back:', err);
//     setDataSource?.('fallback');
//     return generateFallbackData();
//   }
// };

// const fetchCurrentBitcoinPrice = async (): Promise<number> => {
//   const res = await fetch(
//     'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
//   );
//   if (!res.ok) throw new Error(`Binance ticker returned ${res.status}`);
//   const json = await res.json() as { price: string };
//   return parseFloat(json.price);
// };

// // Fallback data generator
// const generateFallbackData = (): CandlestickData[] => {
//   const data: CandlestickData[] = [];
//   let currentPrice = 121008;
//   const now = Date.now();

//   for (let i = 59; i >= 0; i--) {
//     const timestamp = now - (i * 60000);
//     const volatility = 0.002;

//     const open = currentPrice;
//     const change = (Math.random() - 0.5) * volatility * currentPrice;
//     const close = open + change;

//     const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
//     const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;

//     const volume = Math.random() * 1000000 + 500000;

//     data.push({
//       timestamp,
//       open,
//       high,
//       low,
//       close,
//       volume
//     });

//     currentPrice = close + (122306 - 121008) / 60;
//   }

//   return data;
// };

// const PriceChart: React.FC<PriceChartProps> = ({
//   priceHistory = [
//     { date: "2025-07-02", price: 104639.48 },
//     { date: "2025-07-03", price: 104611.16 },
//     { date: "2025-07-04", price: 103296.19 },
//     { date: "2025-07-05", price: 101348.19 },
//     { date: "2025-07-06", price: 101987.11 },
//     { date: "2025-07-07", price: 105436.11 },
//     { date: "2025-07-08", price: 106371.09 }
//   ],
//   forecast = [
//     {
//       date: "2025-07-14",
//       signal: "LONG" as const,
//       entry: 117498.65,
//       stop_loss: 115287.826,
//       take_profit: 119709.474,
//       confidence_intervals: {
//         50: [117088.88, 117908.414],
//         80: [116154.45, 118842.84],
//         90: [115877.55, 119119.75]
//       },
//       deviation_percent: 1.5,
//       overall_accuracy_percent: 98.5
//     }
//   ],
//   className = "",
//   hourlyForecast = [
//     {
//       time: "2025-07-15T07:00:00+00:00",
//       signal: "HOLD" as const,
//       entry_price: null,
//       stop_loss: null,
//       take_profit: null,
//       forecast_price: 116632.66,
//       current_price: 116919.4,
//       deviation_percent: "N/A",
//       accuracy_percent: "N/A",
//       risk_reward_ratio: 0.68,
//       sentiment_score: 27.39,
//       confidence_50: [116402.414, 116862.9],
//       confidence_80: [116252.7, 117012.61],
//       confidence_90: [116228.18, 117037.13]
//     },
//     {
//       time: "2025-07-15T08:00:00+00:00",
//       signal: "HOLD" as const,
//       entry_price: null,
//       stop_loss: null,
//       take_profit: null,
//       forecast_price: 116548.55,
//       current_price: 116797,
//       deviation_percent: -0.21,
//       accuracy_percent: 99.79,
//       risk_reward_ratio: 0.61,
//       sentiment_score: 32.27,
//       confidence_50: [116390.73, 116706.37],
//       confidence_80: [116281.36, 116815.734],
//       confidence_90: [116030.195, 117066.9]
//     },
//     {
//       time: "2025-07-15T09:00:00+00:00",
//       signal: "HOLD" as const,
//       entry_price: null,
//       stop_loss: null,
//       take_profit: null,
//       forecast_price: 116705.53,
//       current_price: 116788.51,
//       deviation_percent: -0.07,
//       accuracy_percent: 99.93,
//       risk_reward_ratio: 0.21,
//       sentiment_score: 43.16,
//       confidence_50: [116539, 116872.06],
//       confidence_80: [116475.63, 116935.43],
//       confidence_90: [116293.57, 117117.49]
//     },
//     {
//       time: "2025-07-15T10:00:00+00:00",
//       signal: "HOLD" as const,
//       entry_price: null,
//       stop_loss: null,
//       take_profit: null,
//       forecast_price: 116782.47,
//       current_price: 116813.69,
//       deviation_percent: -0.03,
//       accuracy_percent: 99.97,
//       risk_reward_ratio: 0.08,
//       sentiment_score: 41.33,
//       confidence_50: [116686.77, 116878.164],
//       confidence_80: [116490.4, 117074.54],
//       confidence_90: [116344.86, 117220.08]
//     }
//   ],
// }) => {
//   const [selectedTimeframe, setSelectedTimeframe] = useState<'TODAY' | 'PAST_7D' | 'NEXT_3D'>('TODAY');
//   const [selectedSubTimeframe, setSelectedSubTimeframe] = useState<'3D' | '7D'>('3D');
//   const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SOL' | 'ETH'>('BTC');
//   const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: null, visible: false, type: 'chart' });
//   const [isMobile, setIsMobile] = useState(false);
//   const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
//   const [currentPrice, setCurrentPrice] = useState<number>(0);
//   const [isLoadingData, setIsLoadingData] = useState(true);
//   const [dataSource, setDataSource] = useState<'real' | 'fallback'>('real');
//   const svgRef = useRef<SVGSVGElement>(null);

//   const [latest, setLatest] = useState<{
//     deviation_percent?: number | string;
//     overall_accuracy_percent?: number | string;
//   } | null>(null);

//   useEffect(() => {
//     const mockLatest = {
//       deviation_percent: 1.5,
//       overall_accuracy_percent: 98.5
//     };
//     setLatest(mockLatest);
//   }, []);

//   useEffect(() => {
//     const initializeRealData = async () => {
//       setIsLoadingData(true);
//       const realData = await fetchRealBitcoinData(setDataSource);
//       setCandlestickData(realData);

//       if (realData.length > 0) {
//         setCurrentPrice(realData[realData.length - 1].close);
//       }

//       setIsLoadingData(false);
//     };

//     initializeRealData();
//   }, []);

//   useEffect(() => {
//     const id = setInterval(async () => {
//       try {
//         const live = await fetchCurrentBitcoinPrice();
//         setCurrentPrice(live);
//       } catch {
//         // swallow or log
//       }
//     }, 10_000);
//     return () => clearInterval(id);
//   }, []);

//   // Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Get simplified date format (MM/DD)
//   const getSimpleDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
//   };

//   // Calculate risk/reward ratio
//   const getRiskReward = (entry: number, stop: number, target: number, signal: 'LONG' | 'SHORT' = 'LONG') => {
//     let risk: number;
//     let reward: number;

//     if (signal === 'LONG') {
//       risk = entry - stop;
//       reward = target - entry;
//     } else {
//       risk = stop - entry;
//       reward = entry - target;
//     }

//     if (risk <= 0 || reward <= 0) {
//       return '0.0';
//     }

//     return (reward / risk).toFixed(1);
//   };

//   // Calculate key levels based on current price and recent data
//   const getKeyLevels = (price: number, recentData?: CandlestickData[]) => {
//     if (!recentData || recentData.length === 0) {
//       return {
//         support: price * 0.996,
//         resistance: price * 1.004,
//         breakoutLevel: price * 1.002,
//         invalidationLevel: price * 0.993
//       };
//     }

//     // Calculate support/resistance from recent highs/lows
//     const recentHighs = recentData.slice(-20).map(d => d.high);
//     const recentLows = recentData.slice(-20).map(d => d.low);

//     const resistance = Math.max(...recentHighs);
//     const support = Math.min(...recentLows);
//     const breakoutLevel = resistance * 1.001;
//     const invalidationLevel = support * 0.999;

//     return { support, resistance, breakoutLevel, invalidationLevel };
//   };

//   // Calculate market structure from actual price data
//   const getMarketStructure = (currentPrice: number, recentData?: CandlestickData[], signal?: string) => {
//     if (!recentData || recentData.length < 10) {
//       return {
//         trend: signal === 'LONG' ? 'Bullish' : signal === 'SHORT' ? 'Bearish' : 'Sideways',
//         shortTermTrend: 'Insufficient Data',
//         longTermTrend: 'Insufficient Data'
//       };
//     }

//     // Short term trend (last 10 candles)
//     const shortTermData = recentData.slice(-10);
//     const shortTermStart = shortTermData[0].close;
//     const shortTermEnd = shortTermData[shortTermData.length - 1].close;
//     const shortTermChange = (shortTermEnd - shortTermStart) / shortTermStart;

//     // Long term trend (last 30 candles)
//     const longTermData = recentData.slice(-30);
//     const longTermStart = longTermData[0].close;
//     const longTermEnd = longTermData[longTermData.length - 1].close;
//     const longTermChange = (longTermEnd - longTermStart) / longTermStart;

//     const getTrendLabel = (change: number) => {
//       if (change > 0.01) return 'Bullish';
//       if (change < -0.01) return 'Bearish';
//       return 'Sideways';
//     };

//     return {
//       trend: signal === 'LONG' ? 'Bullish' : signal === 'SHORT' ? 'Bearish' : 'Sideways',
//       shortTermTrend: getTrendLabel(shortTermChange),
//       longTermTrend: getTrendLabel(longTermChange)
//     };
//   };

//   // Calculate performance metrics from hourly forecast data
//   const calculatePerformanceMetrics = (hourlyData?: HourlyForecast[]) => {
//     if (!hourlyData || hourlyData.length === 0) {
//       return {
//         winRate: 0,
//         avgGain: 0,
//         avgLoss: 0,
//         profitFactor: 0,
//         winProbability: 0,
//         maxDrawdown: 0
//       };
//     }

//     const validData = hourlyData.filter(h =>
//       h.accuracy_percent !== 'N/A' &&
//       h.deviation_percent !== 'N/A' &&
//       typeof h.accuracy_percent === 'number' &&
//       typeof h.deviation_percent === 'number'
//     );

//     if (validData.length === 0) {
//       return {
//         winRate: 98.5, // fallback from latest data
//         avgGain: 1.8,
//         avgLoss: 0.9,
//         profitFactor: 2.0,
//         winProbability: 75,
//         maxDrawdown: 2.1
//       };
//     }

//     const accuracies = validData.map(h => Number(h.accuracy_percent));
//     const deviations = validData.map(h => Number(h.deviation_percent));

//     const winRate = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

//     const gains = deviations.filter(d => d > 0);
//     const losses = deviations.filter(d => d < 0).map(d => Math.abs(d));

//     const avgGain = gains.length > 0 ? gains.reduce((sum, g) => sum + g, 0) / gains.length : 0;
//     const avgLoss = losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / losses.length : 0;

//     const profitFactor = avgLoss > 0 ? avgGain / avgLoss : 0;
//     const winProbability = (gains.length / validData.length) * 100;
//     const maxDrawdown = Math.max(...losses, 0);

//     return {
//       winRate: Math.round(winRate * 100) / 100,
//       avgGain: Math.round(avgGain * 100) / 100,
//       avgLoss: Math.round(avgLoss * 100) / 100,
//       profitFactor: Math.round(profitFactor * 100) / 100,
//       winProbability: Math.round(winProbability),
//       maxDrawdown: Math.round(maxDrawdown * 100) / 100
//     };
//   };

//   // Calculate position size based on volatility and risk
//   const calculatePositionSize = (signal: string, riskReward: number, volatility: number) => {
//     if (signal === 'HOLD') return 'Conservative (1-2%)';

//     // Base position size on risk/reward and volatility
//     if (riskReward > 2 && volatility < 0.02) return 'Aggressive (3-5%)';
//     if (riskReward > 1.5 && volatility < 0.025) return 'Moderate (2-3%)';
//     return 'Conservative (1-2%)';
//   };

//   // Calculate market volatility from recent data
//   const calculateVolatility = (recentData?: CandlestickData[]) => {
//     if (!recentData || recentData.length < 10) return 0.02; // default

//     const returns = recentData.slice(-10).map((candle, i, arr) => {
//       if (i === 0) return 0;
//       return (candle.close - arr[i - 1].close) / arr[i - 1].close;
//     }).slice(1);

//     const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
//     const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;

//     return Math.sqrt(variance);
//   };

//   // Calculate market context from data
//   const getMarketContext = (recentData?: CandlestickData[], sentimentScore?: number) => {
//     if (!recentData || recentData.length === 0) {
//       return {
//         newsImpact: 'Unknown',
//         technicalSetup: 'Unknown',
//         volumeStatus: 'Unknown',
//         correlation: 'Unknown'
//       };
//     }

//     // Volume analysis
//     const recentVolumes = recentData.slice(-10).map(d => d.volume);
//     const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
//     const currentVolume = recentData[recentData.length - 1]?.volume || 0;

//     const volumeRatio = currentVolume / avgVolume;
//     let volumeStatus = 'Average';
//     if (volumeRatio > 1.2) volumeStatus = 'Above Average';
//     if (volumeRatio < 0.8) volumeStatus = 'Below Average';

//     // Technical setup based on price action
//     const recent5 = recentData.slice(-5);
//     const priceRange = Math.max(...recent5.map(d => d.high)) - Math.min(...recent5.map(d => d.low));
//     const avgPrice = recent5.reduce((sum, d) => sum + d.close, 0) / recent5.length;
//     const volatilityRatio = priceRange / avgPrice;

//     let technicalSetup = 'Consolidation';
//     if (volatilityRatio > 0.03) technicalSetup = 'Breakout Pending';
//     if (volatilityRatio > 0.05) technicalSetup = 'High Volatility';

//     // News impact based on sentiment score
//     let newsImpact = 'Low';
//     if (sentimentScore) {
//       if (sentimentScore > 60 || sentimentScore < 20) newsImpact = 'High';
//       else if (sentimentScore > 45 || sentimentScore < 35) newsImpact = 'Medium';
//     }

//     return {
//       newsImpact,
//       technicalSetup,
//       volumeStatus,
//       correlation: 'Following Crypto Market' // This would need external data to compute properly
//     };
//   };

//   // Filter data based on selected timeframe
//   const getFilteredData = () => {
//     if (selectedTimeframe === 'TODAY') {
//       return {
//         historical: [],
//         forecast: selectedSubTimeframe === '3D' ? forecast : [],
//         showCandlesticks: true
//       };
//     } else if (selectedTimeframe === 'PAST_7D') {
//       return {
//         historical: priceHistory,
//         forecast: [],
//         showCandlesticks: false
//       };
//     } else {
//       return {
//         historical: [],
//         forecast: forecast,
//         showCandlesticks: false
//       };
//     }
//   };

//   const lastHourly = hourlyForecast && hourlyForecast.length > 0
//     ? hourlyForecast[hourlyForecast.length - 1]
//     : null;

//   const { historical: displayPriceHistory, forecast: displayForecast, showCandlesticks } = getFilteredData();

//   // Show/hide tooltip
//   const showTooltip = (
//     event: React.MouseEvent,
//     data: any,
//     type: 'chart' | 'info' = 'chart'
//   ) => {
//     if (!svgRef.current) return;

//     // 1. grab the SVG’s position on screen
//     const { left, top } = svgRef.current.getBoundingClientRect();

//     // 2. compute cursor position inside the SVG
//     const x = event.clientX - left;
//     const y = event.clientY - top;

//     setTooltip({ x, y, data, visible: true, type });
//   };

//   const hideTooltip = () => {
//     setTooltip(prev => ({ ...prev, visible: false }));
//   };

//   // Tooltip content definitions
//   const tooltipContent = {
//     riskManagement: {
//       title: "Risk Management",
//       content: [
//         "Risk vs Reward: Calculated as (Take Profit - Entry) ÷ (Entry - Stop Loss). Higher ratios indicate better risk-adjusted returns.",
//         "Position Size: Recommended portfolio allocation based on volatility and R:R ratio. Conservative (1-2%), Moderate (2-3%), Aggressive (3-5%).",
//         "Win Probability: Percentage of positive price deviations from historical hourly forecasts.",
//         "Max Drawdown: Largest single loss percentage observed in recent trading signals."
//       ]
//     },
//     performanceMetrics: {
//       title: "Performance Metrics",
//       content: [
//         "Win Rate: Average accuracy percentage from the last 100 hourly predictions.",
//         "Avg Gain: Mean percentage gain from all profitable prediction periods.",
//         "Avg Loss: Mean percentage loss from all unprofitable prediction periods.",
//         "Profit Factor: Ratio of average gains to average losses. Values above 2.0 indicate strong performance."
//       ]
//     },
//     marketStructure: {
//       title: "Market Structure & Key Levels",
//       content: [
//         "Trend Direction: Short-term (10 candles) vs Long-term (30 candles) price movement analysis.",
//         "Key Pivot: Current price level acting as decision point for market direction.",
//         "Next Resistance: Calculated from recent 20-period highs, where selling pressure may increase.",
//         "Next Support: Calculated from recent 20-period lows, where buying interest typically emerges."
//       ]
//     }
//   };

//   // Create candlestick chart with future projections
//   const createCandlestickChart = () => {
//     if (!showCandlesticks || candlestickData.length === 0) {
//       return null;
//     }

//     const width = isMobile ? 200 : 430;
//     const chartHeight = isMobile ? 200 : 260;
//     const volumeHeight = isMobile ? 50 : 70;
//     const padding = isMobile ? 25 : 35;
//     const topPadding = isMobile ? 25 : 35;
//     const bottomPadding = isMobile ? 35 : 45;
//     const height = chartHeight + volumeHeight + topPadding + bottomPadding + 20;

//     const futureMinutes = 30;
//     const lastTimestamp = candlestickData[candlestickData.length - 1]?.timestamp || Date.now();
//     const futureTimeSlots = Array.from({ length: futureMinutes }, (_, i) =>
//       lastTimestamp + ((i + 1) * 60000)
//     );

//     const totalDataPoints = candlestickData.length + futureTimeSlots.length;
//     const candleWidth = Math.max(2, (width - 2 * padding) / totalDataPoints - 1);
//     const xStep = (width - 2 * padding) / Math.max(totalDataPoints - 1, 1);

//     const prices = candlestickData.flatMap(d => [d.open, d.high, d.low, d.close]);

//     // Include hourly forecast confidence intervals in price range
//     if (lastHourly) {
//       prices.push(
//         lastHourly.forecast_price,
//         lastHourly.confidence_50[0], lastHourly.confidence_50[1],
//         lastHourly.confidence_80[0], lastHourly.confidence_80[1],
//         lastHourly.confidence_90[0], lastHourly.confidence_90[1]
//       );

//       if (displayEntry) prices.push(displayEntry);
//       if (displayStopLoss) prices.push(displayStopLoss);
//       if (displayTakeProfit) prices.push(displayTakeProfit);
//     }

//     // Add key levels to price range
//     const keyLevels = getKeyLevels(currentPrice);
//     prices.push(keyLevels.support, keyLevels.resistance, keyLevels.breakoutLevel, keyLevels.invalidationLevel);

//     const minPrice = Math.min(...prices) * 0.998;
//     const maxPrice = Math.max(...prices) * 1.002;
//     const priceRange = maxPrice - minPrice;
//     const maxVolume = Math.max(...candlestickData.map(d => d.volume));

//     const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * chartHeight;
//     const getX = (index: number) => padding + index * xStep;
//     const getVolumeY = (volume: number) => chartHeight + padding + 20 + (1 - volume / maxVolume) * volumeHeight;

//     return (
//       <svg
//         ref={svgRef}
//         width={width}
//         height={height}
//         className="w-full h-full"
//         viewBox={`0 0 ${width} ${height}`}
//       // onMouseLeave={hideTooltip}
//       >
//         {/* Price chart grid */}
//         {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((ratio, i) => (
//           <line
//             key={i}
//             x1={padding}
//             y1={padding + ratio * chartHeight}
//             x2={width - padding}
//             y2={padding + ratio * chartHeight}
//             stroke="#1f2937"
//             strokeWidth={1}
//             opacity={i % 2 === 0 ? 0.3 : 0.15}
//           />
//         ))}

//         {/* Key Support/Resistance Levels */}
//         {(() => {
//           const levels = getKeyLevels(currentPrice);
//           return (
//             <>
//               {/* Support Line */}
//               <line
//                 x1={padding}
//                 y1={getY(levels.support)}
//                 x2={width - padding}
//                 y2={getY(levels.support)}
//                 stroke="#ef4444"
//                 strokeWidth={2}
//                 strokeDasharray="3,3"
//                 opacity={0.7}
//               />
//               <text x={padding + 5} y={getY(levels.support) - 5} fill="#ef4444" fontSize="10" className="font-bold">
//                 SUPPORT ${Math.round(levels.support).toLocaleString()}
//               </text>

//               {/* Resistance Line */}
//               <line
//                 x1={padding}
//                 y1={getY(levels.resistance)}
//                 x2={width - padding}
//                 y2={getY(levels.resistance)}
//                 stroke="#10b981"
//                 strokeWidth={2}
//                 strokeDasharray="3,3"
//                 opacity={0.7}
//               />
//               <text x={padding + 5} y={getY(levels.resistance) + 15} fill="#10b981" fontSize="10" className="font-bold">
//                 RESISTANCE ${Math.round(levels.resistance).toLocaleString()}
//               </text>

//               {/* Breakout Level */}
//               <line
//                 x1={padding}
//                 y1={getY(levels.breakoutLevel)}
//                 x2={width - padding}
//                 y2={getY(levels.breakoutLevel)}
//                 stroke="#8b5cf6"
//                 strokeWidth={1}
//                 strokeDasharray="6,2"
//                 opacity={0.6}
//               />
//               <text x={width - padding - 5} y={getY(levels.breakoutLevel) - 5} fill="#8b5cf6" fontSize="9" textAnchor="end">
//                 BREAKOUT ${Math.round(levels.breakoutLevel).toLocaleString()}
//               </text>

//               {/* Invalidation Level */}
//               <line
//                 x1={padding}
//                 y1={getY(levels.invalidationLevel)}
//                 x2={width - padding}
//                 y2={getY(levels.invalidationLevel)}
//                 stroke="#f59e0b"
//                 strokeWidth={1}
//                 strokeDasharray="6,2"
//                 opacity={0.6}
//               />
//               <text x={width - padding - 5} y={getY(levels.invalidationLevel) + 15} fill="#f59e0b" fontSize="9" textAnchor="end">
//                 INVALIDATION ${Math.round(levels.invalidationLevel).toLocaleString()}
//               </text>
//             </>
//           );
//         })()}

//         {/* Vertical line to separate historical and forecast */}
//         <line
//           x1={getX(candlestickData.length - 1)}
//           y1={padding}
//           x2={getX(candlestickData.length - 1)}
//           y2={chartHeight + padding}
//           stroke="#374151"
//           strokeWidth={2}
//           strokeDasharray="5,5"
//           opacity={0.6}
//         />

//         {/* Volume chart grid */}
//         <line
//           x1={padding}
//           y1={chartHeight + padding + 20}
//           x2={width - padding}
//           y2={chartHeight + padding + 20}
//           stroke="#1f2937"
//           strokeWidth={1}
//           opacity={0.5}
//         />

//         {/* Enhanced Confidence intervals using hourly forecast data */}
//         {lastHourly && (
//           <>
//             {(() => {
//               const startX = getX(candlestickData.length - 1);
//               const endX = width - padding;
//               const currentPrice = candlestickData[candlestickData.length - 1]?.close || lastHourly.forecast_price;

//               const createFutureConfidencePath = (upperBound: number, lowerBound: number) => {
//                 const startY = getY(currentPrice);
//                 const midX = startX + (endX - startX) * 0.3;
//                 const endUpperY = getY(upperBound);
//                 const endLowerY = getY(lowerBound);

//                 return `
//                   M ${startX},${startY}
//                   Q ${midX},${startY} ${midX + 20},${(endUpperY + endLowerY) / 2}
//                   L ${endX},${endUpperY}
//                   L ${endX},${endLowerY}
//                   Q ${midX},${(endUpperY + endLowerY) / 2} ${startX},${startY}
//                   Z
//                 `;
//               };

//               return (
//                 <>
//                   {/* 90% High Confidence Range */}
//                   <path
//                     d={createFutureConfidencePath(
//                       lastHourly.confidence_90[1],
//                       lastHourly.confidence_90[0]
//                     )}
//                     fill="#22c55e"
//                     fillOpacity={0.1}
//                     stroke="#22c55e"
//                     strokeOpacity={0.3}
//                     strokeWidth={1}
//                   />

//                   {/* 80% Medium Confidence Range */}
//                   <path
//                     d={createFutureConfidencePath(
//                       lastHourly.confidence_80[1],
//                       lastHourly.confidence_80[0]
//                     )}
//                     fill="#f59e0b"
//                     fillOpacity={0.15}
//                     stroke="#f59e0b"
//                     strokeOpacity={0.4}
//                     strokeWidth={1}
//                   />

//                   {/* 50% Low Confidence Range */}
//                   <path
//                     d={createFutureConfidencePath(
//                       lastHourly.confidence_50[1],
//                       lastHourly.confidence_50[0]
//                     )}
//                     fill="#3b82f6"
//                     fillOpacity={0.2}
//                     stroke="#3b82f6"
//                     strokeOpacity={0.5}
//                     strokeWidth={2}
//                   />
//                 </>
//               );
//             })()}

//             {/* Trading lines for hourly forecast */}
//             {displayEntry && (
//               <line
//                 x1={getX(candlestickData.length - 1)}
//                 y1={getY(displayEntry)}
//                 x2={width - padding}
//                 y2={getY(displayEntry)}
//                 stroke="#10b981"
//                 strokeWidth={2}
//                 strokeDasharray="8,4"
//                 opacity={0.8}
//               />
//             )}

//             {displayStopLoss && (
//               <line
//                 x1={getX(candlestickData.length - 1)}
//                 y1={getY(displayStopLoss)}
//                 x2={width - padding}
//                 y2={getY(displayStopLoss)}
//                 stroke="#ef4444"
//                 strokeWidth={2}
//                 strokeDasharray="8,4"
//                 opacity={0.8}
//               />
//             )}

//             {displayTakeProfit && (
//               <line
//                 x1={getX(candlestickData.length - 1)}
//                 y1={getY(displayTakeProfit)}
//                 x2={width - padding}
//                 y2={getY(displayTakeProfit)}
//                 stroke="#8b5cf6"
//                 strokeWidth={2}
//                 strokeDasharray="8,4"
//                 opacity={0.8}
//               />
//             )}

//             {/* Price Target Probability Line */}
//             <line
//               x1={getX(candlestickData.length - 1)}
//               y1={getY(lastHourly.forecast_price)}
//               x2={width - padding}
//               y2={getY(lastHourly.forecast_price)}
//               stroke="#fbbf24"
//               strokeWidth={3}
//               strokeDasharray="12,6"
//               opacity={0.9}
//             />

//             {/* Enhanced Labels */}
//             {displayEntry && (
//               <text x={width - padding - 5} y={getY(displayEntry) - 5} fill="#10b981" fontSize="10" textAnchor="end" className="font-bold">
//                 ENTRY ZONE ${displayEntry.toLocaleString()}
//               </text>
//             )}
//             {displayTakeProfit && (
//               <text x={width - padding - 5} y={getY(displayTakeProfit) - 5} fill="#8b5cf6" fontSize="10" textAnchor="end" className="font-bold">
//                 TAKE PROFIT ${displayTakeProfit.toLocaleString()}
//               </text>
//             )}
//             {displayStopLoss && (
//               <text x={width - padding - 5} y={getY(displayStopLoss) + 15} fill="#ef4444" fontSize="10" textAnchor="end" className="font-bold">
//                 STOP LOSS ${displayStopLoss.toLocaleString()}
//               </text>
//             )}
//             <text x={width - padding - 5} y={getY(lastHourly.forecast_price) - 5} fill="#fbbf24" fontSize="10" textAnchor="end" className="font-bold">
//               PRICE TARGET ${lastHourly.forecast_price.toLocaleString()}
//             </text>
//           </>
//         )}

//         {/* Candlesticks */}
//         {candlestickData.map((candle, i) => {
//           const x = getX(i);
//           const openY = getY(candle.open);
//           const closeY = getY(candle.close);
//           const highY = getY(candle.high);
//           const lowY = getY(candle.low);

//           const isGreen = candle.close > candle.open;
//           const bodyHeight = Math.abs(closeY - openY);
//           const bodyY = Math.min(openY, closeY);

//           return (
//             <g key={i}>
//               <line
//                 x1={x}
//                 y1={highY}
//                 x2={x}
//                 y2={lowY}
//                 stroke={isGreen ? "#10b981" : "#ef4444"}
//                 strokeWidth={1}
//               />

//               <rect
//                 x={x - candleWidth / 2}
//                 y={bodyY}
//                 width={candleWidth}
//                 height={Math.max(bodyHeight, 1)}
//                 fill={isGreen ? "#10b981" : "#ef4444"}
//                 stroke={isGreen ? "#10b981" : "#ef4444"}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...candle, type: 'candlestick' }, 'chart')}
//               />

//               <rect
//                 x={x - candleWidth / 2}
//                 y={getVolumeY(candle.volume)}
//                 width={candleWidth}
//                 height={(candle.volume / maxVolume) * volumeHeight}
//                 fill={isGreen ? "#10b981" : "#ef4444"}
//                 opacity={0.6}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...candle, type: 'volume' }, 'chart')}
//               />
//             </g>
//           );
//         })}

//         {/* Current price indicator */}
//         <line
//           x1={padding}
//           y1={getY(currentPrice)}
//           x2={getX(candlestickData.length - 1)}
//           y2={getY(currentPrice)}
//           stroke="#fbbf24"
//           strokeWidth={2}
//           opacity={0.9}
//         />

//         {currentPrice != null ? (
//           <text
//             x={getX(candlestickData.length - 1) - 5}
//             y={getY(currentPrice) - 5}
//             fill="#fbbf24"
//             fontSize="12"
//             textAnchor="end"
//             className="font-bold"
//           >
//             LIVE ${currentPrice.toLocaleString()}
//           </text>
//         ) : (
//           <text
//             x={getX(candlestickData.length - 1) - 5}
//             y={padding - 5}
//             fill="#fbbf24"
//             fontSize="10"
//             textAnchor="end"
//           >
//             Loading…
//           </text>
//         )}

//         {/* Price labels */}
//         {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
//           const price = minPrice + (maxPrice - minPrice) * (1 - ratio);
//           return (
//             <text key={i} x={padding - 5} y={padding + ratio * chartHeight + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//               ${Math.round(price).toLocaleString()}
//             </text>
//           );
//         })}

//         {/* Volume label */}
//         <text x={padding - 5} y={chartHeight + padding + 35} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="end">
//           Volume
//         </text>

//         {/* Time labels */}
//         {candlestickData.length > 1 && (
//           <>
//             <text x={padding} y={height - 10} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               {new Date(candlestickData[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//             </text>
//             <text x={getX(candlestickData.length - 1)} y={height - 10} fill="#fbbf24" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               NOW
//             </text>
//             <text x={width - padding} y={height - 10} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               +30min
//             </text>
//           </>
//         )}

//         {/* Enhanced Legend for confidence zones */}
//         {/* <g>
//           <text x={padding + 10} y={padding + 20} fill="#9ca3af" fontSize="10" className="font-bold">
//             Price Probability Ranges:
//           </text>
//           <rect x={padding + 10} y={padding + 25} width={12} height={8} fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeOpacity={0.5} strokeWidth={1} />
//           <text x={padding + 25} y={padding + 32} fill="#3b82f6" fontSize="8">50% CONFIDENCE</text>

//           <rect x={padding + 120} y={padding + 25} width={12} height={8} fill="#f59e0b" fillOpacity={0.15} stroke="#f59e0b" strokeOpacity={0.4} strokeWidth={1} />
//           <text x={padding + 135} y={padding + 32} fill="#f59e0b" fontSize="8">80% CONFIDENCE</text>

//           <rect x={padding + 230} y={padding + 25} width={12} height={8} fill="#22c55e" fillOpacity={0.1} stroke="#22c55e" strokeOpacity={0.3} strokeWidth={1} />
//           <text x={padding + 245} y={padding + 32} fill="#22c55e" fontSize="8">90% CONFIDENCE</text>
//         </g> */}
//       </svg>
//     );
//   };

//   // Create regular SVG chart for non-today views
//   const createSVGChart = () => {
//     const isToday = selectedTimeframe === 'TODAY';

//     if (showCandlesticks) {
//       return createCandlestickChart();
//     }

//     const allData = [
//       ...displayPriceHistory.map(item => ({ ...item, type: 'historical' })),
//       ...displayForecast.map(item => ({ ...item, price: item.entry, type: 'forecast' }))
//     ];

//     if (allData.length === 0) {
//       return (
//         <div className="flex items-center justify-center h-full text-gray-400">
//           No data available for selected timeframe
//         </div>
//       );
//     }

//     const allPrices = [
//       ...allData.map(item => item.price),
//       ...displayForecast.flatMap(item => [
//         item.confidence_intervals[90][0],
//         item.confidence_intervals[90][1],
//         item.stop_loss,
//         item.take_profit
//       ])
//     ];

//     const minPrice = Math.min(...allPrices) * 0.995;
//     const maxPrice = Math.max(...allPrices) * 1.005;
//     const priceRange = maxPrice - minPrice;

//     const width = isMobile ? 350 : 500;
//     const height = isMobile ? 200 : 300;
//     const padding = isMobile ? 30 : 50;

//     const xStep = (width - 2 * padding) / Math.max(allData.length - 1, 1);

//     const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);
//     const getX = (index: number) => padding + index * xStep;

//     return (
//       <svg
//         ref={svgRef}
//         width={width}
//         height={height}
//         className="w-full h-full"
//         viewBox={`0 0 ${width} ${height}`}
//       // onMouseLeave={hideTooltip}
//       >
//         {/* Grid lines */}
//         {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
//           <line
//             key={i}
//             x1={padding}
//             y1={padding + ratio * (height - 2 * padding)}
//             x2={width - padding}
//             y2={padding + ratio * (height - 2 * padding)}
//             stroke="#1f2937"
//             strokeWidth={1}
//             opacity={0.3}
//           />
//         ))}

//         {/* Price lines */}
//         {displayPriceHistory.length > 0 && (
//           <polyline
//             points={displayPriceHistory.map((item, i) => {
//               const x = getX(i);
//               const y = getY(item.price);
//               return `${x},${y}`;
//             }).join(' ')}
//             fill="none"
//             stroke="#3b82f6"
//             strokeWidth={isMobile ? 2 : 3}
//           />
//         )}

//         {displayForecast.length > 0 && (
//           <polyline
//             points={displayForecast.map((item, i) => {
//               const x = getX(displayPriceHistory.length + i);
//               const y = getY(item.entry);
//               return `${x},${y}`;
//             }).join(' ')}
//             fill="none"
//             stroke="#10b981"
//             strokeWidth={isMobile ? 2 : 3}
//             strokeDasharray="8,4"
//           />
//         )}

//         {/* Data points */}
//         {displayPriceHistory.map((item, i) => {
//           const x = getX(i);
//           const y = getY(item.price);
//           return (
//             <circle
//               key={i}
//               cx={x}
//               cy={y}
//               r={isMobile ? 3 : 4}
//               fill="#3b82f6"
//               stroke="#0a1628"
//               strokeWidth={isMobile ? 1 : 2}
//               style={{ cursor: 'pointer' }}
//               onMouseEnter={(e) => showTooltip(e, { ...item, type: 'historical' }, 'chart')}
//             />
//           );
//         })}

//         {displayForecast.map((item, i) => {
//           const x = getX(displayPriceHistory.length + i);
//           const y = getY(item.entry);
//           const radius = isMobile ? 4 : 5;
//           const arrowSize = isMobile ? 8 : 12;
//           return (
//             <g key={i}>
//               <circle
//                 cx={x}
//                 cy={y}
//                 r={radius}
//                 fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
//                 stroke="#0a1628"
//                 strokeWidth={isMobile ? 1 : 2}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' }, 'chart')}
//               />
//               <polygon
//                 points={item.signal === 'LONG'
//                   ? `${x},${y - arrowSize} ${x - arrowSize / 2},${y - arrowSize / 2} ${x + arrowSize / 2},${y - arrowSize / 2}`
//                   : `${x},${y + arrowSize} ${x - arrowSize / 2},${y + arrowSize / 2} ${x + arrowSize / 2},${y + arrowSize / 2}`
//                 }
//                 fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' }, 'chart')}
//               />
//             </g>
//           );
//         })}

//         {/* Price labels */}
//         <text x={padding - 5} y={padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round(maxPrice).toLocaleString()}
//         </text>
//         <text x={padding - 5} y={height - padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round(minPrice).toLocaleString()}
//         </text>
//         <text x={padding - 5} y={padding + (height - 2 * padding) / 2} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round((maxPrice + minPrice) / 2).toLocaleString()}
//         </text>

//         {/* Date labels */}
//         {allData.length > 1 && (
//           <>
//             <text x={padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               {getSimpleDate(allData[0]?.date)}
//             </text>
//             <text x={width - padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               {getSimpleDate(allData[allData.length - 1]?.date)}
//             </text>
//           </>
//         )}
//       </svg>
//     );
//   };

//   if (!latest) {
//     return (
//       <div className="p-4 text-gray-400">
//         Loading data...
//       </div>
//     );
//   }

//   const firstForecast = latest;
//   const firstForecasts = displayForecast[0] || forecast[0];

//   // Use hourly forecast data or fallback to forecast data
//   const displaySignal = lastHourly?.signal || firstForecasts?.signal || 'HOLD';
//   const displayEntry = lastHourly?.entry_price || firstForecasts?.entry;
//   const displayTakeProfit = lastHourly?.take_profit || firstForecasts?.take_profit;
//   const displayStopLoss = lastHourly?.stop_loss || firstForecasts?.stop_loss;
//   const performanceMetrics = calculatePerformanceMetrics(hourlyForecast);

//   const nextHourTarget = lastHourly?.forecast_price ||
//     (hourlyForecast && hourlyForecast.length > 0 ? hourlyForecast[0].forecast_price : null);

//   const confidenceProbability = lastHourly?.confidence_50 ?
//     Math.round(((lastHourly.confidence_50[1] - lastHourly.confidence_50[0]) / lastHourly.forecast_price) * 100 * 10) :
//     75; // Default fallback

//   const expectedTimeframe = displaySignal === 'LONG' || displaySignal === 'SHORT' ?
//     '30-60' : '45-90';

//   // Calculate minutes to next forecast (assuming hourly updates)
//   const minutesToNextForecast = (() => {
//     const now = new Date();
//     const nextHour = new Date(now);
//     nextHour.setHours(now.getHours() + 1, 0, 0, 0);
//     return Math.ceil((nextHour.getTime() - now.getTime()) / (1000 * 60));
//   })();

//   const formattedAccuracy = lastHourly?.accuracy_percent && lastHourly.accuracy_percent !== 'N/A'
//     ? `${lastHourly.accuracy_percent}%`
//     : firstForecast?.overall_accuracy_percent
//       ? `${firstForecast.overall_accuracy_percent}%`
//       : `${performanceMetrics.winRate}%`;

//   const formattedDeviation = lastHourly?.deviation_percent && lastHourly.deviation_percent !== 'N/A'
//     ? `${lastHourly.deviation_percent}%`
//     : firstForecast?.deviation_percent
//       ? `+${firstForecast.deviation_percent}%`
//       : '+1.50%';

//   // Calculate market structure
//   const marketStructure = getMarketStructure(currentPrice, candlestickData, displaySignal);
//   const keyLevels = getKeyLevels(currentPrice, candlestickData);
//   const volatility = calculateVolatility(candlestickData);
//   const marketContext = getMarketContext(candlestickData, lastHourly?.sentiment_score || 30);

//   // Calculate position size recommendation
//   const riskRewardValue = lastHourly?.risk_reward_ratio ||
//     (displayEntry && displayStopLoss && displayTakeProfit ?
//       parseFloat(getRiskReward(displayEntry, displayStopLoss, displayTakeProfit)) : 1.5);

//   const positionSize = calculatePositionSize(displaySignal, riskRewardValue, volatility);

//   return (
//     <div className={`bg-[#080b12] rounded-lg p-4 ${className}`}>
//       {/* Controls Section */}
//       <div className="flex justify-between items-center mb-4">
//         <select
//           value={selectedAsset}
//           onChange={(e) => setSelectedAsset(e.target.value as 'BTC' | 'SOL' | 'ETH')}
//           className="bg-[#0d1120]/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] focus:border-blue-500 focus:outline-none text-sm"
//         >
//           <option value="BTC">BTC</option>
//           <option value="SOL" disabled>SOL (Soon)</option>
//           <option value="ETH" disabled>ETH (Soon)</option>
//         </select>

//         <SegmentedControl
//           options={[
//             { value: 'TODAY', label: 'Today' },
//           ]}
//           selected={selectedTimeframe}
//           onChange={(value) => setSelectedTimeframe(value as 'TODAY')}
//         />
//       </div>

//       <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 mb-4 border border-blue-500/30">
//         <div className="flex items-center justify-between">
//           <div>
//             <div className="text-blue-400 text-sm font-medium mb-1">🎯 NEXT HOUR OUTLOOK</div>
//             <div className="text-white text-lg font-bold">
//               ZkAGI anticipates price to hit ${nextHourTarget?.toLocaleString()} over next hour
//             </div>
//             {/* <div className="text-gray-400 text-sm">
//         Probability: {confidenceProbability}% • Expected in {expectedTimeframe} minutes
//       </div> */}
//           </div>
//           <div className="text-right">
//             <div className="text-gray-400 text-sm">Next forecast in:</div>
//             <div className="text-yellow-400 text-xl font-bold">{minutesToNextForecast}m</div>
//           </div>
//         </div>
//       </div>

//       {/* Enhanced Key Metrics */}
//       <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 mb-4`}>
//         {/* Trading Signal Panel */}
//         <div className={`bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 border-l-4 ${displaySignal === 'LONG' ? 'border-green-500' :
//           displaySignal === 'SHORT' ? 'border-red-500' :
//             'border-yellow-500'
//           }`}>
//           <div className="flex justify-between items-start mb-2">
//             <span className="text-gray-400 text-sm">TRADING SIGNAL</span>
//             <span className={`font-bold text-lg ${displaySignal === 'LONG' ? 'text-green-400' :
//               displaySignal === 'SHORT' ? 'text-red-400' :
//                 'text-yellow-400'
//               }`}>
//               {displaySignal}
//             </span>
//           </div>

//           <div className="space-y-1">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Entry Zone:</span>
//               <span className="text-white font-medium">
//                 {displayEntry ? `${(displayEntry * 0.999).toLocaleString()} - ${(displayEntry * 1.001).toLocaleString()}` : 'N/A'}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Take Profit:</span>
//               <span className="text-green-400">
//                 {displayTakeProfit ? `${displayTakeProfit.toLocaleString()} (+${((displayTakeProfit / (displayEntry || 1) - 1) * 100).toFixed(1)}%)` : 'N/A'}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Stop Loss:</span>
//               <span className="text-red-400">
//                 {displayStopLoss ? `${displayStopLoss.toLocaleString()} (-${((1 - displayStopLoss / (displayEntry || 1)) * 100).toFixed(1)}%)` : 'N/A'}
//               </span>
//             </div>
//           </div>

//           <div className="mb-1 mt-5 p-2 bg-[#0d1120]/50 rounded text-[9px] text-gray-500">
//             <strong>Note:</strong> Position parameters display as N/A during HOLD signals.
//             Specific entry zones, profit targets, and stop levels are provided for actionable LONG/SHORT signals.
//           </div>
//         </div>

//         {/* Enhanced Risk Analysis */}
//         <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4">
//           <div
//             className="text-gray-400 text-sm mb-2 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
//             onMouseEnter={(e) => showTooltip(e, tooltipContent.riskManagement, 'info')}
//             onMouseLeave={hideTooltip}
//           >
//             <span>Risk Management</span>
//             <span className="text-xs">ⓘ</span>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Risk vs Reward:</span>
//               <span className="text-blue-400 font-bold">
//                 {lastHourly?.risk_reward_ratio ?
//                   `1:${lastHourly.risk_reward_ratio.toFixed(1)}` :
//                   displayEntry && displayStopLoss && displayTakeProfit ?
//                     `1:${getRiskReward(displayEntry, displayStopLoss, displayTakeProfit)}` :
//                     '1:1.5'
//                 }
//               </span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Position Size:</span>
//               <span className="text-green-400">{positionSize}</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Win Probability:</span>
//               <span className="text-blue-400">{performanceMetrics.winProbability}%</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Max Drawdown:</span>
//               <span className="text-yellow-400">-{performanceMetrics.maxDrawdown}%</span>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Performance Panel */}
//         <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4">
//           <div
//             className="text-gray-400 text-sm mb-2 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
//             onMouseEnter={(e) => showTooltip(e, tooltipContent.performanceMetrics, 'info')}
//             onMouseLeave={hideTooltip}
//           >
//             <span>Performance Metrics</span>
//             <span className="text-xs">ⓘ</span>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Win Rate (Last 100):</span>
//               <span className="text-green-400">
//                 {formattedAccuracy}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Avg Gain:</span>
//               <span className="text-green-400">+{performanceMetrics.avgGain}%</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Avg Loss:</span>
//               <span className="text-red-400">-{performanceMetrics.avgLoss}%</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-400">Profit Factor:</span>
//               <span className="text-blue-400">{performanceMetrics.profitFactor}x</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Market Structure Panel */}
//       <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 mb-4">
//         <div
//           className="text-gray-400 text-sm mb-3 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
//           onMouseEnter={(e) => showTooltip(e, tooltipContent.marketStructure, 'info')}
//           onMouseLeave={hideTooltip}
//         >
//           <span>Market Structure & Key Levels</span>
//           <span className="text-xs">ⓘ</span>
//         </div>
//         <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-4`}>
//           <div>
//             <div className="text-xs text-gray-400">Trend Direction</div>
//             <div className={`text-sm font-medium ${marketStructure.trend === 'Bullish' ? 'text-green-400' :
//               marketStructure.trend === 'Bearish' ? 'text-red-400' :
//                 'text-yellow-400'
//               }`}>
//               {marketStructure.shortTermTrend} / {marketStructure.longTermTrend}
//             </div>
//           </div>
//           <div>
//             <div className="text-xs text-gray-400">Key Pivot</div>
//             <div className="text-sm font-medium text-white">${Math.round(currentPrice).toLocaleString()}</div>
//           </div>
//           <div>
//             <div className="text-xs text-gray-400">Next Resistance</div>
//             <div className="text-sm font-medium text-green-400">${Math.round(keyLevels.resistance).toLocaleString()}</div>
//           </div>
//           <div>
//             <div className="text-xs text-gray-400">Next Support</div>
//             <div className="text-sm font-medium text-red-400">${Math.round(keyLevels.support).toLocaleString()}</div>
//           </div>
//         </div>
//       </div>

//       {/* Chart Container */}
//       <div className="w-full bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-2 mb-4 relative"
//         style={{ height: selectedTimeframe === 'TODAY' ? (isMobile ? '320px' : '420px') : (isMobile ? '180px' : '220px') }}
//         onMouseLeave={hideTooltip}
//       >
//         {createSVGChart()}

//         {/* Enhanced Tooltip */}
//         {tooltip.visible && tooltip.data && (
//           <div
//             className={`absolute ${tooltip.type === 'info' ? 'bg-[#0d1120]' : 'bg-[#080b12]'} border border-[rgba(255,255,255,0.08)] rounded-lg p-3 text-white shadow-xl z-50 ${isMobile ? 'text-xs' : 'text-sm'
//               } ${tooltip.type === 'info' ? 'max-w-md' : 'min-w-48'}`}
//             style={{
//               left: tooltip.x + 10,
//               top: tooltip.y - 10,
//               transform: tooltip.x > (isMobile ? 200 : 300) ? 'translateX(-100%)' : 'none'
//             }}
//           >
//             {tooltip.type === 'info' ? (
//               // Info tooltip content
//               <div className="space-y-2">
//                 <div className="font-bold text-blue-400 border-b border-gray-600 pb-1">
//                   {tooltip.data.title}
//                 </div>
//                 <div className="space-y-2">
//                   {tooltip.data.content.map((item: string, index: number) => (
//                     <div key={index} className="text-sm leading-relaxed">
//                       <span className="font-medium text-gray-300">
//                         {item.split(':')[0]}:
//                       </span>
//                       <span className="text-gray-400 ml-1">
//                         {item.split(':').slice(1).join(':')}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               // Chart tooltip content
//               <div className="space-y-2">
//                 {tooltip.data.type === 'candlestick' && (
//                   <>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Time:</span>
//                       <span>{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">OHLC:</span>
//                       <span>
//                         ${Math.round(tooltip.data.open).toLocaleString()} /
//                         ${Math.round(tooltip.data.high).toLocaleString()} /
//                         ${Math.round(tooltip.data.low).toLocaleString()} /
//                         ${Math.round(tooltip.data.close).toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Change:</span>
//                       <span className={tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}>
//                         {((tooltip.data.close / tooltip.data.open - 1) * 100).toFixed(2)}%
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Volume:</span>
//                       <span>{(tooltip.data.volume / 1000).toFixed(0)}K</span>
//                     </div>
//                   </>
//                 )}

//                 {tooltip.data.type === 'volume' && (
//                   <>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Time:</span>
//                       <span>{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Volume:</span>
//                       <span>{Math.round(tooltip.data.volume).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Price:</span>
//                       <span>${Math.round(tooltip.data.close).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Volume Type:</span>
//                       <span className={tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}>
//                         {tooltip.data.close > tooltip.data.open ? 'Buying Pressure' : 'Selling Pressure'}
//                       </span>
//                     </div>
//                   </>
//                 )}

//                 {tooltip.data.type === 'historical' && (
//                   <>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Date:</span>
//                       <span>{getSimpleDate(tooltip.data.date)}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Price:</span>
//                       <span>${Math.round(tooltip.data.price).toLocaleString()}</span>
//                     </div>
//                   </>
//                 )}

//                 {tooltip.data.type === 'forecast' && (
//                   <>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Date:</span>
//                       <span>{getSimpleDate(tooltip.data.date)}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Signal:</span>
//                       <span className={tooltip.data.signal === 'LONG' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
//                         {tooltip.data.signal}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Entry:</span>
//                       <span>${Math.round(tooltip.data.entry).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Stop:</span>
//                       <span className="text-red-400">${Math.round(tooltip.data.stop_loss).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Target:</span>
//                       <span className="text-green-400">${Math.round(tooltip.data.take_profit).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">R:R Ratio:</span>
//                       <span className="text-blue-400">1:{getRiskReward(tooltip.data.entry, tooltip.data.stop_loss, tooltip.data.take_profit)}</span>
//                     </div>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Enhanced Legend */}
//       <div className="mb-4">
//         <div className={`flex flex-wrap gap-x-6 gap-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
//           <div className="flex items-center space-x-2">
//             <div className="w-4 h-0.5 bg-yellow-500"></div>
//             <span className="text-gray-400 whitespace-nowrap">Live Price</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-4 h-2 bg-blue-500" style={{ opacity: 0.3 }}></div>
//             <span className="text-gray-400 whitespace-nowrap">50% Confidence</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-4 h-2 bg-yellow-600" style={{ opacity: 0.3 }}></div>
//             <span className="text-gray-400 whitespace-nowrap">80% Confidence</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-4 h-2 bg-green-500" style={{ opacity: 0.3 }}></div>
//             <span className="text-gray-400 whitespace-nowrap">90% Confidence</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-4 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
//             <span className="text-gray-400 whitespace-nowrap">Support/Resistance</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-4 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
//             <span className="text-gray-400 whitespace-nowrap">Key Levels</span>
//           </div>
//         </div>
//       </div>

//       {/* Market Context Panel */}
//       <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4">
//         <div className="text-gray-400 text-sm mb-3">Market Context & Catalysts</div>
//         <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-4 text-sm`}>
//           <div>
//             <div className="text-xs text-gray-400">News Impact</div>
//             <div className="text-white">{marketContext.newsImpact}</div>
//           </div>
//           <div>
//             <div className="text-xs text-gray-400">Technical Setup</div>
//             <div className="text-white">{marketContext.technicalSetup}</div>
//           </div>
//           <div>
//             <div className="text-xs text-gray-400">Volume</div>
//             <div className={`${marketContext.volumeStatus === 'Above Average' ? 'text-green-400' :
//               marketContext.volumeStatus === 'Below Average' ? 'text-red-400' : 'text-yellow-400'
//               }`}>{marketContext.volumeStatus}</div>
//           </div>
//           <div>
//             <div className="text-xs text-gray-400">Correlation</div>
//             <div className="text-white">{marketContext.correlation}</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PriceChart;



// import React, { useState, useRef, useEffect } from 'react';
// import { Maximize2, Minimize2, X } from 'lucide-react';

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

// interface PriceData {
//   date: string;
//   price: number;
// }

// interface CandlestickData {
//   timestamp: number;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   volume: number;
// }

// interface ForecastData {
//   date: string;
//   signal: 'LONG' | 'SHORT';
//   entry: number;
//   stop_loss: number;
//   take_profit: number;
//   confidence_intervals: {
//     50: [number, number];
//     80: [number, number];
//     90: [number, number];
//   };
//   deviation_percent?: number | string;
//   overall_accuracy_percent?: number | string;
// }

// interface PriceChartProps {
//   priceHistory?: PriceData[];
//   forecast?: ForecastData[];
//   hourlyForecast?: HourlyForecast[];
//   className?: string;
// }

// interface TooltipData {
//   x: number;
//   y: number;
//   data: any;
//   visible: boolean;
//   type?: 'chart' | 'info';
// }

// // Segmented Control Component
// const SegmentedControl = ({
//   options,
//   selected,
//   onChange,
//   className = ""
// }: {
//   options: { value: string; label: string }[];
//   selected: string;
//   onChange: (value: string) => void;
//   className?: string;
// }) => {
//   return (
//     <div className={`inline-flex bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-1 ${className}`}>
//       {options.map((option) => (
//         <button
//           key={option.value}
//           onClick={() => onChange(option.value)}
//           className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-md transition-all duration-200 whitespace-nowrap ${selected === option.value
//             ? 'bg-blue-600 text-white shadow-md'
//             : 'text-gray-400 hover:text-white hover:bg-[#2a3441]'
//             }`}
//         >
//           {option.label}
//         </button>
//       ))}
//     </div>
//   );
// };

// const fetchRealBitcoinData = async (
//   setDataSource?: (src: 'real' | 'fallback') => void
// ): Promise<CandlestickData[]> => {
//   try {
//     const res = await fetch(
//       'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60'
//     );
//     if (!res.ok) throw new Error(`Binance returned ${res.status}`);
//     const raw = await res.json() as any[][];
//     setDataSource?.('real');
//     return raw.map(([ts, open, high, low, close, volume]) => ({
//       timestamp: ts,
//       open: +open,
//       high: +high,
//       low: +low,
//       close: +close,
//       volume: +volume,
//     }));
//   } catch (err) {
//     console.error('Failed to fetch real candles, falling back:', err);
//     setDataSource?.('fallback');
//     return generateFallbackData();
//   }
// };

// const fetchCurrentBitcoinPrice = async (): Promise<number> => {
//   const res = await fetch(
//     'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
//   );
//   if (!res.ok) throw new Error(`Binance ticker returned ${res.status}`);
//   const json = await res.json() as { price: string };
//   return parseFloat(json.price);
// };

// // Fallback data generator
// const generateFallbackData = (): CandlestickData[] => {
//   const data: CandlestickData[] = [];
//   let currentPrice = 121008;
//   const now = Date.now();

//   for (let i = 59; i >= 0; i--) {
//     const timestamp = now - (i * 60000);
//     const volatility = 0.002;

//     const open = currentPrice;
//     const change = (Math.random() - 0.5) * volatility * currentPrice;
//     const close = open + change;

//     const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
//     const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;

//     const volume = Math.random() * 1000000 + 500000;

//     data.push({
//       timestamp,
//       open,
//       high,
//       low,
//       close,
//       volume
//     });

//     currentPrice = close + (122306 - 121008) / 60;
//   }

//   return data;
// };

// const PriceChart: React.FC<PriceChartProps> = ({
//   priceHistory = [
//     { date: "2025-07-02", price: 104639.48 },
//     { date: "2025-07-03", price: 104611.16 },
//     { date: "2025-07-04", price: 103296.19 },
//     { date: "2025-07-05", price: 101348.19 },
//     { date: "2025-07-06", price: 101987.11 },
//     { date: "2025-07-07", price: 105436.11 },
//     { date: "2025-07-08", price: 106371.09 }
//   ],
//   forecast = [
//     {
//       date: "2025-07-14",
//       signal: "LONG" as const,
//       entry: 117498.65,
//       stop_loss: 115287.826,
//       take_profit: 119709.474,
//       confidence_intervals: {
//         50: [117088.88, 117908.414],
//         80: [116154.45, 118842.84],
//         90: [115877.55, 119119.75]
//       },
//       deviation_percent: 1.5,
//       overall_accuracy_percent: 98.5
//     }
//   ],
//   className = "",
//   hourlyForecast = [
//     {
//       time: "2025-07-15T07:00:00+00:00",
//       signal: "HOLD" as const,
//       entry_price: null,
//       stop_loss: null,
//       take_profit: null,
//       forecast_price: 116632.66,
//       current_price: 116919.4,
//       deviation_percent: "N/A",
//       accuracy_percent: "N/A",
//       risk_reward_ratio: 0.68,
//       sentiment_score: 27.39,
//       confidence_50: [116402.414, 116862.9],
//       confidence_80: [116252.7, 117012.61],
//       confidence_90: [116228.18, 117037.13]
//     },
//     {
//       time: "2025-07-15T08:00:00+00:00",
//       signal: "HOLD" as const,
//       entry_price: null,
//       stop_loss: null,
//       take_profit: null,
//       forecast_price: 116548.55,
//       current_price: 116797,
//       deviation_percent: -0.21,
//       accuracy_percent: 99.79,
//       risk_reward_ratio: 0.61,
//       sentiment_score: 32.27,
//       confidence_50: [116390.73, 116706.37],
//       confidence_80: [116281.36, 116815.734],
//       confidence_90: [116030.195, 117066.9]
//     },
//     {
//       time: "2025-07-15T09:00:00+00:00",
//       signal: "HOLD" as const,
//       entry_price: null,
//       stop_loss: null,
//       take_profit: null,
//       forecast_price: 116705.53,
//       current_price: 116788.51,
//       deviation_percent: -0.07,
//       accuracy_percent: 99.93,
//       risk_reward_ratio: 0.21,
//       sentiment_score: 43.16,
//       confidence_50: [116539, 116872.06],
//       confidence_80: [116475.63, 116935.43],
//       confidence_90: [116293.57, 117117.49]
//     },
//     {
//       time: "2025-07-15T10:00:00+00:00",
//       signal: "HOLD" as const,
//       entry_price: null,
//       stop_loss: null,
//       take_profit: null,
//       forecast_price: 116782.47,
//       current_price: 116813.69,
//       deviation_percent: -0.03,
//       accuracy_percent: 99.97,
//       risk_reward_ratio: 0.08,
//       sentiment_score: 41.33,
//       confidence_50: [116686.77, 116878.164],
//       confidence_80: [116490.4, 117074.54],
//       confidence_90: [116344.86, 117220.08]
//     }
//   ],
// }) => {
//   const [selectedTimeframe, setSelectedTimeframe] = useState<'TODAY' | 'PAST_7D' | 'NEXT_3D'>('TODAY');
//   const [selectedSubTimeframe, setSelectedSubTimeframe] = useState<'3D' | '7D'>('3D');
//   const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SOL' | 'ETH'>('BTC');
//   const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: null, visible: false, type: 'chart' });
//   const [isMobile, setIsMobile] = useState(false);
//   const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
//   const [currentPrice, setCurrentPrice] = useState<number>(0);
//   const [isLoadingData, setIsLoadingData] = useState(true);
//   const [dataSource, setDataSource] = useState<'real' | 'fallback'>('real');
//   const [isChartMaximized, setIsChartMaximized] = useState(false);
//   const svgRef = useRef<SVGSVGElement>(null);

//   const [latest, setLatest] = useState<{
//     deviation_percent?: number | string;
//     overall_accuracy_percent?: number | string;
//   } | null>(null);

//   useEffect(() => {
//     const mockLatest = {
//       deviation_percent: 1.5,
//       overall_accuracy_percent: 98.5
//     };
//     setLatest(mockLatest);
//   }, []);

//   useEffect(() => {
//     const initializeRealData = async () => {
//       setIsLoadingData(true);
//       const realData = await fetchRealBitcoinData(setDataSource);
//       setCandlestickData(realData);

//       if (realData.length > 0) {
//         setCurrentPrice(realData[realData.length - 1].close);
//       }

//       setIsLoadingData(false);
//     };

//     initializeRealData();
//   }, []);

//   useEffect(() => {
//     const id = setInterval(async () => {
//       try {
//         const live = await fetchCurrentBitcoinPrice();
//         setCurrentPrice(live);
//       } catch {
//         // swallow or log
//       }
//     }, 10_000);
//     return () => clearInterval(id);
//   }, []);

//   // Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Handle escape key to close maximized chart
//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && isChartMaximized) {
//         setIsChartMaximized(false);
//       }
//     };

//     if (isChartMaximized) {
//       document.addEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }

//     return () => {
//       document.removeEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isChartMaximized]);

//   // Get simplified date format (MM/DD)
//   const getSimpleDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
//   };

//   // Calculate risk/reward ratio
//   const getRiskReward = (entry: number, stop: number, target: number, signal: 'LONG' | 'SHORT' = 'LONG') => {
//     let risk: number;
//     let reward: number;

//     if (signal === 'LONG') {
//       risk = entry - stop;
//       reward = target - entry;
//     } else {
//       risk = stop - entry;
//       reward = entry - target;
//     }

//     if (risk <= 0 || reward <= 0) {
//       return '0.0';
//     }

//     return (reward / risk).toFixed(1);
//   };

//   // Calculate key levels based on current price and recent data
//   const getKeyLevels = (price: number, recentData?: CandlestickData[]) => {
//     if (!recentData || recentData.length === 0) {
//       return {
//         support: price * 0.996,
//         resistance: price * 1.004,
//         breakoutLevel: price * 1.002,
//         invalidationLevel: price * 0.993
//       };
//     }

//     // Calculate support/resistance from recent highs/lows
//     const recentHighs = recentData.slice(-20).map(d => d.high);
//     const recentLows = recentData.slice(-20).map(d => d.low);

//     const resistance = Math.max(...recentHighs);
//     const support = Math.min(...recentLows);
//     const breakoutLevel = resistance * 1.001;
//     const invalidationLevel = support * 0.999;

//     return { support, resistance, breakoutLevel, invalidationLevel };
//   };

//   // Calculate market structure from actual price data
//   const getMarketStructure = (currentPrice: number, recentData?: CandlestickData[], signal?: string) => {
//     if (!recentData || recentData.length < 10) {
//       return {
//         trend: signal === 'LONG' ? 'Bullish' : signal === 'SHORT' ? 'Bearish' : 'Sideways',
//         shortTermTrend: 'Insufficient Data',
//         longTermTrend: 'Insufficient Data'
//       };
//     }

//     // Short term trend (last 10 candles)
//     const shortTermData = recentData.slice(-10);
//     const shortTermStart = shortTermData[0].close;
//     const shortTermEnd = shortTermData[shortTermData.length - 1].close;
//     const shortTermChange = (shortTermEnd - shortTermStart) / shortTermStart;

//     // Long term trend (last 30 candles)
//     const longTermData = recentData.slice(-30);
//     const longTermStart = longTermData[0].close;
//     const longTermEnd = longTermData[longTermData.length - 1].close;
//     const longTermChange = (longTermEnd - longTermStart) / longTermStart;

//     const getTrendLabel = (change: number) => {
//       if (change > 0.01) return 'Bullish';
//       if (change < -0.01) return 'Bearish';
//       return 'Sideways';
//     };

//     return {
//       trend: signal === 'LONG' ? 'Bullish' : signal === 'SHORT' ? 'Bearish' : 'Sideways',
//       shortTermTrend: getTrendLabel(shortTermChange),
//       longTermTrend: getTrendLabel(longTermChange)
//     };
//   };

//   // Calculate performance metrics from hourly forecast data
//   const calculatePerformanceMetrics = (hourlyData?: HourlyForecast[]) => {
//     if (!hourlyData || hourlyData.length === 0) {
//       return {
//         winRate: 0,
//         avgGain: 0,
//         avgLoss: 0,
//         profitFactor: 0,
//         winProbability: 0,
//         maxDrawdown: 0
//       };
//     }

//     const validData = hourlyData.filter(h =>
//       h.accuracy_percent !== 'N/A' &&
//       h.deviation_percent !== 'N/A' &&
//       typeof h.accuracy_percent === 'number' &&
//       typeof h.deviation_percent === 'number'
//     );

//     if (validData.length === 0) {
//       return {
//         winRate: 98.5, // fallback from latest data
//         avgGain: 1.8,
//         avgLoss: 0.9,
//         profitFactor: 2.0,
//         winProbability: 75,
//         maxDrawdown: 2.1
//       };
//     }

//     const accuracies = validData.map(h => Number(h.accuracy_percent));
//     const deviations = validData.map(h => Number(h.deviation_percent));

//     const winRate = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

//     const gains = deviations.filter(d => d > 0);
//     const losses = deviations.filter(d => d < 0).map(d => Math.abs(d));

//     const avgGain = gains.length > 0 ? gains.reduce((sum, g) => sum + g, 0) / gains.length : 0;
//     const avgLoss = losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / losses.length : 0;

//     const profitFactor = avgLoss > 0 ? avgGain / avgLoss : 0;
//     const winProbability = (gains.length / validData.length) * 100;
//     const maxDrawdown = Math.max(...losses, 0);

//     return {
//       winRate: Math.round(winRate * 100) / 100,
//       avgGain: Math.round(avgGain * 100) / 100,
//       avgLoss: Math.round(avgLoss * 100) / 100,
//       profitFactor: Math.round(profitFactor * 100) / 100,
//       winProbability: Math.round(winProbability),
//       maxDrawdown: Math.round(maxDrawdown * 100) / 100
//     };
//   };

//   // Calculate position size based on volatility and risk
//   const calculatePositionSize = (signal: string, riskReward: number, volatility: number) => {
//     if (signal === 'HOLD') return 'Conservative (1-2%)';

//     // Base position size on risk/reward and volatility
//     if (riskReward > 2 && volatility < 0.02) return 'Aggressive (3-5%)';
//     if (riskReward > 1.5 && volatility < 0.025) return 'Moderate (2-3%)';
//     return 'Conservative (1-2%)';
//   };

//   // Calculate market volatility from recent data
//   const calculateVolatility = (recentData?: CandlestickData[]) => {
//     if (!recentData || recentData.length < 10) return 0.02; // default

//     const returns = recentData.slice(-10).map((candle, i, arr) => {
//       if (i === 0) return 0;
//       return (candle.close - arr[i - 1].close) / arr[i - 1].close;
//     }).slice(1);

//     const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
//     const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;

//     return Math.sqrt(variance);
//   };

//   // Calculate market context from data
//   const getMarketContext = (recentData?: CandlestickData[], sentimentScore?: number) => {
//     if (!recentData || recentData.length === 0) {
//       return {
//         newsImpact: 'Unknown',
//         technicalSetup: 'Unknown',
//         volumeStatus: 'Unknown',
//         correlation: 'Unknown'
//       };
//     }

//     // Volume analysis
//     const recentVolumes = recentData.slice(-10).map(d => d.volume);
//     const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
//     const currentVolume = recentData[recentData.length - 1]?.volume || 0;

//     const volumeRatio = currentVolume / avgVolume;
//     let volumeStatus = 'Average';
//     if (volumeRatio > 1.2) volumeStatus = 'Above Average';
//     if (volumeRatio < 0.8) volumeStatus = 'Below Average';

//     // Technical setup based on price action
//     const recent5 = recentData.slice(-5);
//     const priceRange = Math.max(...recent5.map(d => d.high)) - Math.min(...recent5.map(d => d.low));
//     const avgPrice = recent5.reduce((sum, d) => sum + d.close, 0) / recent5.length;
//     const volatilityRatio = priceRange / avgPrice;

//     let technicalSetup = 'Consolidation';
//     if (volatilityRatio > 0.03) technicalSetup = 'Breakout Pending';
//     if (volatilityRatio > 0.05) technicalSetup = 'High Volatility';

//     // News impact based on sentiment score
//     let newsImpact = 'Low';
//     if (sentimentScore) {
//       if (sentimentScore > 60 || sentimentScore < 20) newsImpact = 'High';
//       else if (sentimentScore > 45 || sentimentScore < 35) newsImpact = 'Medium';
//     }

//     return {
//       newsImpact,
//       technicalSetup,
//       volumeStatus,
//       correlation: 'Following Crypto Market' // This would need external data to compute properly
//     };
//   };

//   // Filter data based on selected timeframe
//   const getFilteredData = () => {
//     if (selectedTimeframe === 'TODAY') {
//       return {
//         historical: [],
//         forecast: selectedSubTimeframe === '3D' ? forecast : [],
//         showCandlesticks: true
//       };
//     } else if (selectedTimeframe === 'PAST_7D') {
//       return {
//         historical: priceHistory,
//         forecast: [],
//         showCandlesticks: false
//       };
//     } else {
//       return {
//         historical: [],
//         forecast: forecast,
//         showCandlesticks: false
//       };
//     }
//   };

//   const lastHourly = hourlyForecast && hourlyForecast.length > 0
//     ? hourlyForecast[hourlyForecast.length - 1]
//     : null;

//   const { historical: displayPriceHistory, forecast: displayForecast, showCandlesticks } = getFilteredData();

//   // Show/hide tooltip

//   const showTooltip = (
//     event: React.MouseEvent,
//     data: any,
//     type: 'chart' | 'info' = 'chart'
//   ) => {
//     if (!svgRef.current) return;

//     // 1. grab the SVG’s position on screen
//     const { left, top } = svgRef.current.getBoundingClientRect();

//     // 2. compute cursor position inside the SVG
//     const x = event.clientX - left;
//     const y = event.clientY - top;

//     setTooltip({ x, y, data, visible: true, type });
//   };

//   const hideTooltip = () => {
//     setTooltip(prev => ({ ...prev, visible: false }));
//   };

//   // Tooltip content definitions
//   const tooltipContent = {
//     riskManagement: {
//       title: "Risk Management",
//       content: [
//         "Risk vs Reward: Calculated as (Take Profit - Entry) ÷ (Entry - Stop Loss). Higher ratios indicate better risk-adjusted returns.",
//         "Position Size: Recommended portfolio allocation based on volatility and R:R ratio. Conservative (1-2%), Moderate (2-3%), Aggressive (3-5%).",
//         "Win Probability: Percentage of positive price deviations from historical hourly forecasts.",
//         "Max Drawdown: Largest single loss percentage observed in recent trading signals."
//       ]
//     },
//     performanceMetrics: {
//       title: "Performance Metrics",
//       content: [
//         "Win Rate: Average accuracy percentage from the last 100 hourly predictions.",
//         "Avg Gain: Mean percentage gain from all profitable prediction periods.",
//         "Avg Loss: Mean percentage loss from all unprofitable prediction periods.",
//         "Profit Factor: Ratio of average gains to average losses. Values above 2.0 indicate strong performance."
//       ]
//     },
//     marketStructure: {
//       title: "Market Structure & Key Levels",
//       content: [
//         "Trend Direction: Short-term (10 candles) vs Long-term (30 candles) price movement analysis.",
//         "Key Pivot: Current price level acting as decision point for market direction.",
//         "Next Resistance: Calculated from recent 20-period highs, where selling pressure may increase.",
//         "Next Support: Calculated from recent 20-period lows, where buying interest typically emerges."
//       ]
//     }
//   };

//   // Create candlestick chart with future projections
//   const createCandlestickChart = (isFullScreen = false) => {
//     if (!showCandlesticks || candlestickData.length === 0) {
//       return null;
//     }

//     // Determine if we should show simplified version (mobile + not full screen)
//     const isMinified = isMobile && !isFullScreen;

//     // Responsive dimensions
//     const width = isFullScreen
//       ? window.innerWidth - 40
//       : (isMobile ? 280 : 950);
//     const chartHeight = isFullScreen
//       ? window.innerHeight * 0.7
//       : (isMobile ? 180 : 600);
//     const volumeHeight = isFullScreen
//       ? 100
//       : (isMobile ? 40 : 80);
//     const padding = isFullScreen ? 60 : (isMobile ? 20 : 35);
//     const topPadding = isFullScreen ? 60 : (isMobile ? 20 : 35);
//     const bottomPadding = isFullScreen ? 80 : (isMobile ? 30 : 45);
//     const height = chartHeight + volumeHeight + topPadding + bottomPadding + 20;

//     const futureMinutes = 30;
//     const lastTimestamp = candlestickData[candlestickData.length - 1]?.timestamp || Date.now();
//     const futureTimeSlots = Array.from({ length: futureMinutes }, (_, i) =>
//       lastTimestamp + ((i + 1) * 60000)
//     );

//     const totalDataPoints = candlestickData.length + futureTimeSlots.length;
//     const candleWidth = Math.max(2, (width - 2 * padding) / totalDataPoints - 1);
//     const xStep = (width - 2 * padding) / Math.max(totalDataPoints - 1, 1);

//     const prices = candlestickData.flatMap(d => [d.open, d.high, d.low, d.close]);

//     // Include hourly forecast confidence intervals in price range
//     if (lastHourly) {
//       prices.push(
//         lastHourly.forecast_price,
//         lastHourly.confidence_50[0], lastHourly.confidence_50[1],
//         lastHourly.confidence_80[0], lastHourly.confidence_80[1],
//         lastHourly.confidence_90[0], lastHourly.confidence_90[1]
//       );

//       if (displayEntry) prices.push(displayEntry);
//       if (displayStopLoss) prices.push(displayStopLoss);
//       if (displayTakeProfit) prices.push(displayTakeProfit);
//     }

//     // Add key levels to price range
//     const keyLevels = getKeyLevels(currentPrice);
//     prices.push(keyLevels.support, keyLevels.resistance, keyLevels.breakoutLevel, keyLevels.invalidationLevel);

//     const minPrice = Math.min(...prices) * 0.998;
//     const maxPrice = Math.max(...prices) * 1.002;
//     const priceRange = maxPrice - minPrice;
//     const maxVolume = Math.max(...candlestickData.map(d => d.volume));

//     const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * chartHeight;
//     const getX = (index: number) => padding + index * xStep;
//     const getVolumeY = (volume: number) => chartHeight + padding + 20 + (1 - volume / maxVolume) * volumeHeight;

//     return (
//       <svg
//         ref={svgRef}
//         width={width}
//         height={height}
//         className="w-full h-full"
//         viewBox={`0 0 ${width} ${height}`}
//       >
//         {/* Price chart grid - Show fewer grid lines on minified mobile */}
//         {(isMinified
//           ? [0, 0.5, 1]
//           : [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
//         ).map((ratio, i) => (
//           <line
//             key={i}
//             x1={padding}
//             y1={padding + ratio * chartHeight}
//             x2={width - padding}
//             y2={padding + ratio * chartHeight}
//             stroke="#1f2937"
//             strokeWidth={1}
//             opacity={i % 2 === 0 ? 0.3 : 0.15}
//           />
//         ))}

//         {/* Key Support/Resistance Levels */}
//         {(() => {
//           const levels = getKeyLevels(currentPrice);
//           return (
//             <>
//               {/* Support Line */}
//               <line
//                 x1={padding}
//                 y1={getY(levels.support)}
//                 x2={width - padding}
//                 y2={getY(levels.support)}
//                 stroke="#ef4444"
//                 strokeWidth={2}
//                 strokeDasharray="3,3"
//                 opacity={0.7}
//               />
//               <text x={padding + 5} y={getY(levels.support) - 5} fill="#ef4444" fontSize={isMinified ? "8" : isFullScreen ? "12" : "10"} className="font-bold">
//                 SUPPORT ${Math.round(levels.support).toLocaleString()}
//               </text>

//               {/* Resistance Line */}
//               <line
//                 x1={padding}
//                 y1={getY(levels.resistance)}
//                 x2={width - padding}
//                 y2={getY(levels.resistance)}
//                 stroke="#10b981"
//                 strokeWidth={2}
//                 strokeDasharray="3,3"
//                 opacity={0.7}
//               />
//               <text x={padding + 5} y={getY(levels.resistance) + 15} fill="#10b981" fontSize={isMinified ? "8" : isFullScreen ? "12" : "10"} className="font-bold">
//                 RESISTANCE ${Math.round(levels.resistance).toLocaleString()}
//               </text>

//               {/* Breakout and Invalidation levels - Hide on minified mobile */}
//               {!isMinified && (
//                 <>
//                   {/* Breakout Level */}
//                   <line
//                     x1={padding}
//                     y1={getY(levels.breakoutLevel)}
//                     x2={width - padding}
//                     y2={getY(levels.breakoutLevel)}
//                     stroke="#8b5cf6"
//                     strokeWidth={1}
//                     strokeDasharray="6,2"
//                     opacity={0.6}
//                   />
//                   <text x={width - padding - 5} y={getY(levels.breakoutLevel) - 5} fill="#8b5cf6" fontSize={isFullScreen ? "11" : "9"} textAnchor="end">
//                     BREAKOUT ${Math.round(levels.breakoutLevel).toLocaleString()}
//                   </text>

//                   {/* Invalidation Level */}
//                   <line
//                     x1={padding}
//                     y1={getY(levels.invalidationLevel)}
//                     x2={width - padding}
//                     y2={getY(levels.invalidationLevel)}
//                     stroke="#f59e0b"
//                     strokeWidth={1}
//                     strokeDasharray="6,2"
//                     opacity={0.6}
//                   />
//                   <text x={width - padding - 5} y={getY(levels.invalidationLevel) + 15} fill="#f59e0b" fontSize={isFullScreen ? "11" : "9"} textAnchor="end">
//                     INVALIDATION ${Math.round(levels.invalidationLevel).toLocaleString()}
//                   </text>
//                 </>
//               )}
//             </>
//           );
//         })()}

//         {/* Vertical line to separate historical and forecast */}
//         <line
//           x1={getX(candlestickData.length - 1)}
//           y1={padding}
//           x2={getX(candlestickData.length - 1)}
//           y2={chartHeight + padding}
//           stroke="#374151"
//           strokeWidth={2}
//           strokeDasharray="5,5"
//           opacity={0.6}
//         />

//         {/* Volume chart grid */}
//         <line
//           x1={padding}
//           y1={chartHeight + padding + 20}
//           x2={width - padding}
//           y2={chartHeight + padding + 20}
//           stroke="#1f2937"
//           strokeWidth={1}
//           opacity={0.5}
//         />

//         {/* Enhanced Confidence intervals using hourly forecast data */}
//         {lastHourly && (
//           <>
//             {(() => {
//               const startX = getX(candlestickData.length - 1);
//               const endX = width - padding;
//               const currentPrice = candlestickData[candlestickData.length - 1]?.close || lastHourly.forecast_price;

//               const createFutureConfidencePath = (upperBound: number, lowerBound: number) => {
//                 const startY = getY(currentPrice);
//                 const midX = startX + (endX - startX) * 0.3;
//                 const endUpperY = getY(upperBound);
//                 const endLowerY = getY(lowerBound);

//                 return `
//                   M ${startX},${startY}
//                   Q ${midX},${startY} ${midX + 20},${(endUpperY + endLowerY) / 2}
//                   L ${endX},${endUpperY}
//                   L ${endX},${endLowerY}
//                   Q ${midX},${(endUpperY + endLowerY) / 2} ${startX},${startY}
//                   Z
//                 `;
//               };

//               return (
//                 <>
//                   {/* Show all confidence intervals except on minified mobile */}
//                   {!isMinified && (
//                     <>
//                       {/* 90% High Confidence Range */}
//                       <path
//                         d={createFutureConfidencePath(
//                           lastHourly.confidence_90[1],
//                           lastHourly.confidence_90[0]
//                         )}
//                         fill="#22c55e"
//                         fillOpacity={0.1}
//                         stroke="#22c55e"
//                         strokeOpacity={0.3}
//                         strokeWidth={1}
//                       />

//                       {/* 80% Medium Confidence Range */}
//                       <path
//                         d={createFutureConfidencePath(
//                           lastHourly.confidence_80[1],
//                           lastHourly.confidence_80[0]
//                         )}
//                         fill="#f59e0b"
//                         fillOpacity={0.15}
//                         stroke="#f59e0b"
//                         strokeOpacity={0.4}
//                         strokeWidth={1}
//                       />
//                     </>
//                   )}

//                   {/* 50% Low Confidence Range - Always show */}
//                   <path
//                     d={createFutureConfidencePath(
//                       lastHourly.confidence_50[1],
//                       lastHourly.confidence_50[0]
//                     )}
//                     fill="#3b82f6"
//                     fillOpacity={0.2}
//                     stroke="#3b82f6"
//                     strokeOpacity={0.5}
//                     strokeWidth={2}
//                   />
//                 </>
//               );
//             })()}

//             {/* Trading lines for hourly forecast - Simplified for minified mobile */}
//             {displayEntry && !isMinified && (
//               <line
//                 x1={getX(candlestickData.length - 1)}
//                 y1={getY(displayEntry)}
//                 x2={width - padding}
//                 y2={getY(displayEntry)}
//                 stroke="#10b981"
//                 strokeWidth={2}
//                 strokeDasharray="8,4"
//                 opacity={0.8}
//               />
//             )}

//             {displayStopLoss && !isMinified && (
//               <line
//                 x1={getX(candlestickData.length - 1)}
//                 y1={getY(displayStopLoss)}
//                 x2={width - padding}
//                 y2={getY(displayStopLoss)}
//                 stroke="#ef4444"
//                 strokeWidth={2}
//                 strokeDasharray="8,4"
//                 opacity={0.8}
//               />
//             )}

//             {displayTakeProfit && !isMinified && (
//               <line
//                 x1={getX(candlestickData.length - 1)}
//                 y1={getY(displayTakeProfit)}
//                 x2={width - padding}
//                 y2={getY(displayTakeProfit)}
//                 stroke="#8b5cf6"
//                 strokeWidth={2}
//                 strokeDasharray="8,4"
//                 opacity={0.8}
//               />
//             )}

//             {/* Price Target Probability Line */}
//             <line
//               x1={getX(candlestickData.length - 1)}
//               y1={getY(lastHourly.forecast_price)}
//               x2={width - padding}
//               y2={getY(lastHourly.forecast_price)}
//               stroke="#fbbf24"
//               strokeWidth={3}
//               strokeDasharray="12,6"
//               opacity={0.9}
//             />

//             {/* Enhanced Labels - Simplified for minified mobile */}
//             {displayEntry && !isMinified && (
//               <text x={width - padding - 5} y={getY(displayEntry) - 5} fill="#10b981" fontSize={isFullScreen ? "12" : "10"} textAnchor="end" className="font-bold">
//                 ENTRY ZONE ${displayEntry.toLocaleString()}
//               </text>
//             )}
//             {displayTakeProfit && !isMinified && (
//               <text x={width - padding - 5} y={getY(displayTakeProfit) - 5} fill="#8b5cf6" fontSize={isFullScreen ? "12" : "10"} textAnchor="end" className="font-bold">
//                 TAKE PROFIT ${displayTakeProfit.toLocaleString()}
//               </text>
//             )}
//             {displayStopLoss && !isMinified && (
//               <text x={width - padding - 5} y={getY(displayStopLoss) + 15} fill="#ef4444" fontSize={isFullScreen ? "12" : "10"} textAnchor="end" className="font-bold">
//                 STOP LOSS ${displayStopLoss.toLocaleString()}
//               </text>
//             )}
//             <text x={width - padding - 5} y={getY(lastHourly.forecast_price) - 5} fill="#fbbf24" fontSize={isMinified ? "8" : isFullScreen ? "12" : "10"} textAnchor="end" className="font-bold">
//               TARGET ${lastHourly.forecast_price.toLocaleString()}
//             </text>
//           </>
//         )}

//         {/* Candlesticks */}
//         {candlestickData.map((candle, i) => {
//           const x = getX(i);
//           const openY = getY(candle.open);
//           const closeY = getY(candle.close);
//           const highY = getY(candle.high);
//           const lowY = getY(candle.low);

//           const isGreen = candle.close > candle.open;
//           const bodyHeight = Math.abs(closeY - openY);
//           const bodyY = Math.min(openY, closeY);

//           return (
//             <g key={i}>
//               <line
//                 x1={x}
//                 y1={highY}
//                 x2={x}
//                 y2={lowY}
//                 stroke={isGreen ? "#10b981" : "#ef4444"}
//                 strokeWidth={1}
//               />

//               <rect
//                 x={x - candleWidth / 2}
//                 y={bodyY}
//                 width={candleWidth}
//                 height={Math.max(bodyHeight, 1)}
//                 fill={isGreen ? "#10b981" : "#ef4444"}
//                 stroke={isGreen ? "#10b981" : "#ef4444"}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...candle, type: 'candlestick' }, 'chart')}
//               />

//               <rect
//                 x={x - candleWidth / 2}
//                 y={getVolumeY(candle.volume)}
//                 width={candleWidth}
//                 height={(candle.volume / maxVolume) * volumeHeight}
//                 fill={isGreen ? "#10b981" : "#ef4444"}
//                 opacity={0.6}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...candle, type: 'volume' }, 'chart')}
//               />
//             </g>
//           );
//         })}

//         {/* Current price indicator */}
//         <line
//           x1={padding}
//           y1={getY(currentPrice)}
//           x2={getX(candlestickData.length - 1)}
//           y2={getY(currentPrice)}
//           stroke="#fbbf24"
//           strokeWidth={2}
//           opacity={0.9}
//         />

//         {currentPrice != null ? (
//           <text
//             x={getX(candlestickData.length - 1) - 5}
//             y={getY(currentPrice) - 5}
//             fill="#fbbf24"
//             fontSize={isMinified ? "10" : isFullScreen ? "14" : "12"}
//             textAnchor="end"
//             className="font-bold"
//           >
//             LIVE ${currentPrice.toLocaleString()}
//           </text>
//         ) : (
//           <text
//             x={getX(candlestickData.length - 1) - 5}
//             y={padding - 5}
//             fill="#fbbf24"
//             fontSize={isMinified ? "8" : isFullScreen ? "12" : "10"}
//             textAnchor="end"
//           >
//             Loading…
//           </text>
//         )}

//         {/* Price labels - Fewer on mobile minified */}
//         {(isMinified
//           ? [0, 0.5, 1]
//           : [0, 0.25, 0.5, 0.75, 1]
//         ).map((ratio, i) => {
//           const price = minPrice + (maxPrice - minPrice) * (1 - ratio);
//           return (
//             <text key={i} x={padding - 5} y={padding + ratio * chartHeight + 5} fill="#9ca3af" fontSize={isMinified ? "8" : isFullScreen ? "12" : "10"} textAnchor="end">
//               ${Math.round(price).toLocaleString()}
//             </text>
//           );
//         })}

//         {/* Volume label */}
//         <text x={padding - 5} y={chartHeight + padding + 35} fill="#9ca3af" fontSize={isMinified ? "6" : isFullScreen ? "10" : "8"} textAnchor="end">
//           Volume
//         </text>

//         {/* Time labels */}
//         {candlestickData.length > 1 && (
//           <>
//             <text x={padding} y={height - 10} fill="#9ca3af" fontSize={isMinified ? "6" : isFullScreen ? "10" : "8"} textAnchor="middle">
//               {new Date(candlestickData[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//             </text>
//             <text x={getX(candlestickData.length - 1)} y={height - 10} fill="#fbbf24" fontSize={isMinified ? "6" : isFullScreen ? "10" : "8"} textAnchor="middle">
//               NOW
//             </text>
//             <text x={width - padding} y={height - 10} fill="#9ca3af" fontSize={isMinified ? "6" : isFullScreen ? "10" : "8"} textAnchor="middle">
//               +30min
//             </text>
//           </>
//         )}
//       </svg>
//     );
//   };

//   // Create regular SVG chart for non-today views
//   const createSVGChart = (isFullScreen = false) => {
//     const isToday = selectedTimeframe === 'TODAY';

//     if (showCandlesticks) {
//       return createCandlestickChart(isFullScreen);
//     }

//     const allData = [
//       ...displayPriceHistory.map(item => ({ ...item, type: 'historical' })),
//       ...displayForecast.map(item => ({ ...item, price: item.entry, type: 'forecast' }))
//     ];

//     if (allData.length === 0) {
//       return (
//         <div className="flex items-center justify-center h-full text-gray-400">
//           No data available for selected timeframe
//         </div>
//       );
//     }

//     const allPrices = [
//       ...allData.map(item => item.price),
//       ...displayForecast.flatMap(item => [
//         item.confidence_intervals[90][0],
//         item.confidence_intervals[90][1],
//         item.stop_loss,
//         item.take_profit
//       ])
//     ];

//     const minPrice = Math.min(...allPrices) * 0.995;
//     const maxPrice = Math.max(...allPrices) * 1.005;
//     const priceRange = maxPrice - minPrice;

//     const width = isFullScreen
//       ? window.innerWidth - 40
//       : (isMobile ? 350 : 500);
//     const height = isFullScreen
//       ? window.innerHeight * 0.8
//       : (isMobile ? 200 : 300);
//     const padding = isFullScreen ? 60 : (isMobile ? 30 : 50);

//     const xStep = (width - 2 * padding) / Math.max(allData.length - 1, 1);

//     const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);
//     const getX = (index: number) => padding + index * xStep;

//     return (
//       <svg
//         ref={svgRef}
//         width={width}
//         height={height}
//         className="w-full h-full"
//         viewBox={`0 0 ${width} ${height}`}
//       >
//         {/* Grid lines */}
//         {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
//           <line
//             key={i}
//             x1={padding}
//             y1={padding + ratio * (height - 2 * padding)}
//             x2={width - padding}
//             y2={padding + ratio * (height - 2 * padding)}
//             stroke="#1f2937"
//             strokeWidth={1}
//             opacity={0.3}
//           />
//         ))}

//         {/* Price lines */}
//         {displayPriceHistory.length > 0 && (
//           <polyline
//             points={displayPriceHistory.map((item, i) => {
//               const x = getX(i);
//               const y = getY(item.price);
//               return `${x},${y}`;
//             }).join(' ')}
//             fill="none"
//             stroke="#3b82f6"
//             strokeWidth={isMobile ? 2 : 3}
//           />
//         )}

//         {displayForecast.length > 0 && (
//           <polyline
//             points={displayForecast.map((item, i) => {
//               const x = getX(displayPriceHistory.length + i);
//               const y = getY(item.entry);
//               return `${x},${y}`;
//             }).join(' ')}
//             fill="none"
//             stroke="#10b981"
//             strokeWidth={isMobile ? 2 : 3}
//             strokeDasharray="8,4"
//           />
//         )}

//         {/* Data points */}
//         {displayPriceHistory.map((item, i) => {
//           const x = getX(i);
//           const y = getY(item.price);
//           return (
//             <circle
//               key={i}
//               cx={x}
//               cy={y}
//               r={isMobile ? 3 : 4}
//               fill="#3b82f6"
//               stroke="#0a1628"
//               strokeWidth={isMobile ? 1 : 2}
//               style={{ cursor: 'pointer' }}
//               onMouseEnter={(e) => showTooltip(e, { ...item, type: 'historical' }, 'chart')}
//             />
//           );
//         })}

//         {displayForecast.map((item, i) => {
//           const x = getX(displayPriceHistory.length + i);
//           const y = getY(item.entry);
//           const radius = isMobile ? 4 : 5;
//           const arrowSize = isMobile ? 8 : 12;
//           return (
//             <g key={i}>
//               <circle
//                 cx={x}
//                 cy={y}
//                 r={radius}
//                 fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
//                 stroke="#0a1628"
//                 strokeWidth={isMobile ? 1 : 2}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' }, 'chart')}
//               />
//               <polygon
//                 points={item.signal === 'LONG'
//                   ? `${x},${y - arrowSize} ${x - arrowSize / 2},${y - arrowSize / 2} ${x + arrowSize / 2},${y - arrowSize / 2}`
//                   : `${x},${y + arrowSize} ${x - arrowSize / 2},${y + arrowSize / 2} ${x + arrowSize / 2},${y + arrowSize / 2}`
//                 }
//                 fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' }, 'chart')}
//               />
//             </g>
//           );
//         })}

//         {/* Price labels */}
//         <text x={padding - 5} y={padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round(maxPrice).toLocaleString()}
//         </text>
//         <text x={padding - 5} y={height - padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round(minPrice).toLocaleString()}
//         </text>
//         <text x={padding - 5} y={padding + (height - 2 * padding) / 2} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
//           ${Math.round((maxPrice + minPrice) / 2).toLocaleString()}
//         </text>

//         {/* Date labels */}
//         {allData.length > 1 && (
//           <>
//             <text x={padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               {getSimpleDate(allData[0]?.date)}
//             </text>
//             <text x={width - padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
//               {getSimpleDate(allData[allData.length - 1]?.date)}
//             </text>
//           </>
//         )}
//       </svg>
//     );
//   };

//   if (!latest) {
//     return (
//       <div className="p-4 text-gray-400">
//         Loading data...
//       </div>
//     );
//   }

//   const firstForecast = latest;
//   const firstForecasts = displayForecast[0] || forecast[0];

//   // Use hourly forecast data or fallback to forecast data
//   const displaySignal = lastHourly?.signal || firstForecasts?.signal || 'HOLD';
//   const displayEntry = lastHourly?.entry_price || firstForecasts?.entry;
//   const displayTakeProfit = lastHourly?.take_profit || firstForecasts?.take_profit;
//   const displayStopLoss = lastHourly?.stop_loss || firstForecasts?.stop_loss;
//   const performanceMetrics = calculatePerformanceMetrics(hourlyForecast);

//   const nextHourTarget = lastHourly?.forecast_price ||
//     (hourlyForecast && hourlyForecast.length > 0 ? hourlyForecast[0].forecast_price : null);

//   const confidenceProbability = lastHourly?.confidence_50 ?
//     Math.round(((lastHourly.confidence_50[1] - lastHourly.confidence_50[0]) / lastHourly.forecast_price) * 100 * 10) :
//     75; // Default fallback

//   const expectedTimeframe = displaySignal === 'LONG' || displaySignal === 'SHORT' ?
//     '30-60' : '45-90';

//   // Calculate minutes to next forecast (assuming hourly updates)
//   // const minutesToNextForecast = (() => {
//   //   const now = new Date();
//   //   const nextHour = new Date(now);
//   //   nextHour.setHours(now.getHours() + 1, 0, 0, 0);
//   //   return Math.ceil((nextHour.getTime() - now.getTime()) / (1000 * 60));
//   // })();
//   const minutesToNextForecast = (() => {
//     const now = new Date();
//     const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
//     const nextHourUTC = new Date(nowUTC);
//     nextHourUTC.setUTCHours(nowUTC.getUTCHours() + 1, 0, 0, 0);
//     return Math.ceil((nextHourUTC.getTime() - nowUTC.getTime()) / (1000 * 60));
//   })();

//   const formattedAccuracy = lastHourly?.accuracy_percent && lastHourly.accuracy_percent !== 'N/A'
//     ? `${lastHourly.accuracy_percent}%`
//     : firstForecast?.overall_accuracy_percent
//       ? `${firstForecast.overall_accuracy_percent}%`
//       : `${performanceMetrics.winRate}%`;

//   const formattedDeviation = lastHourly?.deviation_percent && lastHourly.deviation_percent !== 'N/A'
//     ? `${lastHourly.deviation_percent}%`
//     : firstForecast?.deviation_percent
//       ? `+${firstForecast.deviation_percent}%`
//       : '+1.50%';

//   // Calculate market structure
//   const marketStructure = getMarketStructure(currentPrice, candlestickData, displaySignal);
//   const keyLevels = getKeyLevels(currentPrice, candlestickData);
//   const volatility = calculateVolatility(candlestickData);
//   const marketContext = getMarketContext(candlestickData, lastHourly?.sentiment_score || 30);

//   // Calculate position size recommendation
//   const riskRewardValue = lastHourly?.risk_reward_ratio ||
//     (displayEntry && displayStopLoss && displayTakeProfit ?
//       parseFloat(getRiskReward(displayEntry, displayStopLoss, displayTakeProfit)) : 1.5);

//   const positionSize = calculatePositionSize(displaySignal, riskRewardValue, volatility);

//   // Full screen chart overlay
//   const FullScreenChart = () => (
//     <>
//       {/* Backdrop */}
//       <div className="fixed inset-0 bg-black bg-opacity-95 z-50" onClick={() => setIsChartMaximized(false)} />

//       {/* Full Screen Chart */}
//       <div className="fixed inset-0 z-50 flex flex-col p-4">
//         <div className="bg-[#080b12] h-full rounded-lg flex flex-col relative border border-[rgba(255,255,255,0.08)]">
//           {/* Close button */}
//           <button
//             onClick={() => setIsChartMaximized(false)}
//             className="absolute top-4 right-4 z-10 bg-[#0d1120] hover:bg-[rgba(255,255,255,0.06)] text-white p-2 rounded-lg transition-colors duration-200"
//             title="Close (Esc)"
//           >
//             <X size={20} />
//           </button>

//           {/* Chart header */}
//           <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
//             <h3 className="text-white text-lg font-bold">
//               {selectedAsset} Price Chart - Full Screen
//             </h3>
//             <p className="text-gray-400 text-sm">
//               Real-time candlestick chart with AI predictions and technical analysis
//             </p>
//           </div>

//           {/* Chart container */}
//           <div className="flex-1 p-4 relative" onMouseLeave={hideTooltip}>
//             {createSVGChart(true)}

//             {/* Enhanced Tooltip for full screen */}
//             {tooltip.visible && tooltip.data && (
//               <div
//                 className={`absolute ${tooltip.type === 'info' ? 'bg-[#0d1120]' : 'bg-[#080b12]'} border border-[rgba(255,255,255,0.08)] rounded-lg p-3 text-white shadow-xl z-50 text-sm ${tooltip.type === 'info' ? 'max-w-md' : 'min-w-48'} break-words`}
//                 style={{
//                   left: tooltip.x + 10,
//                   top: tooltip.y - 10,
//                   transform: tooltip.x > 300 ? 'translateX(-100%)' : 'none'
//                 }}
//               >
//                 {tooltip.type === 'info' ? (
//                   // Info tooltip content
//                   <div className="space-y-2">
//                     <div className="font-bold text-blue-400 border-b border-gray-600 pb-1 break-words">
//                       {tooltip.data.title}
//                     </div>
//                     <div className="space-y-2">
//                       {tooltip.data.content.map((item: string, index: number) => (
//                         <div key={index} className="text-sm leading-relaxed">
//                           <span className="font-medium text-gray-300 break-words">
//                             {item.split(':')[0]}:
//                           </span>
//                           <span className="text-gray-400 ml-1 break-words">
//                             {item.split(':').slice(1).join(':')}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ) : (
//                   // Chart tooltip content
//                   <div className="space-y-2">
//                     {tooltip.data.type === 'candlestick' && (
//                       <>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Time:</span>
//                           <span className="break-words min-w-0">{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">OHLC:</span>
//                           <span className="break-all min-w-0">
//                             ${Math.round(tooltip.data.open).toLocaleString()} /
//                             ${Math.round(tooltip.data.high).toLocaleString()} /
//                             ${Math.round(tooltip.data.low).toLocaleString()} /
//                             ${Math.round(tooltip.data.close).toLocaleString()}
//                           </span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Change:</span>
//                           <span className={`flex-shrink-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
//                             {((tooltip.data.close / tooltip.data.open - 1) * 100).toFixed(2)}%
//                           </span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Volume:</span>
//                           <span className="flex-shrink-0">{(tooltip.data.volume / 1000).toFixed(0)}K</span>
//                         </div>
//                       </>
//                     )}

//                     {tooltip.data.type === 'volume' && (
//                       <>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Time:</span>
//                           <span className="break-words min-w-0">{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Volume:</span>
//                           <span className="break-all min-w-0">{Math.round(tooltip.data.volume).toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Price:</span>
//                           <span className="break-all min-w-0">${Math.round(tooltip.data.close).toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Volume Type:</span>
//                           <span className={`break-words min-w-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
//                             {tooltip.data.close > tooltip.data.open ? 'Buying Pressure' : 'Selling Pressure'}
//                           </span>
//                         </div>
//                       </>
//                     )}

//                     {tooltip.data.type === 'historical' && (
//                       <>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Date:</span>
//                           <span className="break-words min-w-0">{getSimpleDate(tooltip.data.date)}</span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Price:</span>
//                           <span className="break-all min-w-0">${Math.round(tooltip.data.price).toLocaleString()}</span>
//                         </div>
//                       </>
//                     )}

//                     {tooltip.data.type === 'forecast' && (
//                       <>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Date:</span>
//                           <span className="break-words min-w-0">{getSimpleDate(tooltip.data.date)}</span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Signal:</span>
//                           <span className={`font-bold flex-shrink-0 ${tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
//                             {tooltip.data.signal}
//                           </span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Entry:</span>
//                           <span className="break-all min-w-0">${Math.round(tooltip.data.entry).toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Stop:</span>
//                           <span className="text-red-400 break-all min-w-0">${Math.round(tooltip.data.stop_loss).toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Target:</span>
//                           <span className="text-green-400 break-all min-w-0">${Math.round(tooltip.data.take_profit).toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">R:R Ratio:</span>
//                           <span className="text-blue-400 flex-shrink-0">1:{getRiskReward(tooltip.data.entry, tooltip.data.stop_loss, tooltip.data.take_profit)}</span>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Full screen legend */}
//           <div className="p-4 border-t border-gray-700">
//             <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-0.5 bg-yellow-500"></div>
//                 <span className="text-gray-400">Live Price</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-2 bg-blue-500" style={{ opacity: 0.3 }}></div>
//                 <span className="text-gray-400">50% Confidence</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-2 bg-yellow-600" style={{ opacity: 0.3 }}></div>
//                 <span className="text-gray-400">80% Confidence</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-2 bg-green-500" style={{ opacity: 0.3 }}></div>
//                 <span className="text-gray-400">90% Confidence</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
//                 <span className="text-gray-400">Support/Resistance</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
//                 <span className="text-gray-400">Key Levels</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );

//   return (
//     <div className={`bg-[#080b12] rounded-lg p-4 ${className}`}>
//       {/* Controls Section */}
//       <div className="flex justify-between items-center mb-4 gap-2">
//         <select
//           value={selectedAsset}
//           onChange={(e) => setSelectedAsset(e.target.value as 'BTC' | 'SOL' | 'ETH')}
//           className="bg-[#0d1120]/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] focus:border-blue-500 focus:outline-none text-sm min-w-0 flex-shrink-0"
//         >
//           <option value="BTC">BTC</option>
//           <option value="SOL" disabled>SOL (Soon)</option>
//           <option value="ETH" disabled>ETH (Soon)</option>
//         </select>

//         <SegmentedControl
//           options={[
//             { value: 'TODAY', label: 'Today' },
//           ]}
//           selected={selectedTimeframe}
//           onChange={(value) => setSelectedTimeframe(value as 'TODAY')}
//           className="flex-shrink-0"
//         />
//       </div>

//       <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 mb-4 border border-blue-500/30">
//         <div className="flex items-center justify-between gap-4">
//           <div className="min-w-0 flex-1">
//             <div className="text-blue-400 text-sm font-medium mb-1">🎯 NEXT HOUR OUTLOOK</div>
//             <div className="text-white text-base md:text-lg font-bold break-words">
//               ZkAGI anticipates price to hit ${nextHourTarget?.toLocaleString()} over next hour
//             </div>
//           </div>
//           <div className="text-right flex-shrink-0">
//             <div className="text-gray-400 text-xs md:text-sm whitespace-nowrap">Next forecast in:</div>
//             <div className="text-yellow-400 text-lg md:text-xl font-bold">{minutesToNextForecast}m</div>
//           </div>
//         </div>
//       </div>

//       {/* Enhanced Key Metrics */}
//       <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 mb-4`}>
//         {/* Trading Signal Panel */}
//         <div className={`bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 border-l-4 overflow-hidden ${displaySignal === 'LONG' ? 'border-green-500' :
//           displaySignal === 'SHORT' ? 'border-red-500' :
//             'border-yellow-500'
//           }`}>
//           <div className="flex justify-between items-start mb-2 gap-2">
//             <span className="text-gray-400 text-sm flex-shrink-0">TRADING SIGNAL</span>
//             <span className={`font-bold text-lg flex-shrink-0 ${displaySignal === 'LONG' ? 'text-green-400' :
//               displaySignal === 'SHORT' ? 'text-red-400' :
//                 'text-yellow-400'
//               }`}>
//               {displaySignal}
//             </span>
//           </div>

//           <div className="space-y-1">
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Entry Zone:</span>
//               <span className="text-white font-medium text-right break-all min-w-0">
//                 {displayEntry ? `${(displayEntry * 0.999).toLocaleString()} - ${(displayEntry * 1.001).toLocaleString()}` : 'N/A'}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Take Profit:</span>
//               <span className="text-green-400 text-right break-all min-w-0">
//                 {displayTakeProfit ? `${displayTakeProfit.toLocaleString()} (+${((displayTakeProfit / (displayEntry || 1) - 1) * 100).toFixed(1)}%)` : 'N/A'}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Stop Loss:</span>
//               <span className="text-red-400 text-right break-all min-w-0">
//                 {displayStopLoss ? `${displayStopLoss.toLocaleString()} (-${((1 - displayStopLoss / (displayEntry || 1)) * 100).toFixed(1)}%)` : 'N/A'}
//               </span>
//             </div>
//           </div>

//           <div className="mb-1 mt-5 p-2 bg-[#0d1120]/50 rounded text-[9px] text-gray-500 break-words">
//             <strong>Note:</strong> Position parameters display as N/A during HOLD signals.
//             Specific entry zones, profit targets, and stop levels are provided for actionable LONG/SHORT signals.
//           </div>
//         </div>

//         {/* Enhanced Risk Analysis */}
//         <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 overflow-hidden">
//           <div
//             className="text-gray-400 text-sm mb-2 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
//             onMouseEnter={(e) => showTooltip(e, tooltipContent.riskManagement, 'info')}
//             onMouseLeave={hideTooltip}
//           >
//             <span className="break-words min-w-0">Risk Management</span>
//             <span className="text-xs flex-shrink-0">ⓘ</span>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Risk vs Reward:</span>
//               <span className="text-blue-400 font-bold flex-shrink-0">
//                 {lastHourly?.risk_reward_ratio ?
//                   `1:${lastHourly.risk_reward_ratio.toFixed(1)}` :
//                   displayEntry && displayStopLoss && displayTakeProfit ?
//                     `1:${getRiskReward(displayEntry, displayStopLoss, displayTakeProfit)}` :
//                     '1:1.5'
//                 }
//               </span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Position Size:</span>
//               <span className="text-green-400 text-right break-words min-w-0">{positionSize}</span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Win Probability:</span>
//               <span className="text-blue-400 flex-shrink-0">{performanceMetrics.winProbability}%</span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Max Drawdown:</span>
//               <span className="text-yellow-400 flex-shrink-0">-{performanceMetrics.maxDrawdown}%</span>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Performance Panel */}
//         <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 overflow-hidden">
//           <div
//             className="text-gray-400 text-sm mb-2 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
//             onMouseEnter={(e) => showTooltip(e, tooltipContent.performanceMetrics, 'info')}
//             onMouseLeave={hideTooltip}
//           >
//             <span className="break-words min-w-0">Performance Metrics</span>
//             <span className="text-xs flex-shrink-0">ⓘ</span>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Win Rate (Last 100):</span>
//               <span className="text-green-400 flex-shrink-0">
//                 {formattedAccuracy}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Avg Gain:</span>
//               <span className="text-green-400 flex-shrink-0">+{performanceMetrics.avgGain}%</span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Avg Loss:</span>
//               <span className="text-red-400 flex-shrink-0">-{performanceMetrics.avgLoss}%</span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Profit Factor:</span>
//               <span className="text-blue-400 flex-shrink-0">{performanceMetrics.profitFactor}x</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Market Structure Panel */}
//       <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 mb-4 overflow-visible">
//         <div
//           className="text-gray-400 text-sm mb-3 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
//           onMouseEnter={(e) => showTooltip(e, tooltipContent.marketStructure, 'info')}
//           onMouseLeave={hideTooltip}
//         >
//           <span className="break-words min-w-0">Market Structure & Key Levels</span>
//           <span className="text-xs flex-shrink-0">ⓘ</span>
//         </div>
//         <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Trend Direction</div>
//             <div className={`text-sm font-medium break-words ${marketStructure.trend === 'Bullish' ? 'text-green-400' :
//               marketStructure.trend === 'Bearish' ? 'text-red-400' :
//                 'text-yellow-400'
//               }`}>
//               {marketStructure.shortTermTrend} / {marketStructure.longTermTrend}
//             </div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Key Pivot</div>
//             <div className="text-sm font-medium text-white break-all">${Math.round(currentPrice).toLocaleString()}</div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Next Resistance</div>
//             <div className="text-sm font-medium text-green-400 break-all">${Math.round(keyLevels.resistance).toLocaleString()}</div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Next Support</div>
//             <div className="text-sm font-medium text-red-400 break-all">${Math.round(keyLevels.support).toLocaleString()}</div>
//           </div>
//         </div>
//       </div>

//       {/* Chart Container with maximize button */}
//       <div className="w-full bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-2 mb-4 relative overflow-visible"
//         style={{ height: selectedTimeframe === 'TODAY' ? (isMobile ? '240px' : '420px') : (isMobile ? '180px' : '220px') }}
//         onMouseLeave={hideTooltip}
//       >
//         {/* Chart maximize button */}
//         <button
//           onClick={() => setIsChartMaximized(true)}
//           className="absolute top-3 right-3 z-10 bg-[#0d1120]/80 hover:bg-[rgba(255,255,255,0.06)] text-gray-300 hover:text-white p-2 rounded-lg transition-colors duration-200 backdrop-blur-sm"
//           title="Maximize Chart"
//         >
//           <Maximize2 size={16} />
//         </button>

//         {createSVGChart(false)}

//         {/* Enhanced Tooltip */}
//         {tooltip.visible && tooltip.data && (
//           <div
//             className={`absolute ${tooltip.type === 'info' ? 'bg-[#0d1120]' : 'bg-[#080b12]'} border border-[rgba(255,255,255,0.08)] rounded-lg p-3 text-white shadow-xl z-50 ${isMobile ? 'text-xs' : 'text-sm'
//               } ${tooltip.type === 'info' ? 'max-w-md' : 'min-w-48'} break-words`}
//             style={{
//               left: tooltip.x + 10,
//               top: tooltip.y - 10,
//               transform: tooltip.x > (isMobile ? 200 : 300) ? 'translateX(-100%)' : 'none'
//             }}
//           >
//             {tooltip.type === 'info' ? (
//               // Info tooltip content
//               <div className="space-y-2">
//                 <div className="font-bold text-blue-400 border-b border-gray-600 pb-1 break-words">
//                   {tooltip.data.title}
//                 </div>
//                 <div className="space-y-2">
//                   {tooltip.data.content.map((item: string, index: number) => (
//                     <div key={index} className="text-sm leading-relaxed">
//                       <span className="font-medium text-gray-300 break-words">
//                         {item.split(':')[0]}:
//                       </span>
//                       <span className="text-gray-400 ml-1 break-words">
//                         {item.split(':').slice(1).join(':')}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               // Chart tooltip content
//               <div className="space-y-2">
//                 {tooltip.data.type === 'candlestick' && (
//                   <>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Time:</span>
//                       <span className="break-words min-w-0">{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">OHLC:</span>
//                       <span className="break-all min-w-0">
//                         ${Math.round(tooltip.data.open).toLocaleString()} /
//                         ${Math.round(tooltip.data.high).toLocaleString()} /
//                         ${Math.round(tooltip.data.low).toLocaleString()} /
//                         ${Math.round(tooltip.data.close).toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Change:</span>
//                       <span className={`flex-shrink-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
//                         {((tooltip.data.close / tooltip.data.open - 1) * 100).toFixed(2)}%
//                       </span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Volume:</span>
//                       <span className="flex-shrink-0">{(tooltip.data.volume / 1000).toFixed(0)}K</span>
//                     </div>
//                   </>
//                 )}

//                 {tooltip.data.type === 'volume' && (
//                   <>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Time:</span>
//                       <span className="break-words min-w-0">{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Volume:</span>
//                       <span className="break-all min-w-0">{Math.round(tooltip.data.volume).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Price:</span>
//                       <span className="break-all min-w-0">${Math.round(tooltip.data.close).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Volume Type:</span>
//                       <span className={`break-words min-w-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
//                         {tooltip.data.close > tooltip.data.open ? 'Buying Pressure' : 'Selling Pressure'}
//                       </span>
//                     </div>
//                   </>
//                 )}

//                 {tooltip.data.type === 'historical' && (
//                   <>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Date:</span>
//                       <span className="break-words min-w-0">{getSimpleDate(tooltip.data.date)}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Price:</span>
//                       <span className="break-all min-w-0">${Math.round(tooltip.data.price).toLocaleString()}</span>
//                     </div>
//                   </>
//                 )}

//                 {tooltip.data.type === 'forecast' && (
//                   <>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Date:</span>
//                       <span className="break-words min-w-0">{getSimpleDate(tooltip.data.date)}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Signal:</span>
//                       <span className={`font-bold flex-shrink-0 ${tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
//                         {tooltip.data.signal}
//                       </span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Entry:</span>
//                       <span className="break-all min-w-0">${Math.round(tooltip.data.entry).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Stop:</span>
//                       <span className="text-red-400 break-all min-w-0">${Math.round(tooltip.data.stop_loss).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Target:</span>
//                       <span className="text-green-400 break-all min-w-0">${Math.round(tooltip.data.take_profit).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">R:R Ratio:</span>
//                       <span className="text-blue-400 flex-shrink-0">1:{getRiskReward(tooltip.data.entry, tooltip.data.stop_loss, tooltip.data.take_profit)}</span>
//                     </div>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Enhanced Legend */}
//       <div className="mb-4 overflow-x-auto">
//         <div className={`flex flex-wrap gap-x-6 gap-y-2 ${isMobile ? 'text-xs' : 'text-sm'} min-w-max`}>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-0.5 bg-yellow-500"></div>
//             <span className="text-gray-400 whitespace-nowrap">Live Price</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-2 bg-blue-500" style={{ opacity: 0.3 }}></div>
//             <span className="text-gray-400 whitespace-nowrap">50% Confidence</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-2 bg-yellow-600" style={{ opacity: 0.3 }}></div>
//             <span className="text-gray-400 whitespace-nowrap">80% Confidence</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-2 bg-green-500" style={{ opacity: 0.3 }}></div>
//             <span className="text-gray-400 whitespace-nowrap">90% Confidence</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
//             <span className="text-gray-400 whitespace-nowrap">Support/Resistance</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
//             <span className="text-gray-400 whitespace-nowrap">Key Levels</span>
//           </div>
//         </div>
//       </div>

//       {/* Market Context Panel */}
//       <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 overflow-hidden">
//         <div className="text-gray-400 text-sm mb-3 break-words">Market Context & Catalysts</div>
//         <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 text-sm`}>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">News Impact</div>
//             <div className="text-white break-words">{marketContext.newsImpact}</div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Technical Setup</div>
//             <div className="text-white break-words">{marketContext.technicalSetup}</div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Volume</div>
//             <div className={`break-words ${marketContext.volumeStatus === 'Above Average' ? 'text-green-400' :
//               marketContext.volumeStatus === 'Below Average' ? 'text-red-400' : 'text-yellow-400'
//               }`}>{marketContext.volumeStatus}</div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Correlation</div>
//             <div className="text-white break-words">{marketContext.correlation}</div>
//           </div>
//         </div>
//       </div>

//       {/* Full Screen Chart Overlay */}
//       {isChartMaximized && <FullScreenChart />}
//     </div>
//   );
// };

// export default PriceChart;

import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';

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

interface PriceData {
  date: string;
  price: number;
}

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ForecastData {
  date: string;
  signal: 'LONG' | 'SHORT';
  entry: number;
  stop_loss: number;
  take_profit: number;
  confidence_intervals: {
    50: [number, number];
    80: [number, number];
    90: [number, number];
  };
  deviation_percent?: number | string;
  overall_accuracy_percent?: number | string;
}

// interface PriceChartProps {
//   priceHistory?: PriceData[];
//   forecast?: ForecastData[];
//   hourlyForecast?: HourlyForecast[];
//   className?: string;
// }

interface PriceChartProps {
  priceHistory?: PriceData[];
  forecast?: ForecastData[];
  hourlyForecast?: HourlyForecast[];
  className?: string;
  selectedAsset?: 'BTC' | 'SOL' | 'ETH';
  onAssetChange?: (asset: 'BTC' | 'SOL' | 'ETH') => void;
}

interface TooltipData {
  x: number;
  y: number;
  data: any;
  visible: boolean;
  type?: 'chart' | 'info' | 'trade';
}

// helpers
const ASSET_TO_BINANCE: Record<'BTC'|'ETH'|'SOL', string> = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
};

const fetchRealCandles = async (
  asset: 'BTC'|'ETH'|'SOL',
  setDataSource?: (src: 'real' | 'fallback') => void
): Promise<CandlestickData[]> => {
  try {
    const symbol = ASSET_TO_BINANCE[asset];
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=60`
    );
    if (!res.ok) throw new Error(`Binance returned ${res.status}`);
    const raw = (await res.json()) as any[][];
    setDataSource?.('real');
    return raw.map(([ts, open, high, low, close, volume]) => ({
      timestamp: ts,
      open: +open, high: +high, low: +low, close: +close, volume: +volume,
    }));
  } catch (err) {
    console.error('Failed to fetch candles, falling back:', err);
    setDataSource?.('fallback');
    return generateFallbackData();
  }
};

const fetchCurrentPrice = async (asset: 'BTC'|'ETH'|'SOL'): Promise<number> => {
  const symbol = ASSET_TO_BINANCE[asset];
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
  );
  if (!res.ok) throw new Error(`Binance ticker returned ${res.status}`);
  const json = (await res.json()) as { price: string };
  return parseFloat(json.price);
};




// Enhanced PnL calculation for trading markers
const calculateTradePnL = (currentIndex: number, hourlyForecast: HourlyForecast[]) => {
  if (currentIndex >= hourlyForecast.length - 1) {
    return { pnl: 0, pnlPercentage: 0, exitPrice: 0, exitReason: 'pending' };
  }

  const currentForecast = hourlyForecast[currentIndex];
  const nextForecast = hourlyForecast[currentIndex + 1];

  if (!currentForecast || !nextForecast ||
    currentForecast.signal === 'HOLD' ||
    !currentForecast.entry_price) {
    return { pnl: 0, pnlPercentage: 0, exitPrice: 0, exitReason: 'pending' };
  }

  const entryPrice = currentForecast.entry_price;
  const stopLoss = currentForecast.stop_loss;
  const takeProfit = currentForecast.take_profit;
  const nextPrice = nextForecast.current_price;

  let exitPrice = nextPrice;
  let exitReason = 'next_hour';

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

  return { pnl, pnlPercentage, exitPrice, exitReason };
};

// Segmented Control Component
const SegmentedControl = ({
  options,
  selected,
  onChange,
  className = ""
}: {
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}) => {
  return (
    <div className={`inline-flex rounded-xl p-0.5 ${className}`} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 text-xs rounded-lg transition-all duration-200 whitespace-nowrap font-semibold ${selected === option.value
            ? 'text-white'
            : 'hover:text-white'
            }`}
          style={selected === option.value ? {
            background: 'linear-gradient(135deg, rgba(124,106,247,0.35), rgba(167,139,250,0.2))',
            boxShadow: '0 2px 8px rgba(124,106,247,0.15)',
            color: '#fff',
          } : {
            color: '#64748b',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

const fetchRealBitcoinData = async (
  setDataSource?: (src: 'real' | 'fallback') => void
): Promise<CandlestickData[]> => {
  try {
    const res = await fetch(
      'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60'
    );
    if (!res.ok) throw new Error(`Binance returned ${res.status}`);
    const raw = await res.json() as any[][];
    setDataSource?.('real');
    return raw.map(([ts, open, high, low, close, volume]) => ({
      timestamp: ts,
      open: +open,
      high: +high,
      low: +low,
      close: +close,
      volume: +volume,
    }));
  } catch (err) {
    console.error('Failed to fetch real candles, falling back:', err);
    setDataSource?.('fallback');
    return generateFallbackData();
  }
};

const fetchCurrentBitcoinPrice = async (): Promise<number> => {
  const res = await fetch(
    'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
  );
  if (!res.ok) throw new Error(`Binance ticker returned ${res.status}`);
  const json = await res.json() as { price: string };
  return parseFloat(json.price);
};

// Fallback data generator
const generateFallbackData = (): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let currentPrice = 121008;
  const now = Date.now();

  for (let i = 59; i >= 0; i--) {
    const timestamp = now - (i * 60000);
    const volatility = 0.002;

    const open = currentPrice;
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    const close = open + change;

    const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;

    const volume = Math.random() * 1000000 + 500000;

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close + (122306 - 121008) / 60;
  }

  return data;
};

const PriceChart: React.FC<PriceChartProps> = ({
  priceHistory = [
    { date: "2025-07-02", price: 104639.48 },
    { date: "2025-07-03", price: 104611.16 },
    { date: "2025-07-04", price: 103296.19 },
    { date: "2025-07-05", price: 101348.19 },
    { date: "2025-07-06", price: 101987.11 },
    { date: "2025-07-07", price: 105436.11 },
    { date: "2025-07-08", price: 106371.09 }
  ],
  forecast = [
    {
      date: "2025-07-14",
      signal: "LONG" as const,
      entry: 117498.65,
      stop_loss: 115287.826,
      take_profit: 119709.474,
      confidence_intervals: {
        50: [117088.88, 117908.414],
        80: [116154.45, 118842.84],
        90: [115877.55, 119119.75]
      },
      deviation_percent: 1.5,
      overall_accuracy_percent: 98.5
    }
  ],
  className = "",
  hourlyForecast = [
    {
      time: "2025-07-15T07:00:00+00:00",
      signal: "LONG" as const,
      entry_price: 116919.4,
      stop_loss: 116500,
      take_profit: 117500,
      forecast_price: 116632.66,
      current_price: 116919.4,
      deviation_percent: "N/A",
      accuracy_percent: "N/A",
      risk_reward_ratio: 0.68,
      sentiment_score: 27.39,
      confidence_50: [116402.414, 116862.9],
      confidence_80: [116252.7, 117012.61],
      confidence_90: [116228.18, 117037.13]
    },
    {
      time: "2025-07-15T08:00:00+00:00",
      signal: "SHORT" as const,
      entry_price: 116797,
      stop_loss: 117200,
      take_profit: 116200,
      forecast_price: 116548.55,
      current_price: 116200,
      deviation_percent: -0.21,
      accuracy_percent: 99.79,
      risk_reward_ratio: 0.61,
      sentiment_score: 32.27,
      confidence_50: [116390.73, 116706.37],
      confidence_80: [116281.36, 116815.734],
      confidence_90: [116030.195, 117066.9]
    },
    {
      time: "2025-07-15T09:00:00+00:00",
      signal: "HOLD" as const,
      entry_price: null,
      stop_loss: null,
      take_profit: null,
      forecast_price: 116705.53,
      current_price: 116788.51,
      deviation_percent: -0.07,
      accuracy_percent: 99.93,
      risk_reward_ratio: 0.21,
      sentiment_score: 43.16,
      confidence_50: [116539, 116872.06],
      confidence_80: [116475.63, 116935.43],
      confidence_90: [116293.57, 117117.49]
    },
    {
      time: "2025-07-15T10:00:00+00:00",
      signal: "LONG" as const,
      entry_price: 116813.69,
      stop_loss: 116400,
      take_profit: 117400,
      forecast_price: 116782.47,
      current_price: 116813.69,
      deviation_percent: -0.03,
      accuracy_percent: 99.97,
      risk_reward_ratio: 0.08,
      sentiment_score: 41.33,
      confidence_50: [116686.77, 116878.164],
      confidence_80: [116490.4, 117074.54],
      confidence_90: [116344.86, 117220.08]
    }
  ],
  selectedAsset: propSelectedAsset,
  onAssetChange
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'TODAY' | 'PAST_7D' | 'NEXT_3D'>('TODAY');
  const [selectedSubTimeframe, setSelectedSubTimeframe] = useState<'3D' | '7D'>('3D');
  // const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SOL' | 'ETH'>('BTC');
  const selectedAsset = propSelectedAsset!;
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: null, visible: false, type: 'chart' });
  const [isMobile, setIsMobile] = useState(false);
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataSource, setDataSource] = useState<'real' | 'fallback'>('real');
  const [isChartMaximized, setIsChartMaximized] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);


  const nextForecast = hourlyForecast?.at(-1) ?? null;

  const handleAssetChange = (asset: 'BTC'|'SOL'|'ETH') => onAssetChange?.(asset);


  function formatDollar(n: number) {
    return `$${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // default to “Hold” if nothing
  const action = nextForecast
    ? nextForecast.signal === 'LONG' ? 'Buy'
      : nextForecast.signal === 'SHORT' ? 'Sell'
        : 'Hold'
    : 'Hold';

  // build a ±0.1% entry zone
  const fuzz = 0.001;
  const entryPrice = nextForecast?.entry_price ?? 0;
  const entryMin = entryPrice * (1 - fuzz);
  const entryMax = entryPrice * (1 + fuzz);

  const [latest, setLatest] = useState<{
    deviation_percent?: number | string;
    overall_accuracy_percent?: number | string;
  } | null>(null);

  useEffect(() => {
    const mockLatest = {
      deviation_percent: 1.5,
      overall_accuracy_percent: 98.5
    };
    setLatest(mockLatest);
  }, []);

  useEffect(() => {
    const initializeRealData = async () => {
      setIsLoadingData(true);
      const realData = await fetchRealBitcoinData(setDataSource);
      setCandlestickData(realData);

      if (realData.length > 0) {
        setCurrentPrice(realData[realData.length - 1].close);
      }

      setIsLoadingData(false);
    };

    initializeRealData();
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const live = await fetchCurrentBitcoinPrice();
        setCurrentPrice(live);
      } catch {
        // swallow or log
      }
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle escape key to close maximized chart
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChartMaximized) {
        setIsChartMaximized(false);
      }
    };

    if (isChartMaximized) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isChartMaximized]);

  // candles + current price load on mount AND when selectedAsset changes
useEffect(() => {
  let isCancelled = false;
  let priceTimer: number | undefined;

  const bootstrap = async () => {
    setIsLoadingData(true);

    const candles = await fetchRealCandles(selectedAsset, setDataSource);
    if (!isCancelled) {
      setCandlestickData(candles);
      if (candles.length > 0) setCurrentPrice(candles[candles.length - 1].close);
      setIsLoadingData(false);
    }

    // start live price polling for THIS asset
    const tick = async () => {
      try {
        const live = await fetchCurrentPrice(selectedAsset);
        if (!isCancelled) setCurrentPrice(live);
      } catch {}
    };
    priceTimer = window.setInterval(tick, 10_000) as unknown as number;
  };

  bootstrap();

  return () => {
    isCancelled = true;
    if (priceTimer) window.clearInterval(priceTimer);
  };
}, [selectedAsset]);


  // Get simplified date format (MM/DD)
  const getSimpleDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  // Calculate risk/reward ratio
  const getRiskReward = (entry: number, stop: number, target: number, signal: 'LONG' | 'SHORT' = 'LONG') => {
    let risk: number;
    let reward: number;

    if (signal === 'LONG') {
      risk = entry - stop;
      reward = target - entry;
    } else {
      risk = stop - entry;
      reward = entry - target;
    }

    if (risk <= 0 || reward <= 0) {
      return '0.0';
    }

    return (reward / risk).toFixed(1);
  };

  // Calculate key levels based on current price and recent data
  const getKeyLevels = (price: number, recentData?: CandlestickData[]) => {
    if (!recentData || recentData.length === 0) {
      return {
        support: price * 0.996,
        resistance: price * 1.004,
        breakoutLevel: price * 1.002,
        invalidationLevel: price * 0.993
      };
    }

    // Calculate support/resistance from recent highs/lows
    const recentHighs = recentData.slice(-20).map(d => d.high);
    const recentLows = recentData.slice(-20).map(d => d.low);

    const resistance = Math.max(...recentHighs);
    const support = Math.min(...recentLows);
    const breakoutLevel = resistance * 1.001;
    const invalidationLevel = support * 0.999;

    return { support, resistance, breakoutLevel, invalidationLevel };
  };

  // Calculate market structure from actual price data
  const getMarketStructure = (currentPrice: number, recentData?: CandlestickData[], signal?: string) => {
    if (!recentData || recentData.length < 10) {
      return {
        trend: signal === 'LONG' ? 'Bullish' : signal === 'SHORT' ? 'Bearish' : 'Sideways',
        shortTermTrend: 'Insufficient Data',
        longTermTrend: 'Insufficient Data'
      };
    }

    // Short term trend (last 10 candles)
    const shortTermData = recentData.slice(-10);
    const shortTermStart = shortTermData[0].close;
    const shortTermEnd = shortTermData[shortTermData.length - 1].close;
    const shortTermChange = (shortTermEnd - shortTermStart) / shortTermStart;

    // Long term trend (last 30 candles)
    const longTermData = recentData.slice(-30);
    const longTermStart = longTermData[0].close;
    const longTermEnd = longTermData[longTermData.length - 1].close;
    const longTermChange = (longTermEnd - longTermStart) / longTermStart;

    const getTrendLabel = (change: number) => {
      if (change > 0.01) return 'Bullish';
      if (change < -0.01) return 'Bearish';
      return 'Sideways';
    };

    return {
      trend: signal === 'LONG' ? 'Bullish' : signal === 'SHORT' ? 'Bearish' : 'Sideways',
      shortTermTrend: getTrendLabel(shortTermChange),
      longTermTrend: getTrendLabel(longTermChange)
    };
  };

  // Calculate performance metrics from hourly forecast data
  const calculatePerformanceMetrics = (hourlyData?: HourlyForecast[]) => {
    if (!hourlyData || hourlyData.length === 0) {
      return {
        winRate: 0,
        avgGain: 0,
        avgLoss: 0,
        profitFactor: 0,
        winProbability: 0,
        maxDrawdown: 0
      };
    }

    const validData = hourlyData.filter(h =>
      h.accuracy_percent !== 'N/A' &&
      h.deviation_percent !== 'N/A' &&
      typeof h.accuracy_percent === 'number' &&
      typeof h.deviation_percent === 'number'
    );

    if (validData.length === 0) {
      return {
        winRate: 98.5, // fallback from latest data
        avgGain: 1.8,
        avgLoss: 0.9,
        profitFactor: 2.0,
        winProbability: 75,
        maxDrawdown: 2.1
      };
    }

    const accuracies = validData.map(h => Number(h.accuracy_percent));
    const deviations = validData.map(h => Number(h.deviation_percent));

    const winRate = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

    const gains = deviations.filter(d => d > 0);
    const losses = deviations.filter(d => d < 0).map(d => Math.abs(d));

    const avgGain = gains.length > 0 ? gains.reduce((sum, g) => sum + g, 0) / gains.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / losses.length : 0;

    const profitFactor = avgLoss > 0 ? avgGain / avgLoss : 0;
    const winProbability = (gains.length / validData.length) * 100;
    const maxDrawdown = Math.max(...losses, 0);

    return {
      winRate: Math.round(winRate * 100) / 100,
      avgGain: Math.round(avgGain * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      winProbability: Math.round(winProbability),
      maxDrawdown: Math.round(maxDrawdown * 100) / 100
    };
  };

  // Calculate position size based on volatility and risk
  const calculatePositionSize = (signal: string, riskReward: number, volatility: number) => {
    if (signal === 'HOLD') return 'Conservative (1-2%)';

    // Base position size on risk/reward and volatility
    if (riskReward > 2 && volatility < 0.02) return 'Aggressive (3-5%)';
    if (riskReward > 1.5 && volatility < 0.025) return 'Moderate (2-3%)';
    return 'Conservative (1-2%)';
  };

  // Calculate market volatility from recent data
  const calculateVolatility = (recentData?: CandlestickData[]) => {
    if (!recentData || recentData.length < 10) return 0.02; // default

    const returns = recentData.slice(-10).map((candle, i, arr) => {
      if (i === 0) return 0;
      return (candle.close - arr[i - 1].close) / arr[i - 1].close;
    }).slice(1);

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;

    return Math.sqrt(variance);
  };

  // Calculate market context from data
  const getMarketContext = (recentData?: CandlestickData[], sentimentScore?: number) => {
    if (!recentData || recentData.length === 0) {
      return {
        newsImpact: 'Unknown',
        technicalSetup: 'Unknown',
        volumeStatus: 'Unknown',
        correlation: 'Unknown'
      };
    }

    // Volume analysis
    const recentVolumes = recentData.slice(-10).map(d => d.volume);
    const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
    const currentVolume = recentData[recentData.length - 1]?.volume || 0;

    const volumeRatio = currentVolume / avgVolume;
    let volumeStatus = 'Average';
    if (volumeRatio > 1.2) volumeStatus = 'Above Average';
    if (volumeRatio < 0.8) volumeStatus = 'Below Average';

    // Technical setup based on price action
    const recent5 = recentData.slice(-5);
    const priceRange = Math.max(...recent5.map(d => d.high)) - Math.min(...recent5.map(d => d.low));
    const avgPrice = recent5.reduce((sum, d) => sum + d.close, 0) / recent5.length;
    const volatilityRatio = priceRange / avgPrice;

    let technicalSetup = 'Consolidation';
    if (volatilityRatio > 0.03) technicalSetup = 'Breakout Pending';
    if (volatilityRatio > 0.05) technicalSetup = 'High Volatility';

    // News impact based on sentiment score
    let newsImpact = 'Low';
    if (sentimentScore) {
      if (sentimentScore > 60 || sentimentScore < 20) newsImpact = 'High';
      else if (sentimentScore > 45 || sentimentScore < 35) newsImpact = 'Medium';
    }

    return {
      newsImpact,
      technicalSetup,
      volumeStatus,
      correlation: 'Following Crypto Market' // This would need external data to compute properly
    };
  };

  // Filter data based on selected timeframe
  const getFilteredData = () => {
    if (selectedTimeframe === 'TODAY') {
      return {
        historical: [],
        forecast: selectedSubTimeframe === '3D' ? forecast : [],
        showCandlesticks: true
      };
    } else if (selectedTimeframe === 'PAST_7D') {
      return {
        historical: priceHistory,
        forecast: [],
        showCandlesticks: false
      };
    } else {
      return {
        historical: [],
        forecast: forecast,
        showCandlesticks: false
      };
    }
  };

  const lastHourly = hourlyForecast && hourlyForecast.length > 0
    ? hourlyForecast[hourlyForecast.length - 1]
    : null;

  const { historical: displayPriceHistory, forecast: displayForecast, showCandlesticks } = getFilteredData();

  // Show/hide tooltip
  const showTooltip = (
    event: React.MouseEvent,
    data: any,
    type: 'chart' | 'info' | 'trade' = 'chart'
  ) => {
    if (!svgRef.current) return;

    // 1. grab the SVG's position on screen
    const { left, top } = svgRef.current.getBoundingClientRect();

    // 2. compute cursor position inside the SVG
    const x = event.clientX - left;
    const y = event.clientY - top;

    setTooltip({ x, y, data, visible: true, type });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Tooltip content definitions
  const tooltipContent = {
    riskManagement: {
      title: "Risk Management",
      content: [
        "Risk vs Reward: Calculated as (Take Profit - Entry) ÷ (Entry - Stop Loss). Higher ratios indicate better risk-adjusted returns.",
        "Position Size: Recommended portfolio allocation based on volatility and R:R ratio. Conservative (1-2%), Moderate (2-3%), Aggressive (3-5%).",
        "Win Probability: Percentage of positive price deviations from historical hourly forecasts.",
        "Max Drawdown: Largest single loss percentage observed in recent trading signals."
      ]
    },
    performanceMetrics: {
      title: "Performance Metrics",
      content: [
        "Win Rate: Average accuracy percentage from the last 100 hourly predictions.",
        "Avg Gain: Mean percentage gain from all profitable prediction periods.",
        "Avg Loss: Mean percentage loss from all unprofitable prediction periods.",
        "Profit Factor: Ratio of average gains to average losses. Values above 2.0 indicate strong performance."
      ]
    },
    marketStructure: {
      title: "Market Structure & Key Levels",
      content: [
        "Trend Direction: Short-term (10 candles) vs Long-term (30 candles) price movement analysis.",
        "Key Pivot: Current price level acting as decision point for market direction.",
        "Next Resistance: Calculated from recent 20-period highs, where selling pressure may increase.",
        "Next Support: Calculated from recent 20-period lows, where buying interest typically emerges."
      ]
    }
  };

  // Create candlestick chart with future projections and B/S markers
  const createCandlestickChart = (isFullScreen = false) => {
    if (!showCandlesticks || candlestickData.length === 0) {
      return null;
    }

    // Determine if we should show simplified version (mobile + not full screen)
    const isMinified = isMobile && !isFullScreen;

    // Responsive dimensions
    const width = isFullScreen
      ? window.innerWidth - 40
      : (isMobile ? 280 : 950);
    const chartHeight = isFullScreen
      ? window.innerHeight * 0.7
      : (isMobile ? 180 : 600);
    const volumeHeight = isFullScreen
      ? 100
      : (isMobile ? 40 : 80);
    const padding = isFullScreen ? 60 : (isMobile ? 20 : 35);
    const topPadding = isFullScreen ? 60 : (isMobile ? 20 : 35);
    const bottomPadding = isFullScreen ? 80 : (isMobile ? 30 : 45);
    const height = chartHeight + volumeHeight + topPadding + bottomPadding + 20;

    const futureMinutes = 30;
    const lastTimestamp = candlestickData[candlestickData.length - 1]?.timestamp || Date.now();
    const futureTimeSlots = Array.from({ length: futureMinutes }, (_, i) =>
      lastTimestamp + ((i + 1) * 60000)
    );

    const totalDataPoints = candlestickData.length + futureTimeSlots.length;
    const candleWidth = Math.max(2, (width - 2 * padding) / totalDataPoints - 1);
    const xStep = (width - 2 * padding) / Math.max(totalDataPoints - 1, 1);

    const prices = candlestickData.flatMap(d => [d.open, d.high, d.low, d.close]);

    // Include hourly forecast confidence intervals in price range
    if (lastHourly) {
      prices.push(
        lastHourly.forecast_price,
        lastHourly.confidence_50[0], lastHourly.confidence_50[1],
        lastHourly.confidence_80[0], lastHourly.confidence_80[1],
        lastHourly.confidence_90[0], lastHourly.confidence_90[1]
      );

      if (displayEntry) prices.push(displayEntry);
      if (displayStopLoss) prices.push(displayStopLoss);
      if (displayTakeProfit) prices.push(displayTakeProfit);
    }

    // Add hourly forecast entry/exit prices to price range
    hourlyForecast.forEach(forecast => {
      if (forecast.entry_price) prices.push(forecast.entry_price);
      if (forecast.stop_loss) prices.push(forecast.stop_loss);
      if (forecast.take_profit) prices.push(forecast.take_profit);
      prices.push(forecast.current_price);
    });

    // Add key levels to price range
    // const keyLevels = getKeyLevels(currentPrice);
    const keyLevels = getKeyLevels(currentPrice, candlestickData);
    prices.push(keyLevels.support, keyLevels.resistance, keyLevels.breakoutLevel, keyLevels.invalidationLevel);

    const minPrice = Math.min(...prices) * 0.998;
    const maxPrice = Math.max(...prices) * 1.002;
    const priceRange = maxPrice - minPrice;
    const maxVolume = Math.max(...candlestickData.map(d => d.volume));

    const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * chartHeight;
    const getX = (index: number) => padding + index * xStep;
    const getVolumeY = (volume: number) => chartHeight + padding + 20 + (1 - volume / maxVolume) * volumeHeight;

    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Price chart grid - Show fewer grid lines on minified mobile */}
        {(isMinified
          ? [0, 0.5, 1]
          : [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
        ).map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + ratio * chartHeight}
            x2={width - padding}
            y2={padding + ratio * chartHeight}
            stroke="#1f2937"
            strokeWidth={1}
            opacity={i % 2 === 0 ? 0.3 : 0.15}
          />
        ))}

        {/* Key Support/Resistance Levels */}
        {(() => {
          const levels = getKeyLevels(currentPrice);
          return (
            <>
              {/* Support Line */}
              <line
                x1={padding}
                y1={getY(levels.support)}
                x2={width - padding}
                y2={getY(levels.support)}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="3,3"
                opacity={0.7}
              />
              <text x={padding + 5} y={getY(levels.support) - 5} fill="#ef4444" fontSize={isMinified ? "8" : isFullScreen ? "12" : "10"} className="font-bold">
                SUPPORT ${Math.round(levels.support).toLocaleString()}
              </text>

              {/* Resistance Line */}
              <line
                x1={padding}
                y1={getY(levels.resistance)}
                x2={width - padding}
                y2={getY(levels.resistance)}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="3,3"
                opacity={0.7}
              />
              <text x={padding + 5} y={getY(levels.resistance) + 15} fill="#10b981" fontSize={isMinified ? "8" : isFullScreen ? "12" : "10"} className="font-bold">
                RESISTANCE ${Math.round(levels.resistance).toLocaleString()}
              </text>

              {/* Breakout and Invalidation levels - Hide on minified mobile */}
              {!isMinified && (
                <>
                  {/* Breakout Level */}
                  <line
                    x1={padding}
                    y1={getY(levels.breakoutLevel)}
                    x2={width - padding}
                    y2={getY(levels.breakoutLevel)}
                    stroke="#8b5cf6"
                    strokeWidth={1}
                    strokeDasharray="6,2"
                    opacity={0.6}
                  />
                  <text x={width - padding - 5} y={getY(levels.breakoutLevel) - 5} fill="#8b5cf6" fontSize={isFullScreen ? "11" : "9"} textAnchor="end">
                    BREAKOUT ${Math.round(levels.breakoutLevel).toLocaleString()}
                  </text>

                  {/* Invalidation Level */}
                  <line
                    x1={padding}
                    y1={getY(levels.invalidationLevel)}
                    x2={width - padding}
                    y2={getY(levels.invalidationLevel)}
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="6,2"
                    opacity={0.6}
                  />
                  <text x={width - padding - 5} y={getY(levels.invalidationLevel) + 15} fill="#f59e0b" fontSize={isFullScreen ? "11" : "9"} textAnchor="end">
                    INVALIDATION ${Math.round(levels.invalidationLevel).toLocaleString()}
                  </text>
                </>
              )}
            </>
          );
        })()}

        {/* Vertical line to separate historical and forecast */}
        <line
          x1={getX(candlestickData.length - 1)}
          y1={padding}
          x2={getX(candlestickData.length - 1)}
          y2={chartHeight + padding}
          stroke="#374151"
          strokeWidth={2}
          strokeDasharray="5,5"
          opacity={0.6}
        />

        {/* Volume chart grid */}
        <line
          x1={padding}
          y1={chartHeight + padding + 20}
          x2={width - padding}
          y2={chartHeight + padding + 20}
          stroke="#1f2937"
          strokeWidth={1}
          opacity={0.5}
        />

        {/* Enhanced Confidence intervals using hourly forecast data */}
        {lastHourly && (
          <>
            {(() => {
              const startX = getX(candlestickData.length - 1);
              const endX = width - padding;
              const currentPrice = candlestickData[candlestickData.length - 1]?.close || lastHourly.forecast_price;

              const createFutureConfidencePath = (upperBound: number, lowerBound: number) => {
                const startY = getY(currentPrice);
                const midX = startX + (endX - startX) * 0.3;
                const endUpperY = getY(upperBound);
                const endLowerY = getY(lowerBound);

                return `
                  M ${startX},${startY}
                  Q ${midX},${startY} ${midX + 20},${(endUpperY + endLowerY) / 2}
                  L ${endX},${endUpperY}
                  L ${endX},${endLowerY}
                  Q ${midX},${(endUpperY + endLowerY) / 2} ${startX},${startY}
                  Z
                `;
              };

              return (
                <>
                  {/* Show all confidence intervals except on minified mobile */}
                  {!isMinified && (
                    <>
                      {/* 90% High Confidence Range */}
                      <path
                        d={createFutureConfidencePath(
                          lastHourly.confidence_90[1],
                          lastHourly.confidence_90[0]
                        )}
                        fill="#22c55e"
                        fillOpacity={0.1}
                        stroke="#22c55e"
                        strokeOpacity={0.3}
                        strokeWidth={1}
                      />

                      {/* 80% Medium Confidence Range */}
                      <path
                        d={createFutureConfidencePath(
                          lastHourly.confidence_80[1],
                          lastHourly.confidence_80[0]
                        )}
                        fill="#f59e0b"
                        fillOpacity={0.15}
                        stroke="#f59e0b"
                        strokeOpacity={0.4}
                        strokeWidth={1}
                      />
                    </>
                  )}

                  {/* 50% Low Confidence Range - Always show */}
                  <path
                    d={createFutureConfidencePath(
                      lastHourly.confidence_50[1],
                      lastHourly.confidence_50[0]
                    )}
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    stroke="#3b82f6"
                    strokeOpacity={0.5}
                    strokeWidth={2}
                  />
                </>
              );
            })()}

            {/* Trading lines for hourly forecast - Simplified for minified mobile */}
            {displayEntry && !isMinified && (
              <line
                x1={getX(candlestickData.length - 1)}
                y1={getY(displayEntry)}
                x2={width - padding}
                y2={getY(displayEntry)}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="8,4"
                opacity={0.8}
              />
            )}

            {displayStopLoss && !isMinified && (
              <line
                x1={getX(candlestickData.length - 1)}
                y1={getY(displayStopLoss)}
                x2={width - padding}
                y2={getY(displayStopLoss)}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="8,4"
                opacity={0.8}
              />
            )}

            {displayTakeProfit && !isMinified && (
              <line
                x1={getX(candlestickData.length - 1)}
                y1={getY(displayTakeProfit)}
                x2={width - padding}
                y2={getY(displayTakeProfit)}
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="8,4"
                opacity={0.8}
              />
            )}

            {/* Price Target Probability Line */}
            <line
              x1={getX(candlestickData.length - 1)}
              y1={getY(lastHourly.forecast_price)}
              x2={width - padding}
              y2={getY(lastHourly.forecast_price)}
              stroke="#fbbf24"
              strokeWidth={3}
              strokeDasharray="12,6"
              opacity={0.9}
            />

            {/* Enhanced Labels - Simplified for minified mobile */}
            {displayEntry && !isMinified && (
              <text x={width - padding - 5} y={getY(displayEntry) - 5} fill="#10b981" fontSize={isFullScreen ? "12" : "10"} textAnchor="end" className="font-bold">
                ENTRY ZONE ${displayEntry.toLocaleString()}
              </text>
            )}
            {displayTakeProfit && !isMinified && (
              <text x={width - padding - 5} y={getY(displayTakeProfit) - 5} fill="#8b5cf6" fontSize={isFullScreen ? "12" : "10"} textAnchor="end" className="font-bold">
                TAKE PROFIT ${displayTakeProfit.toLocaleString()}
              </text>
            )}
            {displayStopLoss && !isMinified && (
              <text x={width - padding - 5} y={getY(displayStopLoss) + 15} fill="#ef4444" fontSize={isFullScreen ? "12" : "10"} textAnchor="end" className="font-bold">
                STOP LOSS ${displayStopLoss.toLocaleString()}
              </text>
            )}
            <text x={width - padding - 5} y={getY(lastHourly.forecast_price) - 5} fill="#fbbf24" fontSize={isMinified ? "8" : isFullScreen ? "12" : "10"} textAnchor="end" className="font-bold">
              TARGET ${lastHourly.forecast_price.toLocaleString()}
            </text>
          </>
        )}

        {/* Candlesticks */}
        {candlestickData.map((candle, i) => {
          const x = getX(i);
          const openY = getY(candle.open);
          const closeY = getY(candle.close);
          const highY = getY(candle.high);
          const lowY = getY(candle.low);

          const isGreen = candle.close > candle.open;
          const bodyHeight = Math.abs(closeY - openY);
          const bodyY = Math.min(openY, closeY);

          return (
            <g key={i}>
              <line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={isGreen ? "#10b981" : "#ef4444"}
                strokeWidth={1}
              />

              <rect
                x={x - candleWidth / 2}
                y={bodyY}
                width={candleWidth}
                height={Math.max(bodyHeight, 1)}
                fill={isGreen ? "#10b981" : "#ef4444"}
                stroke={isGreen ? "#10b981" : "#ef4444"}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => showTooltip(e, { ...candle, type: 'candlestick' }, 'chart')}
              />

              <rect
                x={x - candleWidth / 2}
                y={getVolumeY(candle.volume)}
                width={candleWidth}
                height={(candle.volume / maxVolume) * volumeHeight}
                fill={isGreen ? "#10b981" : "#ef4444"}
                opacity={0.6}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => showTooltip(e, { ...candle, type: 'volume' }, 'chart')}
              />
            </g>
          );
        })}

        {/* NEW: B/S/X Trading Markers for hourly forecast */}
        {hourlyForecast.map((forecast, index) => {
          if (forecast.signal === 'HOLD' || !forecast.entry_price) return null;

          // Calculate positions for entry and exit markers
          const entryIndex = Math.floor((index / hourlyForecast.length) * candlestickData.length);
          const entryX = getX(entryIndex);
          const entryY = getY(forecast.entry_price);

          const tradePnL = calculateTradePnL(index, hourlyForecast);
          const isLong = forecast.signal === 'LONG';

          return (
            <g key={`trade-${index}`}>
              {/* Entry Marker */}
              <circle
                cx={entryX}
                cy={entryY}
                r={isFullScreen ? 8 : 6}
                fill={isLong ? '#10b981' : '#ef4444'}
                stroke="#ffffff"
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => showTooltip(e, {
                  type: 'entry',
                  signal: forecast.signal,
                  price: forecast.entry_price,
                  time: forecast.time,
                  forecast
                }, 'trade')}
                onMouseLeave={hideTooltip}
              />

              {/* B/S letter */}
              <text
                x={entryX}
                y={entryY + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={isFullScreen ? "12" : "10"}
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {isLong ? 'B' : 'S'}
              </text>

              {/* Exit Marker (if trade is completed) */}
              {index < hourlyForecast.length - 1 && tradePnL.exitPrice > 0 && (
                <>
                  {(() => {
                    const exitIndex = Math.floor(((index + 1) / hourlyForecast.length) * candlestickData.length);
                    const exitX = getX(exitIndex);
                    const exitY = getY(tradePnL.exitPrice);
                    const exitColor = tradePnL.pnl > 0 ? '#10b981' : '#ef4444';

                    return (
                      <>
                        {/* Exit Marker */}
                        <circle
                          cx={exitX}
                          cy={exitY}
                          r={isFullScreen ? 8 : 6}
                          fill={exitColor}
                          stroke="#ffffff"
                          strokeWidth={2}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => showTooltip(e, {
                            type: 'exit',
                            signal: forecast.signal,
                            price: tradePnL.exitPrice,
                            time: hourlyForecast[index + 1]?.time,
                            exitReason: tradePnL.exitReason,
                            pnl: tradePnL.pnl,
                            pnlPercentage: tradePnL.pnlPercentage
                          }, 'trade')}
                          onMouseLeave={hideTooltip}
                        />

                        {/* X letter */}
                        <text
                          x={exitX}
                          y={exitY + 1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize={isFullScreen ? "12" : "10"}
                          fontWeight="bold"
                          style={{ pointerEvents: 'none' }}
                        >
                          X
                        </text>

                        {/* Connection line */}
                        <line
                          x1={entryX}
                          y1={entryY}
                          x2={exitX}
                          y2={exitY}
                          stroke={exitColor}
                          strokeWidth={2}
                          strokeDasharray="5,5"
                          opacity={0.6}
                        />
                      </>
                    );
                  })()}
                </>
              )}
            </g>
          );
        })}

        {/* Current price indicator */}
        <line
          x1={padding}
          y1={getY(currentPrice)}
          x2={getX(candlestickData.length - 1)}
          y2={getY(currentPrice)}
          stroke="#fbbf24"
          strokeWidth={2}
          opacity={0.9}
        />

        {currentPrice != null ? (
          <text
            x={getX(candlestickData.length - 1) - 5}
            y={getY(currentPrice) - 5}
            fill="#fbbf24"
            fontSize={isMinified ? "10" : isFullScreen ? "14" : "12"}
            textAnchor="end"
            className="font-bold"
          >
            LIVE ${currentPrice.toLocaleString()}
          </text>
        ) : (
          <text
            x={getX(candlestickData.length - 1) - 5}
            y={padding - 5}
            fill="#fbbf24"
            fontSize={isMinified ? "8" : isFullScreen ? "12" : "10"}
            textAnchor="end"
          >
            Loading…
          </text>
        )}

        {/* Price labels - Fewer on mobile minified */}
        {(isMinified
          ? [0, 0.5, 1]
          : [0, 0.25, 0.5, 0.75, 1]
        ).map((ratio, i) => {
          const price = minPrice + (maxPrice - minPrice) * (1 - ratio);
          return (
            <text key={i} x={padding - 5} y={padding + ratio * chartHeight + 5} fill="#9ca3af" fontSize={isMinified ? "8" : isFullScreen ? "12" : "10"} textAnchor="end">
              ${Math.round(price).toLocaleString()}
            </text>
          );
        })}

        {/* Volume label */}
        <text x={padding - 5} y={chartHeight + padding + 35} fill="#9ca3af" fontSize={isMinified ? "6" : isFullScreen ? "10" : "8"} textAnchor="end">
          Volume
        </text>

        {/* Time labels */}
        {candlestickData.length > 1 && (
          <>
            <text x={padding} y={height - 10} fill="#9ca3af" fontSize={isMinified ? "6" : isFullScreen ? "10" : "8"} textAnchor="middle">
              {new Date(candlestickData[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </text>
            <text x={getX(candlestickData.length - 1)} y={height - 10} fill="#fbbf24" fontSize={isMinified ? "6" : isFullScreen ? "10" : "8"} textAnchor="middle">
              NOW
            </text>
            <text x={width - padding} y={height - 10} fill="#9ca3af" fontSize={isMinified ? "6" : isFullScreen ? "10" : "8"} textAnchor="middle">
              +30min
            </text>
          </>
        )}
      </svg>
    );
  };

  // Create regular SVG chart for non-today views
  const createSVGChart = (isFullScreen = false) => {
    const isToday = selectedTimeframe === 'TODAY';

    if (showCandlesticks) {
      return createCandlestickChart(isFullScreen);
    }

    const allData = [
      ...displayPriceHistory.map(item => ({ ...item, type: 'historical' })),
      ...displayForecast.map(item => ({ ...item, price: item.entry, type: 'forecast' }))
    ];

    if (allData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No data available for selected timeframe
        </div>
      );
    }

    const allPrices = [
      ...allData.map(item => item.price),
      ...displayForecast.flatMap(item => [
        item.confidence_intervals[90][0],
        item.confidence_intervals[90][1],
        item.stop_loss,
        item.take_profit
      ])
    ];

    const minPrice = Math.min(...allPrices) * 0.995;
    const maxPrice = Math.max(...allPrices) * 1.005;
    const priceRange = maxPrice - minPrice;

    const width = isFullScreen
      ? window.innerWidth - 40
      : (isMobile ? 350 : 500);
    const height = isFullScreen
      ? window.innerHeight * 0.8
      : (isMobile ? 200 : 300);
    const padding = isFullScreen ? 60 : (isMobile ? 30 : 50);

    const xStep = (width - 2 * padding) / Math.max(allData.length - 1, 1);

    const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);
    const getX = (index: number) => padding + index * xStep;

    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + ratio * (height - 2 * padding)}
            x2={width - padding}
            y2={padding + ratio * (height - 2 * padding)}
            stroke="#1f2937"
            strokeWidth={1}
            opacity={0.3}
          />
        ))}

        {/* Price lines */}
        {displayPriceHistory.length > 0 && (
          <polyline
            points={displayPriceHistory.map((item, i) => {
              const x = getX(i);
              const y = getY(item.price);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={isMobile ? 2 : 3}
          />
        )}

        {displayForecast.length > 0 && (
          <polyline
            points={displayForecast.map((item, i) => {
              const x = getX(displayPriceHistory.length + i);
              const y = getY(item.entry);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth={isMobile ? 2 : 3}
            strokeDasharray="8,4"
          />
        )}

        {/* Data points */}
        {displayPriceHistory.map((item, i) => {
          const x = getX(i);
          const y = getY(item.price);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isMobile ? 3 : 4}
              fill="#3b82f6"
              stroke="#0a1628"
              strokeWidth={isMobile ? 1 : 2}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => showTooltip(e, { ...item, type: 'historical' }, 'chart')}
            />
          );
        })}

        {displayForecast.map((item, i) => {
          const x = getX(displayPriceHistory.length + i);
          const y = getY(item.entry);
          const radius = isMobile ? 4 : 5;
          const arrowSize = isMobile ? 8 : 12;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
                stroke="#0a1628"
                strokeWidth={isMobile ? 1 : 2}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' }, 'chart')}
              />
              <polygon
                points={item.signal === 'LONG'
                  ? `${x},${y - arrowSize} ${x - arrowSize / 2},${y - arrowSize / 2} ${x + arrowSize / 2},${y - arrowSize / 2}`
                  : `${x},${y + arrowSize} ${x - arrowSize / 2},${y + arrowSize / 2} ${x + arrowSize / 2},${y + arrowSize / 2}`
                }
                fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' }, 'chart')}
              />
            </g>
          );
        })}

        {/* Price labels */}
        <text x={padding - 5} y={padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
          ${Math.round(maxPrice).toLocaleString()}
        </text>
        <text x={padding - 5} y={height - padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
          ${Math.round(minPrice).toLocaleString()}
        </text>
        <text x={padding - 5} y={padding + (height - 2 * padding) / 2} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
          ${Math.round((maxPrice + minPrice) / 2).toLocaleString()}
        </text>

        {/* Date labels */}
        {allData.length > 1 && (
          <>
            <text x={padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
              {getSimpleDate(allData[0]?.date)}
            </text>
            <text x={width - padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
              {getSimpleDate(allData[allData.length - 1]?.date)}
            </text>
          </>
        )}
      </svg>
    );
  };

  if (!latest) {
    return (
      <div className="p-4 text-gray-400">
        Loading data...
      </div>
    );
  }

  const firstForecast = latest;
  const firstForecasts = displayForecast[0] || forecast[0];

  // Use hourly forecast data or fallback to forecast data
  const displaySignal = lastHourly?.signal || firstForecasts?.signal || 'HOLD';
  const displayEntry = lastHourly?.entry_price || firstForecasts?.entry;
  const displayTakeProfit = lastHourly?.take_profit || firstForecasts?.take_profit;
  const displayStopLoss = lastHourly?.stop_loss || firstForecasts?.stop_loss;
  const performanceMetrics = calculatePerformanceMetrics(hourlyForecast);

  const nextHourTarget = lastHourly?.forecast_price ||
    (hourlyForecast && hourlyForecast.length > 0 ? hourlyForecast[0].forecast_price : null);

  const confidenceProbability = lastHourly?.confidence_50 ?
    Math.round(((lastHourly.confidence_50[1] - lastHourly.confidence_50[0]) / lastHourly.forecast_price) * 100 * 10) :
    75; // Default fallback

  const expectedTimeframe = displaySignal === 'LONG' || displaySignal === 'SHORT' ?
    '30-60' : '45-90';

  // Calculate minutes to next forecast (assuming hourly updates)
  const minutesToNextForecast = (() => {
    const now = new Date();
    const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const nextHourUTC = new Date(nowUTC);
    nextHourUTC.setUTCHours(nowUTC.getUTCHours() + 1, 0, 0, 0);
    return Math.ceil((nextHourUTC.getTime() - nowUTC.getTime()) / (1000 * 60));
  })();

  const formattedAccuracy = lastHourly?.accuracy_percent && lastHourly.accuracy_percent !== 'N/A'
    ? `${lastHourly.accuracy_percent}%`
    : firstForecast?.overall_accuracy_percent
      ? `${firstForecast.overall_accuracy_percent}%`
      : `${performanceMetrics.winRate}%`;

  const formattedDeviation = lastHourly?.deviation_percent && lastHourly.deviation_percent !== 'N/A'
    ? `${lastHourly.deviation_percent}%`
    : firstForecast?.deviation_percent
      ? `+${firstForecast.deviation_percent}%`
      : '+1.50%';

  // Calculate market structure
  const marketStructure = getMarketStructure(currentPrice, candlestickData, displaySignal);
  const keyLevels = getKeyLevels(currentPrice, candlestickData);
  const volatility = calculateVolatility(candlestickData);
  const marketContext = getMarketContext(candlestickData, lastHourly?.sentiment_score || 30);

  // Calculate position size recommendation
  const riskRewardValue = lastHourly?.risk_reward_ratio ||
    (displayEntry && displayStopLoss && displayTakeProfit ?
      parseFloat(getRiskReward(displayEntry, displayStopLoss, displayTakeProfit)) : 1.5);

  const positionSize = calculatePositionSize(displaySignal, riskRewardValue, volatility);

  // Full screen chart overlay
  const FullScreenChart = () => (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-95 z-50" onClick={() => setIsChartMaximized(false)} />

      {/* Full Screen Chart */}
      <div className="fixed inset-0 z-50 flex flex-col p-4">
        <div className="bg-[#080b12] h-full rounded-lg flex flex-col relative border border-[rgba(255,255,255,0.08)]">
          {/* Close button */}
          <button
            onClick={() => setIsChartMaximized(false)}
            className="absolute top-4 right-4 z-10 bg-[#0d1120] hover:bg-[rgba(255,255,255,0.06)] text-white p-2 rounded-lg transition-colors duration-200"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>

          {/* Chart header */}
          <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
            <h3 className="text-white text-lg font-bold">
              {selectedAsset} Price Chart - Full Screen
            </h3>
            <p className="text-gray-400 text-sm">
              Real-time candlestick chart with AI predictions and trading markers
            </p>
          </div>

          {/* Chart container */}
          <div className="flex-1 p-4 relative" onMouseLeave={hideTooltip}>
            {createSVGChart(true)}

            {/* Enhanced Tooltip for full screen */}
            {tooltip.visible && tooltip.data && (
              <div
                className={`absolute ${tooltip.type === 'info' ? 'bg-[#0d1120]' : 'bg-[#080b12]'} border border-[rgba(255,255,255,0.08)] rounded-lg p-3 text-white shadow-xl z-50 text-sm ${tooltip.type === 'info' ? 'max-w-md' : 'min-w-48'} break-words`}
                style={{
                  left: tooltip.x + 10,
                  top: tooltip.y - 10,
                  transform: tooltip.x > 300 ? 'translateX(-100%)' : 'none'
                }}
              >
                {tooltip.type === 'info' ? (
                  // Info tooltip content
                  <div className="space-y-2">
                    <div className="font-bold text-blue-400 border-b border-gray-600 pb-1 break-words">
                      {tooltip.data.title}
                    </div>
                    <div className="space-y-2">
                      {tooltip.data.content.map((item: string, index: number) => (
                        <div key={index} className="text-sm leading-relaxed">
                          <span className="font-medium text-gray-300 break-words">
                            {item.split(':')[0]}:
                          </span>
                          <span className="text-gray-400 ml-1 break-words">
                            {item.split(':').slice(1).join(':')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : tooltip.type === 'trade' ? (
                  // Trade tooltip content
                  <div className="space-y-2">
                    <div className="font-bold text-blue-400 border-b border-gray-600 pb-1">
                      {tooltip.data.type === 'entry' ? 'Trade Entry' : 'Trade Exit'}
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Signal:</span>
                      <span className={tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}>
                        {tooltip.data.signal}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Price:</span>
                      <span>${tooltip.data.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Time:</span>
                      <span>{new Date(tooltip.data.time).toLocaleTimeString()}</span>
                    </div>
                    {tooltip.data.type === 'exit' && (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400">Exit Reason:</span>
                          <span className={`${tooltip.data.exitReason === 'take_profit' ? 'text-green-400' :
                            tooltip.data.exitReason === 'stop_loss' ? 'text-red-400' : 'text-blue-400'
                            }`}>
                            {tooltip.data.exitReason === 'take_profit' ? 'Take Profit' :
                              tooltip.data.exitReason === 'stop_loss' ? 'Stop Loss' : 'Next Hour'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400">PnL:</span>
                          <span className={tooltip.data.pnl > 0 ? 'text-green-400' : 'text-red-400'}>
                            ${tooltip.data.pnl?.toFixed(2)} ({tooltip.data.pnlPercentage?.toFixed(2)}%)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  // Chart tooltip content
                  <div className="space-y-2">
                    {tooltip.data.type === 'candlestick' && (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Time:</span>
                          <span className="break-words min-w-0">{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">OHLC:</span>
                          <span className="break-all min-w-0">
                            ${Math.round(tooltip.data.open).toLocaleString()} /
                            ${Math.round(tooltip.data.high).toLocaleString()} /
                            ${Math.round(tooltip.data.low).toLocaleString()} /
                            ${Math.round(tooltip.data.close).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Change:</span>
                          <span className={`flex-shrink-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
                            {((tooltip.data.close / tooltip.data.open - 1) * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Volume:</span>
                          <span className="flex-shrink-0">{(tooltip.data.volume / 1000).toFixed(0)}K</span>
                        </div>
                      </>
                    )}

                    {tooltip.data.type === 'volume' && (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Time:</span>
                          <span className="break-words min-w-0">{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Volume:</span>
                          <span className="break-all min-w-0">{Math.round(tooltip.data.volume).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Price:</span>
                          <span className="break-all min-w-0">${Math.round(tooltip.data.close).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Volume Type:</span>
                          <span className={`break-words min-w-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
                            {tooltip.data.close > tooltip.data.open ? 'Buying Pressure' : 'Selling Pressure'}
                          </span>
                        </div>
                      </>
                    )}

                    {tooltip.data.type === 'historical' && (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Date:</span>
                          <span className="break-words min-w-0">{getSimpleDate(tooltip.data.date)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Price:</span>
                          <span className="break-all min-w-0">${Math.round(tooltip.data.price).toLocaleString()}</span>
                        </div>
                      </>
                    )}

                    {tooltip.data.type === 'forecast' && (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Date:</span>
                          <span className="break-words min-w-0">{getSimpleDate(tooltip.data.date)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Signal:</span>
                          <span className={`font-bold flex-shrink-0 ${tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                            {tooltip.data.signal}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Entry:</span>
                          <span className="break-all min-w-0">${Math.round(tooltip.data.entry).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Stop:</span>
                          <span className="text-red-400 break-all min-w-0">${Math.round(tooltip.data.stop_loss).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Target:</span>
                          <span className="text-green-400 break-all min-w-0">${Math.round(tooltip.data.take_profit).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">R:R Ratio:</span>
                          <span className="text-blue-400 flex-shrink-0">1:{getRiskReward(tooltip.data.entry, tooltip.data.stop_loss, tooltip.data.take_profit)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Full screen legend */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-yellow-500"></div>
                <span className="text-gray-400">Live Price</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
                <span className="text-gray-400">Long Entry</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-gray-400">Short Entry</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">X</span>
                </div>
                <span className="text-gray-400">Exit</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-blue-500" style={{ opacity: 0.3 }}></div>
                <span className="text-gray-400">50% Confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-yellow-600" style={{ opacity: 0.3 }}></div>
                <span className="text-gray-400">80% Confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-green-500" style={{ opacity: 0.3 }}></div>
                <span className="text-gray-400">90% Confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
                <span className="text-gray-400">Support/Resistance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
                <span className="text-gray-400">Key Levels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={`bg-[#080b12] rounded-lg p-4 ${className}`}>
      {/* Controls Section */}
      <div className="flex justify-between items-center mb-4 gap-2">
        {/* <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value as 'BTC' | 'SOL' | 'ETH')}
          className="bg-[#0d1120]/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] focus:border-blue-500 focus:outline-none text-sm min-w-0 flex-shrink-0"
        >
          <option value="BTC">BTC</option>
          <option value="SOL" disabled>SOL (Soon)</option>
          <option value="ETH" disabled>ETH (Soon)</option>
        </select> */}
         <select
    value={selectedAsset}
    onChange={(e) => handleAssetChange(e.target.value as 'BTC' | 'SOL' | 'ETH')}
    className="bg-[#0d1120]/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] focus:border-blue-500 focus:outline-none text-sm min-w-0 flex-shrink-0"
  >
    <option value="BTC">BTC</option>
    <option value="SOL">SOL</option>
    <option value="ETH">ETH</option>
  </select>

        <SegmentedControl
          options={[
            { value: 'TODAY', label: 'Today' },
          ]}
          selected={selectedTimeframe}
          onChange={(value) => setSelectedTimeframe(value as 'TODAY')}
          className="flex-shrink-0"
        />
      </div>

      <div className="rounded-xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, rgba(124,106,247,0.08), rgba(52,211,153,0.04))', border: '1px solid rgba(124,106,247,0.15)' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold mb-1 flex items-center gap-1.5" style={{ color: '#a78bfa', fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Next Hour Outlook
            </div>
            <div className="text-white text-base md:text-lg font-bold break-words">
              ZkAGI anticipates price to hit ${nextHourTarget?.toLocaleString()} over next hour
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-gray-400 text-xs md:text-sm whitespace-nowrap">Next forecast in:</div>
            <div className="text-yellow-400 text-lg md:text-xl font-bold">{minutesToNextForecast}m</div>
          </div>
        </div>
        {nextForecast && (
          <div
            className={`
      mt-3
      inline-block
      bg-yellow-500/10    /* pale yellow background */
      border-l-4 border-yellow-400  /* thick yellow accent bar */
      px-3 py-2           /* padding for breathing room */
      rounded-md          /* subtle rounding */
      text-sm text-yellow-100 /* light yellow text */
      font-semibold       /* bolder copy */
      shadow-sm           /* tiny drop shadow */
    `}
          >
            <strong className="text-yellow-200">Play:</strong>{" "}
            {action} around{" "}
            <span className="font-medium text-white">
              {formatDollar(entryMin)}–{formatDollar(entryMax)}
            </span>
            {nextForecast.signal !== "HOLD" && (
              <>
                , target{" "}
                <span className="font-medium text-yellow-200">
                  {formatDollar(nextForecast.take_profit!)}
                </span>
                , stop at{" "}
                <span className="font-medium text-yellow-200">
                  {formatDollar(nextForecast.stop_loss!)}
                </span>
              </>
            )}
            .
          </div>
        )}

      </div>

      {/* Enhanced Key Metrics */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 mb-4`}>
        {/* Trading Signal Panel */}
        <div className={`bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 border-l-4 overflow-hidden ${displaySignal === 'LONG' ? 'border-green-500' :
          displaySignal === 'SHORT' ? 'border-red-500' :
            'border-yellow-500'
          }`}>
          <div className="flex justify-between items-start mb-2 gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold flex-shrink-0" style={{ color: '#64748b', fontFamily: "'DM Mono', monospace" }}>Trading Signal</span>
            <span className={`font-bold text-lg flex-shrink-0 ${displaySignal === 'LONG' ? 'text-green-400' :
              displaySignal === 'SHORT' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
              {displaySignal}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Entry Zone:</span>
              <span className="text-white font-medium text-right break-all min-w-0">
                {displayEntry ? `${(displayEntry * 0.999).toLocaleString()} - ${(displayEntry * 1.001).toLocaleString()}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Take Profit:</span>
              <span className="text-green-400 text-right break-all min-w-0">
                {displayTakeProfit ? `${displayTakeProfit.toLocaleString()} (+${((displayTakeProfit / (displayEntry || 1) - 1) * 100).toFixed(1)}%)` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Stop Loss:</span>
              <span className="text-red-400 text-right break-all min-w-0">
                {displayStopLoss ? `${displayStopLoss.toLocaleString()} (-${((1 - displayStopLoss / (displayEntry || 1)) * 100).toFixed(1)}%)` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="mb-1 mt-5 p-2 bg-[#0d1120]/50 rounded text-[9px] text-gray-500 break-words">
            <strong>Note:</strong> Position parameters display as N/A during HOLD signals.
            Specific entry zones, profit targets, and stop levels are provided for actionable LONG/SHORT signals.
          </div>
        </div>

        {/* Enhanced Risk Analysis */}
        <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 overflow-hidden">
          <div
            className="text-gray-400 text-sm mb-2 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
            onMouseEnter={(e) => showTooltip(e, tooltipContent.riskManagement, 'info')}
            onMouseLeave={hideTooltip}
          >
            <span className="break-words min-w-0">Risk Management</span>
            <span className="text-xs flex-shrink-0">ⓘ</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Risk vs Reward:</span>
              <span className="text-blue-400 font-bold flex-shrink-0">
                {lastHourly?.risk_reward_ratio ?
                  `1:${lastHourly.risk_reward_ratio.toFixed(1)}` :
                  displayEntry && displayStopLoss && displayTakeProfit ?
                    `1:${getRiskReward(displayEntry, displayStopLoss, displayTakeProfit)}` :
                    '1:1.5'
                }
              </span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Position Size:</span>
              <span className="text-green-400 text-right break-words min-w-0">{positionSize}</span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Win Probability:</span>
              <span className="text-blue-400 flex-shrink-0">{performanceMetrics.winProbability}%</span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Max Drawdown:</span>
              <span className="text-yellow-400 flex-shrink-0">-{performanceMetrics.maxDrawdown}%</span>
            </div>
          </div>
        </div>

        {/* Enhanced Performance Panel */}
        <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 overflow-hidden">
          <div
            className="text-gray-400 text-sm mb-2 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
            onMouseEnter={(e) => showTooltip(e, tooltipContent.performanceMetrics, 'info')}
            onMouseLeave={hideTooltip}
          >
            <span className="break-words min-w-0">Performance Metrics</span>
            <span className="text-xs flex-shrink-0">ⓘ</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Win Rate (Last 100):</span>
              <span className="text-green-400 flex-shrink-0">
                {formattedAccuracy}
              </span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Avg Gain:</span>
              <span className="text-green-400 flex-shrink-0">+{performanceMetrics.avgGain}%</span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Avg Loss:</span>
              <span className="text-red-400 flex-shrink-0">-{performanceMetrics.avgLoss}%</span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Profit Factor:</span>
              <span className="text-blue-400 flex-shrink-0">{performanceMetrics.profitFactor}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Structure Panel */}
      <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 mb-4 overflow-visible">
        <div
          className="text-gray-400 text-sm mb-3 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
          onMouseEnter={(e) => showTooltip(e, tooltipContent.marketStructure, 'info')}
          onMouseLeave={hideTooltip}
        >
          <span className="break-words min-w-0">Market Structure & Key Levels</span>
          <span className="text-xs flex-shrink-0">ⓘ</span>
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Trend Direction</div>
            <div className={`text-sm font-medium break-words ${marketStructure.trend === 'Bullish' ? 'text-green-400' :
              marketStructure.trend === 'Bearish' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
              {marketStructure.shortTermTrend} / {marketStructure.longTermTrend}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Key Pivot</div>
            <div className="text-sm font-medium text-white break-all">${Math.round(currentPrice).toLocaleString()}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Next Resistance</div>
            <div className="text-sm font-medium text-green-400 break-all">${Math.round(keyLevels.resistance).toLocaleString()}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Next Support</div>
            <div className="text-sm font-medium text-red-400 break-all">${Math.round(keyLevels.support).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Chart Container with maximize button */}
      <div className="w-full bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-2 mb-4 relative overflow-visible"
        style={{ height: selectedTimeframe === 'TODAY' ? (isMobile ? '240px' : '420px') : (isMobile ? '180px' : '220px') }}
        onMouseLeave={hideTooltip}
      >
        {/* Chart maximize button */}
        <button
          onClick={() => setIsChartMaximized(true)}
          className="absolute top-3 right-3 z-10 bg-[#0d1120]/80 hover:bg-[rgba(255,255,255,0.06)] text-gray-300 hover:text-white p-2 rounded-lg transition-colors duration-200 backdrop-blur-sm"
          title="Maximize Chart"
        >
          <Maximize2 size={16} />
        </button>

        {createSVGChart(false)}

        {/* Enhanced Tooltip */}
        {tooltip.visible && tooltip.data && (
          <div
            className={`absolute ${tooltip.type === 'info' ? 'bg-[#0d1120]' : 'bg-[#080b12]'} border border-[rgba(255,255,255,0.08)] rounded-lg p-3 text-white shadow-xl z-50 ${isMobile ? 'text-xs' : 'text-sm'
              } ${tooltip.type === 'info' ? 'max-w-md' : 'min-w-48'} break-words`}
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: tooltip.x > (isMobile ? 200 : 300) ? 'translateX(-100%)' : 'none'
            }}
          >
            {tooltip.type === 'info' ? (
              // Info tooltip content
              <div className="space-y-2">
                <div className="font-bold text-blue-400 border-b border-gray-600 pb-1 break-words">
                  {tooltip.data.title}
                </div>
                <div className="space-y-2">
                  {tooltip.data.content.map((item: string, index: number) => (
                    <div key={index} className="text-sm leading-relaxed">
                      <span className="font-medium text-gray-300 break-words">
                        {item.split(':')[0]}:
                      </span>
                      <span className="text-gray-400 ml-1 break-words">
                        {item.split(':').slice(1).join(':')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : tooltip.type === 'trade' ? (
              // Trade tooltip content
              <div className="space-y-2">
                <div className="font-bold text-blue-400 border-b border-gray-600 pb-1">
                  {tooltip.data.type === 'entry' ? 'Trade Entry' : 'Trade Exit'}
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Signal:</span>
                  <span className={tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}>
                    {tooltip.data.signal}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Price:</span>
                  <span>${tooltip.data.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Time:</span>
                  <span>{new Date(tooltip.data.time).toLocaleTimeString()}</span>
                </div>
                {tooltip.data.type === 'exit' && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Exit Reason:</span>
                      <span className={`${tooltip.data.exitReason === 'take_profit' ? 'text-green-400' :
                        tooltip.data.exitReason === 'stop_loss' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                        {tooltip.data.exitReason === 'take_profit' ? 'Take Profit' :
                          tooltip.data.exitReason === 'stop_loss' ? 'Stop Loss' : 'Next Hour'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">PnL:</span>
                      <span className={tooltip.data.pnl > 0 ? 'text-green-400' : 'text-red-400'}>
                        ${tooltip.data.pnl?.toFixed(2)} ({tooltip.data.pnlPercentage?.toFixed(2)}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Chart tooltip content
              <div className="space-y-2">
                {tooltip.data.type === 'candlestick' && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Time:</span>
                      <span className="break-words min-w-0">{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">OHLC:</span>
                      <span className="break-all min-w-0">
                        ${Math.round(tooltip.data.open).toLocaleString()} /
                        ${Math.round(tooltip.data.high).toLocaleString()} /
                        ${Math.round(tooltip.data.low).toLocaleString()} /
                        ${Math.round(tooltip.data.close).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Change:</span>
                      <span className={`flex-shrink-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
                        {((tooltip.data.close / tooltip.data.open - 1) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Volume:</span>
                      <span className="flex-shrink-0">{(tooltip.data.volume / 1000).toFixed(0)}K</span>
                    </div>
                  </>
                )}

                {tooltip.data.type === 'volume' && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Time:</span>
                      <span className="break-words min-w-0">{new Date(tooltip.data.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Volume:</span>
                      <span className="break-all min-w-0">{Math.round(tooltip.data.volume).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Price:</span>
                      <span className="break-all min-w-0">${Math.round(tooltip.data.close).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Volume Type:</span>
                      <span className={`break-words min-w-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
                        {tooltip.data.close > tooltip.data.open ? 'Buying Pressure' : 'Selling Pressure'}
                      </span>
                    </div>
                  </>
                )}

                {tooltip.data.type === 'historical' && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Date:</span>
                      <span className="break-words min-w-0">{getSimpleDate(tooltip.data.date)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Price:</span>
                      <span className="break-all min-w-0">${Math.round(tooltip.data.price).toLocaleString()}</span>
                    </div>
                  </>
                )}

                {tooltip.data.type === 'forecast' && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Date:</span>
                      <span className="break-words min-w-0">{getSimpleDate(tooltip.data.date)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Signal:</span>
                      <span className={`font-bold flex-shrink-0 ${tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                        {tooltip.data.signal}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Entry:</span>
                      <span className="break-all min-w-0">${Math.round(tooltip.data.entry).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Stop:</span>
                      <span className="text-red-400 break-all min-w-0">${Math.round(tooltip.data.stop_loss).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Target:</span>
                      <span className="text-green-400 break-all min-w-0">${Math.round(tooltip.data.take_profit).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">R:R Ratio:</span>
                      <span className="text-blue-400 flex-shrink-0">1:{getRiskReward(tooltip.data.entry, tooltip.data.stop_loss, tooltip.data.take_profit)}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Legend */}
      <div className="mb-4 overflow-x-auto">
        <div className={`flex flex-wrap gap-x-6 gap-y-2 ${isMobile ? 'text-xs' : 'text-sm'} min-w-max`}>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-0.5 bg-yellow-500"></div>
            <span className="text-gray-400 whitespace-nowrap">Live Price</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span className="text-gray-400 whitespace-nowrap">Long Entry</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-gray-400 whitespace-nowrap">Short Entry</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">X</span>
            </div>
            <span className="text-gray-400 whitespace-nowrap">Exit</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-2 bg-blue-500" style={{ opacity: 0.3 }}></div>
            <span className="text-gray-400 whitespace-nowrap">50% Confidence</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-2 bg-yellow-600" style={{ opacity: 0.3 }}></div>
            <span className="text-gray-400 whitespace-nowrap">80% Confidence</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-2 bg-green-500" style={{ opacity: 0.3 }}></div>
            <span className="text-gray-400 whitespace-nowrap">90% Confidence</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
            <span className="text-gray-400 whitespace-nowrap">Support/Resistance</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
            <span className="text-gray-400 whitespace-nowrap">Key Levels</span>
          </div>
        </div>
      </div>

      {/* Market Context Panel */}
      <div className="bg-[#0d1120]/60 backdrop-blur-sm rounded-lg p-4 overflow-hidden">
        <div className="text-gray-400 text-sm mb-3 break-words">Market Context & Catalysts</div>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 text-sm`}>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">News Impact</div>
            <div className="text-white break-words">{marketContext.newsImpact}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Technical Setup</div>
            <div className="text-white break-words">{marketContext.technicalSetup}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Volume</div>
            <div className={`break-words ${marketContext.volumeStatus === 'Above Average' ? 'text-green-400' :
              marketContext.volumeStatus === 'Below Average' ? 'text-red-400' : 'text-yellow-400'
              }`}>{marketContext.volumeStatus}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Correlation</div>
            <div className="text-white break-words">{marketContext.correlation}</div>
          </div>
        </div>
      </div>

      {/* Full Screen Chart Overlay */}
      {isChartMaximized && <FullScreenChart />}
    </div>
  );
};

export default PriceChart;