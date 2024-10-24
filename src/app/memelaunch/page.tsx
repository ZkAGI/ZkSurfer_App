// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { ArrowLeft } from 'lucide-react';

// interface FormData {
//     name: string;
//     ticker: string;
//     description: string;
//     model: string;
//     trainingData: File | null;
//     webpageUrl: string;
//     twitter: string;
//     telegram: string;
//     website: string;
// }

// const MemeLaunchPage = () => {
//     const searchParams = useSearchParams();
//     const [formData, setFormData] = useState<FormData>({
//         name: '',
//         ticker: '',
//         description: '',
//         model: 'Llama3.1',
//         trainingData: null,
//         webpageUrl: '',
//         twitter: '',
//         telegram: '',
//         website: ''
//     });

//     const models = [
//         { name: 'Llama3.1', enabled: true },
//         { name: 'Qwen2.5', enabled: false },
//         { name: 'Gemma 2', enabled: false },
//         { name: 'Nemotron-4', enabled: false }
//     ];

//     useEffect(() => {
//         const name = searchParams.get('name');
//         const description = searchParams.get('description');

//         if (name || description) {
//             setFormData(prev => ({
//                 ...prev,
//                 name: name || prev.name,
//                 description: description || prev.description
//             }));
//         }
//     }, [searchParams]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         console.log('Launching meme coin with data:', formData);
//     };

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             setFormData(prev => ({
//                 ...prev,
//                 trainingData: e.target.files![0]
//             }));
//         }
//     };

//     return (
//         <div className="min-h-screen bg-[#08121f] text-white p-4">
//             <div className="max-w-xl mx-auto">
//                 <div className="mb-6 flex items-center">
//                     <ArrowLeft className="w-6 h-6 mr-4" />
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div>
//                         <label className="block mb-2 text-sm">Name</label>
//                         <input
//                             type="text"
//                             name="name"
//                             value={formData.name}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="Cool Tiger"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Ticker</label>
//                         <input
//                             type="text"
//                             name="ticker"
//                             value={formData.ticker}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="Mememlord"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Description</label>
//                         <textarea
//                             name="description"
//                             value={formData.description}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700 h-32"
//                             placeholder="Get ready to roar with style!"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Choose Model</label>
//                         <select
//                             name="model"
//                             value={formData.model}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                         >
//                             {models.map((model) => (
//                                 <option
//                                     key={model.name}
//                                     value={model.name}
//                                     disabled={!model.enabled}
//                                 >
//                                     {model.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Upload Training Data</label>
//                         <input
//                             type="file"
//                             accept=".pdf,.xlsx"
//                             onChange={handleFileChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Webpage URL</label>
//                         <input
//                             type="url"
//                             name="webpageUrl"
//                             value={formData.webpageUrl}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="(upload Link)"
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Twitter</label>
//                         <input
//                             type="text"
//                             name="twitter"
//                             value={formData.twitter}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="(optional)"
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Telegram</label>
//                         <input
//                             type="text"
//                             name="telegram"
//                             value={formData.telegram}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="(optional)"
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Website</label>
//                         <input
//                             type="url"
//                             name="website"
//                             value={formData.website}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="(optional)"
//                         />
//                     </div>

//                     <div className="text-xs text-center text-gray-400 mt-4">
//                         TIP : Coin data cannot be changed after creation.
//                     </div>

//                     <button
//                         type="submit"
//                         className="w-full bg-white text-black font-bold py-4 rounded-lg mt-6"
//                     >
//                         CREATE COIN
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default MemeLaunchPage;
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { ArrowLeft } from 'lucide-react';
// import { useMemeStore } from '@/stores/meme-store';

// interface FormData {
//     name: string;
//     ticker: string;
//     description: string;
//     model: string;
//     trainingData: File | null;
//     webpageUrl: string;
//     twitter: string;
//     telegram: string;
//     website: string;
//     imageBase64: string;
//     seed: string;
//     walletAddress: string;
//     prompt: string
// }

// const MemeLaunchPage = () => {
//     const { memeData, resetMemeData } = useMemeStore();
//     const [formData, setFormData] = useState<FormData>({
//         name: '',
//         ticker: '',
//         description: '',
//         model: 'Llama3.1',
//         trainingData: null,
//         webpageUrl: '',
//         twitter: '',
//         telegram: '',
//         website: '',
//         imageBase64: '',
//         seed: '',
//         walletAddress: '',
//         prompt: ''
//     });
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     const models = [
//         { name: 'Llama3.1', enabled: true },
//         { name: 'Qwen2.5', enabled: false },
//         { name: 'Gemma 2', enabled: false },
//         { name: 'Nemotron-4', enabled: false }
//     ];

//     useEffect(() => {
//         const name = searchParams.get('name');
//         const description = searchParams.get('description');
//         const image = searchParams.get('image');
//         const seed = searchParams.get('seed');
//         const wallet = searchParams.get('wallet');
//         const prompt = searchParams.get('prompt');

//         if (name || description || image || seed || wallet) {
//             setFormData(prev => ({
//                 ...prev,
//                 name: name || prev.name,
//                 description: description || prev.description,
//                 imageBase64: image || prev.imageBase64,
//                 seed: seed || prev.seed,
//                 walletAddress: wallet || prev.walletAddress
//             }));
//         }
//     }, [searchParams]);

//     const readFileAsText = (file: File): Promise<string> => {
//         return new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 resolve(e.target?.result as string);
//             };
//             reader.onerror = reject;
//             reader.readAsText(file);
//         });
//     };

//     const getUrls = (formData: FormData): string[] => {
//         const urls: string[] = [];
//         if (formData.webpageUrl) urls.push(formData.webpageUrl);
//         if (formData.website) urls.push(formData.website);
//         if (formData.twitter) urls.push(formData.twitter);
//         if (formData.telegram) urls.push(formData.telegram);
//         return urls;
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsSubmitting(true);

//         try {
//             let pdfContent = '';
//             if (formData.trainingData) {
//                 pdfContent = await readFileAsText(formData.trainingData);
//             }

//             const apiPayload = {
//                 coin_name: formData.name,
//                 ticker: formData.ticker,
//                 description: formData.description,
//                 urls: getUrls(formData),
//                 training_data: {
//                     pdfs: [pdfContent],
//                     images: []
//                 },
//                 wallet_address: formData.walletAddress,
//                 image_base64: formData.imageBase64.slice(0, 100),
//                 seed: formData.seed,
//                 user_prompt: formData.prompt
//             };

//             console.log('=== API Payload Details ===');
//             console.log('Coin Name:', apiPayload.coin_name);
//             console.log('Ticker:', apiPayload.ticker);
//             console.log('Description:', apiPayload.description);
//             console.log('URLs:', apiPayload.urls);
//             console.log('PDF Content Length:', apiPayload.training_data.pdfs[0]?.length || 0);
//             console.log('Wallet Address:', apiPayload.wallet_address);
//             console.log('Image Base64 Length:', apiPayload.image_base64?.length || 0);
//             console.log('Seed:', apiPayload.seed);
//             console.log('User Prompt:', apiPayload.user_prompt);
//             console.log('=== Full API Payload ===');
//             console.log(JSON.stringify(apiPayload, null, 2));

//             const response = await fetch('https://zynapse.zkagi.ai/api/coinLaunch', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'api-key': 'zk-123321'
//                 },
//                 body: JSON.stringify(apiPayload)
//             });

//             if (!response.ok) {
//                 throw new Error(`API call failed: ${response.statusText}`);
//             }

//             const result = await response.json();
//             console.log('Coin launched successfully:', result);
//             // Add success handling here (e.g., show success message, redirect)

//         } catch (error) {
//             console.error('Error launching coin:', error);
//             // Add error handling here (e.g., show error message)
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             setFormData(prev => ({
//                 ...prev,
//                 trainingData: e.target.files![0]
//             }));
//         }
//     };

//     return (
//         <div className="min-h-screen bg-[#08121f] text-white p-4">
//             <div className="max-w-xl mx-auto">
//                 <div className="mb-6 flex items-center">
//                     <ArrowLeft className="w-6 h-6 mr-4" />
//                 </div>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div>
//                         <label className="block mb-2 text-sm">Name</label>
//                         <input
//                             type="text"
//                             name="name"
//                             value={formData.name}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="Cool Tiger"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Ticker</label>
//                         <input
//                             type="text"
//                             name="ticker"
//                             value={formData.ticker}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="Mememlord"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Description</label>
//                         <textarea
//                             name="description"
//                             value={formData.description}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700 h-32"
//                             placeholder="Get ready to roar with style!"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Choose Model</label>
//                         <select
//                             name="model"
//                             value={formData.model}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                         >
//                             {models.map((model) => (
//                                 <option
//                                     key={model.name}
//                                     value={model.name}
//                                     disabled={!model.enabled}
//                                 >
//                                     {model.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Upload Training Data</label>
//                         <input
//                             type="file"
//                             accept=".pdf,.xlsx"
//                             onChange={handleFileChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Webpage URL</label>
//                         <input
//                             type="url"
//                             name="webpageUrl"
//                             value={formData.webpageUrl}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="(upload Link)"
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Twitter</label>
//                         <input
//                             type="text"
//                             name="twitter"
//                             value={formData.twitter}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="(optional)"
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Telegram</label>
//                         <input
//                             type="text"
//                             name="telegram"
//                             value={formData.telegram}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="(optional)"
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 text-sm">Website</label>
//                         <input
//                             type="url"
//                             name="website"
//                             value={formData.website}
//                             onChange={handleChange}
//                             className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
//                             placeholder="(optional)"
//                         />
//                     </div>

//                     <div className="text-xs text-center text-gray-400 mt-4">
//                         TIP : Coin data cannot be changed after creation.
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="w-full bg-white text-black font-bold py-4 rounded-lg mt-6 disabled:opacity-50"
//                     >
//                         {isSubmitting ? 'CREATING COIN...' : 'CREATE COIN'}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default MemeLaunchPage;




'use client';
import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import next router for redirect
import { useMemeStore } from '@/stores/meme-store'; // Import zustand store

interface FormDataType {
    name: string;
    ticker: string;
    description: string;
    model: string;
    trainingData: File | null;
    webpageUrl: string;
    twitter: string;
    telegram: string;
    website: string;
    imageBase64: string;
    seed: string;
    walletAddress: string;
    prompt: string;
}

const MemeLaunchPage = () => {
    const router = useRouter();
    const { memeData, resetMemeData } = useMemeStore(); // Use zustand store
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const models = [
        { name: 'Llama3.1', enabled: true },
        { name: 'Qwen2.5', enabled: false },
        { name: 'Gemma 2', enabled: false },
        { name: 'Nemotron-4', enabled: false }
    ];

    // useEffect(() => {
    //     // If no memeData is available in the store, redirect the user
    //     if (!memeData) {
    //         router.push('/');
    //         return;
    //     }

    //     // Optionally pre-populate form with existing memeData from the store
    //     setFormData({
    //         name: memeData.name,
    //         description: memeData.description,
    //         imageBase64: memeData.base64Image,
    //         seed: memeData.seed,
    //         walletAddress: memeData.wallet,
    //         prompt: memeData.prompt,
    //         ticker: '', // You can decide whether to add new fields or not
    //         model: 'Llama3.1', // Default value or based on your logic
    //         trainingData: null,
    //         webpageUrl: '',
    //         twitter: '',
    //         telegram: '',
    //         website: ''
    //     });
    // }, [memeData, router]);


    useEffect(() => {
        if (memeData) {
            setIsLoading(false); // Stop loading if data exists
        } else {
            // Delay redirect to ensure memeData is actually null or missing
            const timer = setTimeout(() => {
                if (!memeData) {
                    router.push('/'); // Redirect after checking
                }
            }, 1000); // 1-second delay for smoother UX

            return () => clearTimeout(timer); // Cleanup on unmount
        }

        setFormData({
            name: memeData.name,
            description: memeData.description,
            imageBase64: memeData.base64Image,
            seed: memeData.seed,
            walletAddress: memeData.wallet,
            prompt: memeData.prompt,
            ticker: '', // You can decide whether to add new fields or not
            model: 'Llama3.1', // Default value or based on your logic
            trainingData: null,
            webpageUrl: '',
            twitter: '',
            telegram: '',
            website: ''
        });
    }, [memeData, router]);


    // Define the formData in local state to track form updates
    const [formData, setFormData] = useState<FormDataType>({
        name: '',
        ticker: '',
        description: '',
        model: 'Llama3.1',
        trainingData: null,
        webpageUrl: '',
        twitter: '',
        telegram: '',
        website: '',
        imageBase64: '',
        seed: '',
        walletAddress: '',
        prompt: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const getUrls = (formData: FormDataType): string[] => {
        const urls: string[] = [];
        if (formData.webpageUrl) urls.push(formData.webpageUrl);
        if (formData.website) urls.push(formData.website);
        if (formData.twitter) urls.push(formData.twitter);
        if (formData.telegram) urls.push(formData.telegram);
        return urls;
    };

    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target?.result as string);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let pdfContent = '';
            if (formData.trainingData) {
                pdfContent = await readFileAsText(formData.trainingData);
            }

            // Prepare API payload using formData or memeData
            const apiPayload = {
                coin_name: formData.name,
                ticker: formData.ticker,
                description: formData.description,
                urls: getUrls(formData),
                training_data: {
                    pdfs: [pdfContent],
                    images: []
                },
                wallet_address: formData.walletAddress,
                image_base64: formData.imageBase64.slice(0, 100),
                seed: formData.seed,
                user_prompt: formData.prompt
            };

            console.log('=== API Payload Details ===');
            console.log('Coin Name:', apiPayload.coin_name);
            console.log('Ticker:', apiPayload.ticker);
            console.log('Description:', apiPayload.description);
            console.log('URLs:', apiPayload.urls);
            console.log('PDF Content Length:', apiPayload.training_data.pdfs[0]?.length || 0);
            console.log('Wallet Address:', apiPayload.wallet_address);
            console.log('Image Base64 Length:', apiPayload.image_base64?.length || 0);
            console.log('Seed:', apiPayload.seed);
            console.log('User Prompt:', apiPayload.user_prompt);
            console.log('=== Full API Payload ===');
            console.log(JSON.stringify(apiPayload, null, 2));

            const response = await fetch('https://zynapse.zkagi.ai/api/coinLaunch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'zk-123321'
                },
                body: JSON.stringify(apiPayload)
            });

            if (!response.ok) throw new Error(`API call failed: ${response.statusText}`);
            const result = await response.json();
            console.log('Coin launched successfully:', result);

            // Reset the zustand store after successful form submission
            resetMemeData();

        } catch (error) {
            console.error('Error launching coin:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({
            ...prev,
            trainingData: file
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-[#08121f] text-white p-4">
            <div className="max-w-xl mx-auto">
                <div className="mb-6 flex items-center">
                    <ArrowLeft className="w-6 h-6 mr-4" />
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                            placeholder="Cool Tiger"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Ticker</label>
                        <input
                            type="text"
                            name="ticker"
                            value={formData.ticker}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                            placeholder="Mememlord"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700 h-32"
                            placeholder="Get ready to roar with style!"
                            required
                        />
                    </div>


                    <div>
                        <label className="block mb-2 text-sm">Choose Model</label>
                        <select
                            name="model"
                            value={formData.model}
                            onChange={handleSelectChange}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                        >
                            {models.map((model) => (
                                <option
                                    key={model.name}
                                    value={model.name}
                                    disabled={!model.enabled}
                                >
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Upload Training Data</label>
                        <input
                            type="file"
                            accept=".pdf,.xlsx"
                            onChange={handleFileChange}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Webpage URL</label>
                        <input
                            type="url"
                            name="webpageUrl"
                            value={formData.webpageUrl}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                            placeholder="(upload Link)"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Twitter</label>
                        <input
                            type="text"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                            placeholder="(optional)"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Telegram</label>
                        <input
                            type="text"
                            name="telegram"
                            value={formData.telegram}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                            placeholder="(optional)"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Website</label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                            placeholder="(optional)"
                        />
                    </div>

                    <div className="text-xs text-center text-gray-400 mt-4">
                        TIP : Coin data cannot be changed after creation.
                    </div>



                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black font-bold py-4 rounded-lg mt-6 disabled:opacity-50"
                    >
                        {isSubmitting ? 'CREATING COIN...' : 'CREATE COIN'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MemeLaunchPage;
