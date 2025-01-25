const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  codepromo: { type: String},
}, { timestamps: true });

module.exports = mongoose.model('Command', commandSchema);
