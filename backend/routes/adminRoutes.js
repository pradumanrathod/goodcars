//allow admin users to approve or reject a dealer
//admin sends a request with: dealerid , status:"approve " or "rejected"

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/authMiddleware');

const prisma = new PrismaClient();
const router = express.Router();

// Admin route to verify or reject dealers
router.put('/verify-dealer', verifyToken, async (req, res) => {
  const { dealerId, status } = req.body;

  // ✅ Only 'approved' or 'rejected' allowed
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // Check if requester is an ADMIN
    const requestingUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (requestingUser.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    // Update dealer verification status
    const updatedDealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: { verificationStatus: status }
    });

    res.json({ message: `Dealer ${status}`, dealer: updatedDealer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update dealer status' });
  }
});

// PATCH /api/verify-dealer
//accept dealerId in req, set the dealers verificationStatus to verified, allow users with role:ADMIN
router.patch('/verify-dealer', verifyToken, async (req, res) => {
  const { dealerId } = req.body;

  // Only admins allowed
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied: Admins only' });
  }

  try {
    const updatedDealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: { verificationStatus: 'verified' },
    });

    res.json({ message: 'Dealer verified successfully ✅', dealer: updatedDealer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify dealer' });
  }
});


module.exports = router;
