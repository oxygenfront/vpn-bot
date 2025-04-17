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
exports.TenthLevelService = void 0;
const common_1 = require("@nestjs/common");
const dayjs = require("dayjs");
const telegram_interface_1 = require("../../interfaces/telegram.interface");
const telegram_utils_1 = require("../../utils/telegram-utils");
let TenthLevelService = class TenthLevelService {
    constructor(telegramUtils) {
        this.telegramUtils = telegramUtils;
    }
    async handleChooseMaxUsesPerUser(ctx) {
        ctx.session.step = telegram_interface_1.StepsEnum.PROMOCODE_MAX_USES_PER_USER;
        if ('message' in ctx.update && 'text' in ctx.update.message) {
            ctx.session.promocodeAvailableCountUses = Number(ctx.update.message.text);
        }
        const text = `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${telegram_interface_1.PromocodeTypes[ctx.session.promocodeType]}\`
• 💸 Скидка: \`${ctx.session.promocodeValue} ${ctx.session.promocodeType === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: \`${ctx.session.promocodeMinOrderAmount} ₽\`
• 📅 Мин. кол-во месяцев для активации: \`${ctx.session.promocodeMinMonthsOrderAmount}\`
• 📅 Действителен до: \`${dayjs(ctx.session.promocodeExpiredDate).format('D MMMM YYYY [г.] HH:MM')}\`
• 🔢 Всего использований: \`${ctx.session.promocodeAvailableCountUses}\`
• 👤 На одного пользователя: ━━.
\n━━━━━━━━━━\n
⚠️ *Примечание:*
    🔢 Укажите, сколько раз *_один пользователь_* может применить промокод:
    1️⃣ Выберите вариант ниже .
    2️⃣ Или введите своё число (например, \`5\`).

⚠️ *Важно:* число должно быть положительным и не больше *${ctx.session.promocodeAvailableCountUses}*.`;
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '1',
                        callback_data: 'choose_max_uses_per_user_1'
                    },
                    {
                        text: '2',
                        callback_data: 'choose_max_uses_per_user_2'
                    }
                ],
                [
                    {
                        text: '3',
                        callback_data: 'choose_max_uses_per_user_3'
                    },
                    {
                        text: '4',
                        callback_data: 'choose_max_uses_per_user_4'
                    }
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: `choose_expired_${ctx.session.promocodeExpiredMonths}`
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
};
exports.TenthLevelService = TenthLevelService;
exports.TenthLevelService = TenthLevelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_utils_1.TelegramUtils])
], TenthLevelService);
//# sourceMappingURL=tenth_level.service.js.map