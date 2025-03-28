import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { UserService } from './user.service';

@Injectable()
export class NotificationService {
    constructor(
        @InjectBot() private readonly bot: Telegraf,
        private readonly userService: UserService,
    ) {
    }

    async sendNotification( userId: number, type: 'expiry' | 'news' | 'promo' | 'status', message: string ) {
        const settings = await this.userService.getUserNotificationSettings({ from: { id: userId } } as any);
        const shouldSend = {
            expiry: settings.expiryReminder,
            news: settings.newsAndUpdates,
            promo: settings.promotions,
            status: settings.serviceStatus,
        }[type];

        if ( shouldSend ) {
            await this.bot.telegram.sendMessage(userId, message, { parse_mode: 'MarkdownV2' });
        }
    }

    async sendExpiryReminder( userId: number, daysLeft: number ) {
        const message = `⚠️ *Напоминание*\n\nВаша подписка истекает через ${daysLeft} дней\\.\nНе забудьте продлить для бесперебойной работы\\!\n\n_Нажмите /buy\\_token для продления_`;
        await this.sendNotification(userId, 'expiry', message);
    }

    async sendPromoNotification( userId: number, promoCode: string, discount: number ) {
        const message = `🎉 *Специальное предложение*\n\nИспользуйте промокод \`${promoCode}\`\nи получите скидку ${discount}% на любой тариф\\!\n\n_Акция действует ограниченное время_`;
        await this.sendNotification(userId, 'promo', message);
    }
}