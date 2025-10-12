// 'use client'
// import React from 'react'
// import PredictionPanel from '@/component/ui/PredictionPanel'
// import { TradingChart } from '@/component/ui/TradingChart'
// import OrderBook from '@/component/ui/OrderBook'
// import Leaderboard from '@/component/ui/Leaderboard'
// import YourPredictions from '@/component/ui/YourPredictions'
// import LeverageTradingAssistant from '@/component/ui/LeverageTradingAssistant'

// const TradingPage: React.FC = () => {
//     return (
//         <div className="min-h-screen bg-gray-950 p-3">
//             <div className="flex flex-col mx-auto">
//                 <h1 className="text-3xl font-bold text-white mb-2">Prediction Dashboard</h1>

//                 <div>
//                     <div className="grid grid-cols-4 gap-2">

//                         <div>
//                             <PredictionPanel className="" />
//                         </div>
//                         <div className="col-span-2 overflow-hidden">
//                             <TradingChart />
//                         </div>
//                         <div>
//                             <OrderBook coin="BTC" depth={10} />
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-4 gap-2 mt-5">
//                         <div className="">
//                             <Leaderboard />
//                         </div>
//                         <div className="col-span-2">
//                             <LeverageTradingAssistant />
//                         </div>
//                         <div>
//                             <YourPredictions />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default TradingPage

// 'use client'
// import React from 'react'
// import PredictionPanel from '@/component/ui/PredictionPanel'
// import { TradingChart } from '@/component/ui/TradingChart'
// import OrderBook from '@/component/ui/OrderBook'
// import Leaderboard from '@/component/ui/Leaderboard'
// import YourPredictions from '@/component/ui/YourPredictions'
// import LeverageTradingAssistant from '@/component/ui/LeverageTradingAssistant'
// import { Suspense } from 'react';

// const TradingPage: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-gray-950 p-3">
//       <div className="flex flex-col mx-auto">
//         <h1 className="text-3xl font-bold text-white mb-2">Prediction Dashboard</h1>

//         <div>
//           {/* Row 1: stacks on mobile */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
//             <div>
//               <PredictionPanel />
//             </div>
//             <div className="md:col-span-2 h-full">
//                <Suspense fallback={null}>
//               <TradingChart />
//               </Suspense>
//             </div>
//             <div>
//               <OrderBook coin="BTC" depth={10} />
//             </div>
//           </div>

//           {/* Row 2: stacks on mobile */}
//           {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-5">
//             <div>
//               <Leaderboard />
//             </div>
//             <div className="md:col-span-2">
//               <LeverageTradingAssistant />
//             </div>
//             <div>
//               <YourPredictions />
//             </div>
//           </div> */}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default TradingPage

import { Suspense } from 'react';
import TradingPageClient from './TradingPageClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TradingPageClient />
    </Suspense>
  );
}
