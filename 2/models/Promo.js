// models/Promo.js
const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true }, // percentage discount
    expirationDate: { type: Date, required: true },
    usageCount: { type: Number, default: 0 }, // Track the number of times the promo has been used
});

const Promo = mongoose.model('Promo', promoSchema);

module.exports = Promo;
