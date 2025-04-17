import { Context, Telegraf } from 'telegraf';
export declare class TelegramWebhookController {
    private readonly bot;
    constructor(bot: Telegraf<Context>);
    handleWebhook(update: any): Promise<{
        ok: boolean;
    }>;
}
