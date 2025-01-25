
const { Router } = require("express");
const route = Router();
const bodyParser = require('body-parser');
require('dotenv').config();
const auth = require("../middlewares/auth");
const Promo = require('../models/Promo');
const User = require("../models/userModel");

const userController = require("../controllers/userController");
const Command = require('../models/Command');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'elaaboudi.anas1@gmail.com',
    pass: 'blxm aara jzne ogza'
  }
});
route.use(bodyParser.json());


route.post("/api/auth/register", userController.register);
route.post("/api/auth/activation", userController.activate);
route.post("/api/auth/signing", userController.signing);
route.post("/api/auth/access", userController.access);
route.post("/api/auth/forgot_pass", userController.forgot);
route.post("/api/auth/reset_pass", auth, userController.reset);
route.get("/api/auth/user", auth, userController.info);
route.patch("/api/auth/user_update", auth, userController.update);
route.get("/api/auth/signout", userController.signout);
route.post("/api/auth/google_signing", userController.google);
route.post("/api/addName", userController.appname);
route.get("/api/getAppNames", userController.getAppNames);


route.get("/api/current", auth, userController.getCurrentUser);
route.patch('/api/codepromo2', async (req, res) => {
  const { code } = req.body;

  try {
    const promo = await Promo.findOneAndUpdate(
      { codepromo2: code },
      { $inc: { codeusage: 1 } },
      { new: true } // Return the updated document
    );

    if (!promo) {
      return res.status(404).json({ message: 'Promo code not found.' });
    }

    res.json({
      success: true,
      message: 'Promo code usage incremented successfully.',
      promo,
    });
  } catch (error) {
    console.error('Error incrementing promo code usage:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

route.post("/api/codepromo", userController.pcodepromo);
route.get("/api/codepromo", userController.gcodepromo);
route.post('/api/codepromo2', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Promo code is required" });
  }

  try {
    // Query the database for the promo code
    const promo = await Promo.findOne({ codepromo2: code });

    if (promo) {
      return res.status(200).json({ valid: true, message: "Promo code is valid" });
    } else {
      return res.status(404).json({ valid: false, message: "Promo code does not exist" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});
route.patch("/api/codepromo", async (req, res) => {
  try {
    // Log request body
    console.log("Request received with body:", req.body);

    const { coda, codepromo2 } = req.body;

    // Log extracted variables
    console.log("Extracted coda:", coda);
    console.log("Extracted codepromo2:", codepromo2);

    if (!coda || !codepromo2) {
      return res.status(400).json({ msg: "Missing required fields: 'coda' or 'codepromo2'" });
    }

    // Update operation
    const result = await Promo.findOneAndUpdate({ codepromo2: coda }, { codepromo2 });

    if (!result) {
      console.log("No matching user found to update.");
      return res.status(404).json({ msg: "No matching user found." });
    }

    // Log the result of the update operation
    console.log("Update operation result:", result);

    // Success response
    res.status(200).json({ msg: "Update success." });
  } catch (err) {
    // Log the error
    console.error("Error occurred:", err);

    // Error response
    res.status(500).json({ msg: err.message });
  }
});






route.patch('/api/updateCredit', auth, userController.updatecredit);



// Route to create a new command
route.post('/api/commands', async (req, res) => {
  const { size, quantity, name, phoneNumber, codepromo } = req.body;

  const newCommand = new Command({ size, quantity, name, phoneNumber, codepromo });

  try {
    const savedCommand = await newCommand.save();
    var mailOptions = {
      from: 'elaaboudi.anas1@gmail.com',
      to: 'elaaboudi.anas1@gmail.com',
      subject: 'New Command Submitted',
      text: `A new command has been submitted.\n\nSize: ${size}\nQuantity: ${quantity}\nName: ${name}\nPhone Number: ${phoneNumber}\ncode promo :${codepromo}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.status(201).json(savedCommand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = route;
