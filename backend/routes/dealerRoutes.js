// routes/dealerRoutes.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/authMiddleware');

const prisma = new PrismaClient();
const router = express.Router();

// 🚗 Register as Dealer (linked to logged-in user)
router.post('/dealer/register', verifyToken, async (req, res) => {
  const { licenseNumber } = req.body;
  console.log("licenseNumber from body", licenseNumber);
  console.log("authenticated user id: ", req.user.id);

  try {
    // Check if user is already a dealer
    const existingDealer = await prisma.dealer.findUnique({
      where: { userId: req.user.id }
    });

    if (existingDealer) {
      console.log("⚠️ Dealer already exists");
      return res.status(400).json({ error: 'User is already registered as a dealer' });
    }

    // Create dealer entry
    const dealer = await prisma.dealer.create({
      data: {
        userId: req.user.id,
        licenseNumber,
        verificationStatus: 'PENDING' // admin will verify
      }
    });

    // Update user's role to DEALER
    await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'DEALER' }
    });

    res.status(201).json({ message: 'Dealer registered successfully', dealer });

  } catch (error) {
    console.error('❌ Dealer registration error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Failed to register as dealer' });
  }
});



module.exports = router;
