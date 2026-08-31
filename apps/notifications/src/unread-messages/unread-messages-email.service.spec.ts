import { Test } from '@nestjs/testing';
import { UnreadMessagesEmailService } from './unread-messages-email.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const dueRow = {
  userId: 'u1',
  conversationId: 'c1',
  email: 'u1@example.com',
  recipientName: 'Recipient',
  senderName: 'Sender',
  preview: 'hello there',
  unreadCount: 2,
};

describe('UnreadMessagesEmailService', () => {
  let service: UnreadMessagesEmailService;
  let prisma: { $queryRaw: jest.Mock; $executeRaw: jest.Mock };
  let mail: { sendUnreadMessagesEmail: jest.Mock };

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn(), $executeRaw: jest.fn() };
    mail = { sendUnreadMessagesEmail: jest.fn().mockResolvedValue(true) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UnreadMessagesEmailService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mail },
      ],
    }).compile();

    service = moduleRef.get(UnreadMessagesEmailService);
  });

  it('emails a due participant and claims the row first', async () => {
    prisma.$queryRaw.mockResolvedValue([dueRow]);
    prisma.$executeRaw.mockResolvedValue(1);

    await service.sweep();

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
    expect(mail.sendUnreadMessagesEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'u1@example.com',
        senderName: 'Sender',
        unreadCount: 2,
        conversationId: 'c1',
      }),
    );
  });

  it('does not email when the row is claimed by another run', async () => {
    prisma.$queryRaw.mockResolvedValue([dueRow]);
    prisma.$executeRaw.mockResolvedValue(0);

    await service.sweep();

    expect(mail.sendUnreadMessagesEmail).not.toHaveBeenCalled();
  });

  it('does nothing when no participants are due', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    await service.sweep();

    expect(prisma.$executeRaw).not.toHaveBeenCalled();
    expect(mail.sendUnreadMessagesEmail).not.toHaveBeenCalled();
  });

  it('skips overlapping runs', async () => {
    let resolveQuery: (v: unknown) => void = () => {};
    prisma.$queryRaw.mockReturnValue(
      new Promise((res) => {
        resolveQuery = res;
      }),
    );

    const first = service.sweep();
    await service.sweep(); // returns immediately, guarded by `running`
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

    resolveQuery([]);
    await first;
  });
});
