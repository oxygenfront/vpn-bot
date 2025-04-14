import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import {
    AvailablePlansEnum,
    MyContext,
    Plans
} from "../../interfaces/telegram.interface";
import { UserService } from "../../services/user.service";
import { TelegramUtils } from "../../utils/telegram-utils";
import * as dayjs from "dayjs";

interface InlineKeyboardButton {
    text: string;
    callback_data: string;
}

@Injectable()
export class ThirdLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
        private readonly userService: UserService,
        private readonly prismaService: PrismaService
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
                [ {
                    text: '💬 Задать вопрос',
                    url: 'https://t.me/vpn_by_oxy/8/34'
                } ],
                [
                    {
                        text: '📖 Все вопросы',
                        url: 'https://t.me/vpn_by_oxy/1/18'
                    },
                    {
                        text: '👨‍💻 Поддержка',
                        url: 'https://t.me/vpn_by_oxy/8/34'
                    },
                ],
                [ { text: '🔙 Назад', callback_data: 'start' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleMySubscriptions( ctx: MyContext ) {
        const telegramId = String(ctx.callbackQuery?.from.id);
        const itemsPerPage = 4;

        const totalSubscriptions = await this.prismaService.userSubscription.count({
            where: {
                user: {
                    telegramId,
                },
            },
        });

        const totalPages = Math.ceil(totalSubscriptions / itemsPerPage);

        ctx.session.page = ctx.session.page || 1;
        let currentPage = Number(ctx.session.page);
        if ( currentPage < 1 ) currentPage = 1;
        if ( currentPage > totalPages ) currentPage = totalPages;

        ctx.session.page = currentPage;

        const skip = (currentPage - 1) * itemsPerPage;
        const take = itemsPerPage;

        const subscriptions = await this.prismaService.userSubscription.findMany({
            where: {
                user: {
                    telegramId
                },
            },
            skip: skip > 0 ? skip : 0,
            take,
            include: {
                subscriptionPlan: {
                    include: {
                        plan: true,
                        deviceRange: true,
                    },
                },
            },
        });


        if ( !subscriptions.length && currentPage === 1 ) {
            const text = `
📋 *У вас пока нет активных подписок\\!*
Начните пользоваться VPN, выбрав подходящий тариф\\.
`;
            const keyboard: { inline_keyboard: InlineKeyboardButton[][] } = {
                inline_keyboard: [ [
                    {
                        text: '🔙 В главное меню',
                        callback_data: 'start'
                    },
                    {
                        text: '🔙 Назад',
                        callback_data: 'my_account'
                    }
                ] ],
            };
            await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
            return;
        }

        if ( !subscriptions.length ) {
            ctx.session.page = 1;
            return this.handleMySubscriptions(ctx);
        }

        let text = `
📋 *Ваши подписки*
Вот список ваших активных подписок\\. Вы можете управлять каждой из них, нажав на соответствующую кнопку\\.
`;

        subscriptions.forEach(( sub, index ) => {
            const isActive = dayjs().isBefore(dayjs(sub.expiredDate));
            const status = isActive ? '🟢 Активна' : '🔴 Истекла';
            const planName = sub.subscriptionPlan?.plan?.name || 'Неизвестный тариф';
            const deviceRange = sub.subscriptionPlan?.deviceRange?.range || 'Неизвестно';
            const expiredDate = dayjs(sub.expiredDate).format('D MMMM YYYY [г.]');
            const pricePerMonth = Math.floor(sub.subscriptionPlan.price / sub.subscriptionPlan.months)

            text += `
*Подписка №${skip + index + 1}*
🆔 ID: \`${this.telegramUtils.escapeMarkdown(sub.id)}\`
📋 Тариф: *${this.telegramUtils.escapeMarkdown(Plans[AvailablePlansEnum[planName.toLowerCase()]])}*
📱 Устройств: *${this.telegramUtils.escapeMarkdown(deviceRange)}*
⏳ Истекает: *${this.telegramUtils.escapeMarkdown(expiredDate)}*
💰 Цена за месяц: *${pricePerMonth}₽*
${status}
`;
        });

        if ( totalPages > 1 ) {
            text += `\n📄 Страница ${currentPage} из ${totalPages}`;
        }

        const keyboard: { inline_keyboard: InlineKeyboardButton[][] } = {
            inline_keyboard: [],
        };

        subscriptions.forEach(( sub, index ) => {
            keyboard.inline_keyboard.push([
                {
                    text: `Подписка №${skip + index + 1} ${dayjs().isBefore(dayjs(sub.expiredDate)) ? '🟢' : '🔴'}`,
                    callback_data: `sub_${sub.id}`,
                },
            ]);
        });

        if ( totalPages > 1 ) {
            const paginationButtons: InlineKeyboardButton[] = [];
            if ( currentPage > 1 ) {
                paginationButtons.push({
                    text: '⬅️ Назад',
                    callback_data: `page_${currentPage - 1}`,
                });
            }
            if ( currentPage < totalPages ) {
                paginationButtons.push({
                    text: 'Вперед ➡️',
                    callback_data: `page_${currentPage + 1}`,
                });
            }
            keyboard.inline_keyboard.push(paginationButtons);
        }

        keyboard.inline_keyboard.push([
            {
                text: '💳 Платежи',
                callback_data: 'payment_history'
            },
        ], [
            {
                text: '🔙 В главное меню',
                callback_data: 'start'
            },
            {
                text: '🔙 Назад',
                callback_data: 'my_account'
            },

        ]);

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
}