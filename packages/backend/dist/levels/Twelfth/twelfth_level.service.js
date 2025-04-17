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
exports.TwelfthLevelService = void 0;
const common_1 = require("@nestjs/common");
const dayjs = require("dayjs");
const nestjs_prisma_1 = require("nestjs-prisma");
const telegram_interface_1 = require("../../interfaces/telegram.interface");
const telegram_utils_1 = require("../../utils/telegram-utils");
let TwelfthLevelService = class TwelfthLevelService {
    constructor(telegramUtils, prismaService) {
        this.telegramUtils = telegramUtils;
        this.prismaService = prismaService;
    }
    async handleCreatePromocode(ctx) {
        const { promocode, promocodeType: type, promocodeValue: value, promocodeMinOrderAmount: minOrderAmount, promocodeExpiredDate: expiredDate, promocodeAvailableCountUses: availableCountUses, promocodeMaxUsesPerUser: maxUsesPerUser, promocodeMinMonthsOrderAmount: minMonthsOrderAmount } = ctx.session;
        if (promocode &&
            type &&
            value &&
            minOrderAmount &&
            expiredDate &&
            availableCountUses &&
            maxUsesPerUser &&
            minMonthsOrderAmount) {
            const text = `🎉 Промокод \`${ctx.session.promocode}\` успешно создан ✅

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${telegram_interface_1.PromocodeTypes[ctx.session.promocodeType]}\`
• 💸 Скидка: \`${ctx.session.promocodeValue} ${ctx.session.promocodeType === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: \`${ctx.session.promocodeMinOrderAmount} ₽\`
• 📅 Мин. кол-во месяцев для активации: \`${ctx.session.promocodeMinMonthsOrderAmount}\`
• 📅 Действителен до: \`${dayjs(ctx.session.promocodeExpiredDate).format('D MMMM YYYY [г.] HH:MM')}\`
• 🔢 Всего использований: \`${ctx.session.promocodeAvailableCountUses}\`
• 👤 На одного пользователя: \`${ctx.session.promocodeMaxUsesPerUser}\`.`;
            const keyboard = {
                inline_keyboard: [
                    [
                        {
                            text: '🎟️ Создать еще один промокод',
                            callback_data: 'handle_add_promocode',
                        }
                    ],
                    [
                        {
                            text: '🔙 В главное меню',
                            callback_data: 'start',
                        }
                    ]
                ]
            };
            const response = await this.prismaService.promocode.create({
                data: {
                    promocode,
                    type,
                    value: Number(value),
                    expiredDate,
                    availableCountUses: Number(availableCountUses),
                    maxUsesPerUser: Number(maxUsesPerUser),
                    minOrderAmount: Number(minOrderAmount),
                    minMonthsOrderAmount: Number(minMonthsOrderAmount),
                }
            });
            if (Object(response).hasOwnProperty('id')) {
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
                };
                await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
            }
        }
    }
};
exports.TwelfthLevelService = TwelfthLevelService;
exports.TwelfthLevelService = TwelfthLevelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_utils_1.TelegramUtils,
        nestjs_prisma_1.PrismaService])
], TwelfthLevelService);
//# sourceMappingURL=twelfth_level.service.js.map