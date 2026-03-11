// import React from 'react';
// import { useDictionary } from '@/app/i18n/context';


// import ApiKeysPage from "./ApiKeysPage";

// export default function ApiKeyPage() {
//     const dictionary = useDictionary();
//     return (
//         <div>
//             <ApiKeysPage dictionary={dictionary} />
//         </div>
//     );
// }

import type { Metadata } from 'next';
import type { NextPage } from 'next';
import ApiKeysPage from './ApiKeysPage';
import { getDictionary } from '@/app/i18n/dictionaries';
import { Locale } from '@/app/i18n/settings';

export const metadata: Metadata = {
  title: "API Keys",
  description:
    "Manage your ZkTerminal API keys. Access the Zynapse API for privacy-preserving AI inference, ZK proof generation, and agent management programmatically.",
  openGraph: {
    title: "API Keys — ZkTerminal",
    description: "Manage API keys for Zynapse AI inference and ZK proof generation.",
  },
};

interface ApiKeyPageProps {
    params: Promise<{
        lang: string;
    }>;
}

const ApiKeyPage: NextPage<ApiKeyPageProps> = async ({ params }) => {
    // Get the dictionary for the current locale
    const { lang } = await params;
    const dictionary = await getDictionary(lang as Locale);

    // Pass the dictionary to your ApiKeysPage component
    return <ApiKeysPage dictionary={dictionary} />;
};

export default ApiKeyPage;