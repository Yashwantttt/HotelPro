require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const Room = require('./models/Room');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'HotelPro API' }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'That value is already in use.' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID or value.' });
  res.status(500).json({ message: 'Unexpected server error. Check the backend terminal.' });
});

const sampleRooms = [
  { name: 'The Garden Studio', type: 'Single', description: 'A calm, thoughtfully designed room with warm natural textures and everything needed for a restful stay.', pricePerNight: 2499, capacity: 1, imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85', amenities: ['Wi-Fi', 'Work desk', 'Breakfast'] },
  { name: 'City Double', type: 'Double', description: 'A bright, comfortable room for two with a soft lounge corner and a view over the city.', pricePerNight: 3499, capacity: 2, imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85', amenities: ['Wi-Fi', 'Air conditioning', 'Breakfast'] },
  { name: 'Signature Deluxe', type: 'Deluxe', description: 'Extra room to unwind, premium bedding, elegant finishes and a spacious modern bathroom.', pricePerNight: 5299, capacity: 3, imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85', amenities: ['Wi-Fi', 'King bed', 'Mini bar', 'Breakfast'] },
  { name: 'The Grand Suite', type: 'Suite', description: 'A generous suite with a separate sitting area, elevated comforts and space for a special occasion.', pricePerNight: 8999, capacity: 4, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85', amenities: ['Wi-Fi', 'Living area', 'King bed', 'Breakfast'] }
];

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro');
    console.log('MongoDB connected');
    if (await Room.countDocuments() === 0) {
      await Room.insertMany(sampleRooms);
      console.log('Sample rooms inserted');
    }
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`HotelPro API listening on http://localhost:${port}`));
  } catch (err) {
    console.error('Could not start server:', err.message);
    process.exit(1);
  }
}
start();
