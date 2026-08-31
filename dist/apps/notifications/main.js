/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsModule = void 0;
const common_1 = __webpack_require__(3);
const schedule_1 = __webpack_require__(4);
const notifications_controller_1 = __webpack_require__(5);
const notifications_service_1 = __webpack_require__(6);
const prisma_module_1 = __webpack_require__(13);
const unread_messages_module_1 = __webpack_require__(14);
const microservices_1 = __webpack_require__(12);
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            schedule_1.ScheduleModule.forRoot(),
            unread_messages_module_1.UnreadMessagesModule,
            microservices_1.ClientsModule.register([
                {
                    name: 'API_GATEWAY_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.API_GATEWAY_HOST || 'localhost',
                        port: 3005,
                    },
                },
            ]),
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [notifications_service_1.NotificationsService],
    })
], NotificationsModule);


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/schedule");

/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsController = void 0;
const common_1 = __webpack_require__(3);
const notifications_service_1 = __webpack_require__(6);
const microservices_1 = __webpack_require__(12);
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    getNotifications(data) {
        return this.notificationsService.getNotifications(data.userId);
    }
    markNotificationRead(data) {
        return this.notificationsService.markNotificationRead(data.userId, data.notificationId);
    }
    markAllNotificationsRead(data) {
        return this.notificationsService.markAllNotificationsRead(data.userId);
    }
    createNotification(data) {
        return this.notificationsService.createNotification(data);
    }
    notifyMastersOfNewAnnouncement(data) {
        return this.notificationsService.notifyMastersOfNewAnnouncement(data);
    }
    forwardWsEvent(data) {
        return this.notificationsService.forwardWsEvent(data);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-notifications' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'mark-notification-read' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markNotificationRead", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'mark-all-notifications-read' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllNotificationsRead", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create-notification' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "createNotification", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'notify-masters-new-announcement' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "notifyMastersOfNewAnnouncement", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'send-ws-event' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "forwardWsEvent", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof notifications_service_1.NotificationsService !== "undefined" && notifications_service_1.NotificationsService) === "function" ? _a : Object])
], NotificationsController);


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsService = void 0;
const crypto_1 = __webpack_require__(7);
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(8);
const microservices_1 = __webpack_require__(12);
const client_1 = __webpack_require__(9);
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    apiGatewayService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma, apiGatewayService) {
        this.prisma = prisma;
        this.apiGatewayService = apiGatewayService;
    }
    async getNotifications(userId) {
        try {
            const notifications = await this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
            return { notifications };
        }
        catch (error) {
            this.logger.error(`Error getting notifications: ${error.message}`);
            return { error: 'Failed to fetch notifications' };
        }
    }
    async markNotificationRead(userId, notificationId) {
        try {
            const notification = await this.prisma.notification.updateMany({
                where: { id: notificationId, userId },
                data: { isRead: true },
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Error marking notification as read: ${error.message}`);
            return { error: 'Failed to update notification' };
        }
    }
    async markAllNotificationsRead(userId) {
        try {
            await this.prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true },
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Error marking all notifications as read: ${error.message}`);
            return { error: 'Failed to update notifications' };
        }
    }
    async createNotification(data) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    metadata: data.metadata || {},
                },
            });
            this.logger.log(`Notification ${notification.id} persisted for user ${data.userId}; emitting send-ws-notification to API gateway (${process.env.API_GATEWAY_HOST || 'localhost'}:3005)`);
            this.apiGatewayService.emit({ cmd: 'send-ws-notification' }, { userId: data.userId, notification });
            return { success: true, notification };
        }
        catch (error) {
            this.logger.error(`Error creating notification: ${error.message}`);
            return { error: 'Failed to create notification' };
        }
    }
    forwardWsEvent(data) {
        this.logger.log(`Forwarding ws event '${data.event}' for user ${data.userId} to API gateway (${process.env.API_GATEWAY_HOST || 'localhost'}:3005)`);
        this.apiGatewayService.emit({ cmd: 'send-ws-event' }, data);
        return { success: true };
    }
    async notifyMastersOfNewAnnouncement(data) {
        try {
            const masters = await this.prisma.user.findMany({
                where: {
                    roles: { has: 'MASTER' },
                    verifiedAt: { not: null },
                    isBlocked: false,
                },
                select: { id: true },
            });
            if (masters.length === 0)
                return { success: true, count: 0 };
            const batchId = (0, crypto_1.randomUUID)();
            const message = data.sphere
                ? `New announcement in ${data.sphere}: "${data.title}"`
                : `A new announcement was posted: "${data.title}"`;
            await this.prisma.notification.createMany({
                data: masters.map((m) => ({
                    userId: m.id,
                    type: client_1.NotificationType.ANNOUNCEMENT,
                    title: 'New announcement',
                    message,
                    metadata: { announcementId: data.announcementId, batchId },
                })),
            });
            const created = await this.prisma.notification.findMany({
                where: { metadata: { path: ['batchId'], equals: batchId } },
            });
            for (const notification of created) {
                this.apiGatewayService.emit({ cmd: 'send-ws-notification' }, { userId: notification.userId, notification });
            }
            return { success: true, count: created.length };
        }
        catch (error) {
            this.logger.error(`Error notifying masters of announcement: ${error.message}`);
            return { error: 'Failed to notify masters' };
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('API_GATEWAY_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object])
], NotificationsService);


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(3);
const client_1 = __webpack_require__(9);
const pg_1 = __webpack_require__(10);
const adapter_pg_1 = __webpack_require__(11);
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        const connectionString = process.env.DATABASE_URL ||
            'postgresql://root:password@postgres:5432/shinapp?schema=public';
        const pool = new pg_1.Pool({ connectionString });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        super({ adapter });
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("pg");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@prisma/adapter-pg");

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 13 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaModule = void 0;
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(8);
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], PrismaModule);


