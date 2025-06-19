const express = require('express');
const router = express.Router();
const Cleaner = require('../models/Cleaner');

// GET all cleaners
router.get('/', async (req, res) => {
  try {
    const cleaners = await Cleaner.find().sort({ createdAt: -1 });
    res.json(cleaners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cleaners' });
  }
});

// POST a new cleaner
router.post('/', async (req, res) => {
  try {
    const newCleaner = await Cleaner.create(req.body);
    res.status(201).json(newCleaner);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create cleaner' });
  }
});

// PATCH a cleaner
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Cleaner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update cleaner' });
  }
});

// DELETE a cleaner
router.delete('/:id', async (req, res) => {
  try {
    await Cleaner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cleaner deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete cleaner' });
  }
});

module.exports = router;
