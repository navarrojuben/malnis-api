const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true, trim: true },  // Added contact number
  serviceType: { type: String, required: true },
  notes: { type: String, trim: true }, // Changed from description to notes
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  date: { type: String, required: true }, // Keep as String if you're storing `YYYY-MM-DD`
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
