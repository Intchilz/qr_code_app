import http from 'http';
import app from './app.js';
import { initSocket } from './sockets/socket.js';

const server = http.createServer(app);
const io = initSocket(server);

// Attach io globally
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});