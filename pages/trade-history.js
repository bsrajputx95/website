import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const fetchTrades = async () => {
      try {
        const res = await fetch('/api/trades?user=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setTrades(data.trades);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch trades.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [router]);

  const handleDelete = async (tradeId) => {
    if (!window.confirm('Are you sure you want to delete this trade?')) return;
    setDeleting(tradeId);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/trades/${tradeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTrades(trades.filter(t => t._id !== tradeId));
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete trade.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Trade History - StockVerse</title>
      </Head>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Trade History</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : trades.length === 0 ? (
          <p>No trades found.</p>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-4 text-left">Stock</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Quantity</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(trade => (
                  <tr key={trade._id} className="border-t border-gray-700">
                    <td className="p-4">{trade.stockSymbol}</td>
                    <td className="p-4 capitalize">{trade.type}</td>
                    <td className="p-4">{trade.quantity}</td>
                    <td className="p-4">₹{trade.price}</td>
                    <td className="p-4">{new Date(trade.timestamp).toLocaleString()}</td>
                    <td className="p-4">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                        onClick={() => handleDelete(trade._id)}
                        disabled={deleting === trade._id}
                      >
                        {deleting === trade._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
} 