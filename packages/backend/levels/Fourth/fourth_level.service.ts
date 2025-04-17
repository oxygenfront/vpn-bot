import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import { PrismaService } from "nestjs-prisma";
import {
    AvailablePlansEnum,
    MyContext, Plans
} from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
import { ThirdLevelService } from "../Third/third_level.service";

@Injectable()
export class FourthLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
        private readonly thirdLevelService: ThirdLevelService,
        private readonly prismaService: PrismaService,
    ) {
    }

    getDayDeclension( days: number ): string {
        const lastDigit = days % 10;
        const lastTwoDigits = days % 100;

        if ( lastTwoDigits >= 11 && lastTwoDigits <= 14 ) {
            return 'дней';
        }

        if ( lastDigit === 1 ) {
            return 'день';
        } else if ( lastDigit >= 2 && lastDigit <= 4 ) {
            return 'дня';
        } else {
            return 'дней';
        }
    }

    async handleChoosePlan( ctx: MyContext, planName: keyof typeof AvailablePlansEnum ) {
        ctx.session.selectedPlan = AvailablePlansEnum[planName];
        const minPrices = await this.prismaService.subscriptionPlan.findMany({
            where: { planId: ctx.session.selectedPlan, deviceRangeId: 1 },
        })

        const text = 'Выберите период подписки'
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: `📅 1 месяц от ${minPrices[0].price}₽`,
                        callback_data: 'month_1'
                    },

                ],
                [
                    {
                        text: `📅 3 месяца от ${minPrices[1].price}₽`,
                        callback_data: 'month_3'
                    }
                ],
                [
                    {
                        text: `📅 6 месяцев от ${minPrices[2].price}₽`,
                        callback_data: 'month_6'
                    }
                ],
                [
                    {
                        text: `📅 12 месяцев от ${minPrices[3].price}₽`,
                        callback_data: 'month_12'
                    },
                ],
                [ { text: '🔙 Назад', callback_data: 'buy_vpn' } ], // 🔙 — оставляем как есть
            ]
        }

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard)

    }

    async handleSubscriptionDetails( ctx: MyContext, subId: string ) {
        const subscriptionId = subId;
        const subscription = await this.prismaService.userSubscription.findUnique({
            where: { id: subscriptionId },
            include: {
                subscriptionPlan: {
                    include: {
                        plan: true,
                        deviceRange: true,
                    },
                },
            },
        });

        if ( !subscription ) {
            const text = '❌ Подписка не найдена.';
            const keyboard = {
                inline_keyboard: [ [ {
                    text: '🔙 Назад',
                    callback_data: 'my_subscriptions'
                } ] ],
            };
            await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
            return;
        }
        const messageId = ctx.callbackQuery && ctx.callbackQuery.message && ctx.callbackQuery.message.message_id

        const isActive = dayjs().isBefore(dayjs(subscription.expiredDate));
        const expiredDate = dayjs(subscription.expiredDate).format('D MMMM YYYY' +
            ' [г.] hh:mm (мск)')
        const twoMonthsFromNow = dayjs().add(2, 'month');
        const endDate = dayjs(subscription.expiredDate)
        const differenceDays = endDate.diff(dayjs(), 'day')

        const status = isActive ? 'Активна' : 'Истекла';
        const statusRenew = subscription.status === 'Active' ? '✅' : '❌'
        const planName = subscription.subscriptionPlan?.plan?.name
        const deviceRange = subscription.subscriptionPlan?.deviceRange?.range || 'Неизвестно'

        const url = `${process.env.FRONTEND_DOMAIN}?chatId=${subscription.userId}&invoiceId=${subscription.lastInvoiceId}&amount=${subscription.subscriptionPlan.price}&months=${subscription.subscriptionPlan.months}&messageId=${messageId}&paymentType=extension`.trim()


        const text = `
🆔 ID: \`${subscriptionId}\`
📋 Тариф: *${Plans[AvailablePlansEnum[planName.toLowerCase()]]}*
📱 Устройств: *${deviceRange}*
⏳ Истекает: *${expiredDate}*
Дата списания: *${dayjs(subscription.nextBillingDate).format('D MMMM YYYY' +
            ' [г.] hh:mm (мск)')}*
🗓️ Дней до конца подписки: *${differenceDays} ${this.getDayDeclension(differenceDays)}*

🔒 VLESS ссылка для подключения: \`${subscription.vlessLinkConnection}\`

🔗 URL ссылка для подключения: ${subscription.urlLinkConnection}

${isActive ? '🟢' : '🔴'} Статус подписки: ${status}

*_Продление подписки доступно только если до конца текущей осталось менее двух месяцев, а также если отключено автопродление_*
`;

        const keyboard = {
            inline_keyboard: [
                [ ...(endDate.isBefore(twoMonthsFromNow) && subscription.status !== 'Active' ? [
                    {
                        text: '🔄 Продлить подписку',
                        web_app: { url }
                    },

                ] : []) ],
                [
                    {
                        text: `${statusRenew} Автопродление (вкл/выкл)`,
                        callback_data: `update_sub-${subscriptionId}-${subscription.status === 'Active' ? 'Cancellation' : 'Activate'}`
                    }
                ],
                [
                    {
                        text: '🔄 Обновить информацию',
                        callback_data: `sub_${subscriptionId}`
                    }
                ],
                [ ...(isActive && subscription.status === 'Active' ? [] : [ {
                    text: '🗑️ Удалить из списка',
                    callback_data: `delete_from_user_subscription-${subscriptionId}`,
                } ]) ],
                [
                    {
                        text: '🔙 В главное меню',
                        callback_data: 'start'
                    },
                    {
                        text: '🔙 Назад',
                        callback_data: 'my_subscriptions'
                    }
                ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleDeleteFromUserSubscription( ctx: MyContext, subId: string ) {
        await this.prismaService.userSubscription.delete({
            where: {
                id: subId,
            }
        })
        return await this.thirdLevelService.handleMySubscriptions(ctx)
    }

    async handleChooseTypePromocode( ctx: MyContext ) {
        if ( 'message' in ctx.update && 'text' in ctx.update.message && ctx.session.promocodeMessageId ) {
            const promocode = await this.prismaService.promocode.findFirst({
                where: {
                    promocode: ctx.update.message.text
                }
            })
            if ( !promocode ) {
                ctx.session.promocode = ctx.update.message.text;
            } else {
                const text = `Промокод \`${ctx.update.message.text}\` уже существует. Выберите другое имя промокоду`
                return await ctx.telegram.editMessageText(
                    ctx.update.message.from.id,
                    ctx.session.promocodeMessageId,
                    undefined,
                    this.telegramUtils.escapeMarkdown(text),
                    {
                        reply_markup: {
                            inline_keyboard: [ [
                                {
                                    text: '🔙 Назад',
                                    callback_data: 'start'
                                }
                            ] ]
                        }, parse_mode: 'MarkdownV2'
                    }
                );
            }
        }


        const text = `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: ━━
• 💸 Скидка: ━━
• 💸 Мин. сумма для активации: ━━
• 📅 Мин. кол-во месяцев для активации:: ━━
• 📅 Действителен до: ━━
• 🔢 Всего использований: ━━
• 👤 На одного пользователя: ━━
\n━━━━━━━━━━\n
⚠️ *Примечание:* _Выберите тип промокода_ .
`;
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: "% Процентный",
                        callback_data: "promocode_type_percent"
                    },
                    {
                        text: "₽ Фиксированный",
                        callback_data: "promocode_type_fixed"
                    }
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: 'start',
                    }
                ]
            ],
        };

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


        ctx.session.promocodeMessageId = null;
    }
}