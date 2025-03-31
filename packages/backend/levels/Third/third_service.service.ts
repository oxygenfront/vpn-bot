import { Injectable } from "@nestjs/common";
import { MyContext } from "../../interfaces/telegram.interface";
import { UserService } from "../../services/user.service";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class ThirdLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
        private readonly userService: UserService,
    ) {
    }

    async handlePromoCode( ctx: MyContext ) {
        const text = ctx.session.promocode
            ? `🎟 *Текущий промокод:* \`${this.telegramUtils.escapeMarkdown(ctx.session.promocode)}\`

*Применённая скидка:* ${this.telegramUtils.escapeMarkdown(String(await this.userService.getPromoDiscount(ctx.session.promocode)))}%
*Действует до:* ${this.telegramUtils.escapeMarkdown(await this.userService.getPromoExpiry(ctx.session.promocode))}

Хотите использовать другой промокод?`
            : `🎁 *Ввод промокода*

Отправьте промокод одним сообщением\\.
Промокод может быть:
• 🏷 Персональным
• 🎯 Акционным
• 🎉 Праздничным

_Промокод будет автоматически применен к следующей покупке_`;

        const keyboard = {
            inline_keyboard: [
                ...(ctx.session.promocode
                    ? [ [ {
                        text: '🔄 Изменить промокод',
                        callback_data: 'change_promocode'
                    } ] ]
                    : []),
                [ {
                    text: '🔙 Назад к выбору тарифа',
                    callback_data: 'buy_vpn'
                } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleFaq( ctx: MyContext ) {
        const text = `❓ *Частые вопросы*

*🔹 Что такое VPN ?*
Это сервис безопасного доступа в интернет через защищенные серверы\\.

*🔹 Какая скорость соединения?*
Мы не ограничиваем скорость \\- все зависит от вашего интернета\\.

*🔹 На скольких устройствах можно использовать?*
От 1 до 7 устройств в зависимости от тарифа\\.

*🔹 Как оплатить подписку?*
Принимаем карты, криптовалюту, а так же работаем с СБП\\.

*🔹 Безопасно ли это?*
Мы используем самые защищенные сервера по всему миру и не храним логи\\.

*🔹 Почему именно мы?*
С нами ваш интернет трафик находится под надежной защитой\\.

_Не нашли ответ? Задайте вопрос поддержке\\!_`;

        const keyboard = {
            inline_keyboard: [
                [ { text: '💬 Задать вопрос', callback_data: 'ask_question' } ],
                [
                    { text: '📖 Все вопросы', callback_data: 'all_faq' },
                    { text: '👨‍💻 Поддержка', callback_data: 'help' },
                ],
                [ { text: '🔙 Назад', callback_data: 'start' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
}