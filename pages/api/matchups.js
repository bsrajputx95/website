import dbConnect from '../../lib/mongodb';
import Matchup from '../../models/Matchup';
import User from '../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();
      const matchups = await Matchup.find().populate('participants', 'name').populate('winner', 'name');
      res.status(200).json({ matchups });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching matchups', error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await dbConnect();

      const { title, startDate, endDate } = req.body;

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const matchup = await Matchup.create({
        title,
        startDate,
        endDate,
        participants: [user._id],
      });

      res.status(201).json({ message: 'Matchup created successfully', matchup });
    } catch (error) {
      res.status(500).json({ message: 'Error creating matchup', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 