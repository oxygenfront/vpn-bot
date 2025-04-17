import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import {
    MyContext,
    PromocodeTypes,
    StepsEnum
} from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class TenthLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
    ) {
    }

    async handleChooseMaxUsesPerUser( ctx: MyContext ) {
        ctx.session.step = StepsEnum.PROMOCODE_MAX_USES_PER_USER
        if ( 'message' in ctx.update && 'text' in ctx.update.message ) {
            ctx.session.promocodeAvailableCountUses = Number(ctx.update.message.text)
        }

        const text = `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${PromocodeTypes[ctx.session.promocodeType as 'fixed' | 'percent']}\`
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

⚠️ *Важно:* число должно быть положительным и не больше *${ctx.session.promocodeAvailableCountUses}*.`

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
        }

        if ( 'message' in ctx.update && 'text' in ctx.update.message && ctx.session.promocodeMessageId ) {
            try {
                const message = await ctx.telegram.editMessageText(
                    ctx.update.message.from.id,
                    ctx.session.promocodeMessageId,
                    undefined,
                    this.telegramUtils.escapeMarkdown(text),
                    { reply_markup: keyboard, parse_mode: 'MarkdownV2' }
                );
                if ( typeof message !== 'boolean' ) {
                    ctx.session.promocodeMessageId = message.message_id

                }

            } catch ( e ) {
                console.log(e);
            }
        } else {
            const message = await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
            if ( typeof message !== 'boolean' ) {
                ctx.session.promocodeMessageId = message.message_id

            }

        }
    }
}