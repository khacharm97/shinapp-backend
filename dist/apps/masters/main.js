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
exports.AppModule = void 0;
const common_1 = __webpack_require__(3);
const masters_module_1 = __webpack_require__(4);
const skills_module_1 = __webpack_require__(13);
const brigades_module_1 = __webpack_require__(16);
const announcements_module_1 = __webpack_require__(20);
const orders_module_1 = __webpack_require__(23);
const reviews_module_1 = __webpack_require__(26);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            masters_module_1.MastersModule,
            skills_module_1.SkillsModule,
            brigades_module_1.BrigadesModule,
            announcements_module_1.AnnouncementsModule,
            orders_module_1.OrdersModule,
            reviews_module_1.ReviewsModule,
        ],
    })
], AppModule);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MastersModule = void 0;
const common_1 = __webpack_require__(3);
const masters_controller_1 = __webpack_require__(5);
const masters_service_1 = __webpack_require__(7);
const prisma_module_1 = __webpack_require__(12);
let MastersModule = class MastersModule {
};
exports.MastersModule = MastersModule;
exports.MastersModule = MastersModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [masters_controller_1.MastersController],
        providers: [masters_service_1.MastersService],
    })
], MastersModule);


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
exports.MastersController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(6);
const masters_service_1 = __webpack_require__(7);
let MastersController = class MastersController {
    mastersService;
    constructor(mastersService) {
        this.mastersService = mastersService;
    }
    getMasters(data) {
        return this.mastersService.getMasters(data.page, data.limit, {
            search: data.search,
            regionId: data.regionId,
            cityId: data.cityId,
            topRated: data.topRated,
            availableNow: data.availableNow,
        });
    }
    globalSearch(data) {
        return this.mastersService.globalSearch(data.page, data.limit, {
            search: data.search,
            regionId: data.regionId,
            cityId: data.cityId,
            topRated: data.topRated,
            availableNow: data.availableNow,
        });
    }
    getMasterById(data) {
        return this.mastersService.getMasterById(data.id);
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
exports.MastersController = MastersController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof masters_service_1.MastersService !== "undefined" && masters_service_1.MastersService) === "function" ? _a : Object])
], MastersController);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MastersService = void 0;
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(8);
let MastersService = class MastersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
                include: {
                    userInfo: true,
                    ownedBrigades: true,
                    brigadeMemberships: {
                        where: { status: 'ACCEPTED' },
                        include: { brigade: true }
                    }
                },
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
                brigadeMemberships: {
                    where: { status: 'ACCEPTED' },
                    include: { brigade: true },
                },
                ownedBrigades: true,
            },
        });
        if (!master) {
            throw new common_1.NotFoundException('Master not found');
        }
        const { password, ...sanitizedMaster } = master;
        return sanitizedMaster;
    }
};
exports.MastersService = MastersService;
exports.MastersService = MastersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], MastersService);


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
/* 13 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SkillsModule = void 0;
const common_1 = __webpack_require__(3);
const skills_controller_1 = __webpack_require__(14);
const skills_service_1 = __webpack_require__(15);
const prisma_module_1 = __webpack_require__(12);
let SkillsModule = class SkillsModule {
};
exports.SkillsModule = SkillsModule;
exports.SkillsModule = SkillsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [skills_controller_1.SkillsController],
        providers: [skills_service_1.SkillsService],
    })
], SkillsModule);


/***/ }),
/* 14 */
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
exports.SkillsController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(6);
const skills_service_1 = __webpack_require__(15);
let SkillsController = class SkillsController {
    skillsService;
    constructor(skillsService) {
        this.skillsService = skillsService;
    }
    getSkills(data) {
        return this.skillsService.getSkills(data?.approvedOnly);
    }
    suggestSkill(data) {
        return this.skillsService.suggestSkill(data);
    }
};
exports.SkillsController = SkillsController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-skills' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SkillsController.prototype, "getSkills", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'suggest-skill' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SkillsController.prototype, "suggestSkill", null);
exports.SkillsController = SkillsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof skills_service_1.SkillsService !== "undefined" && skills_service_1.SkillsService) === "function" ? _a : Object])
], SkillsController);


/***/ }),
/* 15 */
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SkillsService = void 0;
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(8);
let SkillsService = class SkillsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
};
exports.SkillsService = SkillsService;
exports.SkillsService = SkillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], SkillsService);


