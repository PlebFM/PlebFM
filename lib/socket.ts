import { NextApiResponse } from 'next';

export const resSocketServerExists = async (res: NextApiResponse) => {
  try {
    const socket: any = res?.socket ?? null;
    if (!socket)
      return {
        success: false,
        type: 'res.socket',
        message: 'FATAL: no socket exists on res!',
      };

    const socketServer: any = socket?.server ?? null;
    if (!socketServer)
      return {
        success: false,
        type: 'socket.server',
        message: 'FATAL: no server exists on socket!',
      };

    return {
      success: true,
      type: 'res.socket.server',
      message: socketServer,
    };
  } catch (error: any) {
    throw new Error(`res-socket-server-catch-error: ${error.message}`);
  }
};

export const serverIOExists = async (socketServer: any) => {
  try {
    const messageType = 'res.socket.server.io';
    const serverIO: any = socketServer?.io ?? null;
    if (serverIO)
      return {
        success: false,
        type: messageType,
        message:
          'Socket connection already running on server! Use socket.io-client to connect.',
      };

    return {
      success: true,
      type: messageType,
      message: socketServer,
    };
  } catch (error: any) {
    throw new Error(`socket-server-io-catch-error: ${error.message}`);
  }
};
