import { Action, Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { MyContext, StepsEnum } from './interfaces/telegram.interface';
import { TelegramService } from './telegram.service';

@Update()
export class TelegramUpdate {
    constructor( private readonly telegramService: TelegramService ) {
    }


    // First level bot
    @Action('start')
    async handleStart( @Ctx() ctx: MyContext ) {
        ctx.session.step = null;
        await ctx.answerCbQuery()
        await this.telegramService.handleStart(ctx);
    }

    @Start()
    async onStart( @Ctx() ctx: MyContext ) {
        await this.telegramService.handleStart(ctx);
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
        await this.telegramService.handleMyAccount(ctx);
    }

    @Command('my_account')
    async onMyAccount( @Ctx() ctx: MyContext ) {
        await this.telegramService.handleMyAccount(ctx);
    }

    @Action('buy_token')
    async handleVpnServices( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()
        await this.telegramService.handleBuyToken(ctx);
    }

    @Command('buy_token')
    async onVpnServices( @Ctx() ctx: MyContext ) {
        await this.telegramService.handleBuyToken(ctx);
    }

    @Action('how_use_token')
    async handleHowUseToken( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()
        await this.telegramService.handleHowUseToken(ctx);
    }

    @Action('help')
    async handleHelp( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()
        await this.telegramService.handleHelp(ctx)
    }

    @Command('help')
    async onHelp( @Ctx() ctx: MyContext ) {
        await this.telegramService.handleHelp(ctx)
    }

    @Action('settings')
    async handleSettings( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery()
        await this.telegramService.handleSettings(ctx)
    }

    @Command('settings')
    async onSettings( @Ctx() ctx: MyContext ) {
        await this.telegramService.handleSettings(ctx)
    }

// ------------------------------------------------------------------

    // Third level

    @Action('promocode')
    async handlePromoCode( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        ctx.session.step = StepsEnum.PROMOCODE;
        await this.telegramService.handlePromoCode(ctx);
    }


    @Action('change_promocode')
    async handleChangePromoCode( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        ctx.session.promocode = '';
        ctx.session.step = StepsEnum.PROMOCODE;
        await this.telegramService.handlePromoCode(ctx);
    }

    @Action('faq')
    async handleFaq( @Ctx() ctx: MyContext ) {
        await ctx.answerCbQuery();
        await this.telegramService.handleFaq(ctx);
    }

// ------------------------------------------------------------------

    // Fourth level


    @On('text')
    async onMessage( ctx: MyContext ) {
        if ( ctx.session.step === StepsEnum.PROMOCODE && 'message' in ctx.update && 'text' in ctx.update.message ) {
            ctx.session.promocode = ctx.update.message.text;
            ctx.session.step = null

            await ctx.reply(`Промокод введен успешно \`${ctx.session.promocode}\``, {
                parse_mode: 'MarkdownV2'
            })
            await this.telegramService.handleBuyToken(ctx)
        }
    }


}