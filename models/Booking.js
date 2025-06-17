const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address:    { type: String, required: true },
  date:       { type: Date, required: true },
  serviceType:{ type: String, required: true },
  status:     { type: String, default: 'pending' } // pending, confirmed, completed
});

module.exports = mongoose.model('Booking', bookingSchema);
