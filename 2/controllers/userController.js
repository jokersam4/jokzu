
const sendMail = require("../helpers/sendMail");
const createToken = require("../helpers/createToken");
const validateEmail = require("../helpers/validateEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { google } = require("googleapis");

const { OAuth2 } = google.auth;
const NameModel = require("../models/NameModel");
const ReviewsModel = require("../models/ReviewsModel");
const Promo = require('../models/Promo');






const userController = {








  register: async (req, res) => {
    try {

      const { name, email, password, userParam } = req.body;


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
      const url = `http://localhost:3000/api/auth/activate/${activation_token}/?user=${userParam || ''}`;
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

      // Log the incoming request data
      console.log("Received email:", email);
      console.log("Received password:", password);

      // Check if the email exists in the database
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found for email:", email);
        return res.status(400).json({ msg: "This email is not registered in our system." });
      }
      console.log("User found:", user);

      // Check if the password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Password mismatch for user:", email);
        return res.status(400).json({ msg: "This password is incorrect." });
      }
      console.log("Password matched for user:", email);

      // If email and password are correct, generate a refresh token
      console.log("Generating refresh token...");
      const rf_token = createToken.refresh({
        id: user._id,
        name: user.name,
        email: user.email,
      });
      console.log("Generated refresh token:", rf_token);

      // Set the refresh token as a HTTP-only cookie
      console.log("Setting refresh token in HTTP-only cookie...");
      res.cookie("_apprftoken", rf_token, {
        httpOnly: true,  // Prevent client-side access to the cookie
        secure: process.env.NODE_ENV === "production",  // Enable for production (HTTPS)
        sameSite: 'Strict',   // Can be 'Strict', 'Lax', or 'None'
        path: "/",  // Make sure it's accessible across the entire site
        maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days
      });
      
      console.log("Refresh token set in cookie.");

      // Send the refresh token back to the frontend along with a success message
      console.log("Sending response to frontend...");
      res.status(200).json({ msg: "Signing success", token: rf_token });
      console.log("Login successful, response sent.");

    } catch (err) {
      // Handle any errors that occur during the process
      console.error("Error during signing:", err.message);
      res.status(500).json({ msg: err.message });
    }
  },


  access: async (req, res) => {
    try {
      console.log("Received access request"); // Log when the function is triggered

      // Get the refresh token from cookies
      const rf_token = req.cookies._apprftoken;
      console.log("Refresh Token: ", rf_token);  // Log the refresh token received from cookies

      // If the refresh token is not present, return a 400 error
      if (!rf_token) {
        console.log("No refresh token found, returning error"); // Log if the token is not found
        return res.status(400).json({ msg: "Please sign in." });
      }

      // Verify the refresh token using the secret
      console.log("Verifying refresh token"); // Log before attempting verification
      jwt.verify(rf_token, process.env.REFRESH_TOKEN, (err, user) => {
        if (err) {
          console.log("Token verification failed:", err.message); // Log verification failure
          return res.status(400).json({ msg: "Please sign in again." });
        }

        console.log("Token verified successfully, user:", user); // Log successful verification

        // If verification is successful, create a new access token
        const ac_token = createToken.access({ id: user.id });
        console.log("New access token created:", ac_token); // Log the newly created access token

        // Send the new access token in the response
        return res.status(200).json({ ac_token });
      });

    } catch (err) {
      console.error("Error occurred in access function:", err.message); // Log any unexpected errors
      return res.status(500).json({ msg: err.message });
    }
  }
  ,
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
      // Log the incoming request user ID
      console.log("Incoming request for user info. User ID:", req.user.id);
  
      // Attempt to find the user by ID and exclude the password field
      const user = await User.findById(req.user.id).select("-password");
  
      // Log the user found or if not found
      if (user) {
        console.log("User found:", user);
      } else {
        console.log("User not found with ID:", req.user.id);
      }
  
      // Return the user data
      res.status(200).json(user);
    } catch (err) {
      // Log the error message
      console.error("Error fetching user info:", err.message);
      res.status(500).json({ msg: err.message });
    }
  },
  
  // updatecredit: async (req, res) => {
  //   try {

  //     const { codepromo } = req.body;

  //     await User.findOneAndUpdate({ _id: req.user.id }, { codepromo });
  //     // success
  //     res.status(200).json({ msg: "Update success6." });
  //   } catch (err) {
  //     res.status(500).json({ msg: err.message });
  //   }
  // },
  updatecredit: async (req, res) => {
    try {
      const { codepromo } = req.body;

      // Log the request body to see what was sent from the frontend
      console.log('Received request body:', req.body);

      // Check if the codepromo exists
      if (!codepromo) {
        console.log('No codepromo provided!');
        return res.status(400).json({ msg: "Promo code is required." });
      }

      console.log('Updating promo code to:', codepromo);

      // Update the user's codepromo field with the received value
      const user = await User.findOneAndUpdate({ _id: req.user.id }, { codepromo });

      // Log if the update was successful or not
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ msg: "User not found." });
      }

      // Success response
      console.log('Promo code updated successfully');
      res.status(200).json({ msg: "Promo code (or string) updated successfully." });
    } catch (err) {
      // Log the error to track it
      console.log('Error updating promo code:', err.message);
      res.status(500).json({ msg: err.message });
    }
  }

  ,
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
  getCurrentUser: async (req, res) => {
    try {
      // Fetch user information from the database using the ID from the token
      const user = await User.findById(req.user.id).select("-password"); // Exclude the password field

      if (!user) return res.status(404).json({ msg: "User not found." });

      // Return user information
      res.status(200).json(user);
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

      // Log the incoming tokenId
      console.log("Received tokenId:", tokenId);

      // Verify Token Id
      const client = new OAuth2(process.env.G_CLIENT_ID);
      const verify = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.G_CLIENT_ID,
      });

      const { email_verified, email, name, picture } = verify.payload;

      // Failed verification
      if (!email_verified) {
        console.log("Email verification failed for email:", email);
        return res.status(400).json({ msg: "Email verification failed." });
      }

      // Passed verification
      const user = await User.findOne({ email });

      // 1. If user exists / sign in
      if (user) {
        console.log("User found:", user.email);

        // Refresh token
        const rf_token = createToken.refresh({ id: user._id });
        console.log("Generated refresh token for user:", rf_token);  // Log for rf_token

        // Store cookie
        res.cookie("_apprftoken", rf_token, {
          httpOnly: true,  // Prevent client-side access to the cookie
          secure: process.env.NODE_ENV === "production",  // Enable for production (HTTPS)
          sameSite: "Strict",  // Security measure for cross-site requests
          path: "/",  // Make sure it's accessible across the entire site
          maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days
        });

        // Verify cookie was set (for debugging)
        if (req.cookies._apprftoken) {
          console.log("Refresh token successfully set in cookie for user:", user.email);
        } else {
          console.log("Failed to set refresh token in cookie for user:", user.email);
        }

        res.status(200).json({ msg: "Signing with Google success." });
      } else {
        // New user / create user
        console.log("New user detected, creating user for email:", email);
        const password = email + process.env.G_CLIENT_ID;
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
          name,
          email,
          password: hashPassword,
          avatar: picture,
          codepromo: "",
        });
        await newUser.save();
        console.log("New user created:", newUser.email);

        // Sign in the user
        // Refresh token
        const rf_token = createToken.refresh({ id: newUser._id });
        console.log("Generated refresh token for new user:", rf_token);  // Log for rf_token

        // Store cookie
        res.cookie("_apprftoken", rf_token, {
          httpOnly: true,  // Prevent client-side access to the cookie
          secure: process.env.NODE_ENV === "production",  // Enable for production (HTTPS)
          sameSite: "Strict",  // Security measure for cross-site requests
          path: "/",  // Make sure it's accessible across the entire site
          maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days
        });

        // Verify cookie was set (for debugging)
        if (req.cookies._apprftoken) {
          console.log("Refresh token successfully set in cookie for new user:", newUser.email);
        } else {
          console.log("Failed to set refresh token in cookie for new user:", newUser.email);
        }

        // Success
        res.status(200).json({ msg: "Signing with Google success." });
      }
    } catch (err) {
      console.error("Error during Google sign-in:", err.message);
      res.status(500).json({ msg: err.message });
    }
  },

  pcodepromo: async (req, res) => {


    try {
      const { codepromo2 } = req.body;
      // Allow null codepromo or proceed without validation
      // If you don't want any validation on the promo code, you can leave this out
      // if (!codepromo) {
      //   return res.status(400).json({ error: 'Promo code is required' });
      // }

      // Create a new promo document (can be null or valid)
      const newCode = new Promo({ codepromo2 });
      await newCode.save();

      // Respond with the created document
      res.status(201).json({ message: 'Promo code added successfully', data: newCode });
    } catch (error) {
      console.error('Error:', error);

      // Handle duplicate key error for null values
      if (error.code === 11000 && error.keyValue.codepromo === null) {
        return res.status(400).json({ error: 'Promo code cannot be null when it already exists' });
      }

      res.status(500).json({ error: 'Server error' });
    }
  },

  patchcodepromo: async (req, res) => {
    try {
      const { codepromo2 } = req.body;

      // Log the request body to see what was sent from the frontend


      // Check if the codepromo exists
      if (!codepromo) {
        console.log('No codepromo provided!');
        return res.status(400).json({ msg: "Promo code is required." });
      }

      console.log('Updating promo code to:', codepromo);

      // Update the user's codepromo field with the received value
      const user = await User.findOneAndUpdate({ codepromo2: codepromo }, { codepromo2 });

      // Log if the update was successful or not
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ msg: "User not found." });
      }

      // Success response
      console.log('Promo code updated successfully');
      res.status(200).json({ msg: "Promo code (or string) updated successfully." });
    } catch (err) {
      // Log the error to track it
      console.log('Error updating promo code:', err.message);
      res.status(500).json({ msg: err.message });
    }
  },


  gcodepromo: async (req, res) => {
    try {


      // Fetch all app names from the database
      const Codes = await Promo.find({});
      // Log the fetched app names

      // Respond with the app names
      res.status(200).json(Codes);
    } catch (error) {
      console.error('Error:', error);
      // Respond with error message
      res.status(500).json({ error: 'Server error' });
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