const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/authMiddleware');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Test route to check if authRoutes is working
router.get('/test', (req, res) => {
  res.send('Auth route is working ✅');
});

// ✅ Register new user
router.post('/register', async (req, res) => {

  console.log("Received Body:", req.body); // Add this line
  const { name, email, phone, password } = req.body;

  try {
    // check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    console.log("Existing User:", existingUser);
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // save new user to database
    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword },
    });

    res.status(201).json({ message: 'User registered successfully', user });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ✅ Login user and return JWT token
// JWT is like an entry pass you get when you log in.
// You log in to an app → the app gives you a token (a secret code),
// Every time you do something (like view profile, access dashboard), you send that token,
// The app checks the token to know “Yes, this person is logged in”.

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    // create and send JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ✅ Get user details using token
// Use the token to identify the user
// Fetch and return only that user’s info
// Useful for showing “My Profile” in the frontend

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ✅ Export the router
module.exports = router;
