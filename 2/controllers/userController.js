
const sendMail = require("../helpers/sendMail");
const createToken = require("../helpers/createToken");
const validateEmail = require("../helpers/validateEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { google } = require("googleapis");
const Couponmodel = require('../models/Coupon');
const { OAuth2 } = google.auth;
const NameModel = require("../models/NameModel");
const ReviewsModel = require("../models/ReviewsModel");
const Promo = require('../models/Promo');






const userController = {








  register: async (req, res) => {
    try {

      const { name, email, password } = req.body;

      // check fields
      if (!name || !email || !password)
        return res.status(400).json({ msg: "Please fill in all fields." });

      // check email
      if (!validateEmail(email))
        return res
          .status(400)
          .json({ msg: "Please enter a valid email address." });

      // check user
      const user = await User.findOne({ email });
      if (user)
        return res
          .status(400)
          .json({ msg: "This email is already registered in our system." });

      // check password
      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." });

      // hash password
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);

      // create token
      const newUser = { name, email, password: hashPassword };
      const activation_token = createToken.activation(newUser);

      // send email
      const url = `http://localhost:3000/api/auth/activate/${activation_token}`;
      sendMail.sendEmailRegister(email, url, "Verify your email");

      // registration success
      res.status(200).json({ msg: "Welcome! Please check your email." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  activate: async (req, res) => {
    try {

      const { activation_token } = req.body;

      // verify token
      const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN);
      const { name, email, password } = user;

      // check user
      const check = await User.findOne({ email });
      if (check)
        return res
          .status(400)
          .json({ msg: "This email is already registered." });

      // add user
      const newUser = new User({
        name,
        email,
        password,

      });
      await newUser.save();

      // activation success
      res
        .status(200)
        .json({ msg: "Your account has been activated, you can now sign in." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  signing: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if the email exists in the database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "This email is not registered in our system." });
      }

      // Check if the password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "This password is incorrect." });
      }

      // If email and password are correct, generate a refresh token
      const rf_token = createToken.refresh({ id: user._id });

      // Set the refresh token as a HTTP-only cookie
      res.cookie("_apprftoken", rf_token, {
        httpOnly: true,
        path: "/api/auth/access",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      });

      // Send the refresh token back to the frontend along with a success message
      // Backend response
      res.status(200).json({ msg: "Signing success", token: rf_token });


    } catch (err) {
      // Handle any errors that occur during the process
      res.status(500).json({ msg: err.message });
    }
  },
  access: async (req, res) => {
    try {
      // rf token
      const rf_token = req.cookies._apprftoken;
      console.log("aaaaaa" + rf_token)
      if (!rf_token) return res.status(400).json({ msg: "Please sign in." });

      // validate
      jwt.verify(rf_token, process.env.REFRESH_TOKEN, (err, user) => {
        if (err) return res.status(400).json({ msg: "Please sign in again." });
        // create access token
        const ac_token = createToken.access({ id: user.id });
        // access success
        return res.status(200).json({ ac_token });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  forgot: async (req, res) => {
    try {

      const { email } = req.body;

      // check email
      const user = await User.findOne({ email });
      if (!user)
        return res
          .status(400)
          .json({ msg: "This email is not registered in our system." });

      // create ac token
      const ac_token = createToken.access({ id: user.id });

      // send email
      const url = `http://localhost:3000/auth/reset-password/${ac_token}`;
      const name = user.name;
      sendMail.sendEmailReset(email, url, "Reset your password", name);

      // success
      res
        .status(200)
        .json({ msg: "Re-send the password, please check your email." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  reset: async (req, res) => {
    try {

      const { password } = req.body;

      // hash password
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);

      // update password
      await User.findOneAndUpdate(
        { _id: req.user.id },
        { password: hashPassword }
      );

      // reset success
      res.status(200).json({ msg: "Password was updated successfully." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  info: async (req, res) => {
    try {

      const user = await User.findById(req.user.id).select("-password");
      // return user
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  updatecredit: async (req, res) => {
    try {

      const { credit } = req.body;

      await User.findOneAndUpdate({ _id: req.user.id }, { credit });
      // success
      res.status(200).json({ msg: "Update success6." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  update: async (req, res) => {
    try {

      const { name, avatar } = req.body;

      // update
      await User.findOneAndUpdate({ _id: req.user.id }, { name, avatar });
      // success
      res.status(200).json({ msg: "Update success." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  signout: async (req, res) => {
    try {
      // clear cookie
      res.clearCookie("_apprftoken", { path: "/api/auth/access" });
      // success
      return res.status(200).json({ msg: "Signout success." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  google: async (req, res) => {
    try {

      const { tokenId } = req.body;

      // verify Token Id
      const client = new OAuth2(process.env.G_CLIENT_ID);
      const verify = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.G_CLIENT_ID,

      });


      const { email_verified, email, name, picture } = verify.payload;

      // failed verification
      if (!email_verified)
        return res.status(400).json({ msg: "Email verification failed." });

      // passed verification
      const user = await User.findOne({ email });
      // 1. If user exist / sign in
      if (user) {
        // refresh token
        const rf_token = createToken.refresh({ id: user._id });
        // store cookie
        res.cookie("_apprftoken", rf_token, {
          httpOnly: true,
          path: "/api/auth/access",
          maxAge: 24 * 60 * 60 * 1000, // 24hrs
        });
        res.status(200).json({ msg: "Signing with Google success." });
      } else {
        // new user / create user
        const password = email + process.env.G_CLIENT_ID;
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
          name,
          email,
          password: hashPassword,
          avatar: picture,
          credit: 0
        });
        await newUser.save();
        // sign in the user
        // refresh token
        const rf_token = createToken.refresh({ id: newUser._id }); // <-- corrected to newUser._id
        // store cookie
        res.cookie("_apprftoken", rf_token, {
          httpOnly: true,
          path: "/api/auth/access",
          maxAge: 24 * 60 * 60 * 1000, // 24hrs
        });
        // success
        res.status(200).json({ msg: "Signing with Google success." });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },


  appname: async (req, res) => {
    const { name, email, date, status, testers } = req.body; // Changed from user to userId

    try {
      // Create a new document with the received name and userId
      const newName = new NameModel({ name, email, date, status, testers }); // Changed user to userId
      // Save the document to the database
      await newName.save();

      console.log('Email received:', email);
      // Respond with success message
      res.status(201).json({ message: 'Name added successfully' });
    } catch (error) {
      console.error('Error:', error);
      // Respond with error message
      res.status(500).json({ error: 'Server error' });
    }
  },
  reviews: async (req, res) => {
    const { name, rating, comment } = req.body; // Changed from user to userId

    try {
      // Create a new document with the received name and userId
      const newReview = new ReviewsModel({ name, rating, comment }); // Changed user to userId
      // Save the document to the database
      await newReview.save();


      // Respond with success message
      res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
      console.error('Error:', error);
      // Respond with error message
      res.status(500).json({ error: 'Server error' });
    }
  },
  coupon: async (req, res) => {
    const { Coupon } = req.body;

    try {
      // Create a new document with the received coupon
      const couponReview = new Couponmodel({ Coupon });

      // Save the document to the database
      await couponReview.save();

      // Respond with success message
      res.status(201).json({ message: 'Coupon added successfully' });
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error (Coupon already exists)
        return res.status(400).json({ error: 'Coupon already exists' });
      }
      console.error('Error:', error);
      // Respond with other server errors
      res.status(500).json({ error: 'Server error' });
    }
  },
  getReviews: async (req, res) => {
    try {


      // Fetch all app names from the database
      const myReviews = await ReviewsModel.find({});
      // Log the fetched app names

      // Respond with the app names
      res.status(200).json(myReviews);
    } catch (error) {
      console.error('Error:', error);
      // Respond with error message
      res.status(500).json({ error: 'Server error' });
    }
  },

  getAppNames: async (req, res) => {
    try {


      // Fetch all app names from the database
      const appNames = await NameModel.find({});
      // Log the fetched app names

      // Respond with the app names
      res.status(200).json(appNames);
    } catch (error) {
      console.error('Error:', error);
      // Respond with error message
      res.status(500).json({ error: 'Server error' });
    }
  },

  // postCountdown: async (req, res) => {
  //   try {
  //     const { expirationTime } = req.body;

  //     // Create new countdown document
  //     const countdown = new Countdown({ expirationTime });
  //     await countdown.save();

  //     res.status(201).json({ message: 'Countdown expiration time stored successfully' });
  //   } catch (error) {
  //     console.error('Error storing countdown expiration time:', error);
  //     res.status(500).json({ error: 'Server error' });
  //   }
  // },
  // getCountdown: async (req, res) => {
  //   try {
  //     // Find the most recent countdown document
  //     const countdown = await Countdown.findOne().sort({ _id: -1 });

  //     if (!countdown) {
  //       return res.status(404).json({ message: 'Countdown expiration time not found' });
  //     }

  //     res.status(200).json({ expirationTime: countdown.expirationTime });
  //   } catch (error) {
  //     console.error('Error retrieving countdown expiration time:', error);
  //     res.status(500).json({ error: 'Server error' });
  //   }
  // }




















  reviews: async (req, res) => {
    const { rating, comment } = req.body;
    const image = req.file ? req.file.path : null; // Changed from user to userId

    try {
      // Create a new document with the received name and userId
      const newReview = new ReviewsModel({ rating, comment, image }); // Changed user to userId
      // Save the document to the database
      await newReview.save();


      // Respond with success message
      res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
      console.error('Error:', error);
      // Respond with error message
      res.status(500).json({ error: 'Server error' });
    }
  },
  promo: async (req, res) => {
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
  },
  getReviews: async (req, res) => {
    try {


      // Fetch all app names from the database
      const myReviews = await ReviewsModel.find({});
      // Log the fetched app names

      // Respond with the app names
      res.status(200).json(myReviews);
    } catch (error) {
      console.error('Error:', error);
      // Respond with error message
      res.status(500).json({ error: 'Server error' });
    }
  },
}

module.exports = userController;