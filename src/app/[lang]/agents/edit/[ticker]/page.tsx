// // import React from 'react';

// // interface TrainingData {
// //     training_urls?: string[];  // changed from "urls" to "training_urls"
// //     pdfs?: string[];
// //     images?: string[];         // base64 images
// // }

// // interface TickerData {
// //     image_base64?: string;     // top image
// //     description?: string;      // text
// //     training_data?: TrainingData;
// // }

// // // Fetch from your endpoint on the server
// // async function getTickerInfo(ticker: string): Promise<TickerData> {
// //     const res = await fetch(
// //         `https://zynapse.zkagi.ai/contentengine_knowledgebase/${ticker}`,
// //         {
// //             headers: {
// //                 'Content-Type': 'application/json',
// //                 'api-key': 'zk-123321',
// //             },
// //         }
// //     );

// //     if (!res.ok) {
// //         throw new Error(`Failed to fetch data for ticker: ${ticker}`);
// //     }
// //     return res.json();
// // }

// // // Server component:
// // export default async function EditAgentPage({
// //     params,
// // }: {
// //     params: { ticker: string };
// // }) {
// //     // 1) Fetch data on the server side
// //     const data = await getTickerInfo(params.ticker);

// //     // 2) Extract only the fields we need
// //     const { image_base64, description, training_data } = data || {};
// //     const {
// //         training_urls = [],
// //         pdfs = [],
// //         images = [],
// //     } = training_data || {};

// //     return (
// //         <main style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
// //             <h1>Edit Agent Data</h1>

// //             {/* Show top image if we have base64 data */}
// //             {image_base64 ? (
// //                 <div style={{ margin: '1rem 0' }}>
// //                     <img
// //                         src={`data:image/png;base64,${image_base64}`}
// //                         alt={`Agent for ${params.ticker}`}
// //                         style={{ maxWidth: '100%', borderRadius: 8 }}
// //                     />
// //                 </div>
// //             ) : (
// //                 <p>No image available.</p>
// //             )}

// //             {/* Show ticker name below image */}
// //             <h2 style={{ background: '#222', padding: '1rem', borderRadius: 8, marginBottom: '1rem', color: '#fff' }}>{params.ticker}</h2>

// //             {/* Description */}
// //             <section style={{ background: '#222', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
// //                 <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>Description</h3>
// //                 <div style={{ whiteSpace: 'pre-wrap', color: '#ccc' }}>
// //                     {description ?? 'No description found.'}
// //                 </div>
// //             </section>

// //             {/* Training Data */}
// //             <section style={{ background: '#222', padding: '1rem', borderRadius: 8 }}>
// //                 <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Training Data</h3>

// //                 {/* trainingData_URLS */}
// //                 <div style={{ background: '#333', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem' }}>
// //                     <h4 style={{ color: '#fff' }}>URLS</h4>
// //                     {training_urls.length > 0 ? (
// //                         <ul style={{ marginLeft: '1rem' }}>
// //                             {training_urls.map((url, idx) => (
// //                                 <li key={idx} style={{ margin: '0.5rem 0' }}>
// //                                     <a
// //                                         href={url}
// //                                         target="_blank"
// //                                         rel="noopener noreferrer"
// //                                         style={{ color: '#57b3ff' }}
// //                                     >
// //                                         {url}
// //                                     </a>
// //                                 </li>
// //                             ))}
// //                         </ul>
// //                     ) : (
// //                         <p style={{ color: '#ccc' }}>No data</p>
// //                     )}
// //                 </div>

// //                 {/* PDFs */}
// //                 <div style={{ background: '#333', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem' }}>
// //                     <h4 style={{ color: '#fff' }}>PDFs</h4>
// //                     {pdfs.length > 0 ? (
// //                         <ul style={{ marginLeft: '1rem' }}>
// //                             {pdfs.map((pdf, idx) => (
// //                                 <li key={idx} style={{ margin: '0.5rem 0', color: '#ccc' }}>
// //                                     {pdf}
// //                                 </li>
// //                             ))}
// //                         </ul>
// //                     ) : (
// //                         <p style={{ color: '#ccc' }}>No data</p>
// //                     )}
// //                 </div>