/***/ }),
/* 16 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrigadesModule = void 0;
const common_1 = __webpack_require__(3);
const brigades_controller_1 = __webpack_require__(17);
const brigades_service_1 = __webpack_require__(18);
const prisma_module_1 = __webpack_require__(12);
const notifications_client_module_1 = __webpack_require__(19);
let BrigadesModule = class BrigadesModule {
};
exports.BrigadesModule = BrigadesModule;
exports.BrigadesModule = BrigadesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notifications_client_module_1.NotificationsClientModule],
        controllers: [brigades_controller_1.BrigadesController],
        providers: [brigades_service_1.BrigadesService],
    })
], BrigadesModule);


/***/ }),
/* 17 */
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
exports.BrigadesController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(6);
const brigades_service_1 = __webpack_require__(18);
let BrigadesController = class BrigadesController {
    brigadesService;
    constructor(brigadesService) {
        this.brigadesService = brigadesService;
    }
    createBrigade(data) {
        return this.brigadesService.createBrigade(data);
    }
    getBrigadeById(data) {
        return this.brigadesService.getBrigadeById(data.id);
    }
    getBrigades(data) {
        return this.brigadesService.getBrigadesByOwnerId(data.ownerId);
    }
    searchBrigadeInvitees(data) {
        return this.brigadesService.searchBrigadeInvitees(data);
    }
    deleteBrigade(data) {
        return this.brigadesService.deleteBrigade(data);
    }
    updateBrigade(data) {
        return this.brigadesService.updateBrigade(data);
    }
    acceptBrigadeInvite(data) {
        return this.brigadesService.acceptBrigadeInvite(data);
    }
    rejectBrigadeInvite(data) {
        return this.brigadesService.rejectBrigadeInvite(data);
    }
};
exports.BrigadesController = BrigadesController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create-brigade' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrigadesController.prototype, "createBrigade", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-brigade-by-id' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrigadesController.prototype, "getBrigadeById", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-brigades' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrigadesController.prototype, "getBrigades", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'search-brigade-invitees' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrigadesController.prototype, "searchBrigadeInvitees", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'delete-brigade' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrigadesController.prototype, "deleteBrigade", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'update-brigade' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrigadesController.prototype, "updateBrigade", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'accept-brigade-invite' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrigadesController.prototype, "acceptBrigadeInvite", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'reject-brigade-invite' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrigadesController.prototype, "rejectBrigadeInvite", null);
exports.BrigadesController = BrigadesController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof brigades_service_1.BrigadesService !== "undefined" && brigades_service_1.BrigadesService) === "function" ? _a : Object])
], BrigadesController);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrigadesService = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(6);
const client_1 = __webpack_require__(9);
const prisma_service_1 = __webpack_require__(8);
let BrigadesService = class BrigadesService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async getBrigadeById(id) {
        const brigade = await this.prisma.brigade.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, userInfo: true },
                },
                members: {
                    where: { status: 'ACCEPTED' },
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, phone: true, avatarUrl: true, userInfo: true, portfolios: true },
                        },
                    },
                },
            },
        });
        if (!brigade) {
            throw new common_1.NotFoundException('Brigade not found');
        }
        return brigade;
    }
    async createBrigade(data) {
        const { ownerId, name, about, invites } = data;
        if (!name || name.trim() === '') {
            return { error: 'Brigade name is required' };
        }
        const uniqueInvites = [...new Set(invites)];
        const invalidInvites = [];
        const validUserIds = [];
        for (const invite of uniqueInvites) {
            const user = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: invite },
                        { phone: invite },
                        { name: { contains: invite, mode: 'insensitive' } }
                    ],
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
                about,
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
    async searchBrigadeInvitees(data) {
        const { requesterId, brigadeId } = data;
        const search = (data.search || '').trim();
        const limit = Math.min(data.limit && data.limit > 0 ? data.limit : 5, 20);
        if (search.length < 2) {
            return { items: [] };
        }
        const excludeUserIds = new Set([requesterId]);
        if (brigadeId) {
            const members = await this.prisma.brigadeMember.findMany({
                where: { brigadeId },
                select: { userId: true },
            });
            members.forEach((m) => excludeUserIds.add(m.userId));
        }
        const items = await this.prisma.user.findMany({
            where: {
                roles: { has: 'MASTER' },
                isBlocked: false,
                id: { notIn: [...excludeUserIds] },
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { equals: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
            },
            take: limit,
            orderBy: { name: 'asc' },
        });
        return { items };
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
        const { ownerId, brigadeId, name, about, invites, removeMemberIds } = data;
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
                    OR: [
                        { email: invite },
                        { phone: invite },
                        { name: { contains: invite, mode: 'insensitive' } }
                    ],
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
                data: { name, about }
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
        const brigade = await this.prisma.brigade.findUnique({
            where: { id: brigadeId },
            include: { owner: true }
        });
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (brigade && user) {
            this.notificationsService.emit({ cmd: 'create-notification' }, {
                userId: brigade.ownerId,
                type: client_1.NotificationType.SYSTEM,
                title: 'Invite Accepted',
                message: `${user.name || user.email || user.phone} has accepted your invite to join "${brigade.name}".`,
                metadata: { brigadeId: brigade.id, memberId: userId },
            });
            this.notificationsService.emit({ cmd: 'send-ws-event' }, {
                userId: brigade.ownerId,
                event: 'brigade_updated',
                payload: { brigadeId: brigade.id }
            });
        }
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
        const brigade = await this.prisma.brigade.findUnique({
            where: { id: brigadeId },
            include: { owner: true }
        });
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (brigade && user) {
            this.notificationsService.emit({ cmd: 'create-notification' }, {
                userId: brigade.ownerId,
                type: client_1.NotificationType.SYSTEM,
                title: 'Invite Rejected',
                message: `${user.name || user.email || user.phone} has rejected your invite to join "${brigade.name}".`,
                metadata: { brigadeId: brigade.id, memberId: userId },
            });
            this.notificationsService.emit({ cmd: 'send-ws-event' }, {
                userId: brigade.ownerId,
                event: 'brigade_updated',
                payload: { brigadeId: brigade.id }
            });
        }
        return { success: true };
    }
};
exports.BrigadesService = BrigadesService;
exports.BrigadesService = BrigadesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('NOTIFICATIONS_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object])
], BrigadesService);


