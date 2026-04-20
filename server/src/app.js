require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const fieldsRoutes = require('./modules/fields/fields.routes');
const updatesRoutes = require('./modules/updates/updates.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldsRoutes);
app.use('/api/updates', updatesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// catch-all for unknown routes
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

module.exports = app;