// //                 {/* Images */}
// //                 <div style={{ background: '#333', padding: '0.75rem', borderRadius: 6 }}>
// //                     <h4 style={{ color: '#fff' }}>Images</h4>
// //                     {images.length > 0 ? (
// //                         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
// //                             {images.map((img, idx) => (
// //                                 <img
// //                                     key={idx}
// //                                     src={`data:image/png;base64,${img}`}
// //                                     alt={`training image ${idx}`}
// //                                     style={{ maxWidth: '100%', borderRadius: 8 }}
// //                                 />
// //                             ))}
// //                         </div>
// //                     ) : (
// //                         <p style={{ color: '#ccc' }}>No data</p>
// //                     )}
// //                 </div>
// //             </section>
// //         </main>
// //     );
// // }

// import React from 'react';
// import { getDictionary } from '@/app/i18n/dictionaries';
// import { Locale } from '@/app/i18n/settings';

// interface TrainingData {
//     training_urls?: string[];  // changed from "urls" to "training_urls"
//     pdfs?: string[];
//     images?: string[];         // base64 images
// }

// interface TickerData {
//     image_base64?: string;     // top image
//     description?: string;      // text
//     training_data?: TrainingData;
// }

// // Fetch from your endpoint on the server
// async function getTickerInfo(ticker: string): Promise<TickerData> {
//     const res = await fetch(
//         `https://zynapse.zkagi.ai/contentengine_knowledgebase/${ticker}`,
//         {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'api-key': 'zk-123321',
//             },
//         }
//     );
//     if (!res.ok) {
//         throw new Error(`Failed to fetch data for ticker: ${ticker}`);
//     }
//     return res.json();
// }

// // Server component:
// export default async function EditAgentPage({
//     params,
// }: {
//     params: { ticker: string; lang: Locale };
// }) {
//     // Get the dictionary for the current locale
//     const dictionary = await getDictionary(params.lang);

//     // 1) Fetch data on the server side
//     const data = await getTickerInfo(params.ticker);

//     // 2) Extract only the fields we need
//     const { image_base64, description, training_data } = data || {};
//     const {
//         training_urls = [],
//         pdfs = [],
//         images = [],
//     } = training_data || {};

//     return (
//         <main style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
//             <h1>Edit Agent Data</h1>
//             {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}

//             {/* Show top image if we have base64 data */}
//             {image_base64 ? (
//                 <div style={{ margin: '1rem 0' }}>
//                     <img
//                         src={`data:image/png;base64,${image_base64}`}
//                         alt={`Agent for ${params.ticker}`}
//                         style={{ maxWidth: '100%', borderRadius: 8 }}
//                     />
//                 </div>
//             ) : (
//                 <p>No image available</p>
//             )}

//             {/* Show ticker name below image */}
//             <h2
//                 style={{
//                     background: '#222',
//                     padding: '1rem',
//                     borderRadius: 8,
//                     marginBottom: '1rem',
//                     color: '#fff',
//                 }}
//             >
//                 {params.ticker}
//             </h2>

//             {/* Description */}
//             <section
//                 style={{
//                     background: '#222',
//                     padding: '1rem',
//                     borderRadius: 8,
//                     marginBottom: '1rem',
//                 }}
//             >
//                 <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>
//                     Description
//                 </h3>
//                 <div style={{ whiteSpace: 'pre-wrap', color: '#ccc' }}>
//                     {description ?? 'No description found.'}
//                 </div>
//             </section>

//             {/* Training Data */}
//             <section style={{ background: '#222', padding: '1rem', borderRadius: 8 }}>
//                 <h3 style={{ marginBottom: '1rem', color: '#fff' }}>
//                     Training Data
//                 </h3>

//                 {/* trainingData_URLS */}
//                 <div
//                     style={{
//                         background: '#333',
//                         padding: '0.75rem',
//                         borderRadius: 6,
//                         marginBottom: '1rem',
//                     }}
//                 >
//                     <h4 style={{ color: '#fff' }}>
//                         URLS
//                     </h4>
//                     {training_urls.length > 0 ? (
//                         <ul style={{ marginLeft: '1rem' }}>
//                             {training_urls.map((url, idx) => (
//                                 <li key={idx} style={{ margin: '0.5rem 0' }}>
//                                     <a
//                                         href={url}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         style={{ color: '#57b3ff' }}
//                                     >
//                                         {url}
//                                     </a>
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p style={{ color: '#ccc' }}>
//                             No data
//                         </p>
//                     )}
//                 </div>

