import http from 'node:http';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { initSocketServer } from './config/socket.js';

async function startServer() {
  // Start HTTP and WebSocket server first so APIs (like captcha, health) are instantly available
  const server = http.createServer(app);
  initSocketServer(server);
  server.listen(env.port, () => {
    console.log(`GOKUL GHEE API server listening on port ${env.port} (${env.nodeEnv})`);
  });

  // Connect to MongoDB Atlas
  try {
    await connectDatabase();
    console.log('Connected to MongoDB Atlas successfully.');
  } catch (error) {
    console.error('MongoDB Atlas connection issue:', error.message);
    console.log('Server is running on port ' + env.port + '. It will retry connecting when Atlas IP whitelist is updated.');
  }
}

startServer();
