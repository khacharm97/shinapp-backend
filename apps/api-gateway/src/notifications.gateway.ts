import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Browsers can send the token via the handshake `auth` payload (works on
      // both polling and websocket transports); `extraHeaders` only reaches us
      // on the polling transport, so accept either.
      const raw =
        (client.handshake.auth?.token as string | undefined) ||
        client.handshake.headers.authorization;
      if (!raw) {
        throw new Error('No authorization token');
      }

      const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'super_secret_key' });
      
      const userId = payload.sub; // User ID from JWT
      client.join(userId); // Join a room specific to this user
      
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Helper to send events
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(userId).emit('new_notification', notification);
  }

  sendEventToUser(userId: string, event: string, payload: any) {
    this.server.to(userId).emit(event, payload);
  }
}