/***/ }),
/* 19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsClientModule = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(6);
let NotificationsClientModule = class NotificationsClientModule {
};
exports.NotificationsClientModule = NotificationsClientModule;
exports.NotificationsClientModule = NotificationsClientModule = __decorate([
    (0, common_1.Module)({
        imports: [
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
        exports: [microservices_1.ClientsModule],
    })
], NotificationsClientModule);


/***/ }),
/* 20 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnnouncementsModule = void 0;
const common_1 = __webpack_require__(3);
const announcements_controller_1 = __webpack_require__(21);
const announcements_service_1 = __webpack_require__(22);
const prisma_module_1 = __webpack_require__(12);
let AnnouncementsModule = class AnnouncementsModule {
};
exports.AnnouncementsModule = AnnouncementsModule;
exports.AnnouncementsModule = AnnouncementsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [announcements_controller_1.AnnouncementsController],
        providers: [announcements_service_1.AnnouncementsService],
    })
], AnnouncementsModule);


/***/ }),
/* 21 */
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
exports.AnnouncementsController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(6);
const announcements_service_1 = __webpack_require__(22);
let AnnouncementsController = class AnnouncementsController {
    announcementsService;
    constructor(announcementsService) {
        this.announcementsService = announcementsService;
    }
    async getPublicAnnouncements(data) {
        try {
            return await this.announcementsService.getPublicAnnouncements(data.page, data.limit);
        }
        catch (e) {
            return { error: e.message || 'Failed to fetch public announcements' };
        }
    }
    async getMyAnnouncements(data) {
        try {
            return await this.announcementsService.getMyAnnouncements(data.companyId);
        }
        catch (e) {
            return { error: e.message || 'Failed to fetch announcements' };
        }
    }
    async createMyAnnouncement(data) {
        try {
            return await this.announcementsService.createMyAnnouncement(data.companyId, data.payload);
        }
        catch (e) {
            return { error: e.message || 'Failed to create announcement' };
        }
    }
    async updateMyAnnouncement(data) {
        try {
            return await this.announcementsService.updateMyAnnouncement(data.companyId, data.id, data.payload);
        }
        catch (e) {
            return { error: e.message || 'Failed to update announcement' };
        }
    }
    async deleteMyAnnouncement(data) {
        try {
            return await this.announcementsService.deleteMyAnnouncement(data.companyId, data.id);
        }
        catch (e) {
            return { error: e.message || 'Failed to delete announcement' };
        }
    }
};
exports.AnnouncementsController = AnnouncementsController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'masters.get_public_announcements' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "getPublicAnnouncements", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'masters.get_my_announcements' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "getMyAnnouncements", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'masters.create_my_announcement' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "createMyAnnouncement", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'masters.update_my_announcement' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "updateMyAnnouncement", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'masters.delete_my_announcement' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "deleteMyAnnouncement", null);
exports.AnnouncementsController = AnnouncementsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof announcements_service_1.AnnouncementsService !== "undefined" && announcements_service_1.AnnouncementsService) === "function" ? _a : Object])
], AnnouncementsController);


