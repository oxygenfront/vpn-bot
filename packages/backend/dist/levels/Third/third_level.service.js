"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdLevelService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_prisma_1 = require("nestjs-prisma");
const telegram_interface_1 = require("../../interfaces/telegram.interface");
const telegram_utils_1 = require("../../utils/telegram-utils");
const dayjs = require("dayjs");
let ThirdLevelService = class ThirdLevelService {
    constructor(telegramUtils, prismaService) {
        this.telegramUtils = telegramUtils;
        this.prismaService = prismaService;
    }
    async handleFaq(ctx) {
        const text = `❓ *Частые вопросы*

*🔹 Что такое VPN ?*
Это сервис безопасного доступа в интернет через защищенные серверы.

*🔹 Какая скорость соединения?*
Мы не ограничиваем скорость - все зависит от вашего интернета.

*🔹 На скольких устройствах можно использовать?*
От 1 до 7 устройств в зависимости от тарифа.

*🔹 Как оплатить подписку?*
Принимаем карты, криптовалюту, а так же работаем с СБП.

*🔹 Безопасно ли это?*
Мы используем самые защищенные сервера по всему миру и не храним логи.

*🔹 Почему именно мы?*
С нами ваш интернет трафик находится под надежной защитой.

_Не нашли ответ? Задайте вопрос поддержке!_`;
        const keyboard = {
            inline_keyboard: [
                [{
                        text: '💬 Задать вопрос',
                        url: 'https://t.me/vpn_by_oxy/8/34'
                    }],
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
                [{ text: '🔙 Назад', callback_data: 'start' }],
            ],
        };
        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
    async handleMySubscriptions(ctx) {
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
        if (currentPage < 1)
            currentPage = 1;
        if (currentPage > totalPages)
            currentPage = totalPages;
        ctx.session.page = currentPage;
        const skip = (currentPage - 1) * itemsPerPage;
        const take = itemsPerPage;
        const subscriptions = await this.prismaService.userSubscription.findMany({
            where: {
                user: {
                    telegramId
                },
            },
            orderBy: {
                createdAt: 'desc'
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
        if (!subscriptions.length && currentPage === 1) {
            const text = `
📋 *У вас пока нет активных подписок!*
Начните пользоваться VPN, выбрав подходящий тариф.
`;
            const keyboard = {
                inline_keyboard: [[
                        {
                            text: '🔙 В главное меню',
                            callback_data: 'start'
                        },
                        {
                            text: '🔙 Назад',
                            callback_data: 'my_account'
                        }
                    ]],
            };
            await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
            return;
        }
        if (!subscriptions.length) {
            ctx.session.page = 1;
            return this.handleMySubscriptions(ctx);
        }
        function formatMonths(months) {
            if (months === 1) {
                return `${months} месяц`;
            }
            else if (months > 1 && months <= 4) {
                return `${months} месяца`;
            }
            else {
                return `${months} месяцев`;
            }
        }
        let text = `
📋 *Ваши подписки*
Вот список ваших активных подписок. Вы можете управлять каждой из них, нажав на соответствующую кнопку.
`;
        subscriptions.forEach((sub, index) => {
            const isActive = dayjs().isBefore(dayjs(sub.expiredDate));
            const status = isActive ? '🟢 Активна' : '🔴 Истекла';
            const planName = sub.subscriptionPlan?.plan?.name || 'Неизвестный тариф';
            const deviceRange = sub.subscriptionPlan?.deviceRange?.range || 'Неизвестно';
            const expiredDate = dayjs(sub.expiredDate).format('D MMMM YYYY' +
                ' [г.] hh:mm (мск)');
            text += `
*Подписка №${skip + index + 1}*
🆔 ID: \`${sub.id}\`
📋 Тариф: *${telegram_interface_1.Plans[telegram_interface_1.AvailablePlansEnum[planName.toLowerCase()]]}*
📱 Устройств: *${deviceRange}*
⏳ Истекает: *${expiredDate}*
🔄 След. списание: *${dayjs(sub.nextBillingDate).format('D MMMM YYYY [г.]' +
                ' hh:mm (мск)')}*
💰 Цена за ${formatMonths(sub.subscriptionPlan.months)}  : *${sub.subscriptionPlan.price}₽*
${status}
`;
        });
        if (totalPages > 1) {
            text += `\n📄 Страница ${currentPage} из ${totalPages}`;
        }
        const keyboard = {
            inline_keyboard: [],
        };
        subscriptions.forEach((sub, index) => {
            keyboard.inline_keyboard.push([
                {
                    text: `Подписка №${skip + index + 1} ${dayjs().isBefore(dayjs(sub.expiredDate)) ? '🟢' : '🔴'}`,
                    callback_data: `sub_${sub.id}`,
                },
            ]);
        });
        if (totalPages > 1) {
            const paginationButtons = [];
            if (currentPage > 1) {
                paginationButtons.push({
                    text: '⬅️ Назад',
                    callback_data: `page_${currentPage - 1}`,
                });
            }
            if (currentPage < totalPages) {
                paginationButtons.push({
                    text: 'Вперед ➡️',
                    callback_data: `page_${currentPage + 1}`,
                });
            }
            keyboard.inline_keyboard.push(paginationButtons);
        }
        keyboard.inline_keyboard.push([
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
    async handleAddPromocode(ctx) {
        ctx.session = {
            ...ctx.session,
            promocode: null,
            promocodeMessageId: null,
            promocodeType: null,
            promocodeExpiredDate: null,
            promocodeExpiredMonths: null,
            promocodeAvailableCountUses: null,
            promocodeMaxUsesPerUser: null,
            promocodeValue: null,
            promocodeMinOrderAmount: null,
            promocodeMinMonthsOrderAmount: null
        };
        ctx.session.step = telegram_interface_1.StepsEnum.PROMOCODE;
        const text = 'Введите название промокода: ';
        const keyboard = {
            inline_keyboard: [[{
                        text: '🔙 Назад',
                        callback_data: 'start'
                    }]],
        };
        const message = await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
        if (typeof message !== 'boolean') {
            ctx.session.promocodeMessageId = message.message_id;
        }
    }
    async handleShowPromocodes(ctx) {
    }
};
exports.ThirdLevelService = ThirdLevelService;
exports.ThirdLevelService = ThirdLevelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_utils_1.TelegramUtils,
        nestjs_prisma_1.PrismaService])
], ThirdLevelService);
//# sourceMappingURL=third_level.service.js.map