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
exports.MastersModule = void 0;
const common_1 = __webpack_require__(3);
const masters_controller_1 = __webpack_require__(4);
const masters_service_1 = __webpack_require__(6);
const prisma_module_1 = __webpack_require__(11);
const microservices_1 = __webpack_require__(5);
let MastersModule = class MastersModule {
};
exports.MastersModule = MastersModule;
exports.MastersModule = MastersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            microservices_1.ClientsModule.register([
                {
                    name: 'NOTIFICATIONS_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.NOTIFICATIONS_HOST || 'localhost',
                        port: 3004,
                    },
                },
            ]),
        ],
        controllers: [masters_controller_1.MastersController],
        providers: [masters_service_1.MastersService],
    })
], MastersModule);


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 4 */
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
exports.MastersController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(5);
const masters_service_1 = __webpack_require__(6);
let MastersController = class MastersController {
    mastersService;
    constructor(mastersService) {
        this.mastersService = mastersService;
    }
    getMasters(data) {
        const filters = {
            search: data.search,
            regionId: data.regionId,
            cityId: data.cityId,
            topRated: data.topRated,
            availableNow: data.availableNow,
        };
        return this.mastersService.getMasters(data.page, data.limit, filters);
    }
    globalSearch(data) {
        const filters = {
            search: data.search,
            regionId: data.regionId,
            cityId: data.cityId,
            topRated: data.topRated,
            availableNow: data.availableNow,
        };
        return this.mastersService.globalSearch(data.page, data.limit, filters);
    }
    getMasterById(data) {
        return this.mastersService.getMasterById(data.id);
    }
    getSkills(data) {
        return this.mastersService.getSkills(data?.approvedOnly);
    }
    suggestSkill(data) {
        return this.mastersService.suggestSkill(data);
    }
    createBrigade(data) {
        return this.mastersService.createBrigade(data);
    }
    getBrigades(data) {
        return this.mastersService.getBrigadesByOwnerId(data.ownerId);
    }
    deleteBrigade(data) {
        return this.mastersService.deleteBrigade(data);
    }
    updateBrigade(data) {
        return this.mastersService.updateBrigade(data);
    }
    acceptBrigadeInvite(data) {
        return this.mastersService.acceptBrigadeInvite(data);
    }
    rejectBrigadeInvite(data) {
        return this.mastersService.rejectBrigadeInvite(data);
    }
};
exports.MastersController = MastersController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-masters' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "getMasters", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'global-search' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "globalSearch", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-master-by-id' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "getMasterById", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-skills' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "getSkills", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'suggest-skill' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "suggestSkill", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create-brigade' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "createBrigade", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-brigades' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "getBrigades", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'delete-brigade' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "deleteBrigade", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'update-brigade' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateBrigade", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'accept-brigade-invite' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "acceptBrigadeInvite", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'reject-brigade-invite' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "rejectBrigadeInvite", null);
exports.MastersController = MastersController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof masters_service_1.MastersService !== "undefined" && masters_service_1.MastersService) === "function" ? _a : Object])
], MastersController);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MastersService = void 0;
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(7);
const microservices_1 = __webpack_require__(5);
const client_1 = __webpack_require__(8);
let MastersService = class MastersService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async getMasters(page = 1, limit = 10, filters) {
        const skip = (page - 1) * limit;
        const where = {
            roles: {
                has: 'MASTER',
            },
            verifiedAt: {
                not: null,
            },
            isBlocked: false,
        };
        const AND = [];
        if (filters?.regionId)
            AND.push({ userInfo: { is: { regionId: filters.regionId } } });
        if (filters?.cityId)
            AND.push({ userInfo: { is: { cityId: filters.cityId } } });
        if (filters?.topRated)
            AND.push({ userInfo: { is: { topRated: filters.topRated } } });
        if (filters?.availableNow)
            AND.push({ userInfo: { is: { availableNow: filters.availableNow } } });
        if (filters?.search) {
            const searchStr = filters.search;
            const matchingSkills = await this.prisma.skill.findMany({
                where: {
                    approved: true,
                    OR: [
                        { nameAm: { contains: searchStr, mode: 'insensitive' } },
                        { nameRu: { contains: searchStr, mode: 'insensitive' } },
                        { nameEn: { contains: searchStr, mode: 'insensitive' } },
                        { nameFa: { contains: searchStr, mode: 'insensitive' } },
                        { key: { contains: searchStr, mode: 'insensitive' } },
                    ],
                },
            });
            const matchingSkillKeys = matchingSkills.map((s) => s.key);
            AND.push({
                OR: [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    matchingSkillKeys.length > 0
                        ? { userInfo: { is: { skills: { hasSome: matchingSkillKeys } } } }
                        : { id: 'no-match-skill' },
                ],
            });
        }
        if (AND.length > 0) {
            where.AND = AND;
        }
        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: { userInfo: true },
                skip,
                take: limit,
            }),
            this.prisma.user.count({
                where,
            }),
        ]);
        const sanitizedItems = items.map(({ password, ...rest }) => rest);
        return {
            items: sanitizedItems,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async globalSearch(page = 1, limit = 10, filters) {
        const mastersData = await this.getMasters(page, limit, filters);
        return {
            masters: mastersData,
        };
    }
    async getMasterById(id) {
        const master = await this.prisma.user.findUnique({
            where: {
                id,
                roles: {
                    has: 'MASTER',
                },
            },
            include: {
                userInfo: true,
                portfolios: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!master) {
            throw new common_1.NotFoundException('Master not found');
        }
        const { password, ...sanitizedMaster } = master;
        return sanitizedMaster;
    }
    async getSkills(approvedOnly = true) {
        return this.prisma.skill.findMany({
            where: approvedOnly ? { approved: true } : undefined,
            orderBy: { nameEn: 'asc' },
        });
    }
    async suggestSkill(data) {
        return this.prisma.skill.create({
            data: {
                ...data,
                approved: false,
            },
        });
    }
    async createBrigade(data) {
        const { ownerId, name, invites } = data;
        if (!name || name.trim() === '') {
            return { error: 'Brigade name is required' };
        }
        const uniqueInvites = [...new Set(invites)];
        const invalidInvites = [];
        const validUserIds = [];
        for (const invite of uniqueInvites) {
            const user = await this.prisma.user.findFirst({
                where: {
                    OR: [{ email: invite }, { phone: invite }],
                },
            });
            if (!user || !user.roles.includes('MASTER')) {
                invalidInvites.push(invite);
            }
            else if (user.id === ownerId) {
                invalidInvites.push(invite + " (cannot invite yourself)");
            }
            else {
                validUserIds.push(user.id);
            }
        }
        if (invalidInvites.length > 0) {
            return { error: `Invalid invites: The following users were not found, are not masters, or are invalid: ${invalidInvites.join(', ')}` };
        }
        const brigade = await this.prisma.brigade.create({
            data: {
                name,
                ownerId,
                members: {
                    create: validUserIds.map((userId) => ({
                        userId,
                        status: 'PENDING',
                    })),
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, phone: true, avatarUrl: true }
                        }
                    }
                }
            }
        });
        for (const userId of validUserIds) {
            this.notificationsService.emit({ cmd: 'create-notification' }, {
                userId,
                type: client_1.NotificationType.BRIGADE_INVITE,
                title: 'Brigade Invitation',
                message: `You have been invited to join the brigade "${brigade.name}".`,
                metadata: { brigadeId: brigade.id },
            });
        }
        return brigade;
    }
    async getBrigadesByOwnerId(ownerId) {
        return this.prisma.brigade.findMany({
            where: { ownerId },
            include: {
                members: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async deleteBrigade(data) {
        const { ownerId, brigadeId } = data;
        const brigade = await this.prisma.brigade.findFirst({
            where: { id: brigadeId, ownerId }
        });
        if (!brigade) {
            return { error: 'Brigade not found or unauthorized' };
        }
        await this.prisma.brigade.delete({
            where: { id: brigadeId }
        });
        return { success: true };
    }
    async updateBrigade(data) {
        const { ownerId, brigadeId, name, invites, removeMemberIds } = data;
        const brigade = await this.prisma.brigade.findFirst({
            where: { id: brigadeId, ownerId }
        });
        if (!brigade) {
            return { error: 'Brigade not found or unauthorized' };
        }
        if (!name || name.trim() === '') {
            return { error: 'Brigade name is required' };
        }
        const uniqueInvites = [...new Set(invites)];
        const invalidInvites = [];
        const validUserIds = [];
        for (const invite of uniqueInvites) {
            const user = await this.prisma.user.findFirst({
                where: {
                    OR: [{ email: invite }, { phone: invite }],
                },
            });
            if (!user || !user.roles.includes('MASTER')) {
                invalidInvites.push(invite);
            }
            else if (user.id === ownerId) {
                invalidInvites.push(invite + " (cannot invite yourself)");
            }
            else {
                const existingMember = await this.prisma.brigadeMember.findFirst({
                    where: { brigadeId, userId: user.id }
                });
                if (!existingMember) {
                    validUserIds.push(user.id);
                }
            }
        }
        if (invalidInvites.length > 0) {
            return { error: `Invalid invites: The following users were not found, are not masters, or are invalid: ${invalidInvites.join(', ')}` };
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.brigade.update({
                where: { id: brigadeId },
                data: { name }
            });
            if (removeMemberIds && removeMemberIds.length > 0) {
                await tx.brigadeMember.deleteMany({
                    where: {
                        id: { in: removeMemberIds },
                        brigadeId: brigadeId
                    }
                });
            }
            if (validUserIds.length > 0) {
                await tx.brigadeMember.createMany({
                    data: validUserIds.map((userId) => ({
                        brigadeId,
                        userId,
                        status: 'PENDING',
                    }))
                });
            }
        });
        for (const userId of validUserIds) {
            this.notificationsService.emit({ cmd: 'create-notification' }, {
                userId,
                type: client_1.NotificationType.BRIGADE_INVITE,
                title: 'Brigade Invitation',
                message: `You have been invited to join the brigade "${name}".`,
                metadata: { brigadeId },
            });
        }
        return this.prisma.brigade.findUnique({
            where: { id: brigadeId },
            include: {
                members: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
                    }
                }
            }
        });
    }
    async acceptBrigadeInvite(data) {
        const { userId, brigadeId } = data;
        const member = await this.prisma.brigadeMember.findFirst({
            where: { userId, brigadeId, status: 'PENDING' },
        });
        if (!member) {
            return { error: 'Invite not found or already accepted/rejected' };
        }
        await this.prisma.brigadeMember.update({
            where: { id: member.id },
            data: { status: 'ACCEPTED' },
        });
        return { success: true };
    }
    async rejectBrigadeInvite(data) {
        const { userId, brigadeId } = data;
        const member = await this.prisma.brigadeMember.findFirst({
            where: { userId, brigadeId, status: 'PENDING' },
        });
        if (!member) {
            return { error: 'Invite not found or already accepted/rejected' };
        }
        await this.prisma.brigadeMember.update({
            where: { id: member.id },
            data: { status: 'REJECTED' },
        });
        return { success: true };
    }
};
exports.MastersService = MastersService;
exports.MastersService = MastersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('NOTIFICATIONS_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object])
], MastersService);


/***/ }),
/* 7 */
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
const client_1 = __webpack_require__(8);
const pg_1 = __webpack_require__(9);
const adapter_pg_1 = __webpack_require__(10);
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
/* 8 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("pg");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@prisma/adapter-pg");

/***/ }),
/* 11 */
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
const prisma_service_1 = __webpack_require__(7);
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], PrismaModule);


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
const masters_module_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(5);
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(masters_module_1.MastersModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: 3002,
        },
    });
    await app.listen();
}
bootstrap();

})();

/******/ })()
;