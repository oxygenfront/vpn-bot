import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import { PrismaService } from "nestjs-prisma";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { MyContext, Plans } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class SecondLevelService {
    constructor(
        @InjectBot() private readonly bot: Telegraf,
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
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
        const subscriptions = user ? user.subscriptions?.map(( subscription ) => {
            return `🟢 ${Plans[subscription.subscriptionPlan.planId]} до ${dayjs(subscription.expiredDate).format('D MMMM YYYY' +
                ' [г.] hh:mm (мск)')}`
        }).filter(( el, i ) => i <= 4 ? el : null).join(`\n━━━━━━━━━━━━━━━━━━\n`) : 'У вас нет' +
            ' активных' +
            ' подписок'

        const text = ` *━━━━  👤 Личный кабинет  ━━━━*
        
${subscriptions.length ? `⚡ *_Текущие активные подписки_*:\n\n${subscriptions}` : 'На данный момент у вас нет активных подписок, но вы всегда можете ее приобрести *_нажав на кнопку ниже_*'}
       
*━━━━━━  Статистика  ━━━━━━*

• 📊 Дней с нами: ${user?.createdAt
            ? Math.floor(dayjs().diff(dayjs(user.createdAt), 'day'))
            : 0}
• ✅ Активных подписок: ${user?.subscriptions.length}

*Нужна помощь?* \nОбратитесь в *_поддержку 24/7_*`;

        const keyboard = {
            inline_keyboard: [

                [
                    ...(subscriptions.length ? [ {
                        text: '📋 Мои подписки',
                        callback_data: 'my_subscriptions'
                    } ] : [ {
                        text: '🪙 Купить VPN',
                        callback_data: 'buy_vpn'
                    } ]),

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

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }

    async handleBuyToken( ctx: MyContext ) {
        ctx.session.selectedPlan = null;
        const minPrices = await this.prismaService.subscriptionPlan.findMany({
            where: { deviceRangeId: 1, months: 1 },
        })
        const text = `💫 *Выберите оптимальный план:*
        
🥇 *Премиум - от ${minPrices[2].price}₽/месяц*
• Безлимитный трафик
• 1-7 устройств
• VIP поддержка
• *_Экономия 60%_*

🥈 *Стандарт - от ${minPrices[1].price}₽/месяц*
• 200GB трафика
• 1-7 устройств
• *_Экономия 40%_*

🥉 *Базовый - от ${minPrices[0].price}₽/месяц*
• 100GB трафика
• 1-7 устройств`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '💎 Премиум', callback_data: 'plan_premium' },
                    { text: '✅ Стандарт', callback_data: 'plan_standard' },
                ],
                [ { text: '🟢 Базовый', callback_data: 'plan_base' } ],
                [ { text: '🔙 Назад', callback_data: 'start' } ],
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard);
    }


}