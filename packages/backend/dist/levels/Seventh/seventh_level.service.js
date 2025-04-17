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
exports.SeventhLevelService = void 0;
const common_1 = require("@nestjs/common");
const telegram_interface_1 = require("../../interfaces/telegram.interface");
const telegram_utils_1 = require("../../utils/telegram-utils");
let SeventhLevelService = class SeventhLevelService {
    constructor(telegramUtils) {
        this.telegramUtils = telegramUtils;
    }
    async handleMinMonthsOrderAmount(ctx) {
        if ('message' in ctx.update && 'text' in ctx.update.message) {
            ctx.session.promocodeMinOrderAmount = Number(ctx.update.message.text);
        }
        const text = `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${telegram_interface_1.PromocodeTypes[ctx.session.promocodeType]}\`
• 💸 Скидка: \`${ctx.session.promocodeValue} ${ctx.session.promocodeType === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: \`${ctx.session.promocodeMinOrderAmount} ₽\`
• 📅 Мин. кол-во месяцев для активации: ━━
• 📅 Действителен до: ━━
• 🔢 Всего использований: ━━
• 👤 На одного пользователя: ━━.
\n━━━━━━━━━━\n
⚠️ *Примечание:* _Выберите минимальное количество месяцев действия подписки для применения промокода_ .`;
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '1 месяц',
                        callback_data: 'choose_min_months_order_amount_1'
                    },
                    {
                        text: '3 месяца',
                        callback_data: 'choose_min_months_order_amount_3'
                    }
                ],
                [
                    {
                        text: '6 месяцев',
                        callback_data: 'choose_min_months_order_amount_6'
                    },
                    {
                        text: '12 месяцев',
                        callback_data: 'choose_min_months_order_amount_12'
                    }
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: `choose_value_${ctx.session.promocodeValue}`
                    }
                ]
            ]
        };
        if ('message' in ctx.update && 'text' in ctx.update.message && ctx.session.promocodeMessageId) {
            try {
                const message = await ctx.telegram.editMessageText(ctx.update.message.from.id, ctx.session.promocodeMessageId, undefined, this.telegramUtils.escapeMarkdown(text), { reply_markup: keyboard, parse_mode: 'MarkdownV2' });
                if (typeof message !== 'boolean') {
                    ctx.session.promocodeMessageId = message.message_id;
                }
                ctx.session.step = null;
            }
            catch (e) {
                console.log(e);
            }
        }
        else {
            const message = await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
            if (typeof message !== 'boolean') {
                ctx.session.promocodeMessageId = message.message_id;
            }
        }
    }
    async handleWritePromocode(ctx) {
        ctx.session.step = telegram_interface_1.StepsEnum.ENTER_PROMOCODE;
        const text = `*_Введите промокод :_*
        
🟢 Узнайте об актуальных промокодах в нашем Telegram-канале или группе !`;
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '👥 Группа',
                        url: 'https://t.me/vpn_by_oxy/42'
                    },
                    {
                        text: '📢 Канал',
                        url: 'https://t.me/VpnByOxy'
                    }
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: `deviceRangeId_${ctx.session.deviceRangeId}`
                    }
                ]
            ]
        };
        const message = await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
        if (typeof message !== 'boolean') {
            ctx.session.promocodeMessageId = message.message_id;
        }
    }
};
exports.SeventhLevelService = SeventhLevelService;
exports.SeventhLevelService = SeventhLevelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_utils_1.TelegramUtils])
], SeventhLevelService);
//# sourceMappingURL=seventh_level.service.js.map