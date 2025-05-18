import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const fakeNews = [
  { title: 'Tech stocks surge on AI breakthrough', source: 'Tech Daily' },
  { title: 'Market volatility expected due to global events', source: 'Finance Times' },
  { title: 'New startup disrupts traditional banking', source: 'Innovation Weekly' },
  { title: 'Global markets react to economic data', source: 'Global Finance' },
  { title: 'Investors optimistic about future growth', source: 'Market Insights' },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [stockSymbol, setStockSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState(1);
  const [tradeType, setTradeType] = useState('buy');
  const [livePrice, setLivePrice] = useState(null);
  const [tradeMessage, setTradeMessage] = useState('');
  const [error, setError] = useState('');
  const [xp, setXp] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isReachable, setIsReachable] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setWalletBalance(data.user.walletBalance);
          setPortfolio(data.user.portfolio);
          setXp(data.user.xp || 0);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setIsReachable(false);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    // Fetch live price for selected stock symbol
    const fetchLivePrice = async () => {
      setLivePrice(null);
      setError('');
      try {
        const res = await fetch(`/api/stockprice?symbol=${stockSymbol}`);
        const data = await res.json();
        if (res.ok) {
          setLivePrice(data.price);
        } else {
          setError('Could not fetch live price.');
        }
      } catch (err) {
        setError('Could not fetch live price.');
      }
    };
    if (stockSymbol) fetchLivePrice();
  }, [stockSymbol]);

  const handleTrade = async (e) => {
    e.preventDefault();
    setTradeMessage('');
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stockSymbol, quantity: Number(quantity), type: tradeType }),
      });
      const data = await res.json();
      if (res.ok) {
        setTradeMessage('Trade successful!');
        setWalletBalance((prev) => tradeType === 'buy' ? prev - quantity * livePrice : prev + quantity * livePrice);
        // Award XP for good trades
        const newXp = xp + 10;
        setXp(newXp);
        // Optionally, refresh user data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Trade failed.');
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback('');
        alert('Thank you for your feedback!');
      } else {
        alert('Failed to submit feedback.');
      }
    } catch (err) {
      alert('Failed to submit feedback.');
    }
  };

  const retryFetchUserData = () => {
    setIsReachable(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setWalletBalance(data.user.walletBalance);
          setPortfolio(data.user.portfolio);
          setXp(data.user.xp || 0);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setIsReachable(false);
      }
    };
    fetchUserData();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (!isReachable) {
    return (
      <div className="text-center text-red-500">
        This site cannot be reached. Please check your internet connection or try again later.
        <button onClick={retryFetchUserData} className="ml-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Retry</button>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: portfolio.map(stock => stock.stockSymbol),
    datasets: [
      {
        label: 'Portfolio Value',
        data: portfolio.map(stock => stock.quantity * stock.averagePrice),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Dashboard - StockVerse</title>
      </Head>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
            <h2 className="text-xl font-bold mb-4">Wallet Balance</h2>
            <p className="text-2xl text-green-400 animate-pulse">₹{walletBalance.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
            <h2 className="text-xl font-bold mb-4">Portfolio</h2>
            {portfolio.length === 0 ? (
              <p>No stocks in your portfolio yet.</p>
            ) : (
              <ul>
                {portfolio.map((stock, index) => (
                  <li key={index} className="mb-2">
                    {stock.stockSymbol}: {stock.quantity} shares at ₹{stock.averagePrice}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 transition-transform duration-300 hover:scale-105">
          <h2 className="text-xl font-bold mb-4">Portfolio Chart</h2>
          <div className="h-64">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 transition-transform duration-300 hover:scale-105">
          <h2 className="text-xl font-bold mb-4">Buy/Sell Stocks</h2>
          <form onSubmit={handleTrade} className="flex flex-col md:flex-row md:items-end gap-4">
            <div>
              <label className="block mb-1">Stock Symbol</label>
              <input type="text" value={stockSymbol} onChange={e => setStockSymbol(e.target.value.toUpperCase())} className="p-2 rounded bg-gray-700" required />
            </div>
            <div>
              <label className="block mb-1">Quantity</label>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="p-2 rounded bg-gray-700" required />
            </div>
            <div>
              <label className="block mb-1">Type</label>
              <select value={tradeType} onChange={e => setTradeType(e.target.value)} className="p-2 rounded bg-gray-700">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div className="md:ml-4">
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Submit</button>
            </div>
          </form>
          {livePrice !== null && (
            <p className="mt-2">Live Price: <span className="font-bold">₹{livePrice}</span></p>
          )}
          {tradeMessage && <p className="text-green-500 mt-2">{tradeMessage}</p>}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
          <h2 className="text-xl font-bold mb-4">Market News</h2>
          <ul>
            {fakeNews.map((news, index) => (
              <li key={index} className="mb-2">
                <span className="font-bold">{news.title}</span> - <span className="text-gray-400">{news.source}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8 transition-transform duration-300 hover:scale-105">
          <h2 className="text-xl font-bold mb-4">XP Points</h2>
          <p className="text-2xl text-yellow-400 animate-pulse">{xp} XP</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8 transition-transform duration-300 hover:scale-105">
          <h2 className="text-xl font-bold mb-4">Feedback</h2>
          <form onSubmit={handleFeedback} className="flex flex-col gap-4">
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="p-2 rounded bg-gray-700" placeholder="Share your feedback..." required />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Submit Feedback</button>
          </form>
        </div>
      </main>
    </div>
  );
} 