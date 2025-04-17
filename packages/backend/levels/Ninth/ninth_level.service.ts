import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import {
    MyContext,
    PromocodeTypes,
    StepsEnum
} from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class NinthLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
    ) {
    }

    async handleChooseAvailableCountUses( ctx: MyContext ) {
        ctx.session.step = StepsEnum.PROMOCODE_AVAILABLE_COUNT_USES
        if ( 'message' in ctx.update && 'text' in ctx.update.message ) {
            if ( dayjs(ctx.update.message.text, 'DD.MM.YYYY HH:mm', true).isValid() ) {
                ctx.session.promocodeExpiredDate = dayjs(ctx.update.message.text, 'DD.MM.YYYY HH:mm', true).toDate()
            } else {
                const text = 'Дата неверна'

                return await this.telegramUtils.sendOrEditMessage(ctx, text)
            }
        }

        const text = `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${PromocodeTypes[ctx.session.promocodeType as 'fixed' | 'percent']}\`
• 💸 Скидка: \`${ctx.session.promocodeValue} ${ctx.session.promocodeType === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: \`${ctx.session.promocodeMinOrderAmount} ₽\`
• 📅 Мин. кол-во месяцев для активации: \`${ctx.session.promocodeMinMonthsOrderAmount}\`
• 📅 Действителен до: \`${dayjs(ctx.session.promocodeExpiredDate).format('D MMMM YYYY [г.] HH:MM')}\`
• 🔢 Всего использований: ━━
• 👤 На одного пользователя: ━━.
\n━━━━━━━━━━\n
⚠️ *Примечание:* _Выберите количество использований промокода_ .
 `
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
                [ {
                    text: '🔙 Назад',
                    callback_data: `choose_min_months_order_amount_${ctx.session.promocodeMinMonthsOrderAmount}`
                } ] ]
        }

        if ( 'message' in ctx.update && 'text' in ctx.update.message && ctx.session.promocodeMessageId ) {
            try {
                await ctx.telegram.editMessageText(
                    ctx.update.message.from.id,
                    ctx.session.promocodeMessageId,
                    undefined,
                    this.telegramUtils.escapeMarkdown(text),
                    { reply_markup: keyboard, parse_mode: 'MarkdownV2' }
                );

            } catch ( e ) {
                console.log(e);
            }
        } else {
            await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);

        }
    }

}