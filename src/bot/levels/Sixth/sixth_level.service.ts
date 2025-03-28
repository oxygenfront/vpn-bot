import { Injectable } from "@nestjs/common";
import * as dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { PrismaService } from "nestjs-prisma";
import {
    MembersInPlan,
    MyContext,
    Plans
} from "../../interfaces/telegram.interface";
import { CloudPaymentsService } from "../../services/cloudpayments.service";
import { TelegramUtils } from "../../utils/telegram-utils";

dayjs.locale('ru');

@Injectable()
export class SixthLevelService {
    constructor( private readonly telegramUtils: TelegramUtils,
                 private readonly prismaService: PrismaService,
                 private readonly cloudPaimentsService: CloudPaymentsService ) {
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
        if ( !subscription ) {
            const text = 'Такой тариф не найден'
            const keyboard = {
                inline_keyboard: [ [ {
                    text: 'Назад',
                    callback_data: `month_${ctx.session.selectedMonths}`,
                } ] ]
            }
            await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard)
            return
        }

        const pricePerMonth = Number(this.telegramUtils.escapeMarkdown(String(Math.ceil(subscription.price / (ctx.session.selectedMonths as number)))))
        const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000)
        const paymentDescription = `Оплата №${randomNumber}`
        const paymentInvoiceId = String(randomNumber)
        const paymentAccountId = ctx.callbackQuery?.from.id as unknown as string
        const text = `Ваша подписка:
        Тариф: ${Plans[subscription.planId]}
        Максимальное кол\\-во устройств для подключения: ${this.telegramUtils.escapeMarkdown(MembersInPlan[subscription.deviceRangeId])}
        
        Стоимость подписки за 1 месяц: ${pricePerMonth}₽
        
        Конец подписки: ${this.telegramUtils.escapeMarkdown(dayjs()
            .add(subscription.months, 'month')
            .format('D MMMM YYYY [г.]'))}
        `

        const { url } = await this.cloudPaimentsService.createPaymentLink(pricePerMonth, paymentDescription, paymentInvoiceId, paymentAccountId)
        const keyboard = {
            inline_keyboard: [ [ {
                text: 'Оплатить подписку',
                url
            } ], [ {
                text: 'Назад',
                callback_data: `month_${ctx.session.selectedMonths}`,
            } ] ]
        }

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard)
    }
}