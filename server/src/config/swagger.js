const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartSeason API',
      version: '1.0.0',
      description: 'REST API for crop field monitoring. Tracks fields, assigns agents, captures updates and computes field health status.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server',
      },
      {
        url: 'https://smartseason-7ukd.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/docs/swagger.yaml'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;