import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import { PrismaService } from "nestjs-prisma";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { MyContext, Plans } from "../../interfaces/telegram.interface";
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
        const user = await this.prismaService.user.findFirst({
            where: {
                telegramId: String(ctx.callbackQuery!.from.id)
            },
            include: {
                subscriptions: {
                    include: { subscriptionPlan: true }
                }
            }
        })
        const subscriptions = user ? user.subscriptions?.map(( subscription ) => {
            return `🟢 ${Plans[subscription.subscriptionPlan.planId]} до ${dayjs(subscription.expiredDate).format('DD.MM.YYYY  HH:mm:ss')}`
        }).join(`\n------------------------------------------------------------\n`) : 'У вас нет активных подписок'

        const activeDevices = await this.userService.getActiveDevices(ctx);
        const status = await this.userService.getUserStatus(ctx);
        const text = `👤 *Личный кабинет*
        
*Статистика:*
• 📊 Дней с нами: ${user?.createdAt
            ? Math.floor(dayjs().diff(dayjs(user.createdAt), 'day'))
            : 0}
• 🔄 Активных устройств: ${this.telegramUtils.escapeMarkdown(String(activeDevices))}
• ⭐️ Статус: ${status}

*Нужна помощь?* Обратитесь в поддержку 24/7`;

        const keyboard = {
            inline_keyboard: [

                [
                    ...(subscriptions.length ? [ {
                        text: '📋 Мои подписки',
                        callback_data: 'my_subscriptions'
                    } ] : []),

                ],
                ...(subscriptions.length ?
                    [
                        [
                            {
                                text: '❌ Отменить подписку',
                                url: 'https://my.cloudpayments.ru/',
                            }
                        ]
                    ] : []),
                [
                    {
                        text: '🔙 В главное меню',
                        callback_data: 'start'
                    },
                    {
                        text: '👨‍💻 Поддержка',
                        url: 'https://t.me/vpn_by_oxy/8'
                    }
                ]
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, this.telegramUtils.escapeMarkdown(text), keyboard);
    }

    async handleBuyToken( ctx: MyContext ) {
        ctx.session.selectedPlan = undefined;
        const minPrices = await this.prismaService.subscriptionPlan.findMany({
            where: { deviceRangeId: 1, months: 1 },
        })
        const text = `💫 *Выберите оптимальный план:*
        
🥇 *Премиум \\- от ${minPrices[0].price}₽/месяц*
• Безлимитный трафик
• 1\\-7 устройств
• VIP поддержка
• _Экономия 60%_

🥈 *Стандарт \\- от ${minPrices[1].price}₽/месяц*
• 200GB трафика
• 1\\-7 устройств
• _Экономия 40%_

🥉 *Базовый \\- от ${minPrices[2].price}₽/месяц*
• 100GB трафика
• 1\\-7 устройств`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '💎 Премиум', callback_data: 'plan_premium' },
                    { text: '✅ Стандарт', callback_data: 'plan_standard' },
                ],
                [ { text: '🟢 Базовый', callback_data: 'plan_base' } ],
                // [ { text: '🎁 Ввести промокод', callback_data: 'promocode' } ],
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

• 📱 Управление устройствами
• 🔐 Безопасность
• 📋 Формат инструкций

_Выберите раздел для настройки:_`;

        const keyboard = {
            inline_keyboard: [
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