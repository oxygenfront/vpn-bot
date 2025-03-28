import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Controller('telegram-webhook')
export class TelegramWebhookController {
    constructor( @InjectBot() private readonly bot: Telegraf<Context> ) {
    }

    @Post()
    @HttpCode(200)
    async handleWebhook( @Body() update: any ) {
        try {
            await this.bot.handleUpdate(update);
            return { ok: true };
        } catch ( error ) {
            console.error('Ошибка обработки вебхука Telegram:', error);
            return { ok: false };
        }
    }
}