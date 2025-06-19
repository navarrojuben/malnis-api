const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Schedule = require('../models/Schedule');

// Utility: get all dates between two dates inclusive, formatted YYYY-MM-DD
function getDatesBetween(startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Public route: Add a schedule (no authentication required)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      address,
      contactNumber,
      date,
      time,
      serviceType,
      notes,
      latitude,
      longitude,
    } = req.body;

    console.log('📦 Incoming schedule:', req.body);

    // Validate required fields
    if (
      !name ||
      !address ||
      !contactNumber ||
      !date ||
      !time ||
      !serviceType ||
      typeof latitude !== 'number' ||
      typeof longitude !== 'number'
    ) {
      return res.status(400).json({ message: 'Missing or invalid required fields.' });
    }

    // Prevent double booking for the same date/time
    const existing = await Schedule.findOne({ date, time });
    if (existing) {
      return res.status(409).json({ message: 'This time slot is already booked for that date.' });
    }

    const schedule = new Schedule({
      name,
      address,
      contactNumber,
      date,
      time,
      serviceType,
      notes,
      latitude,
      longitude,
    });

    const savedSchedule = await schedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    console.error('❌ Schedule save error:', error);
    res.status(400).json({ message: error.message });
  }
});

// ✅ NEW: GET /schedules/availability - Get available time slots per date (including dates with no bookings)
router.get('/availability', async (req, res) => {
  try {
    const schedules = await Schedule.find({}, 'date time');

    const timeSlots = ['07:00 AM - 12:00 NN', '01:00 PM - 06:00 PM'];

    // Build map: date -> Set of booked times
    const bookedMap = {};
    for (const sched of schedules) {
      if (!bookedMap[sched.date]) {
        bookedMap[sched.date] = new Set();
      }
      bookedMap[sched.date].add(sched.time);
    }

    // Define the date range for availability
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + 1); // tomorrow
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 2); // two months ahead

    const allDates = getDatesBetween(startDate, endDate);

    const response = {};

    for (const date of allDates) {
      const taken = bookedMap[date] || new Set();
      const available = timeSlots.filter(slot => !taken.has(slot));
      response[date] = available;
    }

    res.json(response);
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ message: 'Failed to fetch availability' });
  }
});

// ⛔ Removed: GET /schedules/dates (no longer needed)

// 🔐 Protected admin routes
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSchedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
