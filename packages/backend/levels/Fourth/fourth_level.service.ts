import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import { PrismaService } from "nestjs-prisma";
import {
    AvailablePlansEnum,
    MyContext, Plans
} from "../../interfaces/telegram.interface";
import { LinkGeneratorService } from "../../services/link-generator.service";
import { UserService } from "../../services/user.service";
import { XuiApiService } from "../../services/xui-api.service";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class FourthLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
        private readonly userService: UserService,
        private readonly xuiApiService: XuiApiService,
        private readonly linkGeneratorService: LinkGeneratorService,
        private readonly prismaService: PrismaService,
    ) {
    }

    async handlePaymentHistory( ctx: MyContext ) {
        const history = await this.userService.getUserPaymentHistory(ctx);

        const text = `💳 *История платежей*

${history.length > 0 ? '*Ваши транзакции:*' : 'У вас пока нет платежей\\.'}
${history
            .map(
                ( payment, index ) => `
${index + 1}\\. ${payment.plan} — ${payment.amount}$ 💸
   📅 01\\.${payment.month}\\.${payment.year} \\| ${payment.status === 'Оплачено' ? '✅' : '⚠️'} ${payment.status}`,
            )
            .join('\n')}

_Всего: ${this.telegramUtils.escapeMarkdown(String(history.length))} транзакций_`;

        const keyboard = {
            inline_keyboard: [
                [ {
                    text: '📥 Выгрузить чеки',
                    callback_data: 'download_receipts'
                } ],
                [ { text: '🔙 Назад в аккаунт', callback_data: 'my_account' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
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
            const text = '❌ Подписка не найдена\\.';
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
        const status = isActive ? '🟢 Активна' : '🔴 Истекла';
        const statusRenew = subscription.status === 'Active' ? '✅' : '❌'
        const planName = subscription.subscriptionPlan?.plan?.name
        const deviceRange = this.telegramUtils.escapeMarkdown(subscription.subscriptionPlan?.deviceRange?.range || 'Неизвестно');
        const expiredDate = this.telegramUtils.escapeMarkdown(dayjs(subscription.expiredDate).format('D MMMM YYYY [г.]'));

        const url = `${process.env.FRONTEND_DOMAIN}?chatId=${subscription.userId}&invoiceId=${subscription.lastInvoiceId}&amount=${subscription.subscriptionPlan.price}&months=${subscription.subscriptionPlan.months}&messageId=${messageId}&paymentType=extension`.trim()

        const text = `
🆔 ID: \`${this.telegramUtils.escapeMarkdown(subscriptionId)}\`
📋 Тариф: *${this.telegramUtils.escapeMarkdown(Plans[AvailablePlansEnum[planName.toLowerCase()]])}*
📱 Устройств: *${deviceRange}*
⏳ Истекает: *${expiredDate}*
${status}
`;

        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '🔄 Продлить подписку',
                        web_app: { url }
                    },

                ],
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
}