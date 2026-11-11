import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create-order' })
  createOrder(@Payload() data: any) {
    return this.ordersService.createOrder(data);
  }

  @MessagePattern({ cmd: 'search-order-clients' })
  searchOrderClients(
    @Payload() data: { requesterId: string; search: string; limit?: number },
  ) {
    return this.ordersService.searchOrderClients(data);
  }

  @MessagePattern({ cmd: 'get-my-orders' })
  getMyOrders(
    @Payload()
    data: {
      userId: string;
      page?: number;
      limit?: number;
      type?: 'ORDER' | 'BRIGADE' | 'TECHNIQUE';
      status?: OrderStatus;
      search?: string;
    },
  ) {
    return this.ordersService.getMyOrders(data);
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

  @MessagePattern({ cmd: 'cancel-order' })
  cancelOrder(@Payload() data: { userId: string; orderId: string }) {
    return this.ordersService.cancelOrder(data.userId, data.orderId);
  }

  @MessagePattern({ cmd: 'request-order-completion' })
  requestOrderCompletion(@Payload() data: { userId: string; orderId: string }) {
    return this.ordersService.requestOrderCompletion(data.userId, data.orderId);
  }

  @MessagePattern({ cmd: 'accept-order-completion' })
  acceptOrderCompletion(@Payload() data: { userId: string; orderId: string }) {
    return this.ordersService.acceptOrderCompletion(data.userId, data.orderId);
  }

  @MessagePattern({ cmd: 'assign-order-members' })
  assignOrderMembers(
    @Payload() data: { ownerId: string; orderId: string; memberIds: string[] },
  ) {
    return this.ordersService.assignOrderMembers(
      data.ownerId,
      data.orderId,
      data.memberIds,
    );
  }

  @MessagePattern({ cmd: 'get-master-busy-dates' })
  getMasterBusyDates(@Payload() data: { masterId: string }) {
    return this.ordersService.getBusyDatesForMaster(data.masterId);
  }

  @MessagePattern({ cmd: 'list-busy-periods' })
  listBusyPeriods(@Payload() data: { masterId: string }) {
    return this.ordersService.listBusyPeriods(data.masterId);
  }

  @MessagePattern({ cmd: 'create-busy-period' })
  createBusyPeriod(
    @Payload()
    data: {
      masterId: string;
      startDate: string;
      endDate: string;
      note?: string;
    },
  ) {
    return this.ordersService.createBusyPeriod(
      data.masterId,
      new Date(data.startDate),
      new Date(data.endDate),
      data.note,
    );
  }

  @MessagePattern({ cmd: 'delete-busy-period' })
  deleteBusyPeriod(@Payload() data: { masterId: string; id: string }) {
    return this.ordersService.deleteBusyPeriod(data.masterId, data.id);
  }
}
