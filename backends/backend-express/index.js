require('dotenv').config(); // 1. Siempre primero para cargar las variables de entorno

const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const pool = require('./db');

const authRoutes = require('./routes/auth');
const suministrosRoutes = require('./routes/suministros');
const misionesRoutes = require('./routes/misiones');
const escuadronesRoutes = require('./routes/escuadrones');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 3. Middlewares globales e inyecciones
app.use(cors());
app.use(express.json());

// Ruta de documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Función de Broadcast global
const broadcast = (data) => {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

// Inyectar broadcast en el objeto app para usarlo en rutas
app.set('broadcast', broadcast);

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ event: 'CONNECTED', message: 'Canal de telemetría C2 activo' }));
});

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/suministros', suministrosRoutes);
app.use('/api/v1/misiones', misionesRoutes);
app.use('/api/v1/escuadrones', escuadronesRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[C2 BACKEND-A] Servidor activo en http://localhost:${PORT}`);
});
