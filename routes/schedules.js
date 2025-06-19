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
      contactNumber,   // Added contactNumber here
      date,
      time,
      serviceType,
      notes,
      latitude,
      longitude,
    } = req.body;

    // Debug log to see incoming request
    console.log('📦 Incoming schedule:', req.body);

    // Validate required fields including contactNumber
    if (
      !name ||
      !address ||
      !contactNumber ||      // Validate contactNumber
      !date ||
      !time ||
      !serviceType ||
      typeof latitude !== 'number' ||
      typeof longitude !== 'number'
    ) {
      return res.status(400).json({ message: 'Missing or invalid required fields.' });
    }

    const schedule = new Schedule({
      name,
      address,
      contactNumber,   // Save contactNumber
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

// Apply authentication middleware for all routes below (admin-only)
router.use(authMiddleware);

// Admin-only routes:

// Get all schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get schedule by ID
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update schedule by ID
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

// Delete schedule by ID
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
