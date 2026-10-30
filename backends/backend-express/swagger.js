const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'C2 Logistics & Ops - API Backend Express',
      version: '1.0.0',
      description: 'Documentación oficial de endpoints tácticos de autenticación, suministros y misiones C2.'
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor Local de Desarrollo / Docker'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJSDoc(options);