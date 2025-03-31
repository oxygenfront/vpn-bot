import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import {
    AvailablePlansEnum,
    MyContext
} from "../../interfaces/telegram.interface";
import { LinkGeneratorService } from "../../services/link-generator.service";
import { UserService } from "../../services/user.service";
import { XuiApiService } from "../../services/xui-api.service";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class FourthLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
        private readonly userService: UserService,
        private readonly xuiApiService: XuiApiService,
        private readonly linkGeneratorService: LinkGeneratorService,
        private readonly prismaService: PrismaService,
    ) {
    }

    async handlePaymentHistory( ctx: MyContext ) {
        const history = await this.userService.getUserPaymentHistory(ctx);

        const text = `💳 *История платежей*

${history.length > 0 ? '*Ваши транзакции:*' : 'У вас пока нет платежей\\.'}
${history
            .map(
                ( payment, index ) => `
${index + 1}\\. ${payment.plan} — ${payment.amount}$ 💸
   📅 01\\.${payment.month}\\.${payment.year} \\| ${payment.status === 'Оплачено' ? '✅' : '⚠️'} ${payment.status}`,
            )
            .join('\n')}

_Всего: ${this.telegramUtils.escapeMarkdown(String(history.length))} транзакций_`;

        const keyboard = {
            inline_keyboard: [
                [ {
                    text: '📥 Выгрузить чеки',
                    callback_data: 'download_receipts'
                } ],
                [ { text: '🔙 Назад в аккаунт', callback_data: 'my_account' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleDevices( ctx: MyContext ) {
        const devices = await this.userService.getUserDevices(ctx);

        const text = `📱 *Управление устройствами*

*Активные устройства:*
${devices
            .map(
                ( device, index ) => `
${index + 1}\\. ${this.telegramUtils.escapeMarkdown(device.name)}
• 📅 Добавлено: ${this.telegramUtils.escapeMarkdown(device.addedDate)}
• 🔄 Последняя активность: ${this.telegramUtils.escapeMarkdown(device.lastActive)}
• 📊 Трафик: ${this.telegramUtils.escapeMarkdown(String(device.traffic))} GB`,
            )
            .join('\n')}

*Доступно устройств:* ${this.telegramUtils.escapeMarkdown(String(await this.userService.getAvailableDevices(ctx)))}
_Лимит зависит от вашего тарифа_`;

        const keyboard = {
            inline_keyboard: [
                [ {
                    text: '➕ Добавить устройство',
                    callback_data: 'add_device'
                } ],
                ...devices.map(( device ) => [
                    {
                        text: `❌ Удалить ${device.name}`,
                        callback_data: `remove_device_${device.id}`
                    },
                ]),
                [
                    { text: '🔄 Обновить', callback_data: 'refresh_devices' },
                    { text: '🔙 Назад', callback_data: 'settings' },
                ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleAddDevice( ctx: MyContext ) {
        const availableSlots = await this.userService.getAvailableDevices(ctx);

        if ( availableSlots <= 0 ) {
            const text = `⚠️ *Достигнут лимит устройств*

Для добавления нового устройства:
• Удалите неиспользуемое устройство
• Или перейдите на тариф с большим лимитом

_Текущий тариф позволяет подключить ${await this.userService.getDeviceLimit(ctx)} устройств_`;

            const keyboard = {
                inline_keyboard: [
                    [
                        {
                            text: '⭐️ Улучшить тариф',
                            callback_data: 'upgrade_plan'
                        },
                        {
                            text: '📱 Управление устройствами',
                            callback_data: 'devices'
                        },
                    ],
                    [ { text: '🔙 Назад', callback_data: 'settings' } ],
                ],
            };

            await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
            return;
        }

        const text = `➕ *Добавление устройства*

*Выберите тип устройства:*
• 📱 Мобильное устройство
• 💻 Компьютер
• 📺 Smart TV
• 🎮 Игровая консоль

_После выбора вы получите инструкцию по настройке_`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '📱 Мобильное', callback_data: 'add_mobile' },
                    { text: '💻 Компьютер', callback_data: 'add_computer' },
                ],
                [
                    { text: '📺 Smart TV', callback_data: 'add_tv' },
                    { text: '🎮 Консоль', callback_data: 'add_console' },
                ],
                [ { text: '🔙 Назад', callback_data: 'devices' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleChoosePlan( ctx: MyContext, planName: keyof typeof AvailablePlansEnum ) {
        ctx.session.selectedPlan = AvailablePlansEnum[planName];
        const minPrices = await this.prismaService.subscriptionPlan.findMany({
            where: { planId: ctx.session.selectedPlan, deviceRangeId: 1 },
        })

        const text = 'Выберите период подписки'
        const keyboard = {
            inline_keyboard: [ [ {
                text: `1 месяц от ${minPrices[0].price}₽`,
                callback_data: 'month_1'
            }, {
                text: `3 месяца от ${minPrices[1].price}₽`,
                callback_data: 'month_3'
            } ], [ {
                text: `6 месяцев от ${minPrices[2].price}₽`,
                callback_data: 'month_6'
            }, {
                text: `12 месяцев от ${minPrices[3].price}₽`,
                callback_data: 'month_12'
            } ], [ { text: 'Назад', callback_data: 'buy_vpn' } ] ]
        }

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard)

    }

    async handleRemoveDevice( ctx: MyContext, deviceId: number ) {
        try {
            // TODO: Реализовать удаление устройства через UserService
            const deviceName = 'Устройство'; // Получить имя устройства из UserService

            const text = `✅ *Устройство успешно удалено*

Устройство "${this.telegramUtils.escapeMarkdown(deviceName)}" было отключено от VPN\\. 
_Вы можете добавить новое устройство в любой момент_`;

            const keyboard = {
                inline_keyboard: [
                    [ {
                        text: '📱 Управление устройствами',
                        callback_data: 'devices'
                    } ],
                    [ { text: '🔙 Назад', callback_data: 'settings' } ],
                ],
            };

            await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
        } catch ( error ) {
            console.error('Error removing device:', error);
            await ctx.reply('Произошла ошибка при удалении устройства\\. Попробуйте позже\\.');
        }
    }

    async handlePaymentProcess( ctx: MyContext, method: string ) {
        const plan = await this.userService.getSelectedPlan(ctx);
        const finalPrice = this.telegramUtils.calculateFinalPrice(
            plan.price,
            ctx.session.promocode ? await this.userService.getPromoDiscount(ctx.session.promocode) : 0,
        );

        const text =
            method === 'card'
                ? `💳 *Оплата картой*

*Сумма к оплате:* ${finalPrice}$

_Нажмите кнопку ниже для перехода к безопасной оплате\\._`
                : `₿ *Оплата криптовалютой*

*Сумма к оплате:* ${finalPrice}$
*Поддерживаемые криптовалюты:*
• Bitcoin
• Ethereum
• USDT

_Выберите криптовалюту для получения адреса_`;

        const keyboard = {
            inline_keyboard:
                method === 'card'
                    ? [
                        [ {
                            text: '💳 Перейти к оплате',
                            callback_data: 'process_card_payment'
                        } ],
                        [ { text: '🔙 Назад', callback_data: 'buy_vpn' } ],
                    ]
                    : [
                        [
                            { text: 'Bitcoin', callback_data: 'crypto_btc' },
                            { text: 'Ethereum', callback_data: 'crypto_eth' },
                        ],
                        [ { text: 'USDT', callback_data: 'crypto_usdt' } ],
                        [ { text: '🔙 Назад', callback_data: 'buy_vpn' } ],
                    ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleNotifications( ctx: MyContext ) {
        const settings = await this.userService.getUserNotificationSettings(ctx);

        const text = `🔔 *Настройки уведомлений*

*Текущие настройки:*
• ${settings.expiryReminder ? '✅' : '❌'} Напоминания об окончании подписки
• ${settings.newsAndUpdates ? '✅' : '❌'} Новости и обновления
• ${settings.promotions ? '✅' : '❌'} Акции и специальные предложения
• ${settings.serviceStatus ? '✅' : '❌'} Статус сервиса

_Выберите, какие уведомления вы хотите получать:_`;

        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: `${settings.expiryReminder ? '✅' : '❌'} Окончание подписки`,
                        callback_data: 'toggle_expiry_reminder',
                    },
                ],
                [
                    {
                        text: `${settings.newsAndUpdates ? '✅' : '❌'} Новости`,
                        callback_data: 'toggle_news',
                    },
                ],
                [
                    {
                        text: `${settings.promotions ? '✅' : '❌'} Акции`,
                        callback_data: 'toggle_promotions',
                    },
                ],
                [
                    {
                        text: `${settings.serviceStatus ? '✅' : '❌'} Статус сервиса`,
                        callback_data: 'toggle_status',
                    },
                ],
                [ { text: '🔙 Назад', callback_data: 'settings' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleToggleSetting( ctx: MyContext, setting: string ) {
        try {
            // TODO: Реализовать переключение настройки через UserService
            const isEnabled = true; // Заменить на вызов UserService

            const settingNames = {
                toggle_expiry_reminder: 'Окончание подписки',
                toggle_news: 'Новости',
                toggle_promotions: 'Акции',
                toggle_status: 'Статус сервиса',
            };

            const text = `✅ *Настройка обновлена*

${this.telegramUtils.escapeMarkdown(settingNames[setting] || setting)}: ${isEnabled ? 'Включено' : 'Выключено'}`;

            await this.handleNotifications(ctx); // Обновляем меню уведомлений
        } catch ( error ) {
            console.error('Error toggling setting:', error);
            await ctx.reply('Произошла ошибка при обновлении настройки\\. Попробуйте позже\\.');
        }
    }
}