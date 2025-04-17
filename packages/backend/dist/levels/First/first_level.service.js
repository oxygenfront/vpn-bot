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
exports.FirstLevelService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_prisma_1 = require("nestjs-prisma");
const telegram_utils_1 = require("../../utils/telegram-utils");
let FirstLevelService = class FirstLevelService {
    constructor(telegramUtils, httpService, prismaService, configService) {
        this.telegramUtils = telegramUtils;
        this.httpService = httpService;
        this.prismaService = prismaService;
        this.configService = configService;
        this.publicId = this.configService.get('CLOUDPAYMENTS_PUBLIC_ID');
        this.apiSecret = this.configService.get('CLOUDPAYMENTS_API_SECRET');
    }
    async handleStart(ctx) {
        const accountId = ('message' in ctx.update && ctx.update.message.from.id) || ('callback_query' in ctx.update && ctx.update.callback_query.from.id);
        ctx.session = {
            ...ctx.session,
            promocode: null,
            promocodeMessageId: null,
            promocodeType: null,
            promocodeExpiredDate: null,
            promocodeExpiredMonths: null,
            promocodeAvailableCountUses: null,
            promocodeMaxUsesPerUser: null,
            promocodeValue: null,
            promocodeMinOrderAmount: null,
            promocodeMinMonthsOrderAmount: null,
            step: null,
            selectedPayment: null,
            paymentAmount: null,
            selectedPlan: null,
            deviceRangeId: null,
            selectedMonths: null,
            autoRenew: false,
        };
        ctx.session.autoRenew = true;
        const user = await this.prismaService.user.findUnique({
            where: {
                telegramId: String(accountId)
            }
        });
        const text = `🌟 *Добро пожаловать в VPN by Oxy*

Ваш надежный проводник в мир безопасного интернета! 

*Почему выбирают нас:*
• 🔒 Полная анонимность и безопасность
• 🚀 Высокая скорость без ограничений
• 🌍 Серверы в разных странах мира
• 🛡️ Защита от блокировок
• 👨‍💻 Техподдержка 24/7

*Готовы начать?* Выберите действие ниже!`;
        const adminKeyboard = {
            inline_keyboard: [
                [
                    {
                        text: '🪙 Купить VPN',
                        callback_data: 'buy_vpn'
                    },
                    {
                        text: '👤 Мой аккаунт',
                        callback_data: 'my_account',
                    }
                ],
                ...(accountId === 695606474 ? [
                    [
                        {
                            text: '🗑️ Очистить все подписки',
                            callback_data: 'clear_all'
                        }
                    ],
                    [
                        {
                            text: '🎟️ Check deploy',
                            callback_data: 'handle_add_promocode',
                        }
                    ],
                    [
                        {
                            text: '🎟️ Все промокоды',
                            callback_data: 'handle_show_promocodes',
                        }
                    ]
                ] : []),
                [
                    {
                        text: '❓ FAQ',
                        callback_data: 'faq'
                    },
                    {
                        text: '📃 Оферта',
                        url: 'https://telegra.ph/DOGOVOR-NA-OKAZANIE-USLUG-PUBLICHNAYA-OFERTA-03-24'
                    },
                ],
                [
                    {
                        text: '👨‍💻 Поддержка',
                        url: 'https://t.me/vpn_by_oxy/8'
                    }
                ]
            ]
        };
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '🪙 Купить VPN',
                        callback_data: 'buy_vpn'
                    },
                    ...(user ?
                        [
                            {
                                text: '👤 Мой аккаунт',
                                callback_data: 'my_account',
                            }
                        ] : [])
                ],
                [
                    {
                        text: '❓ FAQ',
                        callback_data: 'faq'
                    },
                    {
                        text: '📃 Оферта',
                        url: 'https://telegra.ph/DOGOVOR-NA-OKAZANIE-USLUG-PUBLICHNAYA-OFERTA-03-24'
                    },
                ],
                [
                    {
                        text: '👨‍💻 Поддержка',
                        url: 'https://t.me/vpn_by_oxy/8'
                    }
                ]
            ],
        };
        await this.telegramUtils.sendOrEditMessage(ctx, text, accountId === 695606474 ? adminKeyboard : keyboard);
    }
};
exports.FirstLevelService = FirstLevelService;
exports.FirstLevelService = FirstLevelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_utils_1.TelegramUtils,
        axios_1.HttpService,
        nestjs_prisma_1.PrismaService,
        config_1.ConfigService])
], FirstLevelService);
//# sourceMappingURL=first_level.service.js.map