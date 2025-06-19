const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  // Site Identity
  siteName: {
    type: String,
    required: true,
    default: "Mal'nis",
  },
  logoUrl: {
    type: String,
    default: '',
  },

  // Hero Section
  heroTitle: {
    type: String,
    required: true,
    default: "Welcome to Mal'nis",
  },
  heroSubtitle: {
    type: String,
    required: true,
    default: "Fast and easy scheduling for your cleaning needs.",
  },

  // Contact Info
  phone: {
    type: String,
    required: true,
    default: '+63 912 345 6789',
  },
  email: {
    type: String,
    required: true,
    default: 'support@cleansched.com',
  },
  address: {
    type: String,
    required: true,
    default: '123 Clean Street, Makati City, Philippines',
  },

  // Social Links
  facebook: {
    type: String,
    default: 'https://facebook.com',
  },
  instagram: {
    type: String,
    default: 'https://instagram.com',
  },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
