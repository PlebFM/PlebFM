import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';

const socketHandler = async (_: NextApiRequest, res: NextApiResponse) => {
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
    if (serverIO) {
      console.info('Socket server already running!');
      return res.status(200).json({
        success: false,
        message:
          'Socket server already running! Use socket.io-client to connect.',
      });
    }
    console.info('Socket server initializing ...');
    const io = new Server(socketServer);
    socket.server.io = io;
    console.info('Socket server initialized!');

    return res.status(200).json({
      success: true,
      message:
        'Socket connection created on server! Use socket.io-client to connect!',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default socketHandler;
