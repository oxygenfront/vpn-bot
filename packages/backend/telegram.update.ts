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

@Update()
export class TelegramUpdate {
    constructor(
        private readonly firstLevelService: FirstLevelService,
        private readonly secondLevelService: SecondLevelService,
        private readonly thirdLevelService: ThirdLevelService,
        private readonly fourthLevelService: FourthLevelService,
        private readonly fifthLevelService: FifthLevelService,
        private readonly sixthLevelService: SixthLevelService,
    ) {
    }

    // Type guards
    private isCallbackQuery( query: any ): query is CallbackQuery.DataQuery {
        return query?.data !== undefined;
    }

    // First level bot
    @Action('start')
    async handleStart( @Ctx() ctx: MyContext ) {
        ctx.session.step = null;
        await ctx.answerCbQuery()
        await this.firstLevelService.handleStart(ctx);
    }

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

// ------------------------------------------------------------------

    // Second level

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

    @Action('how_use_token')
    async handleHowUseToken( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()
        await this.secondLevelService.handleHowUseToken(ctx);
    }

    @Action('help')
    async handleHelp( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()
        await this.secondLevelService.handleHelp(ctx)
    }

    @Command('help')
    async onHelp( @Ctx() ctx: MyContext ) {
        await this.secondLevelService.handleHelp(ctx)
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


// ------------------------------------------------------------------

    // Third level

    @Action('promocode')
    async handlePromoCode( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        ctx.session.step = StepsEnum.PROMOCODE;
        await this.thirdLevelService.handlePromoCode(ctx);
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


    @Action('change_promocode')
    async handleChangePromoCode( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        ctx.session.promocode = '';
        ctx.session.step = StepsEnum.PROMOCODE;
        await this.thirdLevelService.handlePromoCode(ctx);
    }

    @Action('faq')
    async handleFaq( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.thirdLevelService.handleFaq(ctx);
    }

// ------------------------------------------------------------------

    // Fourth level


    // Устройства
    @Action('devices')
    async handleDevices( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.fourthLevelService.handleDevices(ctx);
    }

    @Action('add_device')
    async handleAddDevice( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.fourthLevelService.handleAddDevice(ctx);
    }

    @Action(/^remove_device_(\d+)$/)
    async handleRemoveDevice( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        if ( this.isCallbackQuery(ctx.callbackQuery) ) {
            const match = ctx.callbackQuery.data.match(/^remove_device_(\d+)$/);
            if ( match ) {
                await this.fourthLevelService.handleRemoveDevice(ctx, parseInt(match[1]));
            }
        }
    }

    @Action('refresh_devices')
    async handleRefreshDevices( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.fourthLevelService.handleDevices(ctx);
    }

    // Выбор подписки
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

    @Action(/^pay_(card|crypto)$/)
    async handlePaymentMethod( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        if ( this.isCallbackQuery(ctx.callbackQuery) ) {
            const method = ctx.callbackQuery.data.replace('pay_', '');
            await this.fourthLevelService.handlePaymentProcess(ctx, method);
        }
    }

    @Action('payment_history')
    async handlePaymentHistory( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.fourthLevelService.handlePaymentHistory(ctx);
    }

    // Настройки
    @Action('notifications')
    async handleNotifications( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.fourthLevelService.handleNotifications(ctx);
    }

    @Action(/^toggle_\w+$/)
    async handleToggleSetting( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        if ( this.isCallbackQuery(ctx.callbackQuery) ) {
            const setting = ctx.callbackQuery.data.replace('toggle_', '');
            await this.fourthLevelService.handleToggleSetting(ctx, setting);
        }
    }

}