import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const PORT = process.env.PORT || 3000

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RTO Vehicle API',
      version: '1.0.0',
      description: 'API documentation for RTO Vehicle Dashboard backend',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
export { swaggerUi }
