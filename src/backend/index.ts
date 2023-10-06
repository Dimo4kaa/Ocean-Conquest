// import session from 'express-session';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import path from "path"
import { fileURLToPath } from 'url';
import { PartyManager } from './modules/PartyManager.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// import { fs } from 'fs';
// import path from 'path';
// const PartyManager = require('./src/PartyManager');
const pm = new PartyManager();

// Создание приложения ExpressJS
const app = express();
const server = http.createServer(app);

// Регистраци Socket приложения
const io = new Server(server);
const port = 5000;

// Настройка сессий
// const sessionMiddleware = session({
//   secret: 's3Cur3',
//   name: 'sessionId',
// });

app.set('trust proxy', 1); // trust first proxy
// app.use(sessionMiddleware);

// Настройка статики
// app.use(express.static('./../front/'));
app.use(express.static(__dirname));

// По умолчанию
// app.use("*", (req, res) => {
// 	res.type("html");
// 	res.send(fs.readFileSync(path.join(__dirname, "./../front/index.html")));
// });

server.listen(port, () => {
  console.log(`Server is running on ${port} port`);
});

// io.use((socket, next) => {
//   sessionMiddleware(socket.request, {}, next);
// });

// Прослушивание socket соединений
io.on('connection', (socket) => {
  pm.connection(socket);
  io.emit('playerCount', io.engine.clientsCount);

  // Отключение коннекта
  socket.on('disconnect', () => {
    pm.disconnect(socket);
    io.emit('playerCount', io.engine.clientsCount);
  });

  // // Поиск случайного соперника
  // socket.on("findRandomOpponent", () => {
  // 	socket.emit("statusChange", "randomFinding");

  // 	pm.playRandom(socket);
  // });
});

// const http = require('http').createServer(app);

// // Регистраци Socket приложения
// const io = require('socket.io')(http);

// // Настройка сессий
// const sessionMiddleware = session({
//   secret: 's3Cur3',
//   name: 'sessionId',
// });

// app.set('trust proxy', 1); // trust first proxy
// app.use(sessionMiddleware);

// // Настройка статики
// // app.use(express.static('./../front/'));
// app.use(express.static('./../../dist/'));

// // По умолчанию
// // app.use('*', (req, res) => {
// //   res.type('html');
// //   res.send(fs.readFileSync(path.join(__dirname, './../front/index.html')));
// // });

// // Поднятие сервера
// http.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

// io.use((socket, next) => {
//   sessionMiddleware(socket.request, {}, next);
// });

// // Прослушивание socket соединений
// io.on('connection', (socket) => {
//   pm.connection(socket);
//   io.emit('playerCount', io.engine.clientsCount);

//   // Отключение коннекта
//   socket.on('disconnect', () => {
//     pm.disconnect(socket);
//     io.emit('playerCount', io.engine.clientsCount);
//   });

//   // // Поиск случайного соперника
//   // socket.on("findRandomOpponent", () => {
//   // 	socket.emit("statusChange", "randomFinding");

//   // 	pm.playRandom(socket);
//   // });
// });
