export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return (
        <div>
            <h1>Test Page</h1>
            <p>Current locale: {locale}</p>
        </div>
    );
}

// import type { NextPage } from 'next';
// import HomeContent from "../home/HomeContent";

// const Home: NextPage = () => {
//     return <HomeContent />;
// };

// export default Home;