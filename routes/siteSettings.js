const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const authMiddleware = require('../middleware/authMiddleware');

// GET /settings - Get current site settings (create default if none exists)
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();

    if (!settings) {
      // Automatically create with default values
      settings = await SiteSettings.create({});
    }

    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

// PATCH /settings - Update site settings (admin only)
router.patch('/', authMiddleware, async (req, res) => {
  try {
    const allowedFields = [
      'siteName',
      'logoUrl',
      'heroTitle',
      'heroSubtitle',
      'phone',
      'email',
      'address',
      'facebook',
      'instagram'
    ];

    // Sanitize input: only allow known fields
    const updates = {};
    allowedFields.forEach(field => {
      if (field in req.body) updates[field] = req.body[field];
    });

    const updated = await SiteSettings.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update site settings' });
  }
});

module.exports = router;