/***/ }),
/* 22 */
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnnouncementsService = void 0;
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(8);
let AnnouncementsService = class AnnouncementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPublicAnnouncements(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.announcement.findMany({
                where: {
                    status: 'PUBLISHED',
                },
                include: {
                    company: {
                        select: { id: true, name: true, email: true, phone: true, avatarUrl: true }
                    }
                },
                orderBy: [
                    { urgent: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            this.prisma.announcement.count({
                where: {
                    status: 'PUBLISHED',
                }
            }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getMyAnnouncements(companyId) {
        return this.prisma.announcement.findMany({
            where: { companyId },
            include: {
                company: {
                    select: { id: true, name: true, email: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createMyAnnouncement(companyId, data) {
        const startDate = data.startDate ? new Date(data.startDate) : new Date();
        const endDate = data.endDate ? new Date(data.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return this.prisma.announcement.create({
            data: {
                companyId,
                sphere: data.sphere,
                title: data.title,
                description: data.description,
                urgent: data.urgent || false,
                status: data.status || 'PENDING',
                startDate,
                endDate,
                imageUrls: data.imageUrls || [],
            },
        });
    }
    async updateMyAnnouncement(companyId, id, data) {
        const existing = await this.prisma.announcement.findUnique({ where: { id } });
        if (!existing || existing.companyId !== companyId) {
            throw new Error('Unauthorized or not found');
        }
        const updateData = { ...data };
        if (updateData.startDate)
            updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate)
            updateData.endDate = new Date(updateData.endDate);
        let removedImages = [];
        if (data.imageUrls) {
            removedImages = existing.imageUrls.filter(url => !data.imageUrls.includes(url));
        }
        const updated = await this.prisma.announcement.update({
            where: { id },
            data: updateData,
        });
        return { ...updated, removedImages };
    }
    async deleteMyAnnouncement(companyId, id) {
        const existing = await this.prisma.announcement.findUnique({ where: { id } });
        if (!existing || existing.companyId !== companyId) {
            throw new Error('Unauthorized or not found');
        }
        const deleted = await this.prisma.announcement.delete({
            where: { id },
        });
        return { ...deleted, removedImages: existing.imageUrls || [] };
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], AnnouncementsService);


/***/ }),
/* 23 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrdersModule = void 0;
const common_1 = __webpack_require__(3);
const orders_controller_1 = __webpack_require__(24);
const orders_service_1 = __webpack_require__(25);
const prisma_module_1 = __webpack_require__(12);
const notifications_client_module_1 = __webpack_require__(19);
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notifications_client_module_1.NotificationsClientModule],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService],
    })
], OrdersModule);


/***/ }),
/* 24 */
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
exports.OrdersController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(6);
const orders_service_1 = __webpack_require__(25);
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    createOrder(data) {
        return this.ordersService.createOrder(data);
    }
    getMyOrders(data) {
        return this.ordersService.getMyOrders(data.userId);
    }
    getOrderById(data) {
        return this.ordersService.getOrderById(data.userId, data.orderId);
    }
    updateOrder(data) {
        return this.ordersService.updateOrder(data);
    }
    acceptOrder(data) {
        return this.ordersService.acceptOrder(data.userId, data.orderId);
    }
    rejectOrder(data) {
        return this.ordersService.rejectOrder(data.userId, data.orderId);
    }
    requestOrderCompletion(data) {
        return this.ordersService.requestOrderCompletion(data.userId, data.orderId);
    }
    acceptOrderCompletion(data) {
        return this.ordersService.acceptOrderCompletion(data.userId, data.orderId);
    }
    getMasterBusyDates(data) {
        return this.ordersService.getBusyDatesForMaster(data.masterId);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create-order' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-my-orders' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getMyOrders", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-order-by-id' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'update-order' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateOrder", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'accept-order' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "acceptOrder", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'reject-order' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "rejectOrder", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'request-order-completion' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "requestOrderCompletion", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'accept-order-completion' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "acceptOrderCompletion", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-master-busy-dates' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getMasterBusyDates", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof orders_service_1.OrdersService !== "undefined" && orders_service_1.OrdersService) === "function" ? _a : Object])
], OrdersController);


/***/ }),
/* 25 */
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
exports.OrdersService = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(6);
const client_1 = __webpack_require__(9);
const prisma_service_1 = __webpack_require__(8);
let OrdersService = class OrdersService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async createOrder(data) {
        const { initiatorId, masterId, clientId, description, imageUrl, startDate, endDate, paymentMethod, price, address, latitude, longitude, privacyAccepted } = data;
        const client = await this.prisma.user.findUnique({ where: { id: clientId } });
        const master = await this.prisma.user.findUnique({ where: { id: masterId } });
        if (!client || !master) {
            return { error: 'Client or Master not found' };
        }
        const order = await this.prisma.order.create({
            data: {
                clientId,
                masterId,
                initiatorId,
                description,
                imageUrl,
                startDate,
                endDate,
                paymentMethod,
                price,
                address,
                latitude,
                longitude,
                privacyAccepted,
                status: 'PENDING',
            },
            include: {
                client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
                master: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
            }
        });
        const receiverId = initiatorId === clientId ? masterId : clientId;
        this.notificationsService.emit({ cmd: 'create-notification' }, {
            userId: receiverId,
            type: client_1.NotificationType.ORDER_INVITE,
            title: 'New Order Request',
            message: `You have received a new order request from ${initiatorId === clientId ? (client.name || 'a client') : (master.name || 'a master')}.`,
            metadata: { orderId: order.id },
        });
        return order;
    }
    async getMyOrders(userId) {
        return this.prisma.order.findMany({
            where: {
                OR: [
                    { clientId: userId },
                    { masterId: userId }
                ]
            },
            include: {
                client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
                master: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getOrderById(userId, orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
                master: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
            }
        });
        if (!order) {
            return { error: 'Order not found' };
        }
        if (order.clientId !== userId && order.masterId !== userId) {
            return { error: 'Unauthorized to view this order' };
        }
        return order;
    }
    async updateOrder(data) {
        const { orderId, initiatorId, description, imageUrl, startDate, endDate, paymentMethod, price, address, latitude, longitude, privacyAccepted } = data;
        const existing = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!existing)
            return { error: 'Order not found' };
        if (existing.clientId !== initiatorId && existing.masterId !== initiatorId) {
            return { error: 'Unauthorized to edit this order' };
        }
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                initiatorId,
                description,
                startDate,
                endDate,
                paymentMethod,
                price,
                address,
                latitude,
                longitude,
                privacyAccepted,
                status: 'PENDING',
                ...(imageUrl !== undefined ? { imageUrl } : {}),
            },
            include: {
                client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
                master: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
            }
        });
        const receiverId = initiatorId === updated.clientId ? updated.masterId : updated.clientId;
        const initiatorName = initiatorId === updated.clientId ? (updated.client.name || 'Client') : (updated.master.name || 'Master');
        this.notificationsService.emit({ cmd: 'create-notification' }, {
            userId: receiverId,
            type: client_1.NotificationType.ORDER_UPDATE,
            title: 'Order Updated',
            message: `${initiatorName} has proposed new terms for your order.`,
            metadata: { orderId: updated.id },
        });
        return updated;
    }
    async acceptOrder(userId, orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            return { error: 'Order not found' };
        if (order.clientId !== userId && order.masterId !== userId)
            return { error: 'Unauthorized' };
        if (order.initiatorId === userId) {
            return { error: 'You cannot accept an order you proposed. Wait for the other party.' };
        }
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'ACCEPTED' },
            include: {
                client: { select: { id: true, name: true } },
                master: { select: { id: true, name: true } }
            }
        });
        const receiverId = order.initiatorId;
        const accepterName = userId === updated.clientId ? (updated.client.name || 'Client') : (updated.master.name || 'Master');
        this.notificationsService.emit({ cmd: 'create-notification' }, {
            userId: receiverId,
            type: client_1.NotificationType.ORDER_ACCEPTED,
            title: 'Order Accepted',
            message: `${accepterName} has accepted the order terms.`,
            metadata: { orderId: updated.id },
        });
        return updated;
    }
    async rejectOrder(userId, orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            return { error: 'Order not found' };
        if (order.clientId !== userId && order.masterId !== userId)
            return { error: 'Unauthorized' };
        if (order.initiatorId === userId) {
            return { error: 'You cannot reject an order you proposed. You can only cancel it.' };
        }
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'REJECTED' },
            include: {
                client: { select: { id: true, name: true } },
                master: { select: { id: true, name: true } }
            }
        });
        const receiverId = order.initiatorId;
        const rejecterName = userId === updated.clientId ? (updated.client.name || 'Client') : (updated.master.name || 'Master');
        this.notificationsService.emit({ cmd: 'create-notification' }, {
            userId: receiverId,
            type: client_1.NotificationType.ORDER_REJECTED,
            title: 'Order Rejected',
            message: `${rejecterName} has rejected the order terms.`,
            metadata: { orderId: updated.id },
        });
        return updated;
    }
    async requestOrderCompletion(userId, orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            return { error: 'Order not found' };
        if (order.clientId !== userId && order.masterId !== userId)
            return { error: 'Unauthorized' };
        if (order.status !== 'ACCEPTED')
            return { error: 'Only accepted orders can be requested for completion' };
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETION_REQUESTED',
                initiatorId: userId
            },
            include: {
                client: { select: { id: true, name: true } },
                master: { select: { id: true, name: true } }
            }
        });
        const receiverId = userId === updated.clientId ? updated.masterId : updated.clientId;
        const requesterName = userId === updated.clientId ? (updated.client.name || 'Client') : (updated.master.name || 'Master');
        this.notificationsService.emit({ cmd: 'create-notification' }, {
            userId: receiverId,
            type: 'SYSTEM',
            title: 'Order Completion Requested',
            message: `${requesterName} has marked the order as completed. Please confirm.`,
            metadata: { orderId: updated.id },
        });
        return updated;
    }
    async acceptOrderCompletion(userId, orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            return { error: 'Order not found' };
        if (order.clientId !== userId && order.masterId !== userId)
            return { error: 'Unauthorized' };
        if (order.status !== 'COMPLETION_REQUESTED')
            return { error: 'Order is not pending completion' };
        if (order.initiatorId === userId)
            return { error: 'You cannot accept your own completion request' };
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' },
            include: {
                client: { select: { id: true, name: true } },
                master: { select: { id: true, name: true } }
            }
        });
        const receiverId = order.initiatorId;
        const accepterName = userId === updated.clientId ? (updated.client.name || 'Client') : (updated.master.name || 'Master');
        this.notificationsService.emit({ cmd: 'create-notification' }, {
            userId: receiverId,
            type: 'SYSTEM',
            title: 'Order Completed',
            message: `${accepterName} has confirmed the order is completed.`,
            metadata: { orderId: updated.id },
        });
        return updated;
    }
    async getBusyDatesForMaster(masterId) {
        const orders = await this.prisma.order.findMany({
            where: {
                masterId,
                status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] }
            },
            select: {
                startDate: true,
                endDate: true
            }
        });
        return orders;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('NOTIFICATIONS_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object])
], OrdersService);


