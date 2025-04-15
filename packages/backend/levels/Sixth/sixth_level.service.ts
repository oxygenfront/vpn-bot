import { Injectable } from '@nestjs/common'
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { PrismaService } from 'nestjs-prisma'
import {
    MembersInPlan,
    MyContext,
    Plans
} from '../../interfaces/telegram.interface'
import { CloudPaymentsService } from '../../services/cloudpayments.service'
import { TelegramUtils } from '../../utils/telegram-utils'
import { WebhookController } from "../../webhooks/webhook.controller";

dayjs.locale('ru')

@Injectable()
export class SixthLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
        private readonly prismaService: PrismaService,
        private readonly webhookController: WebhookController
    ) {
    }

    async handleViewChosenPlan( ctx: MyContext ) {
        if ( ctx.callbackQuery && 'data' in ctx.callbackQuery ) {
            ctx.session.deviceRangeId = Number(ctx.callbackQuery.data.split('_')[1])
        }

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
                months: 1
            }
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

        const pricePerMonth = Number(
            String(Math.floor(subscription.price / (ctx.session.selectedMonths as number))),
        )
        const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000)
        const messageId = 'callback_query' in ctx.update && ctx.update.callback_query.message?.message_id
        const paymentAccountId = 'callback_query' in ctx.update && ctx.update.callback_query.from.id
        const paymentInvoiceId = String(randomNumber)
        const text = `
✨ *Перед оплатой проверьте данные \\!*  

📋 *Тариф:*  *__${Plans[subscription.planId]}__*

📱 *Максимальное кол\\-во устройств:*  *_${MembersInPlan[subscription.deviceRangeId]}_*  

💰 *Цена подписки в месяц:*  ~${defaultPrice}₽~ ➤ *_${pricePerMonth}₽_* 

🧾 *Общая стоимость тарифа:* *_${subscription.price}_* ₽

⏳ *Конец подписки:*  *_${
            dayjs().add(subscription.months, 'month').format('DD.MM.YYYY')
        }_*  
`
        const url = `${process.env.FRONTEND_DOMAIN}?chatId=${paymentAccountId}&invoiceId=${paymentInvoiceId}&amount=${subscription.price}&months=${ctx.session.selectedMonths}&messageId=${messageId}&paymentType=pay`
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: 'Оплатить подписку',
                        web_app: { url },
                    },
                ],
                [
                    {
                        text: 'Назад',
                        callback_data: `month_${ctx.session.selectedMonths}`,
                    },
                ],
            ],
        }

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard)
    }
}
