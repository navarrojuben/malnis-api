const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Schedule = require('../models/Schedule');

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


// ✅ NEW: GET /schedules/availability - Get available time slots per date
router.get('/availability', async (req, res) => {
  try {
    const schedules = await Schedule.find({}, 'date time');

    const timeSlots = ['07:00 AM - 12:00 NN', '01:00 PM - 06:00 PM'];
    const availabilityMap = {};

    for (const sched of schedules) {
      if (!availabilityMap[sched.date]) {
        availabilityMap[sched.date] = new Set();
      }
      availabilityMap[sched.date].add(sched.time);
    }

    const response = {};

    Object.keys(availabilityMap).forEach((date) => {
      const taken = availabilityMap[date];
      const available = timeSlots.filter(slot => !taken.has(slot));
      response[date] = available;
    });

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