/***/ }),
/* 26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReviewsModule = void 0;
const common_1 = __webpack_require__(3);
const reviews_controller_1 = __webpack_require__(27);
const reviews_service_1 = __webpack_require__(28);
const prisma_module_1 = __webpack_require__(12);
let ReviewsModule = class ReviewsModule {
};
exports.ReviewsModule = ReviewsModule;
exports.ReviewsModule = ReviewsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [reviews_controller_1.ReviewsController],
        providers: [reviews_service_1.ReviewsService],
    })
], ReviewsModule);


/***/ }),
/* 27 */
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
exports.ReviewsController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(6);
const reviews_service_1 = __webpack_require__(28);
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    createReview(data) {
        return this.reviewsService.createReview(data);
    }
    getMasterReviews(data) {
        return this.reviewsService.getReviewsForMaster(data.masterId);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create-review' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "createReview", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get-master-reviews' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "getMasterReviews", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof reviews_service_1.ReviewsService !== "undefined" && reviews_service_1.ReviewsService) === "function" ? _a : Object])
], ReviewsController);


/***/ }),
/* 28 */
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReviewsService = void 0;
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(8);
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReview(data) {
        const { orderId, authorId, targetId, rating, comment } = data;
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            return { error: 'Order not found' };
        if (order.status !== 'COMPLETED')
            return { error: 'Order must be completed to leave a review' };
        const existing = await this.prisma.review.findFirst({
            where: { orderId, authorId }
        });
        if (existing) {
            return { error: 'You have already left a review for this order' };
        }
        const review = await this.prisma.review.create({
            data: {
                orderId,
                authorId,
                targetId,
                rating,
                comment
            }
        });
        return review;
    }
    async getReviewsForMaster(masterId) {
        const reviews = await this.prisma.review.findMany({
            where: { targetId: masterId },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        return { reviews, averageRating, count: reviews.length };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ReviewsService);


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
const app_module_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(6);
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
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