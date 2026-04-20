require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./modules/auth/auth.routes');
const fieldsRoutes = require('./modules/fields/fields.routes');
const updatesRoutes = require('./modules/updates/updates.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({
    name: 'SmartSeason API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /auth/register': 'Register a new user',
        'POST /auth/login': 'Login and receive token',
      },
      fields: {
        'GET /fields': 'Get all fields (role scoped)',
        'POST /fields': 'Create a field (admin only)',
        'GET /fields/:id': 'Get field with update history',
        'PATCH /fields/:id/assign': 'Assign field to agent (admin only)',
        'DELETE /fields/:id': 'Delete a field (admin only)',
      },
      updates: {
        'POST /updates': 'Submit a field update (agent)',
        'GET /updates/field/:field_id': 'Get updates for a field',
      },
      dashboard: {
        'GET /dashboard': 'Role scoped dashboard summary',
      },
    },
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/fields', fieldsRoutes);
app.use('/updates', updatesRoutes);
app.use('/dashboard', dashboardRoutes);

// catch-all for unknown routes
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

module.exports = app;
