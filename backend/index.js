// index.js
const express = require('express');
const cors = require('cors');
const itineraryRoutes = require('./routes/itineraryRoutes');

const app = express();
const PORT = 2200;

app.use(express.json());
app.use(cors());

// Routes
app.use('/api', itineraryRoutes);

app.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));