import dbConnect from '../../lib/mongodb';
import Trade from '../../models/Trade';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import { getLivePrice } from '../../lib/stockApi';

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
  await dbConnect();

  if (req.method === 'GET') {
    // Fetch all trades for the logged-in user
    try {
      const trades = await Trade.find({ userId: decoded.id }).sort({ timestamp: -1 });
      return res.status(200).json({ trades });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching trades', error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    // Delete a trade by ID (tradeId in query)
    const { tradeId } = req.query;
    if (!tradeId) {
      return res.status(400).json({ message: 'No trade ID provided' });
    }
    try {
      const trade = await Trade.findOne({ _id: tradeId, userId: decoded.id });
      if (!trade) {
        return res.status(404).json({ message: 'Trade not found' });
      }
      await trade.deleteOne();
      return res.status(200).json({ message: 'Trade deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting trade', error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { stockSymbol, quantity, type } = req.body;
    // Fetch live price
    let price;
    try {
      price = await getLivePrice(stockSymbol);
    } catch (err) {
      return res.status(400).json({ message: 'Could not fetch live price for this symbol.' });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Check if user has enough balance for buy
    if (type === 'buy' && user.walletBalance < quantity * price) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    // Update wallet balance
    if (type === 'buy') {
      user.walletBalance -= quantity * price;
    } else {
      user.walletBalance += quantity * price;
    }
    // Update portfolio
    const stockIndex = user.portfolio.findIndex(s => s.stockSymbol === stockSymbol);
    if (stockIndex === -1) {
      user.portfolio.push({ stockSymbol, quantity, averagePrice: price });
    } else {
      const stock = user.portfolio[stockIndex];
      if (type === 'buy') {
        stock.quantity += quantity;
        stock.averagePrice = (stock.averagePrice * (stock.quantity - quantity) + price * quantity) / stock.quantity;
      } else {
        stock.quantity -= quantity;
        if (stock.quantity === 0) {
          user.portfolio.splice(stockIndex, 1);
        }
      }
    }
    await user.save();
    // Create trade record
    const trade = await Trade.create({
      userId: user._id,
      stockSymbol,
      quantity,
      price,
      type,
    });
    res.status(201).json({ message: 'Trade executed successfully', trade });
  }
} 