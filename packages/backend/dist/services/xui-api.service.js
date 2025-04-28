"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XuiApiService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const process = require("node:process");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
let XuiApiService = class XuiApiService {
    constructor(httpService) {
        this.httpService = httpService;
    }
    async login() {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${process.env.PANEL_LINK}/login`, {
            username: process.env.PANEL_USERNAME,
            password: process.env.PANEL_PASSWORD
        }, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        }));
        return response.headers['set-cookie']?.find((cookie) => cookie.startsWith('3x-ui='));
    }
    async getOrCreateClient({ sessionCookie, username, tgId, inboundId = 1, expiredDays, limit, limitIp }) {
        const inboundResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${process.env.PANEL_LINK}/panel/api/inbounds/get/${inboundId}`, {
            headers: {
                'Cookie': sessionCookie,
                'Accept': 'application/json'
            },
            withCredentials: true
        }));
        const { settings, streamSettings, port: inboundPort } = inboundResponse.data.obj;
        const { clients } = JSON.parse(settings);
        let client = clients.find((c) => c.email === username);
        const gbLimit = limit * 1024 * 1024 * 1024;
        if (!client) {
            const currentTime = Date.now();
            const expiryTime = currentTime + expiredDays * 24 * 60 * 60 * 1000;
            client = {
                id: (0, uuid_1.v4)(),
                flow: '',
                password: (0, crypto_1.randomBytes)(64).toString('base64'),
                email: username,
                limitIp,
                totalGB: gbLimit,
                expiryTime: expiryTime,
                subId: (0, uuid_1.v4)(),
                enable: true,
                tgId: tgId,
                reset: 0,
            };
            const requestSettings = { clients: [client] };
            const addClientResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${process.env.PANEL_LINK}/panel/api/inbounds/addClient`, {
                id: inboundId,
                settings: JSON.stringify(requestSettings)
            }, {
                headers: {
                    'Cookie': sessionCookie,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
            }));
            if (!addClientResponse.data.success) {
                throw new Error(`Не удалось создать пользователя: ${addClientResponse.data.msg}`);
            }
        }
        return { client, streamSettings, inboundPort: inboundPort };
    }
};
exports.XuiApiService = XuiApiService;
exports.XuiApiService = XuiApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], XuiApiService);
//# sourceMappingURL=xui-api.service.js.map