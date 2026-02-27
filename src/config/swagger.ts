import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RTO Vehicle API",
      version: "1.0.0",
      description: "API documentation for RTO Vehicle Dashboard backend",
    },
    servers: [
      {
        url: BASE_URL,
        description: "API server",
      },
    ],
    components: {
      securitySchemes: {
        jwtAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: "Enter your JWT token (without 'Bearer' prefix)",
        },
        partnerAuth: {
          type: "apiKey",
          in: "header",
          name: "PartnerId",
          description: "Enter your Partner ID",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
