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
exports.NinthLevelService = void 0;
const common_1 = require("@nestjs/common");
const dayjs = require("dayjs");
const telegram_interface_1 = require("../../interfaces/telegram.interface");
const telegram_utils_1 = require("../../utils/telegram-utils");
let NinthLevelService = class NinthLevelService {
    constructor(telegramUtils) {
        this.telegramUtils = telegramUtils;
    }
    async handleChooseAvailableCountUses(ctx) {
        ctx.session.step = telegram_interface_1.StepsEnum.PROMOCODE_AVAILABLE_COUNT_USES;
        if ('message' in ctx.update && 'text' in ctx.update.message) {
            if (dayjs(ctx.update.message.text, 'DD.MM.YYYY HH:mm', true).isValid()) {
                ctx.session.promocodeExpiredDate = dayjs(ctx.update.message.text, 'DD.MM.YYYY HH:mm', true).toDate();
            }
            else {
                const text = 'Дата неверна';
                return await this.telegramUtils.sendOrEditMessage(ctx, text);
            }
        }
        const text = `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${telegram_interface_1.PromocodeTypes[ctx.session.promocodeType]}\`
• 💸 Скидка: \`${ctx.session.promocodeValue} ${ctx.session.promocodeType === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: \`${ctx.session.promocodeMinOrderAmount} ₽\`
• 📅 Мин. кол-во месяцев для активации: \`${ctx.session.promocodeMinMonthsOrderAmount}\`
• 📅 Действителен до: \`${dayjs(ctx.session.promocodeExpiredDate).format('D MMMM YYYY [г.] HH:MM')}\`
• 🔢 Всего использований: ━━
• 👤 На одного пользователя: ━━.
\n━━━━━━━━━━\n
⚠️ *Примечание:* _Выберите количество использований промокода_ .
 `;
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '250',
                        callback_data: 'choose_available_count_uses_250'
                    },
                    {
                        text: '500',
                        callback_data: 'choose_available_count_uses_500'
                    }
                ],
                [
                    {
                        text: '750',
                        callback_data: 'choose_available_count_uses_750'
                    },
                    {
                        text: '1000',
                        callback_data: 'choose_available_count_uses_1000'
                    }
                ],
                [{
                        text: '🔙 Назад',
                        callback_data: `choose_min_months_order_amount_${ctx.session.promocodeMinMonthsOrderAmount}`
                    }]
            ]
        };
        if ('message' in ctx.update && 'text' in ctx.update.message && ctx.session.promocodeMessageId) {
            try {
                await ctx.telegram.editMessageText(ctx.update.message.from.id, ctx.session.promocodeMessageId, undefined, this.telegramUtils.escapeMarkdown(text), { reply_markup: keyboard, parse_mode: 'MarkdownV2' });
            }
            catch (e) {
                console.log(e);
            }
        }
        else {
            await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
        }
    }
};
exports.NinthLevelService = NinthLevelService;
exports.NinthLevelService = NinthLevelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_utils_1.TelegramUtils])
], NinthLevelService);
//# sourceMappingURL=ninth_level.service.js.map