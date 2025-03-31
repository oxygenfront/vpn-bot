import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { MyContext } from "../../interfaces/telegram.interface";
import { UserService } from "../../services/user.service";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class SecondLevelService {
    constructor(
        @InjectBot() private readonly bot: Telegraf,
        private readonly userService: UserService,
        private readonly telegramUtils: TelegramUtils,
        private readonly prismaService: PrismaService
    ) {
    }

    async handleMyAccount( ctx: MyContext ) {
        const subscriptions = await this.userService.getUserSubscriptions(ctx);
        const days = await this.userService.getUserDays(ctx);
        const activeDevices = await this.userService.getActiveDevices(ctx);
        const status = await this.userService.getUserStatus(ctx);

        const text = `👤 *Личный кабинет*

*Ваши активные подписки:*
${subscriptions}

*Статистика:*
• 📊 Дней с нами: ${this.telegramUtils.escapeMarkdown(String(days))}
• 🔄 Активных устройств: ${this.telegramUtils.escapeMarkdown(String(activeDevices))}
• ⭐️ Статус: ${status}

*Нужна помощь?* Обратитесь в поддержку 24/7`;

        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '🔄 Продлить подписку',
                        callback_data: 'extend_subscription'
                    },
                    { text: '📱 Мои устройства', callback_data: 'my_devices' },
                ],
                [
                    {
                        text: 'Отменить подписку',
                        url: 'https://my.cloudpayments.ru/'
                    },
                    {
                        text: '💳 История платежей',
                        callback_data: 'payment_history'
                    },
                ],
                [ { text: '🔙 В главное меню', callback_data: 'start' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleBuyToken( ctx: MyContext ) {
        ctx.session.selectedPlan = undefined;
        const minPrices = await this.prismaService.subscriptionPlan.findMany({
            where: { deviceRangeId: 1, months: 1 },
        })
        const text = `💫 *Выберите оптимальный план:*
        
🥇 *Премиум \\- от ${minPrices[0].price}₽/месяц*
• Безлимитный трафик
• 1\\-9 устройств
• VIP поддержка
• _Экономия 60%_

🥈 *Стандарт \\- от ${minPrices[1].price}₽/месяц*
• 200GB трафика
• 1\\-9 устройств
• _Экономия 40%_

🥉 *Базовый \\- от ${minPrices[2].price}₽/месяц*
• 100GB трафика
• 1\\-9 устройств

💎 У вас есть промокод? Используйте его для дополнительной скидки\\!`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '💎 Премиум', callback_data: 'plan_premium' },
                    { text: '✅ Стандарт', callback_data: 'plan_standard' },
                ],
                [ { text: '🟢 Базовый', callback_data: 'plan_base' } ],
                [ { text: '🎁 Ввести промокод', callback_data: 'promocode' } ],
                [ { text: '🔙 Назад', callback_data: 'start' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleHowUseToken( ctx: MyContext ) {
        const text = `📱 *Как подключить VPN?*

*Выберите предпочтительный способ подключения:*

🔹 *Amnezia VPN*
• Максимальная безопасность
• Продвинутые настройки
• Для опытных пользователей

🔸 *Hiddify*
• Простой интерфейс
• Быстрое подключение
• Идеально для новичков

_Выберите клиент, и мы предоставим подробную инструкцию по установке_`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: 'Amnezia VPN', callback_data: 'guide_amnezia' },
                    { text: 'Hiddify', callback_data: 'guide_hiddify' },
                ],
                [ {
                    text: '📺 Видео-инструкция',
                    callback_data: 'video_guide'
                } ],
                [
                    {
                        text: '❓ Частые вопросы',
                        callback_data: 'connection_faq'
                    },
                    { text: '👨‍💻 Поддержка', callback_data: 'help' },
                ],
                [ { text: '🔙 Назад', callback_data: 'start' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleHelp( ctx: MyContext ) {
        const text = `👨‍💻 *Служба поддержки*

*Мы всегда готовы помочь\\!*

• 🕐 Время ответа: до 30 минут
• 📅 Работаем: 24/7
• 🌍 Поддержка на русском и английском

*Выберите тему обращения:*
• 🔧 Технические вопросы
• 💳 Вопросы оплаты
• 🎁 Акции и промокоды
• 💬 Другое

_Опишите проблему, и мы поможем максимально быстро\\!_`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '🔧 Техподдержка', callback_data: 'tech_support' },
                    {
                        text: '💳 Вопросы оплаты',
                        callback_data: 'payment_support'
                    },
                ],
                [ {
                    text: '📝 Написать сообщение',
                    callback_data: 'write_message'
                } ],
                [
                    { text: '❓ FAQ', callback_data: 'faq' },
                    { text: '🔙 Назад', callback_data: 'start' },
                ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleSettings( ctx: MyContext ) {
        const text = `⚙️ *Настройки*

*Персонализируйте работу бота:*

• 🌍 Язык интерфейса
• 🔔 Уведомления
• 📱 Управление устройствами
• 🔐 Безопасность
• 📋 Формат инструкций

_Выберите раздел для настройки:_`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '🌍 Язык', callback_data: 'change_language' },
                    { text: '🔔 Уведомления', callback_data: 'notifications' },
                ],
                [
                    { text: '📱 Устройства', callback_data: 'devices' },
                    { text: '🔐 Безопасность', callback_data: 'security' },
                ],
                [ {
                    text: '📋 Формат инструкций',
                    callback_data: 'guide_format'
                } ],
                [ { text: '🔙 В главное меню', callback_data: 'start' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
}