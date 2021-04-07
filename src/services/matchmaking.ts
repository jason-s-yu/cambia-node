import socket from 'socket.io';
import { logger, getCode } from '../utils';
import { authenticateJWT, getElo } from '../controllers/user';
import { DecodedToken } from '../types/jwt';

// id: { socketId }
const queue: { [key: string]: { socketId: string, elo: number } } = {};

const game: { [key: string]: string; } = {};

export const handleConnection = (io: socket.Server) => {
  io.use(async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      const user = await authenticateJWT(socket.handshake.query.token as any);
      if (user) {
        console.log('User authenticated', user)
        next();
      }
    }
  }).on('connection', async socket => {
    const user = await authenticateJWT(socket.handshake.query.token as any) as DecodedToken;
    logger.info(`User ${user.id} connected (${user.email})`);

    socket.on('looking for match', async () => {
      const elo = await getElo(user.id);
      logger.info(`User ${user.email} looking for match, ranked at ${elo}`);

      // first try to find someone within elo, first find exact match then increase search radius by 20 each pass
      // we stop searching after diff (acceptable elo difference range) is greater than 500
      let found = Object.keys(queue).find(key => queue[key].elo === elo)
      let diff = 20;
      while (!found && diff <= 500) {
        found = Object.keys(queue).find(key => queue[key].elo - elo < diff);
        if (!found) diff += 20;
      }

      // no matches currently found, adding to queue
      if (!found) {
        queue[user.id] = {
          socketId: socket.id,
          elo: elo
        };
      } else {
        // match found
        const otherUser = queue[found];
        // remove from queue
        delete queue[found];
        logger.info(`Match found for user ${user.id} (${user.email}) - matched with user ${found}`);
        
        const joinCode = getCode();
        socket.emit('match found', { otherPlayer: found, otherSocketId: socket.id, code: joinCode });
        socket.to(otherUser.socketId).emit('match found', { otherPlayer: user.id, otherSocketId: socket.id, code: joinCode });
      }
    }).on('accept match', (code: string, otherId: string, otherSocketId: string) => {
      logger.info(`${user.id} accepted match`);

      game[user.id] = socket.id;

      if (game[otherId] === otherSocketId) {
        delete game[user.id];
        delete game[otherId];
        socket.emit('verify match');
        socket.to(otherSocketId).emit('verify match');
        socket.join(code);
      }
    }).on('leave queue', () => {
      logger.info(`User ${user.id} left matchmaking queue`);
      delete queue[user.id];
    });
  });
}