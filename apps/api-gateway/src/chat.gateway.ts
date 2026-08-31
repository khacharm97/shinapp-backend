import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Real-time transport for chat. Each socket joins a room named after its
 * userId so the gateway can push messages to specific participants. Message
 * persistence happens over REST (ChatController) — this gateway is push-only,
 * mirroring NotificationsGateway.
 */
@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Depending on the platform adapter version, @WebSocketServer() may inject the
   * root Socket.IO server or the '/chat' namespace directly. Normalise to the
   * namespace so room targeting always hits chat clients.
   */
  private get chat() {
    const server: any = this.server;
    return typeof server?.of === 'function' ? server.of('/chat') : server;
  }

  handleConnection(client: Socket) {
    try {
      // Accept the token from the handshake `auth` payload (survives the
      // websocket upgrade in browsers) or the Authorization header (polling).
      const raw =
        (client.handshake.auth?.token as string | undefined) ||
        client.handshake.headers.authorization;
      if (!raw) throw new Error('No authorization token');

      const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super_secret_key',
      });

      const userId = payload.sub;
      client.data.userId = userId;
      client.join(userId);
      this.logger.log(`Chat client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Chat connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chat client disconnected: ${client.id}`);
  }

  /** Push a new message to every participant currently connected. */
  emitMessage(userIds: string[], message: any, conversationId: string) {
    for (const userId of userIds) {
      this.server.to(userId).emit('chat:message', { conversationId, message });
    }
  }

  async isOnline(userId: string): Promise<boolean> {
    const sockets = await this.server.in(userId).fetchSockets();
    return sockets.length > 0;
  }
}
