import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { Ctx } from "nestjs-telegraf";
import {
    AvailablePlansEnum,
    MyContext
} from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class FifthLevelService {
    constructor( private readonly telegramUtils: TelegramUtils,
                 private readonly prismaService: PrismaService ) {
    }

    async handleSelectMembers( @Ctx() ctx: MyContext ) {

        if ( ctx.callbackQuery && 'data' in ctx.callbackQuery ) {
            ctx.session.selectedMonths = Number(ctx.callbackQuery.data.split('_')[1])
        }

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
            inline_keyboard: [ [ {
                text: `от 1 до 3 — ${prices[0].price}₽`,
                callback_data: 'deviceRangeId_1',
            }, {
                text: `от 3 до 5 — ${prices[1].price}₽`,
                callback_data: 'deviceRangeId_2',
            } ], [ {
                text: `от 5 до 7 — ${prices[2].price}₽`,
                callback_data: 'deviceRangeId_3',
            }, {
                text: 'Назад',
                callback_data: `plan_${AvailablePlansEnum[ctx.session.selectedPlan as number]}`,
            } ] ]
        }
        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
}