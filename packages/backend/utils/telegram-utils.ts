import { Injectable } from '@nestjs/common';
import { MyContext } from '../interfaces/telegram.interface';

@Injectable()
export class TelegramUtils {
    escapeMarkdown( text: string ): string {
        // return text.replace(/([_[\]()~>#+\-=|{}.!%\\])/g, '\\$1');
        return text.replace(/([[\]()>#+\-=|{}.!%\\])/g, '\\$1')
    }

    async sendOrEditMessage( ctx: MyContext, text: string, keyboard?: any ) {
        if ( ctx.callbackQuery ) {
            return await ctx.editMessageText(this.escapeMarkdown(text), {
                reply_markup: keyboard,
                parse_mode: 'MarkdownV2'
            });
        } else {
            return await ctx.reply(this.escapeMarkdown(text), {
                reply_markup: keyboard,
                parse_mode: 'MarkdownV2'
            });
        }
    }
}