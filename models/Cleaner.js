const mongoose = require('mongoose');

const cleanerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: { type: String },
    img: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cleaner', cleanerSchema);
