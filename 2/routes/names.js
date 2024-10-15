// routes/names.js

const express = require('express');
const router = express.Router();
const Name = require('../models/Name');

router.post('/', async (req, res) => {
  try {
    const newName = new Name({
      name: req.body.name
    });
    await newName.save();
    res.status(201).json({ message: 'Name stored successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
