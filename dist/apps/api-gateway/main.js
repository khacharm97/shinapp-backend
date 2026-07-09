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
exports.ApiGatewayModule = void 0;
const common_1 = __webpack_require__(3);
const api_gateway_controller_1 = __webpack_require__(4);
const api_gateway_service_1 = __webpack_require__(17);
const microservices_1 = __webpack_require__(5);
const jwt_1 = __webpack_require__(18);
const passport_1 = __webpack_require__(12);
const jwt_strategy_1 = __webpack_require__(19);
const google_strategy_1 = __webpack_require__(21);
const admin_controller_1 = __webpack_require__(23);
const contact_requests_controller_1 = __webpack_require__(24);
let ApiGatewayModule = class ApiGatewayModule {
};
exports.ApiGatewayModule = ApiGatewayModule;
exports.ApiGatewayModule = ApiGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.register([
                {
                    name: 'AUTH_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.AUTH_HOST || 'localhost',
                        port: 3001,
                    },
                },
                {
                    name: 'MASTERS_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.MASTERS_HOST || 'localhost',
                        port: 3002,
                    },
                },
                {
                    name: 'ADMIN_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.ADMIN_HOST || 'localhost',
                        port: 3003,
                    },
                },
            ]),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'super_secret_key',
                signOptions: { expiresIn: '1h' },
            }),
        ],
        controllers: [api_gateway_controller_1.ApiGatewayController, admin_controller_1.AdminGatewayController, contact_requests_controller_1.ContactRequestsController],
        providers: [api_gateway_service_1.ApiGatewayService, jwt_strategy_1.JwtStrategy, google_strategy_1.GoogleStrategy],
    })
], ApiGatewayModule);


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 4 */
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiGatewayController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(5);
const platform_express_1 = __webpack_require__(6);
const multer_1 = __webpack_require__(7);
const path_1 = __webpack_require__(8);
const fs = __importStar(__webpack_require__(9));
const rxjs_1 = __webpack_require__(10);
const jwt_auth_guard_1 = __webpack_require__(11);
const roles_guard_1 = __webpack_require__(13);
const roles_decorator_1 = __webpack_require__(14);
const client_1 = __webpack_require__(15);
const google_auth_guard_1 = __webpack_require__(16);
let ApiGatewayController = class ApiGatewayController {
    authService;
    mastersService;
    constructor(authService, mastersService) {
        this.authService = authService;
        this.mastersService = mastersService;
    }
    async googleAuth(req) {
    }
    async googleAuthRedirect(req, res) {
        const googleUser = req.user;
        googleUser.role = req.query.state;
        const result = await (0, rxjs_1.firstValueFrom)(this.authService.send({ cmd: 'google-login' }, googleUser));
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/auth/callback?token=${result.access_token}`);
    }
    async register(body) {
        const result = await (0, rxjs_1.firstValueFrom)(this.authService.send({ cmd: 'register' }, body));
        console.log('Microservice register returned:', result);
        return result;
    }
    async login(body) {
        const result = await (0, rxjs_1.firstValueFrom)(this.authService.send({ cmd: 'login' }, body));
        console.log('Microservice login returned:', result);
        return result;
    }
    async getSkills(approvedOnly = 'true') {
        return (0, rxjs_1.firstValueFrom)(this.mastersService.send({ cmd: 'get-skills' }, { approvedOnly: approvedOnly === 'true' }));
    }
    async suggestSkill(body) {
        return (0, rxjs_1.firstValueFrom)(this.mastersService.send({ cmd: 'suggest-skill' }, body));
    }
    async getMasters(page = '1', limit = '10', search, regionId, cityId, topRated, availableNow) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        return (0, rxjs_1.firstValueFrom)(this.mastersService.send({ cmd: 'get-masters' }, {
            page: pageNum,
            limit: limitNum,
            search,
            regionId,
            cityId,
            topRated: topRated === 'true',
            availableNow: availableNow === 'true'
        }));
    }
    async getMasterById(id) {
        return (0, rxjs_1.firstValueFrom)(this.mastersService.send({ cmd: 'get-master-by-id' }, { id }));
    }
    async globalSearch(page = '1', limit = '10', search, regionId, cityId, topRated, availableNow) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        return (0, rxjs_1.firstValueFrom)(this.mastersService.send({ cmd: 'global-search' }, {
            page: pageNum,
            limit: limitNum,
            search,
            regionId,
            cityId,
            topRated: topRated === 'true',
            availableNow: availableNow === 'true'
        }));
    }
    async testProfile(id) {
        const result = await (0, rxjs_1.firstValueFrom)(this.authService.send({ cmd: 'get-profile' }, { userId: id }));
        return result;
    }
    async getProfile(req) {
        console.log('API Gateway getProfile called with req.user:', req.user);
        const result = await (0, rxjs_1.firstValueFrom)(this.authService.send({ cmd: 'get-profile' }, { userId: req.user.id }));
        console.log('Microservice returned:', result);
        return result;
    }
    updateProfile(req, body) {
        return this.authService.send({ cmd: 'update-profile' }, { userId: req.user.id, profileData: body });
    }
    async uploadAvatar(req, file) {
        if (!file) {
            throw new Error('File not found');
        }
        try {
            const oldProfile = await (0, rxjs_1.firstValueFrom)(this.authService.send({ cmd: 'get-profile' }, { userId: req.user.id }));
            if (oldProfile && oldProfile.avatarUrl) {
                const oldFilePath = (0, path_1.join)(process.cwd(), oldProfile.avatarUrl);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
        }
        catch (e) {
            console.error('Failed to delete old avatar:', e);
        }
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        const result = await (0, rxjs_1.firstValueFrom)(this.authService.send({ cmd: 'update-avatar' }, { userId: req.user.id, avatarUrl }));
        return result;
    }
    async createPortfolio(req, files, body) {
        const imageUrls = files?.map(f => `/uploads/portfolios/${f.filename}`) || [];
        const portfolioData = {
            title: body.title,
            description: body.description,
            order: body.order ? parseInt(body.order, 10) : 0,
            imageUrls,
        };
        return (0, rxjs_1.firstValueFrom)(this.authService.send({ cmd: 'create-portfolio' }, { userId: req.user.id, portfolioData }));
    }
    async deletePortfolio(req, id) {
        return (0, rxjs_1.firstValueFrom)(this.authService.send({ cmd: 'delete-portfolio' }, { userId: req.user.id, portfolioId: id }));
    }
    getAdminData(req) {
        return { message: 'Welcome to the admin area!', user: req.user };
    }
};
exports.ApiGatewayController = ApiGatewayController;
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "googleAuthRedirect", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('skills'),
    __param(0, (0, common_1.Query)('approvedOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getSkills", null);
__decorate([
    (0, common_1.Post)('skills/suggest'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "suggestSkill", null);
__decorate([
    (0, common_1.Get)('masters'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('regionId')),
    __param(4, (0, common_1.Query)('cityId')),
    __param(5, (0, common_1.Query)('topRated')),
    __param(6, (0, common_1.Query)('availableNow')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getMasters", null);
__decorate([
    (0, common_1.Get)('masters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getMasterById", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('regionId')),
    __param(4, (0, common_1.Query)('cityId')),
    __param(5, (0, common_1.Query)('topRated')),
    __param(6, (0, common_1.Query)('availableNow')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "globalSearch", null);
__decorate([
    (0, common_1.Get)('test-profile/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "testProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiGatewayController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('profile/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = './uploads/avatars';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            }
        })
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof Express !== "undefined" && (_c = Express.Multer) !== void 0 && _c.File) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.MASTER),
    (0, common_1.Post)('profile/portfolio'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 3, {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = './uploads/portfolios';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            }
        })
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_e = typeof Array !== "undefined" && Array) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "createPortfolio", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.MASTER),
    (0, common_1.Delete)('profile/portfolio/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "deletePortfolio", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)('admin-only'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiGatewayController.prototype, "getAdminData", null);
exports.ApiGatewayController = ApiGatewayController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE')),
    __param(1, (0, common_1.Inject)('MASTERS_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object])
], ApiGatewayController);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("multer");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("rxjs");

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
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(12);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 13 */
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
exports.RolesGuard = void 0;
const common_1 = __webpack_require__(3);
const core_1 = __webpack_require__(1);
const roles_decorator_1 = __webpack_require__(14);
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.roles?.includes(role));
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(3);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("@prisma/client");

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
exports.GoogleAuthGuard = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(12);
let GoogleAuthGuard = class GoogleAuthGuard extends (0, passport_1.AuthGuard)('google') {
    getAuthenticateOptions(context) {
        const req = context.switchToHttp().getRequest();
        return {
            state: req.query.role || 'customer',
        };
    }
};
exports.GoogleAuthGuard = GoogleAuthGuard;
exports.GoogleAuthGuard = GoogleAuthGuard = __decorate([
    (0, common_1.Injectable)()
], GoogleAuthGuard);


/***/ }),
/* 17 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiGatewayService = void 0;
const common_1 = __webpack_require__(3);
let ApiGatewayService = class ApiGatewayService {
    getHello() {
        return 'Hello World!';
    }
};
exports.ApiGatewayService = ApiGatewayService;
exports.ApiGatewayService = ApiGatewayService = __decorate([
    (0, common_1.Injectable)()
], ApiGatewayService);


/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 19 */
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
exports.JwtStrategy = void 0;
const passport_jwt_1 = __webpack_require__(20);
const passport_1 = __webpack_require__(12);
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(5);
const rxjs_1 = __webpack_require__(10);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    authClient;
    constructor(authClient) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'super_secret_key',
        });
        this.authClient = authClient;
    }
    async validate(payload) {
        const result = await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'auth.check_blocked' }, { id: payload.sub }));
        if (result && result.isBlocked) {
            throw new common_1.ForbiddenException('auth_error_user_blocked');
        }
        return { id: payload.sub, roles: payload.roles };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("passport-jwt");

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GoogleStrategy = void 0;
const passport_1 = __webpack_require__(12);
const passport_google_oauth20_1 = __webpack_require__(22);
const common_1 = __webpack_require__(3);
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }
    async validate(accessToken, refreshToken, profile, done) {
        const { name, emails, id } = profile;
        const user = {
            googleId: id,
            email: emails && emails.length > 0 ? emails[0].value : null,
            firstName: name?.givenName,
            lastName: name?.familyName,
            picture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
            accessToken,
        };
        done(null, user);
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GoogleStrategy);


/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("passport-google-oauth20");

/***/ }),
/* 23 */
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
exports.AdminGatewayController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(5);
const rxjs_1 = __webpack_require__(10);
const jwt_auth_guard_1 = __webpack_require__(11);
let AdminGatewayController = class AdminGatewayController {
    adminClient;
    constructor(adminClient) {
        this.adminClient = adminClient;
    }
    async login(loginDto) {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.login' }, loginDto));
        if (result && result.error) {
            throw new common_1.UnauthorizedException(result.error);
        }
        return result;
    }
    getMe(req) {
        return req.user;
    }
    async getUsers() {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.get_users' }, {}));
        if (result && result.error) {
            throw new common_1.UnauthorizedException(result.error);
        }
        return result;
    }
    async getUserById(id) {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.get_user_by_id' }, { id }));
        if (result && result.error)
            throw new common_1.UnauthorizedException(result.error);
        return result;
    }
    async toggleBlockUser(id, data) {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.toggle_block_user' }, { id, isBlocked: data.isBlocked }));
        if (result && result.error)
            throw new common_1.UnauthorizedException(result.error);
        return result;
    }
    async toggleVerifyUser(id, data) {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.toggle_verify_user' }, { id, isVerified: data.isVerified }));
        if (result && result.error)
            throw new common_1.UnauthorizedException(result.error);
        return result;
    }
    async getContactRequests() {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.get_contact_requests' }, {}));
        if (result && result.error) {
            throw new common_1.UnauthorizedException(result.error);
        }
        return result;
    }
    async markContactRequestRead(id) {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.mark_contact_request_read' }, { id }));
        if (result && result.error) {
            throw new common_1.UnauthorizedException(result.error);
        }
        return result;
    }
    async getAllSkills() {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.get_all_skills' }, {}));
        if (result && result.error)
            throw new common_1.UnauthorizedException(result.error);
        return result;
    }
    async createSkill(data) {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.create_skill' }, data));
        if (result && result.error)
            throw new common_1.UnauthorizedException(result.error);
        return result;
    }
    async updateSkill(id, payload) {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.update_skill' }, { id, payload }));
        if (result && result.error)
            throw new common_1.UnauthorizedException(result.error);
        return result;
    }
    async deleteSkill(id) {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminClient.send({ cmd: 'admin.delete_skill' }, { id }));
        if (result && result.error)
            throw new common_1.UnauthorizedException(result.error);
        return result;
    }
};
exports.AdminGatewayController = AdminGatewayController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminGatewayController.prototype, "getMe", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "getUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "getUserById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('users/:id/block'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "toggleBlockUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('users/:id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "toggleVerifyUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('contact-requests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "getContactRequests", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('contact-requests/:id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "markContactRequestRead", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('skills'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "getAllSkills", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('skills'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "createSkill", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('skills/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "updateSkill", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('skills/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminGatewayController.prototype, "deleteSkill", null);
exports.AdminGatewayController = AdminGatewayController = __decorate([
    (0, common_1.Controller)('admin'),
    __param(0, (0, common_1.Inject)('ADMIN_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object])
], AdminGatewayController);


/***/ }),
/* 24 */
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContactRequestsController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(5);
const rxjs_1 = __webpack_require__(10);
const nodemailer = __importStar(__webpack_require__(25));
let ContactRequestsController = class ContactRequestsController {
    adminService;
    transporter;
    constructor(adminService) {
        this.adminService = adminService;
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
    async exists(email) {
        const result = await (0, rxjs_1.firstValueFrom)(this.adminService.send({ cmd: 'admin.contact_request_exists' }, { email }));
        if (result && !result.error) {
            return { exists: true, contact: result.contact, id: result.id };
        }
        return { exists: false, contact: false };
    }
    async create(body) {
        return (0, rxjs_1.firstValueFrom)(this.adminService.send({ cmd: 'admin.create_contact_request' }, body));
    }
    async update(email, body) {
        return (0, rxjs_1.firstValueFrom)(this.adminService.send({ cmd: 'admin.update_contact_request' }, { email, payload: body }));
    }
    async sendEstimateEmail(body, res) {
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
            return res.status(common_1.HttpStatus.OK).json({ success: true });
        }
        catch (error) {
            console.error('Error sending estimate email:', error);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
    async sendContactEmail(body, res) {
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
            return res.status(common_1.HttpStatus.OK).json({ success: true });
        }
        catch (error) {
            console.error('Error sending contact email:', error);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
};
exports.ContactRequestsController = ContactRequestsController;
__decorate([
    (0, common_1.Get)('exists'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactRequestsController.prototype, "exists", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':email'),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContactRequestsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('email/estimate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContactRequestsController.prototype, "sendEstimateEmail", null);
__decorate([
    (0, common_1.Post)('email/contact'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContactRequestsController.prototype, "sendContactEmail", null);
exports.ContactRequestsController = ContactRequestsController = __decorate([
    (0, common_1.Controller)('contact-requests'),
    __param(0, (0, common_1.Inject)('ADMIN_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object])
], ContactRequestsController);


/***/ }),
/* 25 */
/***/ ((module) => {

module.exports = require("nodemailer");

/***/ }),
/* 26 */
/***/ ((module) => {

module.exports = require("express");

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
const api_gateway_module_1 = __webpack_require__(2);
async function bootstrap() {
    const app = await core_1.NestFactory.create(api_gateway_module_1.ApiGatewayModule);
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    const express = __webpack_require__(26);
    const { join } = __webpack_require__(8);
    app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
    await app.listen(process.env.port ?? 3000);
}
bootstrap();

})();

/******/ })()
;