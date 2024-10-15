
const { Router } = require("express");
const route = Router();
const bodyParser = require('body-parser');
require('dotenv').config();
const auth = require("../middlewares/auth");
const Promo = require('../models/Promo');

const cors = require('cors');
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
route.use(cors());

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
route.post("/api/addName", userController.appname );
route.get("/api/getAppNames", userController.getAppNames);

 route.post("/api/coupon", userController.coupon );

route.patch('/api/updateCredit', auth , ); 



// Route to create a new command
route.post('/api/commands', async (req, res) => {
  const { size, quantity, name, phoneNumber } = req.body;

  const newCommand = new Command({ size, quantity, name, phoneNumber });

  try {
    const savedCommand = await newCommand.save();
    var mailOptions = {
      from: 'elaaboudi.anas1@gmail.com',
      to: 'elaaboudi.anas1@gmail.com',
      subject: 'New Command Submitted',
      text: `A new command has been submitted.\n\nSize: ${size}\nQuantity: ${quantity}\nName: ${name}\nPhone Number: ${phoneNumber}`,
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
