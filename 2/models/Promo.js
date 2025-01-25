const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  codepromo2: {
    type: String,
    required: true,
    
  },
  codeusage: { type: Number 
   , default : 0,
  },
  earnings: { type: Number 
    , default : 0,
   },
}); // Adds createdAt and updatedAt fields automatically

const Promo = mongoose.model('Promo', promoSchema);

module.exports = Promo;
