// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Simple welcome route
app.get('/', (req, res) => {
  res.send('Praman Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log(`Connected to program: ${process.env.PROGRAM_ID}`);
});