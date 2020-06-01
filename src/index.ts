import express from 'express';
import socket from 'socket.io';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { api } from './api';
import dotenv from 'dotenv';
import { Server } from 'http';
import { handleConnection } from './services/matchmaking';
import { requestLogger } from './utils';
import { authenticateJWT } from './controllers/user';

dotenv.config({ path: 'prisma/.env' });

const app = express();

app.use(requestLogger);
app.use(bodyParser.json());
app.use(cookieParser(''));

app.use('/api', api);

const server: Server = app.listen(3000, () => console.log(`Listening on port ${3000}!`));
const io: socket.Server = socket.listen(server);

handleConnection(io);
