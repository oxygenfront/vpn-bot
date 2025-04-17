import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import {
    MyContext,
    PromocodeTypes,
    StepsEnum
} from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";


@Injectable()
export class EighthLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
    ) {
    }

    async handleChooseExpiredDate( ctx: MyContext ) {
        ctx.session.step = StepsEnum.PROMOCODE_EXPIRED_DATE;

        const text = `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${PromocodeTypes[ctx.session.promocodeType as 'fixed' | 'percent']}\`
• 💸 Скидка: \`${ctx.session.promocodeValue} ${ctx.session.promocodeType === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: \`${ctx.session.promocodeMinOrderAmount} ₽\`
• 📅 Мин. кол-во месяцев для активации: \`${ctx.session.promocodeMinMonthsOrderAmount}\`
• 📅 Действителен до: ━━
• 🔢 Всего использований: ━━
• 👤 На одного пользователя: ━━.
\n━━━━━━━━━━\n
⚠️ *Примечание*: Укажите срок действия промокода:
    1️⃣ Введите дату окончания в формате \`DD.MM.YYYY HH:mm\`\n(например, \`01.01.2025 00:00\`).
    2️⃣ Или выберите промежуток ниже (отсчёт начнётся с момента создания промокода).

⚠️ *Важно:*
- Формат даты должен быть точным, например, \`15.12.2025 14:30\`.
- При выборе промежутка срок действия начнётся с *${dayjs().format('DD.MM.YYYY')}*.`

        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '1 месяц',
                        callback_data: 'choose_expired_1'
                    },
                    {
                        text: '3 месяца',
                        callback_data: 'choose_expired_3'
                    }
                ], [
                    {
                        text: '6 месяцев',
                        callback_data: 'choose_expired_6'
                    },
                    {
                        text: '9 месяцев',
                        callback_data: 'choose_expired_9'
                    }
                ],
                [
                    {
                        text: '1 год',
                        callback_data: 'choose_expired_12'
                    },
                    {
                        text: '🔙 Назад',
                        callback_data: `choose_min_order_amount_${ctx.session.promocodeMinOrderAmount}`
                    }
                ]
            ],
        }

        const message = await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
        if ( typeof message !== 'boolean' ) {
            ctx.session.promocodeMessageId = message.message_id
        }
    }

    async handleShowPromocodeDetails( ctx: MyContext, promocode: any ) {

        const handleReturnTextAboutPromocode = ( promo ) => {
            if ( promo ) {
                if ( 'message' in ctx.update && 'text' in ctx.update.message ) {
                    ctx.session.promocodeEnteredByUser = ctx.update.message.text

                }
                return `🎉 *Промокод \`${promo.promocode}\` найден!*

📋 *Детали промокода:*

• 🎟️ Промокод: \`${promo.promocode}\`
• 💸 Скидка: \`${promo.value} ${promo.type === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: \`${promo.minOrderAmount || 0} ₽\`
• 📅 Мин. кол-во месяцев для активации: \`${promo.minMonthsOrderAmount || 'Без ограничения'}\`
• 📅 Действителен до: \`${promo.expiredDate ? dayjs(promo.expiredDate).format('D MMMM YYYY [г.] HH:MM') : 'Бессрочно'}\`
• 🔢 Всего осталось: \`${promo.availableCountUses}\`
• 👤 Ваши оставшиеся использования: \`${promo.maxUsesPerUser - promo.uses.length} из ${promo.maxUsesPerUser}\`

${promo.uses.length === promo.maxUsesPerUser ? `
🚫 *Промокод недоступен!*

К сожалению, вы исчерпали лимит использования этого промокода.  

👤 Вы использовали его *${promo?.uses.length}* раз из ${promo.maxUsesPerUser}.  
🔄 Попробуйте другой промокод или свяжитесь с поддержкой.`
                    : ''}`
            }
            return `🚫 *Промокод не найден!*

К сожалению, такого промокода не существует.  

🔄 Попробуйте ввести другой промокод.  
📢 Узнайте об актуальных промокодах в нашем Telegram-канале или группе ! `
        }


        const text = handleReturnTextAboutPromocode(promocode)
        const keyboard = {
            inline_keyboard: [
                [
                    ...(promocode?.uses.length === promocode?.maxUsesPerUser || !promocode ? [
                        {
                            text: '👥 Группа',
                            url: 'https://t.me/vpn_by_oxy/42'
                        },
                        {
                            text: '📢 Канал',
                            url: 'https://t.me/VpnByOxy'
                        }
                    ] : [ {
                        text: '✅ Воспользоваться',
                        callback_data: `take_promocode_${ctx.session.deviceRangeId}`
                    } ])
                ],

                [
                    {
                        text: '🔙 Назад',
                        callback_data: `deviceRangeId_${ctx.session.deviceRangeId}`
                    },

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