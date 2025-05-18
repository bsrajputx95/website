import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Challenges() {
  const [matchups, setMatchups] = useState([]);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchMatchups = async () => {
      try {
        const res = await fetch('/api/matchups');
        const data = await res.json();
        if (res.ok) {
          setMatchups(data.matchups);
        }
      } catch (err) {
        console.error('Error fetching matchups:', err);
      }
    };

    fetchMatchups();
  }, []);

  const handleCreateMatchup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/matchups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, startDate, endDate }),
      });
      const data = await res.json();
      if (res.ok) {
        setMatchups([...matchups, data.matchup]);
        setTitle('');
        setStartDate('');
        setEndDate('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Weekly Challenges - StockVerse</title>
      </Head>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Weekly Challenges</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Create a Challenge</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleCreateMatchup}>
              <div className="mb-4">
                <label className="block mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                Create Challenge
              </button>
            </form>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Active Challenges</h2>
            {matchups.length === 0 ? (
              <p>No active challenges.</p>
            ) : (
              <ul>
                {matchups.map((matchup) => (
                  <li key={matchup._id} className="mb-4 p-4 bg-gray-700 rounded">
                    <h3 className="font-bold">{matchup.title}</h3>
                    <p>Start: {new Date(matchup.startDate).toLocaleDateString()}</p>
                    <p>End: {new Date(matchup.endDate).toLocaleDateString()}</p>
                    <p>Participants: {matchup.participants.length}</p>
                    {matchup.winner && <p>Winner: {matchup.winner.name}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 