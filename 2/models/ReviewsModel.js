const mongoose = require("mongoose");

// Define the schema for the Name model
const ReviewsSchema = new mongoose.Schema({
  name: {
    type: String,
   
  },
  rating: {
    type: Number,
    default: 0
  }, 
  comment: {
    type: String,
    required: true,
  },
  image: String
});

// Create the Mongoose model for the Name collection
const ReviewsModel = mongoose.model('Reviews', ReviewsSchema);

module.exports = ReviewsModel;
