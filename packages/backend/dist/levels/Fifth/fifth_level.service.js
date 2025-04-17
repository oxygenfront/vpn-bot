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
exports.FifthLevelService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_prisma_1 = require("nestjs-prisma");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegram_interface_1 = require("../../interfaces/telegram.interface");
const telegram_utils_1 = require("../../utils/telegram-utils");
let FifthLevelService = class FifthLevelService {
    constructor(telegramUtils, prismaService) {
        this.telegramUtils = telegramUtils;
        this.prismaService = prismaService;
    }
    async handleChooseValue(ctx) {
        ctx.session.step = telegram_interface_1.StepsEnum.PROMOCODE_VALUE;
        const text = `${ctx.session.promocodeType === 'percent' ?
            `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${telegram_interface_1.PromocodeTypes[ctx.session.promocodeType]}\`
• 💸 Скидка: ━━
• 💸 Мин. сумма для активации: ━━
• 📅 Мин. кол-во месяцев для активации: ━━
• 📅 Действителен до: ━━
• 🔢 Всего использований: ━━
• 👤 На одного пользователя: ━━.
\n━━━━━━━━━━\n
⚠️ *Важно:* _Число должно быть от 1 до 100._` :
            `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания !

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${telegram_interface_1.PromocodeTypes[ctx.session.promocodeType]}\`
• 💸 Скидка: ━━
• 💸 Мин. сумма для активации: ━━
• 📅 Мин. кол-во месяцев для активации: ━━
• 📅 Действителен до: ━━
• 🔢 Всего использований: ━━
• 👤 На одного пользователя: ━━
\n━━━━━━━━━━━━\n
💰 Укажите сумму скидки:
1️⃣ Выберите вариант ниже.
2️⃣ Или введите число (например, \`1000.50\`).
    
⚠️ *Важно:* _Сумма должна быть положительной._`}`;
        const percentKeyboard = {
            inline_keyboard: [
                [
                    {
                        text: '10 %',
                        callback_data: 'choose_value_10'
                    },
                    {
                        text: '30 %',
                        callback_data: 'choose_value_30'
                    }
                ],
                [
                    {
                        text: '50 %',
                        callback_data: 'choose_value_50'
                    },
                    {
                        text: '70 %',
                        callback_data: 'choose_value_70'
                    }
                ],
                [
                    {
                        text: '90 %',
                        callback_data: 'choose_value_90'
                    },
                    {
                        text: '100 %',
                        callback_data: 'choose_value_100'
                    }
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: `handle_choose_type_promocode`
                    }
                ]
            ]
        };
        const fixedKeyboard = {
            inline_keyboard: [
                [
                    {
                        text: '100 ₽',
                        callback_data: 'choose_value_100'
                    },
                    {
                        text: '200 ₽',
                        callback_data: 'choose_value_200'
                    }
                ],
                [
                    {
                        text: '300 ₽',
                        callback_data: 'choose_value_300'
                    },
                    {
                        text: '500 ₽',
                        callback_data: 'choose_value_500'
                    }
                ],
                [
                    {
                        text: '700 ₽',
                        callback_data: 'choose_value_700'
                    },
                    {
                        text: '1000 ₽',
                        callback_data: 'choose_value_1000'
                    }
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: 'handle_choose_type_promocode'
                    }
                ]
            ]
        };
        const keyboard = ctx.session.promocodeType === 'percent' ? percentKeyboard : fixedKeyboard;
        const message = await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
        if (typeof message !== 'boolean') {
            ctx.session.promocodeMessageId = message.message_id;
        }
    }
    async handleSelectMembers(ctx) {
        if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
            ctx.session.selectedMonths = Number(ctx.callbackQuery.data.split('_')[1]);
        }
        if (!(ctx.session.selectedPlan && ctx.session.selectedMonths))
            return;
        const prices = await this.prismaService.subscriptionPlan.findMany({
            where: {
                planId: ctx.session.selectedPlan,
                months: ctx.session.selectedMonths
            },
        });
        await ctx.answerCbQuery();
        const text = 'Выберите количество человек, которых планируете' +
            ' добавить в подписку';
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: `📱 от 1 до 3 — ${prices[0].price}₽`,
                        callback_data: 'deviceRangeId_1'
                    },
                ],
                [
                    {
                        text: `📱 от 3 до 5 — ${prices[1].price}₽`,
                        callback_data: 'deviceRangeId_2'
                    },
                ],
                [
                    {
                        text: `📱 от 5 до 7 — ${prices[2].price}₽`,
                        callback_data: 'deviceRangeId_3'
                    },
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: `plan_${telegram_interface_1.AvailablePlansEnum[ctx.session.selectedPlan]}`
                    },
                    { text: '🔙 В главное меню', callback_data: 'start' }
                ],
            ],
        };
        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
};
exports.FifthLevelService = FifthLevelService;
__decorate([
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FifthLevelService.prototype, "handleSelectMembers", null);
exports.FifthLevelService = FifthLevelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_utils_1.TelegramUtils,
        nestjs_prisma_1.PrismaService])
], FifthLevelService);
//# sourceMappingURL=fifth_level.service.js.map