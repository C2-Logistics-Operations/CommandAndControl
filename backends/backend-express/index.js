require('dotenv').config();

const express = require('express');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const authRoutes = require('./routes/auth');
const suministrosRoutes = require('./routes/suministros');

// 2. Inicializar aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middlewares globales
app.use(cors());
app.use(express.json());

// 4. Documentación Swagger
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// 5. Rutas de API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/suministros', suministrosRoutes);

// 6. Iniciar servidor únicamente fuera del entorno de pruebas
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `[C2 BACKEND-A] Servidor activo en http://localhost:${PORT}`
    );
  });
}

// 7. Exportar aplicación para pruebas
module.exports = app;
