// models/Coupon.js

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  Coupon: {
    type: String,
    required: true,
    unique: true // Ensures uniqueness
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
