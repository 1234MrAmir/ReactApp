const express = require("express");
const User = require("../models/User");
const router = express.Router();
// i have use v 6.12.0 for the validation use by the express-validator
const { body, validationResult } = require('express-validator');
// bcrypt js is a npm package for using the hasshing password 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "AmirkhanWithAngle1234";
const fetchUser = require('../middleware/fetchUser')


// ROUTE 1: Create a User using: POST "api/auth/createuser" (No login required)
router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password should be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  let success = false;
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }

        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ success, error: 'Sorry, a user with this email already exists' });
        }
         
        // this coding is using for the adding salt and hash in our password which password will we secure and save in the pattern of the string.
        const salt =  bcrypt.genSaltSync(10);
        const secPassword =  await bcrypt.hash(req.body.password, salt);
           // Create the user
        const newUser = new User({ 
            name: req.body.name, 
            email: req.body.email,
            password: secPassword, 
        });

        await newUser.save();
        
        // this coding is for the jwt(jason webtoken)
        const data = {
          user:{
            id: User.id
          }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        console.log(authToken); //---- end jwt coding)

        // by this method we are sending the request in our database
        // res.json(newUser); 
        success = true;
        res.json({success, authToken})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal sever error' });
    }
});


// ROUTE 2: Authenticate a User using: POST "api/auth/login" (No login required)
router.post('/login', [
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Password should be at least 5 characters').exists(),
], async (req, res) => {
  let success = false
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ success, error: "Please try to login with correct credentials" }); // Changed "req" to "res"
    }
    // Comparing email and password
    const passwordCompare = await bcrypt.compare(password, existingUser.password);
    if (!passwordCompare) {
      return res.status(400).json({ success, error: "Please try to login with correct credentials" }); // Changed "req" to "res"
    }
    const data = {
      user: {
        id: existingUser.id // Fixed variable name "User" to "existingUser"
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true
    res.json({success, authToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' }); // Fixed the spelling of "server"
  }
});

// ROUTE 1: Get Logged in User details: POST "api/auth/getuser" (login required)
router.post('/getuser', fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
 