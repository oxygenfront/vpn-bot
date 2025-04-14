import { Injectable } from '@nestjs/common';
import { MyContext } from '../interfaces/telegram.interface';

@Injectable()
export class TelegramUtils {
    async sendOrEditMessage( ctx: MyContext, text: string, keyboard?: any ) {
        if ( ctx.callbackQuery ) {
            return await ctx.editMessageText(text, {
                reply_markup: keyboard,
                parse_mode: 'MarkdownV2'
            });
        } else {
            return await ctx.reply(text, {
                reply_markup: keyboard,
                parse_mode: 'MarkdownV2'
            });
        }
    }

    escapeMarkdown( text: string ): string {
        return text.replace(/[_[\]()~`>#+\-=|{}.!]/g, '\\$&');
    }


}