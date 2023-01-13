import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';

const handler = async (_: NextApiRequest, res: NextApiResponse) => {
  try {
    const socket: any = res?.socket ?? null;
    const io: any = socket?.server?.io ?? null;
    if (!io)
      return res.status(404).json({
        success: false,
        message:
          'No socket connection present. Use /api/socket/connect to create websocket connection!',
      });

    io.on('connection', (socket: any) => {
      socket.on('input-change', (msg: any) => {
        socket.broadcast.emit('update-input', msg);
      });
    });
    res.end();
  } catch (error) {}
};

export default handler;
