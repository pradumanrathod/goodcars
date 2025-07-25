const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const app = express();
const prisma = new PrismaClient();
app.use(express.static('public'));

app.use(cors());
app.use(express.json());
const dealerRoutes=require('./routes/dealerRoutes');
app.use('/api', dealerRoutes);
const verifyToken = require('./middleware/authMiddleware'); //verifytoken is our middleware, checks jwt token b4 running the route ,
// token valid= user can access /ursers

const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes); // cleaner ✅


// Test route
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});


//test for prisma
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany(); // Fetch all users
    res.json(users);
  } catch (error) {
    console.error('❌ Prisma Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});




const adminRoutes = require('./routes/adminRoutes');
app.use('/api', adminRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
