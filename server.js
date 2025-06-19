const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const authMiddleware = require('./middleware/authMiddleware');
const Schedule = require('./models/Schedule'); // ⬅️ needed for cleanup

dotenv.config();
const app = express();

const allowedOrigins = ['https://malnis.netlify.app', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy does not allow access from origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🧹 Cleanup past schedules on startup
const cleanUpOldSchedules = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // e.g. '2025-06-19'
    const result = await Schedule.deleteMany({ date: { $lt: today } });
    console.log(`🧹 Deleted ${result.deletedCount} past schedules`);
  } catch (err) {
    console.error('❌ Schedule cleanup failed:', err.message);
  }
};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('✅ MongoDB connected');
    await cleanUpOldSchedules(); // Clean past schedules
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Login route (public)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const isValid =
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD;

  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.json({ token });
});

// API Routes
app.use('/schedules', require('./routes/schedules')); // handles auth inside
app.use('/settings', require('./routes/siteSettings'));
app.use('/services', require('./routes/serviceRoutes'));
app.use('/cleaners', require('./routes/cleanerRoutes'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
