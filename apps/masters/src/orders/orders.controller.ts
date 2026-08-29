import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create-order' })
  createOrder(@Payload() data: any) {
    return this.ordersService.createOrder(data);
  }

  @MessagePattern({ cmd: 'get-my-orders' })
  getMyOrders(@Payload() data: { userId: string }) {
    return this.ordersService.getMyOrders(data.userId);
  }

  @MessagePattern({ cmd: 'get-order-by-id' })
  getOrderById(@Payload() data: { userId: string; orderId: string }) {
    return this.ordersService.getOrderById(data.userId, data.orderId);
  }

  @MessagePattern({ cmd: 'update-order' })
  updateOrder(@Payload() data: any) {
    return this.ordersService.updateOrder(data);
  }

  @MessagePattern({ cmd: 'accept-order' })
  acceptOrder(@Payload() data: { userId: string; orderId: string }) {
    return this.ordersService.acceptOrder(data.userId, data.orderId);
  }

  @MessagePattern({ cmd: 'reject-order' })
  rejectOrder(@Payload() data: { userId: string; orderId: string }) {
    return this.ordersService.rejectOrder(data.userId, data.orderId);
  }

  @MessagePattern({ cmd: 'request-order-completion' })
  requestOrderCompletion(@Payload() data: { userId: string; orderId: string }) {
    return this.ordersService.requestOrderCompletion(data.userId, data.orderId);
  }

  @MessagePattern({ cmd: 'accept-order-completion' })
  acceptOrderCompletion(@Payload() data: { userId: string; orderId: string }) {
    return this.ordersService.acceptOrderCompletion(data.userId, data.orderId);
  }

  @MessagePattern({ cmd: 'get-master-busy-dates' })
  getMasterBusyDates(@Payload() data: { masterId: string }) {
    return this.ordersService.getBusyDatesForMaster(data.masterId);
  }
}
