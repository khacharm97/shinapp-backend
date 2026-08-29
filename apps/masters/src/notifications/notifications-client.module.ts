import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

/**
 * Registers and re-exports the TCP client for the notifications microservice
 * so any feature module that emits notifications can just import this module
 * instead of repeating the ClientsModule.register boilerplate.
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATIONS_HOST || 'localhost',
          port: 3004,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NotificationsClientModule {}
