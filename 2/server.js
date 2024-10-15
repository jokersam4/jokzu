  const express = require('express');
  const mongoose = require('mongoose');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const multer = require('multer');
  const cookieParser = require('cookie-parser');
  const path = require('path');
  require('dotenv').config();
  const Command = require('./models/Command');
  const userRoutes = require('./routes/userRoutes'); // Assuming routes for users
  const commandRoutes = require('./routes/userRoutes');
  const promoRoutes = require('./routes/userRoutes');
  const Promo = require('./models/Promo');
  const app = express();
  const port = process.env.PORT || 5000;

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use('/api/commands', commandRoutes); 
  app.use('/uploads', express.static('uploads'));
  app.use(cookieParser());
  // Multer setup for file uploads

  app.use(userRoutes);

  app.get('/api/coupon', (req, res) => {
    try {
      const { promoCode } = req.params;
      if (Coupon === promoCode ) {
        return res.status(200).json({ exists: true });
      } else {
        return res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error('Error fetching coupon:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Connect to MongoDB
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  mongoose.connection.once('open', () => {
      console.log('Connected to MongoDB');
  });

  mongoose.connection.on('error', (error) => {
      console.log(`MongoDB Connection Error: ${error}`);
  });

  // Review Schema
  const reviewSchema = new mongoose.Schema({
      name: String,
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      image: String
  }, { timestamps: true });

  const Review = mongoose.model('Review', reviewSchema);

  // Routes










  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  app.post('/api/reviews', upload.single('image'), async (req, res) => {
    try {
        const { name, rating, comment } = req.body;
        const image = req.file ? req.file.filename : null;

        // Save the review to the database
        // Assuming you have a Review model
        const newReview = new Review({
            name,
            rating,
            comment,
            image
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ error: 'Failed to save review' });
    }
  });

  // Serve the uploaded images statically
  app.use('/uploads', express.static('uploads'));

















  app.post('/api/coupons/validate', async (req, res) => {
      const { code } = req.body;
    
      try {
        const promo = await Promo.findOne({ code });
    
        if (!promo) {
          return res.status(404).json({ message: 'Promo code not found' });
        }
    
        const usageCount = await Command.countDocuments({ promoCode: code });
        const discount = promo.discount;
    
        res.json({ discount, usageCount });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
  });

  app.get('/api/getreviews', async (req, res) => {
      try {
          const reviews = await Review.find().sort({ createdAt: -1 });
          res.json(reviews);
      } catch (error) {
          console.error('Error fetching reviews:', error);
          res.status(500).json({ msg: 'Server error' });
      }
  });

  app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
  });