// import type { NextPage } from 'next';
// import HomeContent from '../home/HomeContent';
// import { getDictionary } from '../i18n/dictionaries';
// import { Locale } from '../i18n/settings';

// interface HomePageProps {
//   params: {
//     lang: Locale;
//   };
// }

// const Home: NextPage<HomePageProps> = async ({ params }) => {
//   // Get the dictionary for the current locale
//   const dictionary = await getDictionary(params.lang);

//   // Pass the dictionary to your HomeContent component
//   return <HomeContent dictionary={dictionary} />;
// };

// export default Home;


import type { NextPage } from 'next';
import HomeContent from './home/HomeContent';

interface HomePageProps {
  params: Promise<{
    lang: string;
  }>;
}

const Home: NextPage<HomePageProps> = async () => {
  return <HomeContent />;
};

export default Home;