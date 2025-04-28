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
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const nestjs_prisma_1 = require("nestjs-prisma");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const telegram_interface_1 = require("../interfaces/telegram.interface");
const config_1 = require("@nestjs/config");
const cloudpayments_service_1 = require("../services/cloudpayments.service");
const link_generator_service_1 = require("../services/link-generator.service");
const xui_api_service_1 = require("../services/xui-api.service");
const telegram_utils_1 = require("../utils/telegram-utils");
const uuid_1 = require("uuid");
const dayjs = require("dayjs");
let WebhookController = class WebhookController {
    constructor(cloudPaymentsService, linkGeneratorService, configService, xuiApiService, telegramUtils, prismaService, bot) {
        this.cloudPaymentsService = cloudPaymentsService;
        this.linkGeneratorService = linkGeneratorService;
        this.configService = configService;
        this.xuiApiService = xuiApiService;
        this.telegramUtils = telegramUtils;
        this.prismaService = prismaService;
        this.bot = bot;
        this.apiUrl = this.configService.get("CLOUDPAYMENTS_API_URL");
    }
    async handleWebhook(body) {
        const { SubscriptionId, Status, Token, InvoiceId, AccountId, Amount, Data } = body;
        const chatId = AccountId;
        if (!chatId) {
            console.error(`Не найден chat_id для InvoiceId: ${InvoiceId}`);
            return { code: 0 };
        }
        switch (Status) {
            case 'Completed':
                if (Token) {
                    const { CloudPayments } = JSON.parse(Data);
                    const messageId = CloudPayments?.messageId;
                    const period = Number(CloudPayments.recurrent.period);
                    const tgId = AccountId;
                    const username = AccountId;
                    try {
                        const sessionCookie = await this.xuiApiService.login();
                        if (!sessionCookie) {
                            await this.bot.telegram.sendMessage(chatId, 'Ошибка: не удалось авторизоваться в панели.');
                            return { code: 0 };
                        }
                        const boughtPlan = await this.prismaService.subscriptionPlan.findFirst({
                            where: {
                                id: CloudPayments.planId,
                            },
                            include: {
                                plan: true,
                                deviceRange: true,
                            },
                        });
                        if (!boughtPlan) {
                            await this.bot.telegram.sendMessage(chatId, 'Ошибка: тарифный план не найден.');
                            return { code: 0 };
                        }
                        const { client, streamSettings, inboundPort } = await this.xuiApiService.getOrCreateClient({
                            sessionCookie,
                            username,
                            tgId,
                            expiredDays: 30 * period,
                            limit: telegram_interface_1.PlanTrafficLimits[boughtPlan.plan.name],
                            limitIp: Number(boughtPlan.deviceRange.range.split('-')[2]),
                        });
                        const user = await this.prismaService.user.upsert({
                            where: {
                                telegramId: chatId,
                            },
                            create: {
                                id: (0, uuid_1.v4)(),
                                telegramId: chatId,
                                cardToken: Token,
                            },
                            update: {
                                updatedAt: new Date(),
                            },
                        });
                        const promocode = CloudPayments.promocode
                            ? await this.prismaService.promocode.findUnique({
                                where: {
                                    promocode: CloudPayments.promocode,
                                },
                                include: {
                                    uses: {
                                        where: { userId: user.id },
                                    },
                                },
                            })
                            : null;
                        const { data } = await this.cloudPaymentsService.responseFunction(`${this.apiUrl}/subscriptions/get`, { Id: SubscriptionId });
                        const response = await this.prismaService.userSubscription.findFirst({
                            where: {
                                id: SubscriptionId,
                            },
                            select: {
                                expiredDate: true,
                            },
                        });
                        const expiredDate = response
                            ? dayjs(response.expiredDate).add(boughtPlan.months, 'month').toDate()
                            : dayjs().add(boughtPlan.months, 'month').toDate();
                        const { vlessLink, urlLink } = this.linkGeneratorService.generateConnectionLinks(client, streamSettings, inboundPort);
                        await this.prismaService.$transaction(async (prisma) => {
                            const userSubscription = await prisma.userSubscription.upsert({
                                where: {
                                    id: SubscriptionId,
                                },
                                update: {
                                    nextBillingDate: dayjs(data.Model.NextTransactionDateIso).add(3, 'hour').toDate(),
                                    expiredDate: expiredDate,
                                    lastInvoiceId: InvoiceId,
                                },
                                create: {
                                    id: SubscriptionId,
                                    status: 'Active',
                                    userId: user.id,
                                    lastInvoiceId: InvoiceId,
                                    subscriptionPlanId: boughtPlan.id,
                                    vlessLinkConnection: vlessLink,
                                    promocodeId: promocode?.id ?? null,
                                    urlLinkConnection: urlLink,
                                    nextBillingDate: dayjs(data.Model.NextTransactionDateIso).add(3, 'hour').toDate(),
                                    startBillingDate: new Date(),
                                    createdAt: new Date(),
                                    expiredDate: dayjs().add(boughtPlan.months, 'month').toDate(),
                                },
                            });
                            if (promocode) {
                                await this.prismaService.promocodeUse.create({
                                    data: {
                                        promocodeId: promocode.id,
                                        userId: user.id,
                                        usedAt: new Date(),
                                    },
                                });
                                const newAvailableCountUses = promocode.availableCountUses - 1;
                                await this.prismaService.promocode.update({
                                    where: { id: promocode.id },
                                    data: {
                                        availableCountUses: newAvailableCountUses,
                                        status: newAvailableCountUses <= 0 ? 'INACTIVE' : promocode.status,
                                    },
                                });
                            }
                            return userSubscription;
                        });
                        const messageText = `
*Оплата успешно завершена!*
💰 Сумма: *${Amount} RUB*
📋 Заказ: *${InvoiceId}*

✨ *Подписка активирована!*
🆔 ID подписки: \`${SubscriptionId}\`

🔗 *Ваша ссылка для подключения:*
${urlLink}

🔒 *VLESS подключение:*
\`${vlessLink}\`

${promocode ? `🎟️ *Промокод применён:* \`${promocode.promocode}\` (Скидка: ${promocode.type === 'percent' ? `${Math.floor(boughtPlan?.price * (promocode.value / 100))} ₽` : `${Amount - promocode.value}`})` : ''}
`;
                        const replyMarkup = {
                            inline_keyboard: [
                                [
                                    {
                                        text: '❓ Что дальше ?',
                                        url: 'https://telegra.ph/CHto-delat-posle-oplaty-03-31',
                                    },
                                    {
                                        text: '👤 Мой аккаунт',
                                        callback_data: 'my_account',
                                    },
                                ],
                                [
                                    {
                                        text: '🔙 Назад',
                                        callback_data: 'buy_vpn',
                                    },
                                ],
                            ],
                        };
                        if (messageId) {
                            try {
                                await this.bot.telegram.editMessageText(chatId, messageId, undefined, this.telegramUtils.escapeMarkdown(messageText), {
                                    reply_markup: replyMarkup,
                                    parse_mode: 'MarkdownV2',
                                });
                            }
                            catch (editError) {
                                try {
                                    await this.bot.telegram.deleteMessage(chatId, messageId);
                                }
                                finally {
                                    await this.bot.telegram.sendMessage(chatId, this.telegramUtils.escapeMarkdown(messageText), {
                                        parse_mode: 'MarkdownV2',
                                        reply_markup: replyMarkup,
                                    });
                                }
                            }
                        }
                        else {
                            await this.bot.telegram.sendMessage(chatId, this.telegramUtils.escapeMarkdown(messageText), {
                                parse_mode: 'MarkdownV2',
                                reply_markup: replyMarkup,
                            });
                        }
                    }
                    catch (error) {
                        console.error('Ошибка при создании подписки:', error);
                        await this.bot.telegram.sendMessage(chatId, 'Ошибка при создании подписки. Обратитесь в поддержку.');
                    }
                }
                break;
            case 'Declined':
                await this.bot.telegram.sendMessage(chatId, `Оплата отклонена. Заказ: ${InvoiceId}. Попробуйте снова.`);
                break;
            case 'Cancelled':
                break;
            case 'Check':
                break;
            case 'Confirmed':
                break;
        }
        return { code: 0 };
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('cloudpayments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleWebhook", null);
exports.WebhookController = WebhookController = __decorate([
    (0, common_1.Controller)('webhook'),
    __param(6, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [cloudpayments_service_1.CloudPaymentsService,
        link_generator_service_1.LinkGeneratorService,
        config_1.ConfigService,
        xui_api_service_1.XuiApiService,
        telegram_utils_1.TelegramUtils,
        nestjs_prisma_1.PrismaService,
        telegraf_1.Telegraf])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map