//                 {/* PDFs */}
//                 <div
//                     style={{
//                         background: '#333',
//                         padding: '0.75rem',
//                         borderRadius: 6,
//                         marginBottom: '1rem',
//                     }}
//                 >
//                     <h4 style={{ color: '#fff' }}>
//                         PDFs
//                     </h4>
//                     {pdfs.length > 0 ? (
//                         <ul style={{ marginLeft: '1rem' }}>
//                             {pdfs.map((pdf, idx) => (
//                                 <li key={idx} style={{ margin: '0.5rem 0', color: '#ccc' }}>
//                                     {pdf}
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p style={{ color: '#ccc' }}>
//                             No data
//                         </p>
//                     )}
//                 </div>

//                 {/* Images */}
//                 <div
//                     style={{
//                         background: '#333',
//                         padding: '0.75rem',
//                         borderRadius: 6,
//                     }}
//                 >
//                     <h4 style={{ color: '#fff' }}>
//                         Images
//                     </h4>
//                     {images.length > 0 ? (
//                         <div
//                             style={{
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                                 gap: '1rem',
//                             }}
//                         >
//                             {images.map((img, idx) => (
//                                 <img
//                                     key={idx}
//                                     src={`data:image/png;base64,${img}`}
//                                     alt={`training image ${idx}`}
//                                     style={{ maxWidth: '100%', borderRadius: 8 }}
//                                 />
//                             ))}
//                         </div>
//                     ) : (
//                         <p style={{ color: '#ccc' }}>
//                             No data
//                         </p>
//                     )}
//                 </div>
//             </section>
//         </main>
//     );
// }

import type { Metadata } from 'next';
import React from 'react';
import { getDictionary } from '@/app/i18n/dictionaries';
import { Locale } from '@/app/i18n/settings';
import EditAgentClient from '@/component/ui/EditAgentClient';

export async function generateMetadata({
  params,
}: {
  params: { ticker: string; lang: Locale };
}): Promise<Metadata> {
  return {
    title: `Edit Agent: ${params.ticker}`,
    description: `Configure and train the ${params.ticker} AI agent on ZkTerminal. Update training data, URLs, PDFs, and images for your agent's knowledge base.`,
    openGraph: {
      title: `Edit Agent: ${params.ticker} — ZkTerminal`,
      description: `Configure the ${params.ticker} AI agent. Update training data and knowledge base.`,
    },
  };
}

interface TrainingData {
    training_urls?: string[];
    pdfs?: string[];
    images?: string[]; // base64 images
}

interface TickerData {
    image_base64?: string; // top image
    description?: string; // text
    training_data?: TrainingData;
}

async function getTickerInfo(ticker: string): Promise<TickerData> {
    const res = await fetch(
        `https://zynapse.zkagi.ai/contentengine_knowledgebase/${ticker}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'api-key': 'zk-123321',
            },
        }
    );
    if (!res.ok) {
        throw new Error(`Failed to fetch data for ticker: ${ticker}`);
    }
    return res.json();
}

export default async function EditAgentPage({
    params,
}: {
    params: { ticker: string; lang: Locale };
}) {
    // Get dictionary for current locale
    const dictionary = await getDictionary(params.lang);

    // Fetch data on the server side
    const data = await getTickerInfo(params.ticker);

    // Extract fields we need
    const { image_base64, description, training_data } = data || {};
    const {
        training_urls: initialUrls = [],
        pdfs: initialPdfs = [],
        images: initialImages = [],
    } = training_data || {};

    return (
        <EditAgentClient
            ticker={params.ticker}
            dictionary={dictionary}
            image_base64={image_base64}
            description={description}
            initialUrls={initialUrls}
            initialPdfs={initialPdfs}
            initialImages={initialImages}
        />
    );
}
