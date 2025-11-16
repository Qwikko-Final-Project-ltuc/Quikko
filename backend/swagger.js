/**
 * ===============================
 * SWAGGER CONFIGURATION
 * ===============================
 * @file swagger.js
 * @description
 * This file configures Swagger for API documentation using `swagger-jsdoc` and `swagger-ui-express`.
 * It generates OpenAPI 3.0 documentation and serves it via an Express endpoint.
 * 
 * Features:
 *  - Defines API title, version, and server URL.
 *  - Configures security schemes for different user roles (customer, vendor, admin, delivery).
 *  - Automatically loads JSDoc comments from all modules and infrastructure files.
 * 
 * @module SwaggerConfig
 */

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

/**
 * @type {object} options - Swagger configuration options
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Qwikko API",
      version: "1.0.0",
      description: "API documentation for Qwikko platform, including customer, vendor, delivery, and admin endpoints.",
    },
    servers: [{ url: "https://qwikko.onrender.com" }],
    components: {
      securitySchemes: {
        customerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        vendorAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        adminAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        deliveryAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./src/modules/**/*.js",       // Include all module files for JSDoc comments
    "./src/infrastructure/**/*.js" // Include infrastructure files for JSDoc comments
  ],
};

// Generate Swagger specification object
const specs = swaggerJsdoc(options);

// Export both Swagger UI and specs for Express usage
module.exports = { swaggerUi, specs };
