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
exports.SecondLevelService = void 0;
const common_1 = require("@nestjs/common");
const dayjs = require("dayjs");
const nestjs_prisma_1 = require("nestjs-prisma");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const telegram_interface_1 = require("../../interfaces/telegram.interface");
const telegram_utils_1 = require("../../utils/telegram-utils");
let SecondLevelService = class SecondLevelService {
    constructor(bot, telegramUtils, prismaService) {
        this.bot = bot;
        this.telegramUtils = telegramUtils;
        this.prismaService = prismaService;
    }
    async handleMyAccount(ctx) {
        const user = await this.prismaService.user.findFirst({
            where: {
                telegramId: String(ctx.callbackQuery.from.id)
            },
            include: {
                subscriptions: {
                    include: { subscriptionPlan: true }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const subscriptions = user ? user.subscriptions?.map((subscription) => {
            return `🟢 ${telegram_interface_1.Plans[subscription.subscriptionPlan.planId]} до ${dayjs(subscription.expiredDate).format('D MMMM YYYY' +
                ' [г.] hh:mm (мск)')}`;
        }).filter((el, i) => i <= 4 ? el : null).join(`\n━━━━━━━━━━━━━━━━━━\n`) : 'У вас нет' +
            ' активных' +
            ' подписок';
        const text = ` *━━━━  👤 Личный кабинет  ━━━━*
        
${subscriptions.length ? `⚡ *_Текущие активные подписки_*:\n\n${subscriptions}` : 'На данный момент у вас нет активных подписок, но вы всегда можете ее приобрести *_нажав на кнопку ниже_*'}
       
*━━━━━━  Статистика  ━━━━━━*

• 📊 Дней с нами: ${user?.createdAt
            ? Math.floor(dayjs().diff(dayjs(user.createdAt), 'day'))
            : 0}
• ✅ Активных подписок: ${user?.subscriptions.length}

*Нужна помощь?* \nОбратитесь в *_поддержку 24/7_*`;
        const keyboard = {
            inline_keyboard: [
                [
                    ...(subscriptions.length ? [{
                            text: '📋 Мои подписки',
                            callback_data: 'my_subscriptions'
                        }] : [{
                            text: '🪙 Купить VPN',
                            callback_data: 'buy_vpn'
                        }]),
                ],
                ...(subscriptions.length ?
                    [
                        [
                            {
                                text: '❌ Отменить подписку',
                                url: 'https://my.cloudpayments.ru/',
                            }
                        ]
                    ] : []),
                [
                    {
                        text: '🔙 В главное меню',
                        callback_data: 'start'
                    },
                    {
                        text: '👨‍💻 Поддержка',
                        url: 'https://t.me/vpn_by_oxy/8'
                    }
                ]
            ],
        };
        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
    async handleBuyToken(ctx) {
        ctx.session.selectedPlan = null;
        const minPrices = await this.prismaService.subscriptionPlan.findMany({
            where: { deviceRangeId: 1, months: 1 },
        });
        const text = `💫 *Выберите оптимальный план:*
        
🥇 *Премиум - от ${minPrices[2].price}₽/месяц*
• Безлимитный трафик
• 1-7 устройств
• VIP поддержка
• *_Экономия 60%_*

🥈 *Стандарт - от ${minPrices[1].price}₽/месяц*
• 200GB трафика
• 1-7 устройств
• *_Экономия 40%_*

🥉 *Базовый - от ${minPrices[0].price}₽/месяц*
• 100GB трафика
• 1-7 устройств`;
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '💎 Премиум', callback_data: 'plan_premium' },
                    { text: '✅ Стандарт', callback_data: 'plan_standard' },
                ],
                [{ text: '🟢 Базовый', callback_data: 'plan_base' }],
                [{ text: '🔙 Назад', callback_data: 'start' }],
            ],
        };
        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
};
exports.SecondLevelService = SecondLevelService;
exports.SecondLevelService = SecondLevelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        telegram_utils_1.TelegramUtils,
        nestjs_prisma_1.PrismaService])
], SecondLevelService);
//# sourceMappingURL=second_level.service.js.map