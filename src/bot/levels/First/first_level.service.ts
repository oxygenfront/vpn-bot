import { Injectable } from "@nestjs/common";
import type { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class FirstLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
    ) {
    }

    async handleStart( ctx: MyContext ) {
        const text = `🌟 *Добро пожаловать в VPN Premium*

Ваш надежный проводник в мир безопасного интернета\\! 

*Почему выбирают нас:*
• 🔒 Полная анонимность и безопасность
• 🚀 Высокая скорость без ограничений
• 🌍 Серверы в разных странах мира
• 🛡️ Защита от блокировок
• 👨‍💻 Техподдержка 24/7

*Готовы начать?* Выберите действие ниже\\!`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '🪙 Купить VPN', callback_data: 'buy_vpn' },
                    { text: '👤 Мой аккаунт', callback_data: 'my_account' },
                ],
                [ {
                    text: '📱 Как подключить?',
                    callback_data: 'how_use_token',

                }, { text: '❓ FAQ', callback_data: 'faq' } ],
                [

                    {
                        text: '📃 Оферта',
                        url: 'https://telegra.ph/DOGOVOR-NA-OKAZANIE-USLUG-PUBLICHNAYA-OFERTA-03-24'
                    },
                    { text: '⚙️ Настройки', callback_data: 'settings' },
                ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
}