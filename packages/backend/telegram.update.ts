import { PrismaService } from "nestjs-prisma";
import { Action, Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { CallbackQuery } from 'telegraf/types';
import {
    AvailablePlansEnum,
    MyContext,
    StepsEnum
} from './interfaces/telegram.interface';
import { FifthLevelService } from "./levels/Fifth/fifth_level.service";
import { FirstLevelService } from "./levels/First/first_level.service";
import { FourthLevelService } from "./levels/Fourth/fourth_level.service";
import { SecondLevelService } from "./levels/Second/second_level.service";
import { SixthLevelService } from "./levels/Sixth/sixth_level.service";
import { ThirdLevelService } from "./levels/Third/third_service.service";
import { CloudPaymentsService } from "./services/cloudpayments.service";

@Update()
export class TelegramUpdate {
    constructor(
        private readonly firstLevelService: FirstLevelService,
        private readonly secondLevelService: SecondLevelService,
        private readonly thirdLevelService: ThirdLevelService,
        private readonly fourthLevelService: FourthLevelService,
        private readonly fifthLevelService: FifthLevelService,
        private readonly sixthLevelService: SixthLevelService,
        private readonly cloudPaymentsService: CloudPaymentsService
    ) {
    }

    private isCallbackQuery( query: any ): query is CallbackQuery.DataQuery {
        return query?.data !== undefined;
    }

    @Action('start')
    async handleStart( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()
        ctx.session.step = null;
        await this.firstLevelService.handleStart(ctx);
    }

    // @Action('clear_all')
    // async handleClearAll( @Ctx() ctx: MyContext ) {
    //     await ctx.answerCbQuery()
    //     await this.firstLevelService.handleClearAll(ctx)
    // }

    @Start()
    async onStart( @Ctx() ctx: MyContext ) {
        ctx.session.step = null;
        await this.firstLevelService.handleStart(ctx);
    }

    @Command('clear')
    async clearSession( @Ctx() ctx: MyContext ) {
        ctx.session = { step: null, promocode: '' }
        await ctx.reply('Сессия очищена')
    }

    @Action('my_account')
    async handleMyAccount( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()
        await this.secondLevelService.handleMyAccount(ctx);
    }

    @Command('my_account')
    async onMyAccount( @Ctx() ctx: MyContext ) {
        await this.secondLevelService.handleMyAccount(ctx);
    }

    @Action('buy_vpn')
    async handleBuyToken( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()
        await this.secondLevelService.handleBuyToken(ctx);
    }

    @Command('buy_vpn')
    async onVpnServices( @Ctx() ctx: MyContext ) {
        await this.secondLevelService.handleBuyToken(ctx);
    }

    @Action('settings')
    async handleSettings( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()
        await this.secondLevelService.handleSettings(ctx)
    }

    @Command('settings')
    async onSettings( @Ctx() ctx: MyContext ) {
        await this.secondLevelService.handleSettings(ctx)
    }


    @On('text')
    async onMessage( ctx: MyContext ) {
        if ( ctx.session.step === StepsEnum.PROMOCODE && 'message' in ctx.update && 'text' in ctx.update.message ) {
            ctx.session.promocode = ctx.update.message.text;
            ctx.session.step = null

            await ctx.reply(`Промокод введен успешно \`${ctx.session.promocode}\``, {
                parse_mode: 'MarkdownV2'
            })
            await this.secondLevelService.handleBuyToken(ctx)
        }
    }

    @Action('faq')
    async handleFaq( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.thirdLevelService.handleFaq(ctx);
    }

    @Action(/^plan_(base|standard|premium)$/)
    async handlePlanSelect( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        if ( this.isCallbackQuery(ctx.callbackQuery) ) {
            const planName = ctx.callbackQuery.data.split('_')[1] as keyof typeof AvailablePlansEnum
            await this.fourthLevelService.handleChoosePlan(ctx, planName);
        }
    }

    @Action(/^month_(1|3|6|12)$/)
    async handleSelectMembers( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.fifthLevelService.handleSelectMembers(ctx);
    }

    @Action(/^deviceRangeId_(1|2|3)$/)
    async handleViewPlan( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.sixthLevelService.handleViewChosenPlan(ctx)
    }

    // @Action('payment_history')
    // async handlePaymentHistory( @Ctx() ctx: MyContext ) {
    //     await ctx.answerCbQuery();
    //     await this.fourthLevelService.handlePaymentHistory(ctx);
    // }

    @Action("my_subscriptions")
    async handleMySubscriptions( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.thirdLevelService.handleMySubscriptions(ctx);
    }

    @Action(/^page_(\d+)$/)
    async handlePagination( ctx: MyContext ) {
        await ctx.answerCbQuery();
        ctx.session.page = Number(ctx.match[1]);
        await this.handleMySubscriptions(ctx);
    }

    @Action(/^sub_(.+)$/)
    async handleSubscriptionDetails( ctx: MyContext ) {
        const subId = ctx.match[1]
        await ctx.answerCbQuery();
        await this.fourthLevelService.handleSubscriptionDetails(ctx, subId);
    }

    @Action(/^update_sub-([^-]+)-(Cancellation|Activate)$/)
    async cancelSubscription( @Ctx() ctx: MyContext ) {
        const subId = ctx.match[1]
        const action = ctx.match[2]
        await this.cloudPaymentsService.updateSubscription(ctx, subId, action)
        await ctx.answerCbQuery();
    }

    @Action(/^delete_from_user_subscription-(.+)$/)
    async handleDeleteFromUserSubscription( @Ctx() ctx: MyContext ) {
        const subId = ctx.match[1]
        await this.fourthLevelService.handleDeleteFromUserSubscription(ctx, subId)
    }


}