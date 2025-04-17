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
exports.SixthLevelService = void 0;
const common_1 = require("@nestjs/common");
require("dayjs/locale/ru");
const dayjs = require("dayjs");
const nestjs_prisma_1 = require("nestjs-prisma");
const telegram_interface_1 = require("../../interfaces/telegram.interface");
const telegram_utils_1 = require("../../utils/telegram-utils");
let SixthLevelService = class SixthLevelService {
    constructor(telegramUtils, prismaService) {
        this.telegramUtils = telegramUtils;
        this.prismaService = prismaService;
    }
    async handleMinOrderAmount(ctx) {
        ctx.session.step = telegram_interface_1.StepsEnum.PROMOCODE_MIN_ORDER_AMOUNT;
        if ('message' in ctx.update && 'text' in ctx.update.message) {
            ctx.session.promocodeValue = Number(ctx.update.message.text);
        }
        const text = `🎉 Промокод \`${ctx.session.promocode}\` в процессе создания

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${telegram_interface_1.PromocodeTypes[ctx.session.promocodeType]}\`
• 💸 Скидка: \`${ctx.session.promocodeValue} ${ctx.session.promocodeType === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: ━━
• 📅 Мин. кол-во месяцев для активации: ━━
• 📅 Действителен до: ━━
• 🔢 Всего использований: ━━
• 👤 На одного пользователя: ━━.
\n━━━━━━━━━━\n
⚠️ *Примечание:* _Выберите минимальную сумму заказа для активации промокода или же отправьте другое число_ .`;
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '199 ₽',
                        callback_data: 'choose_min_order_amount_199',
                    },
                    {
                        text: '249 ₽',
                        callback_data: 'choose_min_order_amount_249',
                    },
                ],
                [
                    {
                        text: '299 ₽',
                        callback_data: 'choose_min_order_amount_299',
                    },
                    {
                        text: '719 ₽',
                        callback_data: 'choose_min_order_amount_719',
                    },
                ],
                [
                    {
                        text: '839 ₽',
                        callback_data: 'choose_min_order_amount_839',
                    },
                    {
                        text: '959 ₽',
                        callback_data: 'choose_min_order_amount_959',
                    },
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: `promocode_type_${ctx.session.promocodeType}`,
                    },
                ],
            ],
        };
        if ('message' in ctx.update && 'text' in ctx.update.message && ctx.session.promocodeMessageId) {
            try {
                const message = await ctx.telegram.editMessageText(ctx.update.message.from.id, ctx.session.promocodeMessageId, undefined, this.telegramUtils.escapeMarkdown(text), { reply_markup: keyboard, parse_mode: 'MarkdownV2' });
                if (typeof message !== 'boolean') {
                    ctx.session.promocodeMessageId = message.message_id;
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        else {
            const message = await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
            if (typeof message !== 'boolean') {
                ctx.session.promocodeMessageId = message.message_id;
            }
        }
    }
    async handleViewChosenPlan(ctx) {
        if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
            ctx.session.promocodeEnteredByUser = null;
            ctx.session.deviceRangeId = Number(ctx.match[1]);
        }
        if (!(ctx.session.selectedPlan && ctx.session.deviceRangeId && ctx.session.selectedMonths))
            return;
        const getPromocode = async () => {
            const promocode = await this.prismaService.promocode.findFirst({
                where: {
                    promocode: ctx.session.promocodeTakedByUser,
                },
                include: {
                    uses: {
                        where: {
                            user: {
                                telegramId: ctx.callbackQuery && String(ctx.callbackQuery.from.id)
                            }
                        }
                    }
                }
            });
            if (!promocode || promocode.uses.length === promocode.maxUsesPerUser || ctx.session.selectedMonths < promocode.minMonthsOrderAmount || !ctx.session.promocodeTakedByUser) {
                return null;
            }
            return promocode;
        };
        const promocode = await getPromocode();
        console.log(promocode);
        const subscription = await this.prismaService.subscriptionPlan.findFirst({
            where: {
                planId: ctx.session.selectedPlan,
                deviceRangeId: ctx.session.deviceRangeId,
                months: ctx.session.selectedMonths,
            },
        });
        const fetchedPrice = await this.prismaService.subscriptionPlan.findFirst({
            where: {
                planId: ctx.session.selectedPlan,
                deviceRangeId: ctx.session.deviceRangeId,
                months: 1,
            },
        });
        const defaultPrice = fetchedPrice?.price;
        if (!subscription) {
            const text = 'Такой тариф не найден';
            const keyboard = {
                inline_keyboard: [
                    [
                        {
                            text: 'Назад',
                            callback_data: `month_${ctx.session.selectedMonths}`,
                        },
                    ],
                ],
            };
            await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
            return;
        }
        const getPrice = (full = false) => {
            if (!ctx.session.selectedMonths) {
                throw new Error('Количество месяцев не указано');
            }
            const months = ctx.session.selectedMonths;
            if (typeof subscription.price !== 'number') {
                throw new Error('Цена подписки не указана или некорректна');
            }
            let finalPrice = subscription.price;
            if (promocode) {
                const isActive = promocode.status === 'ACTIVE';
                const isNotExpired = !promocode.expiredDate || dayjs().isBefore(promocode.expiredDate);
                const meetsMinOrder = subscription.price >= promocode.minOrderAmount;
                const meetsMinMonths = months >= promocode.minMonthsOrderAmount;
                if (!isActive ||
                    !isNotExpired ||
                    !meetsMinOrder ||
                    !meetsMinMonths) {
                    return full
                        ? Math.round(finalPrice)
                        : Math.round(finalPrice / months);
                }
                if (promocode.type === 'percent') {
                    const discount = (subscription.price * promocode.value) / 100;
                    finalPrice = Math.max(0, subscription.price - discount);
                }
                else if (promocode.type === 'fixed') {
                    finalPrice = Math.max(0, subscription.price - promocode.value);
                }
            }
            return full
                ? Math.round(finalPrice)
                : Math.round(finalPrice / months);
        };
        const plan = await this.prismaService.subscriptionPlan.findFirst({
            where: {
                price: subscription.price,
                months: ctx.session.selectedMonths,
            },
        });
        const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
        const messageId = 'callback_query' in ctx.update && ctx.update.callback_query.message?.message_id;
        const paymentAccountId = 'callback_query' in ctx.update && ctx.update.callback_query.from.id;
        const paymentInvoiceId = String(randomNumber);
        const text = `
✨ *Перед оплатой проверьте данные !*  

📋 *Тариф:*  *__${telegram_interface_1.Plans[subscription.planId]}__*

📱 *Максимальное кол-во устройств:*  *_${telegram_interface_1.MembersInPlan[subscription.deviceRangeId]}_*  

💰 *Цена подписки в месяц:* ${subscription.months === 1 ? `*_${getPrice()}₽_*` : `~${defaultPrice}₽~ ➤ *_${getPrice()}₽_* `} 

🧾 *Общая стоимость тарифа:* *_${getPrice(true)}_* ₽

⏳ *Конец подписки:*  *_${dayjs()
            .add(subscription.months, 'month')
            .format('D MMMM YYYY' + ' [г.] hh:mm (мск)')}_*  
`;
        const url = `${process.env.FRONTEND_DOMAIN}?${promocode ? `promocode=${promocode.promocode}&` : ''}planId=${plan?.id}&chatId=${paymentAccountId}&invoiceId=${paymentInvoiceId}&amount=${getPrice(true)}&months=${ctx.session.selectedMonths}&messageId=${messageId}&paymentType=pay`;
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '💳 Оплатить подписку',
                        web_app: { url },
                    },
                ],
                [
                    {
                        text: '🎁 Ввести промокод',
                        callback_data: 'write_promocode',
                    },
                ],
                [
                    ...(promocode && !(promocode?.uses.length === promocode?.maxUsesPerUser) && ctx.session.promocodeTakedByUser
                        ? [
                            {
                                text: `❌ Удалить промо ${ctx.session.promocodeTakedByUser}`,
                                callback_data: `delete_promocode_from_order_${ctx.session.deviceRangeId}`,
                            },
                        ]
                        : []),
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: `month_${ctx.session.selectedMonths}`,
                    },
                    { text: '🔙 В главное меню', callback_data: 'start' }
                ],
            ],
        };
        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }
};
exports.SixthLevelService = SixthLevelService;
exports.SixthLevelService = SixthLevelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_utils_1.TelegramUtils,
        nestjs_prisma_1.PrismaService])
], SixthLevelService);
//# sourceMappingURL=sixth_level.service.js.map