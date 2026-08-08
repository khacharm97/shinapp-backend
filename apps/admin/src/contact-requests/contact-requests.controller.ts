import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ContactRequestsService } from './contact-requests.service';

@Controller()
export class ContactRequestsController {
  constructor(private readonly contactRequestsService: ContactRequestsService) {}

  @MessagePattern({ cmd: 'admin.get_contact_requests' })
  async getContactRequests() {
    try {
      return await this.contactRequestsService.getContactRequests();
    } catch (e) {
      return { error: e.message || 'Failed to fetch contact requests' };
    }
  }

  @MessagePattern({ cmd: 'admin.create_contact_request' })
  async createContactRequest(data: any) {
    try {
      return await this.contactRequestsService.createContactRequest(data);
    } catch (e) {
      return { error: e.message || 'Failed to create contact request' };
    }
  }

  @MessagePattern({ cmd: 'admin.update_contact_request' })
  async updateContactRequest(data: { email: string; payload: any }) {
    try {
      return await this.contactRequestsService.updateContactRequest(
        data.email,
        data.payload,
      );
    } catch (e) {
      return { error: e.message || 'Failed to update contact request' };
    }
  }

  @MessagePattern({ cmd: 'admin.contact_request_exists' })
  async contactRequestExists(data: { email: string }) {
    try {
      return await this.contactRequestsService.contactRequestExists(data.email);
    } catch (e) {
      return { error: e.message || 'Failed to check contact request' };
    }
  }

  @MessagePattern({ cmd: 'admin.mark_contact_request_read' })
  async markContactRequestAsRead(data: { id: string }) {
    try {
      return await this.contactRequestsService.markContactRequestAsRead(data.id);
    } catch (e) {
      return { error: e.message || 'Failed to mark as read' };
    }
  }
}
