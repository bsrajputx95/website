import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>StockVerse - Fantasy Stock Trading Leaderboard</title>
        <meta name="description" content="StockVerse - Fantasy Stock Trading Leaderboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to StockVerse</h1>
        <p className="text-xl text-center mb-8">A fantasy stock trading leaderboard system where you can compete with others using virtual money.</p>
        <div className="flex justify-center space-x-4">
          <Link href="/login">
            <a className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Login</a>
          </Link>
          <Link href="/signup">
            <a className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Sign Up</a>
          </Link>
        </div>
      </main>
    </div>
  );
} 