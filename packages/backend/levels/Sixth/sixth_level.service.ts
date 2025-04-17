import { Injectable } from '@nestjs/common'
// biome-ignore lint/style/noNamespaceImport: <explanation>
import 'dayjs/locale/ru'
import * as dayjs from 'dayjs'
import { PrismaService } from 'nestjs-prisma'
import {
    MembersInPlan,
    MyContext,
    Plans,
    PromocodeTypes,
    StepsEnum
} from '../../interfaces/telegram.interface'
import { TelegramUtils } from '../../utils/telegram-utils'

@Injectable()
export class SixthLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
        private readonly prismaService: PrismaService,
    ) {
    }

    async handleMinOrderAmount( ctx: MyContext ) {
        ctx.session.step = StepsEnum.PROMOCODE_MIN_ORDER_AMOUNT

        if ( 'message' in ctx.update && 'text' in ctx.update.message ) {
            ctx.session.promocodeValue = Number(ctx.update.message.text)
        }

        const text = `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${PromocodeTypes[ctx.session.promocodeType as 'fixed' | 'percent']}\`
• 💸 Скидка: \`${ctx.session.promocodeValue} ${ctx.session.promocodeType === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: ━━
• 📅 Мин. кол-во месяцев для активации: ━━
• 📅 Действителен до: ━━
• 🔢 Всего использований: ━━
• 👤 На одного пользователя: ━━.
\n━━━━━━━━━━\n
⚠️ *Примечание:* _Выберите минимальную сумму заказа для активации промокода или же отправьте другое число_ .`
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '199 ₽',
                        callback_data: 'choose_min_order_amount_199',
                    },
                    {
                        text: '249 ₽',
                        callback_data: 'choose_min_order_amount_249',
                    },
                ],
                [
                    {
                        text: '299 ₽',
                        callback_data: 'choose_min_order_amount_299',
                    },
                    {
                        text: '719 ₽',
                        callback_data: 'choose_min_order_amount_719',
                    },
                ],
                [
                    {
                        text: '839 ₽',
                        callback_data: 'choose_min_order_amount_839',
                    },
                    {
                        text: '959 ₽',
                        callback_data: 'choose_min_order_amount_959',
                    },
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: `promocode_type_${ctx.session.promocodeType}`,
                    },
                ],
            ],
        }

        if ( 'message' in ctx.update && 'text' in ctx.update.message && ctx.session.promocodeMessageId ) {
            try {
                const message = await ctx.telegram.editMessageText(
                    ctx.update.message.from.id,
                    ctx.session.promocodeMessageId,
                    undefined,
                    this.telegramUtils.escapeMarkdown(text),
                    { reply_markup: keyboard, parse_mode: 'MarkdownV2' },
                )
                if ( typeof message !== 'boolean' ) {
                    ctx.session.promocodeMessageId = message.message_id
                }
            } catch ( e ) {
                console.log(e)
            }
        } else {
            const message = await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard)
            if ( typeof message !== 'boolean' ) {
                ctx.session.promocodeMessageId = message.message_id
            }
        }
    }

    async handleViewChosenPlan( ctx: MyContext ) {
        if ( ctx.callbackQuery && 'data' in ctx.callbackQuery ) {
            ctx.session.promocodeEnteredByUser = null
            ctx.session.deviceRangeId = Number(ctx.match[1])
        }
        if ( !(ctx.session.selectedPlan && ctx.session.deviceRangeId && ctx.session.selectedMonths) ) return

        const getPromocode = async () => {
            const promocode = await this.prismaService.promocode.findFirst({
                where: {
                    promocode: ctx.session.promocodeTakedByUser,
                },
                include: {
                    uses: {
                        where: {
                            user: {
                                telegramId: ctx.callbackQuery && String(ctx.callbackQuery.from.id)
                            }
                        }
                    }
                }
            })
            if ( !promocode || promocode.uses.length === promocode.maxUsesPerUser || (ctx.session.selectedMonths as number) < promocode.minMonthsOrderAmount || !ctx.session.promocodeTakedByUser ) {
                return null
            }
            return promocode
        }

        const promocode = await getPromocode()
        console.log(promocode)

        const subscription = await this.prismaService.subscriptionPlan.findFirst({
            where: {
                planId: ctx.session.selectedPlan,
                deviceRangeId: ctx.session.deviceRangeId,
                months: ctx.session.selectedMonths,
            },
        })

        const fetchedPrice = await this.prismaService.subscriptionPlan.findFirst({
            where: {
                planId: ctx.session.selectedPlan,
                deviceRangeId: ctx.session.deviceRangeId,
                months: 1,
            },
        })

        const defaultPrice = fetchedPrice?.price

        if ( !subscription ) {
            const text = 'Такой тариф не найден'
            const keyboard = {
                inline_keyboard: [
                    [
                        {
                            text: 'Назад',
                            callback_data: `month_${ctx.session.selectedMonths}`,
                        },
                    ],
                ],
            }
            await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard)
            return
        }

        const getPrice = ( full: boolean = false ): number => {
            if ( !ctx.session.selectedMonths ) {
                throw new Error('Количество месяцев не указано');
            }
            const months = ctx.session.selectedMonths as number;

            if ( typeof subscription.price !== 'number' ) {
                throw new Error('Цена подписки не указана или некорректна');
            }

            let finalPrice = subscription.price;

            if ( promocode ) {
                const isActive = promocode.status === 'ACTIVE';
                const isNotExpired = !promocode.expiredDate || dayjs().isBefore(promocode.expiredDate);
                const meetsMinOrder = subscription.price >= promocode.minOrderAmount;
                const meetsMinMonths = months >= promocode.minMonthsOrderAmount;

                if (
                    !isActive ||
                    !isNotExpired ||
                    !meetsMinOrder ||
                    !meetsMinMonths
                ) {
                    return full
                        ? Math.round(finalPrice)
                        : Math.round(finalPrice / months);
                }
                if ( promocode.type === 'percent' ) {
                    const discount = (subscription.price * promocode.value) / 100;
                    finalPrice = Math.max(0, subscription.price - discount);
                } else if ( promocode.type === 'fixed' ) {
                    finalPrice = Math.max(0, subscription.price - promocode.value);
                }
            }

            return full
                ? Math.round(finalPrice)
                : Math.round(finalPrice / months);
        };

        const plan = await this.prismaService.subscriptionPlan.findFirst({
            where: {
                price: subscription.price,
                months: ctx.session.selectedMonths,
            },
        })


        const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000)
        const messageId = 'callback_query' in ctx.update && ctx.update.callback_query.message?.message_id
        const paymentAccountId = 'callback_query' in ctx.update && ctx.update.callback_query.from.id
        const paymentInvoiceId = String(randomNumber)
        const text = `
✨ *Перед оплатой проверьте данные !*  

📋 *Тариф:*  *__${Plans[subscription.planId]}__*

📱 *Максимальное кол-во устройств:*  *_${MembersInPlan[subscription.deviceRangeId]}_*  

💰 *Цена подписки в месяц:* ${subscription.months === 1 ? `*_${getPrice()}₽_*` : `~${defaultPrice}₽~ ➤ *_${getPrice()}₽_* `} 

🧾 *Общая стоимость тарифа:* *_${getPrice(true)}_* ₽

⏳ *Конец подписки:*  *_${dayjs()
            .add(subscription.months, 'month')
            .format('D MMMM YYYY' + ' [г.] hh:mm (мск)')}_*  
`
        const url = `${process.env.FRONTEND_DOMAIN}?${promocode ? `promocode=${promocode.promocode}&` : ''}planId=${plan?.id}&chatId=${paymentAccountId}&invoiceId=${paymentInvoiceId}&amount=${getPrice(true)}&months=${ctx.session.selectedMonths}&messageId=${messageId}&paymentType=pay`
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '💳 Оплатить подписку',
                        web_app: { url },
                    },
                ],
                [
                    {
                        text: '🎁 Ввести промокод',
                        callback_data: 'write_promocode',
                    },
                ],
                [
                    ...(promocode && !(promocode?.uses.length === promocode?.maxUsesPerUser) && ctx.session.promocodeTakedByUser
                        ? [
                            {
                                text: `❌ Удалить промо ${ctx.session.promocodeTakedByUser}`,
                                callback_data: `delete_promocode_from_order_${ctx.session.deviceRangeId}`,
                            },
                        ]
                        : []),
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: `month_${ctx.session.selectedMonths}`,
                    },
                    { text: '🔙 В главное меню', callback_data: 'start' }
                ],
            ],
        }

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard)
    }
}
