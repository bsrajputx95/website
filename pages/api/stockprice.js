import { getLivePrice } from '../../lib/stockApi';

export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ message: 'No symbol provided' });
  }
  try {
    const price = await getLivePrice(symbol);
    res.status(200).json({ price });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
} 