import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { Ctx } from "nestjs-telegraf";
import {
    AvailablePlansEnum,
    MyContext, PromocodeTypes, StepsEnum
} from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class FifthLevelService {
    constructor( private readonly telegramUtils: TelegramUtils,
                 private readonly prismaService: PrismaService ) {
    }

    async handleChooseValue( ctx: MyContext ) {
        ctx.session.step = StepsEnum.PROMOCODE_VALUE

        const text = `${ctx.session.promocodeType === 'percent' ?
            `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${PromocodeTypes[ctx.session.promocodeType as 'fixed' | 'percent']}\`
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
• ⚙️ Тип промокода: \`${PromocodeTypes[ctx.session.promocodeType as 'fixed' | 'percent']}\`
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
    
⚠️ *Важно:* _Сумма должна быть положительной._`}`
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
        }
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
        }
        const keyboard = ctx.session.promocodeType === 'percent' ? percentKeyboard : fixedKeyboard

        const message = await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
        if ( typeof message !== 'boolean' ) {
            ctx.session.promocodeMessageId = message.message_id
        }
    }

    async handleSelectMembers( @Ctx() ctx: MyContext ) {

        if ( ctx.callbackQuery && 'data' in ctx.callbackQuery ) {
            ctx.session.selectedMonths = Number(ctx.callbackQuery.data.split('_')[1])
        }
        if ( !(ctx.session.selectedPlan && ctx.session.selectedMonths) ) return

        const prices = await this.prismaService.subscriptionPlan.findMany({
            where: {
                planId: ctx.session.selectedPlan,
                months: ctx.session.selectedMonths
            },
        })


        await ctx.answerCbQuery();
        const text = 'Выберите количество человек, которых планируете' +
            ' добавить в подписку'
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
                        callback_data: `plan_${AvailablePlansEnum[ctx.session.selectedPlan as number]}`
                    },
                    { text: '🔙 В главное меню', callback_data: 'start' }
                ],
            ],
        }
        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
}