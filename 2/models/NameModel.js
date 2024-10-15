const mongoose = require("mongoose");

// Define the schema for the Name model
const NameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  }, 
  testers: {
    type: String,
    
  },
   status: {
    type: String,
    
  },
  date: {
    type: Date,
    default: Date.now // Set the default value to the current date and time
  }
});

// Create the Mongoose model for the Name collection
const NameModel = mongoose.model('Name', NameSchema);

module.exports = NameModel;
