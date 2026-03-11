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

import type { NextPage } from 'next';
import ApiKeysPage from './ApiKeysPage';
import { getDictionary } from '@/app/i18n/dictionaries';
import { Locale } from '@/app/i18n/settings';

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