import * as dayjs from 'dayjs'
import * as customParseFormat from 'dayjs/plugin/customParseFormat'
import { PrismaService } from "nestjs-prisma";
import { Action, Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { CallbackQuery } from 'telegraf/types';
import {
    AvailablePlansEnum,
    MyContext,
    StepsEnum
} from './interfaces/telegram.interface';
import { EighthLevelService } from "./levels/Eighth/eighth_level.service";
import { EleventhLevelService } from "./levels/Eleventh/elventh_level.service";
import { FifthLevelService } from "./levels/Fifth/fifth_level.service";
import { FirstLevelService } from "./levels/First/first_level.service";
import { FourthLevelService } from "./levels/Fourth/fourth_level.service";
import { NinthLevelService } from "./levels/Ninth/ninth_level.service";
import { SecondLevelService } from "./levels/Second/second_level.service";
import { SeventhLevelService } from "./levels/Seventh/seventh_level.service";
import { SixthLevelService } from "./levels/Sixth/sixth_level.service";
import { TenthLevelService } from "./levels/Tenth/tenth_level.service";
import { ThirdLevelService } from "./levels/Third/third_level.service";
import { TwelfthLevelService } from "./levels/Twelfth/twelfth_level.service";
import { CloudPaymentsService } from "./services/cloudpayments.service";

dayjs.extend(customParseFormat)
dayjs.locale("ru");

@Update()
export class TelegramUpdate {
    constructor(
        private readonly firstLevelService: FirstLevelService,
        private readonly secondLevelService: SecondLevelService,
        private readonly thirdLevelService: ThirdLevelService,
        private readonly fourthLevelService: FourthLevelService,
        private readonly fifthLevelService: FifthLevelService,
        private readonly sixthLevelService: SixthLevelService,
        private readonly seventhLevelService: SeventhLevelService,
        private readonly eighthLevelService: EighthLevelService,
        private readonly ninthLevelService: NinthLevelService,
        private readonly tenthLevelService: TenthLevelService,
        private readonly eleventhLevelService: EleventhLevelService,
        private readonly twelfthLevelService: TwelfthLevelService,
        private readonly cloudPaymentsService: CloudPaymentsService,
        private readonly prismaService: PrismaService,
    ) {
    }

    private isCallbackQuery( query: any ): query is CallbackQuery.DataQuery {
        return query?.data !== undefined;
    }


    @Action('start')
    async handleStart( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()

        await this.firstLevelService.handleStart(ctx);
    }

    // @Action('clear_all')
    // async handleClearAll( @Ctx() ctx: MyContext ) {
    //     await ctx.answerCbQuery()
    //     await this.firstLevelService.handleClearAll(ctx)
    // }

    @Start()
    async onStart( @Ctx() ctx: MyContext ) {
        await this.firstLevelService.handleStart(ctx);
    }

    @Command('clear')
    async clearSession( @Ctx() ctx: MyContext ) {
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

    @Action('handle_add_promocode')
    async handleAddPromoCode( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.thirdLevelService.handleAddPromocode(ctx)
    }

    @Action('handle_show_promocodes')
    async handleShowPromoCodes( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.thirdLevelService.handleShowPromocodes(ctx);
    }


    @On('text')
    async onMessage( @Ctx() ctx: MyContext ) {
        if ( 'message' in ctx.update && 'text' in ctx.update.message ) {
            switch ( ctx.session.step ) {
                case (StepsEnum.PROMOCODE):
                    await this.fourthLevelService.handleChooseTypePromocode(ctx)
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;

                case (StepsEnum.PROMOCODE_VALUE):
                    await this.sixthLevelService.handleMinOrderAmount(ctx)
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;

                case (StepsEnum.PROMOCODE_MIN_ORDER_AMOUNT):
                    await this.seventhLevelService.handleMinMonthsOrderAmount(ctx)
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;

                case (StepsEnum.PROMOCODE_EXPIRED_DATE):
                    await this.ninthLevelService.handleChooseAvailableCountUses(ctx)
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;

                case StepsEnum.PROMOCODE_AVAILABLE_COUNT_USES:
                    await this.tenthLevelService.handleChooseMaxUsesPerUser(ctx)
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;

                case StepsEnum.PROMOCODE_MAX_USES_PER_USER:
                    await this.eleventhLevelService.handleCheckPromocode(ctx)
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;
                case StepsEnum.ENTER_PROMOCODE:
                    const promocode = await this.prismaService.promocode.findUnique({
                        where: {
                            promocode: ctx.update.message.text
                        },
                        include: {
                            uses: {
                                where: {
                                    user: {
                                        telegramId: String(ctx.update.message.from.id)
                                    }
                                }
                            }
                        }
                    })

                    await this.eighthLevelService.handleShowPromocodeDetails(ctx, promocode)
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;
            }


        }
    }

    @Action('handle_choose_type_promocode')
    async handleChooseTypePromocode( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.fourthLevelService.handleChooseTypePromocode(ctx)
    }


    @Action(/^promocode_type_(percent|fixed)/)
    async handleChooseValue( ctx: MyContext ) {
        await ctx.answerCbQuery();

        ctx.session.promocodeType = ctx.match[1] as 'percent' | 'fixed';
        await this.fifthLevelService.handleChooseValue(ctx)
    }

    @Action(/^choose_value_(\d+)$/)
    async handleMinOrderAmount( ctx: MyContext ) {
        ctx.session.promocodeValue = ctx.match[1]
        await ctx.answerCbQuery();
        await this.sixthLevelService.handleMinOrderAmount(ctx)
    }

    @Action(/^choose_min_order_amount_(\d+)$/)
    async handleMinMonthsOrderAmount( ctx: MyContext ) {
        ctx.session.promocodeMinOrderAmount = ctx.match[1]
        await ctx.answerCbQuery();
        await this.seventhLevelService.handleMinMonthsOrderAmount(ctx)
    }

    @Action(/^choose_min_months_order_amount_(\d+)$/)
    async handleChooseExpiredDate( @Ctx() ctx: MyContext ) {
        ctx.session.promocodeMinMonthsOrderAmount = ctx.match[1]
        await ctx.answerCbQuery()
        await this.eighthLevelService.handleChooseExpiredDate(ctx)
    }

    @Action(/choose_expired_(1|3|6|9|12)$/)
    async handleChooseAvailableCountUses( @Ctx() ctx: MyContext ) {
        const months = ctx.match[1]
        ctx.session.promocodeExpiredDate = dayjs().add(months, 'months').toDate()
        ctx.session.promocodeExpiredMonths = months
        await ctx.answerCbQuery();
        await this.ninthLevelService.handleChooseAvailableCountUses(ctx)
    }

    @Action(/^choose_available_count_uses_(\d+)$/)
    async handleChooseMaxUsesPerUser( ctx: MyContext ) {
        ctx.session.promocodeAvailableCountUses = ctx.match[1]
        await ctx.answerCbQuery();
        await this.tenthLevelService.handleChooseMaxUsesPerUser(ctx)
    }

    @Action(/^choose_max_uses_per_user_(\d+)$/)
    async handleCheckPromocode( @Ctx() ctx: MyContext ) {
        ctx.session.promocodeMaxUsesPerUser = ctx.match[1]
        await ctx.answerCbQuery();
        await this.eleventhLevelService.handleCheckPromocode(ctx)
    }


    @Action('create_promocode')
    async handleCreatePromocode( ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.twelfthLevelService.handleCreatePromocode(ctx)
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
    async handleViewChosenPlan( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.sixthLevelService.handleViewChosenPlan(ctx)
    }

    @Action('write_promocode')
    async handleWritePromocode( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.seventhLevelService.handleWritePromocode(ctx)
    }

    @Action(/^take_promocode_(1|2|3)$/)
    async handleTakePromocode( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        ctx.session.promocodeTakedByUser = ctx.session.promocodeEnteredByUser
        await this.sixthLevelService.handleViewChosenPlan(ctx)
    }

    @Action(/^delete_promocode_from_order_(1|2|3)$/)
    async handleDeletePromocodeFromOrder( @Ctx() ctx: MyContext ) {
        ctx.session.promocodeTakedByUser = null
        await ctx.answerCbQuery();
        await this.sixthLevelService.handleViewChosenPlan(ctx)
    }

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