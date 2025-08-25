require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const briefRoutes = require('./routes/brief');
const matchRoutes = require('./routes/match');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/brief', briefRoutes);
app.use('/api/match', matchRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Mohtawa Marketing Brief Builder running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} to view the app`);
});
