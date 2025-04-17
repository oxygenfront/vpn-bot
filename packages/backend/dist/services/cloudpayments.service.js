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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudPaymentsService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_prisma_1 = require("nestjs-prisma");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const rxjs_1 = require("rxjs");
const telegraf_1 = require("telegraf");
const fourth_level_service_1 = require("../levels/Fourth/fourth_level.service");
let CloudPaymentsService = class CloudPaymentsService {
    constructor(httpService, configService, fourthLevelService, prismaService, bot) {
        this.httpService = httpService;
        this.configService = configService;
        this.fourthLevelService = fourthLevelService;
        this.prismaService = prismaService;
        this.bot = bot;
        this.publicId = this.configService.get('CLOUDPAYMENTS_PUBLIC_ID');
        this.apiSecret = this.configService.get('CLOUDPAYMENTS_API_SECRET');
        this.apiUrl = this.configService.get('CLOUDPAYMENTS_API_URL');
    }
    async responseFunction(url, data) {
        return await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, data, {
            auth: { username: this.publicId, password: this.apiSecret },
        }));
    }
    async updateSubscription(ctx, subId, action) {
        const url = action === 'Cancellation' ? `${this.apiUrl}/subscriptions/cancel` : `${this.apiUrl}/subscriptions/update`;
        if (action === 'Activate') {
            const userSubscription = await this.prismaService.userSubscription.findFirst({
                where: {
                    id: subId,
                }
            });
            if (!userSubscription) {
                await ctx.reply('Не удалось активировать подписку, обратитесь в техподдержку');
                return;
            }
            const data = {
                Id: subId,
                Status: 'Active'
            };
            const response = await this.responseFunction(url, data);
            if (response.data.Success) {
                await this.prismaService.userSubscription.update({
                    where: {
                        id: subId
                    },
                    data: {
                        status: 'Active'
                    }
                });
                await this.fourthLevelService.handleSubscriptionDetails(ctx, subId);
                return;
            }
        }
        else if (action === 'Cancellation') {
            const data = {
                Id: subId,
            };
            const response = await this.responseFunction(url, data);
            if (response.data.Success) {
                await this.prismaService.userSubscription.update({
                    where: {
                        id: subId,
                    },
                    data: {
                        status: 'Cancelled'
                    }
                });
                await this.fourthLevelService.handleSubscriptionDetails(ctx, subId);
                return;
            }
        }
        else {
            return 'Что то пошло не так :( ';
        }
    }
};
exports.CloudPaymentsService = CloudPaymentsService;
exports.CloudPaymentsService = CloudPaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        fourth_level_service_1.FourthLevelService,
        nestjs_prisma_1.PrismaService,
        telegraf_1.Telegraf])
], CloudPaymentsService);
//# sourceMappingURL=cloudpayments.service.js.map