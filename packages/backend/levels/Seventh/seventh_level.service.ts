import { Injectable } from "@nestjs/common";
import {
    MyContext,
    PromocodeTypes,
    StepsEnum
} from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class SeventhLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
    ) {
    }

    async handleMinMonthsOrderAmount( ctx: MyContext ) {
        if ( 'message' in ctx.update && 'text' in ctx.update.message ) {
            ctx.session.promocodeMinOrderAmount = Number(ctx.update.message.text)
        }

        const text = `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${PromocodeTypes[ctx.session.promocodeType as 'fixed' | 'percent']}\`
• 💸 Скидка: \`${ctx.session.promocodeValue} ${ctx.session.promocodeType === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: \`${ctx.session.promocodeMinOrderAmount} ₽\`
• 📅 Мин. кол-во месяцев для активации: ━━
• 📅 Действителен до: ━━
• 🔢 Всего использований: ━━
• 👤 На одного пользователя: ━━.
\n━━━━━━━━━━\n
⚠️ *Примечание:* _Выберите минимальное количество месяцев действия подписки для применения промокода_ .`
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

                ctx.session.step = null;

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

    async handleWritePromocode( ctx: MyContext ) {
        ctx.session.step = StepsEnum.ENTER_PROMOCODE
        const text = `*_Введите промокод :_*
        
🟢 Узнайте об актуальных промокодах в нашем Telegram-канале или группе !`
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
        }

        const message = await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
        if ( typeof message !== 'boolean' ) {
            ctx.session.promocodeMessageId = message.message_id
        }
    }

}