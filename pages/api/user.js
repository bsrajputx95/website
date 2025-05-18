import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await dbConnect();
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await dbConnect();
      const { name, password } = req.body;
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (name) user.name = name;
      if (password) user.password = await bcrypt.hash(password, 10);
      await user.save();
      res.status(200).json({ message: 'Profile updated' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 