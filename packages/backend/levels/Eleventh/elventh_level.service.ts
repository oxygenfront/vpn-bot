import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import { PrismaService } from "nestjs-prisma";
import { MyContext, PromocodeTypes } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class EleventhLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
        private readonly prismaService: PrismaService
    ) {
    }

    async handleCheckPromocode( ctx: MyContext ) {
        if ( 'message' in ctx.update && 'text' in ctx.update.message ) {
            ctx.session.promocodeMaxUsesPerUser = Number(ctx.update.message.text)
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
• 👤 На одного пользователя: \`${ctx.session.promocodeMaxUsesPerUser}\`.
\n━━━━━━━━━━\n
❓ *_Проверьте данные перед созданием промокода !_*`
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '✅ Создать промокод',
                        callback_data: 'create_promocode',
                    }
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: `choose_available_count_uses_${ctx.session.promocodeAvailableCountUses}`
                    }
                ]
            ]
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