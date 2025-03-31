import { Injectable } from '@nestjs/common';
import { MyContext } from '../interfaces/telegram.interface';

@Injectable()
export class TelegramUtils {
    async sendOrEditMessage( ctx: MyContext, text: string, keyboard?: any ) {
        try {
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
        } catch ( error ) {
            console.error('Error sending/editing message:', error);
            await ctx.reply('Произошла ошибка. Попробуйте позже.');
        }
    }

    escapeMarkdown( text: string ): string {
        return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    }

    calculateFinalPrice( price: number, discount: number ): number {
        return price * (1 - discount / 100);
    }

    getPeriodText( months: number ): string {
        if ( months === 1 ) return 'месяц';
        if ( months < 5 ) return 'месяца';
        return 'месяцев';
    }
}