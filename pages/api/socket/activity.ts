import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';

const handler = async (_: NextApiRequest, res: NextApiResponse) => {
  try {
    const socket: any = res?.socket ?? null;
    if (!socket)
      return res
        .status(404)
        .json({ success: false, message: 'FATAL: no socket exists on res!' });

    const socketServer: any = socket?.server ?? null;
    if (!socketServer)
      return res.status(404).json({
        success: false,
        message: 'FATAL: no server exists on socket!',
      });

    const serverIO: any = socketServer?.io ?? null;
    if (!serverIO) {
      console.info('Socket server initializing ...');
      socket.server.io = new Server(socketServer);
      console.info('Socket server initialized!');
    }

    const io = socket.server.io;
    return await io.on('connection', (socket: any) => {
      console.log('connect');
      socket.broadcast.emit('a user connected');
      socket.on('hello', (msg: any) => {
        socket.emit(msg);
      });
    });
  } catch (error) {}
};

export default handler;
