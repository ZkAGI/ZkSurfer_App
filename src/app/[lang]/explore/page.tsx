import type { NextPage } from 'next';
import ExploreAgentsPage from "./AgentMarketplace";
import { getDictionary } from '@/app/i18n/dictionaries';
import { Locale } from '@/app/i18n/settings';
import { ExploreAgentsPageProps } from './AgentMarketplace';

interface ExplorePageProps {
  params: Promise<{
    lang: string;
  }>;
}

const ExplorePage: NextPage<ExplorePageProps> = async ({ params }) => {
  // Get the dictionary for the current locale
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const typedDictionary = dictionary as ExploreAgentsPageProps['dictionary'];

  // Pass the dictionary to your ExploreAgentsPage component
  return <ExploreAgentsPage dictionary={typedDictionary} />;
};

export default ExplorePage;