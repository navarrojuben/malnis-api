const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');

const protect = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my', protect, getUserBookings);
router.get('/all', protect, getAllBookings); // admin-only check to be added later
router.put('/:id', protect, updateBookingStatus);

module.exports = router;
