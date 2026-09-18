import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ForgeTrack API',
      version,
      description: 'API documentation for the ForgeTrack engineering inventory and field reporting system.',
    },
    // Swagger UI renders tag groups in this order, so declaring them here
    // controls the sidebar order regardless of which file each path lives in.
    tags: [
      { name: 'Auth', description: 'Registration, login, and password reset' },
      { name: 'Users', description: 'User management (admin only)' },
      { name: 'Products', description: 'Product catalogue and inventory' },
      { name: 'Orders', description: 'Customer orders and fulfilment' },
      { name: 'Dashboard', description: 'Aggregated inventory and order metrics (admin only)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.ts', './docs/*.yaml'],
};

export const swaggerSpec = swaggerJSDoc(options);