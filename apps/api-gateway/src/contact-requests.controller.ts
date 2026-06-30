import { Controller, Get, Post, Put, Body, Param, Inject, Query, Res, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as nodemailer from 'nodemailer';

@Controller('contact-requests')
export class ContactRequestsController {
  private transporter;

  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminService: ClientProxy,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'dummy@gmail.com',
        pass: process.env.SMTP_PASS || 'dummy',
      },
    });
  }

  @Get('exists')
  async exists(@Query('email') email: string) {
    const result = await firstValueFrom(
      this.adminService.send({ cmd: 'admin.contact_request_exists' }, { email })
    );
    if (result && !result.error) {
      return { exists: true, contact: result.contact, id: result.id };
    }
    return { exists: false, contact: false };
  }

  @Post()
  async create(@Body() body: any) {
    return firstValueFrom(
      this.adminService.send({ cmd: 'admin.create_contact_request' }, body)
    );
  }

  @Put(':email')
  async update(@Param('email') email: string, @Body() body: any) {
    return firstValueFrom(
      this.adminService.send({ cmd: 'admin.update_contact_request' }, { email, payload: body })
    );
  }

  @Post('email/estimate')
  async sendEstimateEmail(@Body() body: any, @Res() res) {
    try {
      const { recipients, subject, message, firstName, lastName, columns, rows, lang } = body;

      let htmlRows = rows.map(r => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${r[columns[0]]}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${r[columns[1]]}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${r[columns[2]]}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${r[columns[3]]}</td>
        </tr>
      `).join('');

      let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <p>Hello ${firstName || ''} ${lastName || ''},</p>
          <p>${message}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">${columns[0]}</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">${columns[1]}</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">${columns[2]}</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">${columns[3]}</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>
          <p style="margin-top: 20px; font-size: 0.9em; color: #555;">Thank you for using ShinApp!</p>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.SMTP_USER || '"ShinApp" <noreply@shinapp.com>',
        to: recipients.join(', '),
        subject: subject,
        html: html,
      });

      return res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      console.error('Error sending estimate email:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  @Post('email/contact')
  async sendContactEmail(@Body() body: any, @Res() res) {
    try {
      const { recipients, firstName, lastName, lang } = body;

      let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Contact Request Received</h2>
          <p>Hello ${firstName || ''} ${lastName || ''},</p>
          <p>We have received your contact request. Our team will get in touch with you shortly.</p>
          <p style="margin-top: 20px; font-size: 0.9em; color: #555;">Thank you for using ShinApp!</p>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.SMTP_USER || '"ShinApp" <noreply@shinapp.com>',
        to: recipients.join(', '),
        subject: 'Contact Request Received - ShinApp',
        html: html,
      });

      return res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      console.error('Error sending contact email:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
