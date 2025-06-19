const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    duration: { type: String },
    img: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