/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnreadMessagesModule = void 0;
const common_1 = __webpack_require__(3);
const prisma_module_1 = __webpack_require__(13);
const mail_module_1 = __webpack_require__(15);
const unread_messages_email_service_1 = __webpack_require__(18);
let UnreadMessagesModule = class UnreadMessagesModule {
};
exports.UnreadMessagesModule = UnreadMessagesModule;
exports.UnreadMessagesModule = UnreadMessagesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, mail_module_1.MailModule],
        providers: [unread_messages_email_service_1.UnreadMessagesEmailService],
    })
], UnreadMessagesModule);


/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MailModule = void 0;
const common_1 = __webpack_require__(3);
const mail_service_1 = __webpack_require__(16);
let MailModule = class MailModule {
};
exports.MailModule = MailModule;
exports.MailModule = MailModule = __decorate([
    (0, common_1.Module)({
        providers: [mail_service_1.MailService],
        exports: [mail_service_1.MailService],
    })
], MailModule);


/***/ }),
/* 16 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var MailService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MailService = void 0;
const common_1 = __webpack_require__(3);
const nodemailer = __importStar(__webpack_require__(17));
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER || 'dummy@gmail.com',
            pass: process.env.SMTP_PASS || 'dummy',
        },
    });
    get from() {
        return process.env.SMTP_FROM || process.env.SMTP_USER || '"ShinApp" <noreply@shinapp.com>';
    }
    get appUrl() {
        return (process.env.APP_URL || 'https://shinapp.com').replace(/\/$/, '');
    }
    async sendUnreadMessagesEmail(input) {
        const conversationUrl = `${this.appUrl}/chat/${input.conversationId}`;
        const countLabel = input.unreadCount > 1
            ? `${input.unreadCount} unread messages`
            : 'a new message';
        const subject = input.unreadCount > 1
            ? `You have ${input.unreadCount} unread messages from ${input.senderName}`
            : `New message from ${input.senderName}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="margin-bottom: 4px;">${escapeHtml(input.senderName)} sent you ${countLabel}</h2>
        <p style="color: #555;">Hello ${escapeHtml(input.recipientName || '')},</p>
        <blockquote style="margin: 16px 0; padding: 12px 16px; background: #f5f5f5; border-left: 3px solid #ccc; white-space: pre-wrap;">${escapeHtml(input.preview)}</blockquote>
        <p>
          <a href="${conversationUrl}"
             style="display: inline-block; padding: 10px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
            Open conversation
          </a>
        </p>
        <p style="margin-top: 24px; font-size: 0.85em; color: #777;">
          You are receiving this because you have unread messages on ShinApp.
          You can turn these reminders off in your notification settings.
        </p>
      </div>
    `;
        try {
            await this.transporter.sendMail({
                from: this.from,
                to: input.to,
                subject,
                html,
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send unread-messages email to ${input.to}: ${error.message}`);
            return false;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)()
], MailService);
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("nodemailer");

/***/ }),
/* 18 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UnreadMessagesEmailService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnreadMessagesEmailService = void 0;
const common_1 = __webpack_require__(3);
const schedule_1 = __webpack_require__(4);
const client_1 = __webpack_require__(9);
const prisma_service_1 = __webpack_require__(8);
const mail_service_1 = __webpack_require__(16);
const PREVIEW_MAX = 140;
const BATCH_LIMIT = 200;
let UnreadMessagesEmailService = UnreadMessagesEmailService_1 = class UnreadMessagesEmailService {
    prisma;
    mail;
    logger = new common_1.Logger(UnreadMessagesEmailService_1.name);
    running = false;
    get delayMinutes() {
        return parseInt(process.env.UNREAD_EMAIL_DELAY_MINUTES || '5', 10);
    }
    constructor(prisma, mail) {
        this.prisma = prisma;
        this.mail = mail;
    }
    async sweep() {
        if (this.running) {
            this.logger.warn('Previous unread-messages sweep still running; skipping');
            return;
        }
        this.running = true;
        try {
            const cutoff = new Date(Date.now() - this.delayMinutes * 60_000);
            const rows = await this.findDue(cutoff);
            if (rows.length === 0)
                return;
            let sent = 0;
            for (const row of rows) {
                if (!(await this.claim(row)))
                    continue;
                const ok = await this.mail.sendUnreadMessagesEmail({
                    to: row.email,
                    recipientName: row.recipientName,
                    senderName: row.senderName || 'Someone',
                    unreadCount: Number(row.unreadCount) || 1,
                    preview: row.preview,
                    conversationId: row.conversationId,
                });
                if (ok)
                    sent++;
            }
            this.logger.log(`Unread-messages sweep: ${rows.length} due, ${sent} emails sent`);
        }
        catch (error) {
            this.logger.error(`Unread-messages sweep failed: ${error.message}`);
        }
        finally {
            this.running = false;
        }
    }
    async findDue(cutoff) {
        const rows = await this.prisma.$queryRaw `
      SELECT
        cp."userId"          AS "userId",
        cp."conversationId"  AS "conversationId",
        u."email"            AS "email",
        u."name"             AS "recipientName",
        s."name"             AS "senderName",
        LEFT(latest."body", ${client_1.Prisma.raw(String(PREVIEW_MAX))}) AS "preview",
        (
          SELECT COUNT(*)::int FROM "Message" m2
          WHERE m2."conversationId" = cp."conversationId"
            AND m2."senderId" <> cp."userId"
            AND m2."createdAt" > COALESCE(cp."lastReadAt", TIMESTAMP 'epoch')
        ) AS "unreadCount"
      FROM "ConversationParticipant" cp
      JOIN "User" u ON u."id" = cp."userId"
      JOIN LATERAL (
        SELECT m."body", m."createdAt", m."senderId"
        FROM "Message" m
        WHERE m."conversationId" = cp."conversationId"
          AND m."senderId" <> cp."userId"
        ORDER BY m."createdAt" DESC
        LIMIT 1
      ) latest ON TRUE
      JOIN "User" s ON s."id" = latest."senderId"
      WHERE u."email" IS NOT NULL
        AND u."emailOnUnreadMessages" = TRUE
        AND latest."createdAt" <= ${cutoff}
        AND latest."createdAt" > COALESCE(cp."lastReadAt", TIMESTAMP 'epoch')
        AND (
          cp."lastEmailedAt" IS NULL
          OR cp."lastEmailedAt" <= COALESCE(cp."lastReadAt", TIMESTAMP 'epoch')
        )
      LIMIT ${client_1.Prisma.raw(String(BATCH_LIMIT))}
    `;
        return rows;
    }
    async claim(row) {
        const affected = await this.prisma.$executeRaw `
      UPDATE "ConversationParticipant"
      SET "lastEmailedAt" = NOW()
      WHERE "conversationId" = ${row.conversationId}
        AND "userId" = ${row.userId}
        AND (
          "lastEmailedAt" IS NULL
          OR "lastEmailedAt" <= COALESCE("lastReadAt", TIMESTAMP 'epoch')
        )
    `;
        return affected === 1;
    }
};
exports.UnreadMessagesEmailService = UnreadMessagesEmailService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UnreadMessagesEmailService.prototype, "sweep", null);
exports.UnreadMessagesEmailService = UnreadMessagesEmailService = UnreadMessagesEmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof mail_service_1.MailService !== "undefined" && mail_service_1.MailService) === "function" ? _b : Object])
], UnreadMessagesEmailService);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const notifications_module_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(12);
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(notifications_module_1.NotificationsModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host: '::',
            port: 3004,
        },
    });
    await app.listen();
}
bootstrap();

})();

/******/ })()
;