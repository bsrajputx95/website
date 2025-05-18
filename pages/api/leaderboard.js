import dbConnect from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const users = await User.find().select('name walletBalance portfolio');
    const leaderboard = users.map(user => {
      const totalValue = user.walletBalance + user.portfolio.reduce((acc, stock) => acc + stock.quantity * stock.averagePrice, 0);
      const roi = ((totalValue - 100000) / 100000) * 100; // Initial balance is ₹1,00,000
      return {
        name: user.name,
        walletBalance: user.walletBalance,
        portfolio: user.portfolio,
        totalValue,
        roi,
      };
    }).sort((a, b) => b.roi - a.roi);

    res.status(200).json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
} 