import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { PartyManager } from './modules/PartyManager.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pm = new PartyManager();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 5000;;
app.set('trust proxy', 1);
app.use(express.static(__dirname));
server.listen(port, () => {
    console.log(`Server is running on ${port} port`);
});
io.on('connection', (socket) => {
    pm.connection(socket);
    io.emit('playerCount', io.engine.clientsCount);
    socket.on('disconnect', () => {
        pm.disconnect(socket);
        io.emit('playerCount', io.engine.clientsCount);
    });
});
