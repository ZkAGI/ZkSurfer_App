import { getDictionary } from '@/app/i18n/dictionaries';
import { Locale } from '@/app/i18n/settings';
import MemeLaunchPage from '../memelaunch/page';
import { MemeLaunchPageProps } from '../memelaunch/page';

interface MemeLaunchPageServerProps {
  params: Promise<{
    lang: string;
  }>;
}

const MemeLaunchPageServer = async ({ params }: MemeLaunchPageServerProps) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const typedDictionary = dictionary as MemeLaunchPageProps['dictionary'];
  return <MemeLaunchPage dictionary={typedDictionary} />;
};

export default MemeLaunchPageServer;