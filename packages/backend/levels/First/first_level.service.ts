import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "nestjs-prisma";
import { firstValueFrom } from "rxjs";
import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class FirstLevelService {
    private readonly apiUrl: string;
    private readonly publicId: string;
    private readonly apiSecret: string;

    constructor(
        private readonly telegramUtils: TelegramUtils,
        private readonly httpService: HttpService,
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.publicId = this.configService.get<string>('CLOUDPAYMENTS_PUBLIC_ID') as string;
        this.apiSecret = this.configService.get<string>('CLOUDPAYMENTS_API_SECRET') as string;
    }

    async handleStart( ctx: MyContext ) {
        const accountId = ('message' in ctx.update && ctx.update.message.from.id) || ('callback_query' in ctx.update && ctx.update.callback_query.from.id)
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
            promocodeMinMonthsOrderAmount: null,

            step: null,
            selectedPayment: null,
            paymentAmount: null,
            selectedPlan: null,
            deviceRangeId: null,
            selectedMonths: null,
            autoRenew: false,
        }
        ctx.session.autoRenew = true
        const user = await this.prismaService.user.findUnique({
            where: {
                telegramId: String(accountId)
            }
        })
        const text = `🌟 *Добро пожаловать в VPN by Oxy*

Ваш надежный проводник в мир безопасного интернета! 

*Почему выбирают нас:*
• 🔒 Полная анонимность и безопасность
• 🚀 Высокая скорость без ограничений
• 🌍 Серверы в разных странах мира
• 🛡️ Защита от блокировок
• 👨‍💻 Техподдержка 24/7

*Готовы начать?* Выберите действие ниже!`;
        const adminKeyboard = {
            inline_keyboard: [
                [
                    {
                        text: '🪙 Купить VPN',
                        callback_data: 'buy_vpn'
                    },
                    {
                        text: '👤 Мой аккаунт',
                        callback_data: 'my_account',
                    }

                ],
                ...(accountId === 695606474 ? [
                    [
                        {
                            text: '🗑️ Очистить все подписки',
                            callback_data: 'clear_all'
                        }

                    ],
                    [
                        {
                            text: '🎟️ Создать промокод deploying',
                            callback_data: 'handle_add_promocode',
                        }

                    ],
                    [
                        {
                            text: '🎟️ Все промокоды',
                            callback_data: 'handle_show_promocodes',
                        }
                    ]
                ] : []),
                [

                    {
                        text: '❓ FAQ',
                        callback_data: 'faq'
                    },
                    {
                        text: '📃 Оферта',
                        url: 'https://telegra.ph/DOGOVOR-NA-OKAZANIE-USLUG-PUBLICHNAYA-OFERTA-03-24'
                    },
                ],
                [
                    {
                        text: '👨‍💻 Поддержка',
                        url: 'https://t.me/vpn_by_oxy/8'
                    }
                ]

            ]
        }
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '🪙 Купить VPN',
                        callback_data: 'buy_vpn'
                    },
                    ...(user ?
                        [
                            {
                                text: '👤 Мой аккаунт',
                                callback_data: 'my_account',
                            }
                        ] : [])
                ],
                [

                    {
                        text: '❓ FAQ',
                        callback_data: 'faq'
                    },
                    {
                        text: '📃 Оферта',
                        url: 'https://telegra.ph/DOGOVOR-NA-OKAZANIE-USLUG-PUBLICHNAYA-OFERTA-03-24'
                    },
                ],
                [
                    {
                        text: '👨‍💻 Поддержка',
                        url: 'https://t.me/vpn_by_oxy/8'
                    }
                ]
            ],
        };

        await this.telegramUtils.sendOrEditMessage(ctx, text, accountId === 695606474 ? adminKeyboard : keyboard);
    }

    // async handleClearAll( ctx: MyContext ) {
    //     const url = `${this.apiUrl}/subscriptions/find`
    //     const accountId = ctx.callbackQuery && ctx.callbackQuery.from.id
    //     const data = {
    //         accountId: "74e4502dddd445fcac35a68211054b1d"
    //     }
    //
    //     const response = await firstValueFrom(
    //         this.httpService.post(url, data, {
    //             auth: { username: this.publicId, password: this.apiSecret },
    //         }),
    //     );
    //
    //     const subscriptions: any[] = response.data.Model.filter(sub => sub.Status === 'Active')
    //     for ( const sub of subscriptions ) {
    //         const url = `${this.apiUrl}/subscriptions/cancel`
    //         const data = {
    //             Id: sub.Id
    //         }
    //         await firstValueFrom(
    //             this.httpService.post(url, data, {
    //                 auth: { username: this.publicId, password: this.apiSecret },
    //             }),
    //         )
    //     }
    //
    // }
}