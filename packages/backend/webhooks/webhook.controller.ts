// webhook.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from "nestjs-prisma";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from 'telegraf';
import { Plans, PlanTrafficLimits } from "../interfaces/telegram.interface";
import { CloudPaymentsService } from "../services/cloudpayments.service";
import { LinkGeneratorService } from "../services/link-generator.service";
import { XuiApiService } from "../services/xui-api.service";
import { TelegramUtils } from "../utils/telegram-utils";
import { v4 as uuidv4 } from "uuid";
import * as dayjs from "dayjs";

@Controller('webhook')
export class WebhookController {

    constructor(
        private readonly cloudPaymentsService: CloudPaymentsService,
        private readonly linkGeneratorService: LinkGeneratorService,
        private readonly xuiApiService: XuiApiService,
        private readonly telegramUtils: TelegramUtils,
        private readonly prismaService: PrismaService,
        @InjectBot() private readonly bot: Telegraf
    ) {
    }


    @Post('cloudpayments')
    async handleWebhook( @Body() body: any ) {
        const {
            SubscriptionId,
            Status,
            Token,
            InvoiceId,
            AccountId,
            Amount,
            Data
        } = body;
        const chatId = AccountId
        if ( !chatId ) {
            console.error(`Не найден chat_id для InvoiceId: ${InvoiceId}`);
            return { code: 0 };
        }

        switch ( Status ) {
            case 'Completed':
                if ( Token ) {
                    const { CloudPayments } = JSON.parse(Data)
                    const messageId = CloudPayments?.messageId;
                    const period = Number(CloudPayments.recurrent.period)
                    const tgId = AccountId
                    const username = AccountId
                    try {
                        const sessionCookie = await this.xuiApiService.login()
                        if ( !sessionCookie ) {
                            await this.bot.telegram.sendMessage(chatId, 'Ошибка: не удалось авторизоваться в панели.');
                            return;
                        }

                        const boughtPlan = await this.prismaService.subscriptionPlan.findFirst({
                            where: {
                                price: Number(Amount),
                                months: CloudPayments.recurrent.period
                            },
                            include: {
                                plan: true
                            }
                        })

                        if ( boughtPlan ) {
                            const {
                                client,
                                streamSettings
                            } = await this.xuiApiService.getOrCreateClient({
                                sessionCookie,
                                username,
                                tgId,
                                expiredDays: 30 * period,
                                limit: PlanTrafficLimits[boughtPlan.plan.name] as unknown as number,
                            });

                            const user = await this.prismaService.user.upsert({
                                where: {
                                    telegramId: chatId,
                                },
                                create: {
                                    id: uuidv4(),
                                    telegramId: chatId,
                                    cardToken: Token,
                                },
                                update: {
                                    updatedAt: new Date(),
                                },
                            });


                            const subscriptionData = await this.cloudPaymentsService.createSubscription(
                                Token,
                                Amount,
                                AccountId,
                                'Month',
                                period,
                            );
                            const response = await this.prismaService.userSubscription.findFirst({
                                where: {
                                    id: SubscriptionId
                                },
                                select: {
                                    expiredDate: true
                                }
                            })

                            const expiredDate = response ? dayjs(response.expiredDate).add(boughtPlan.months, 'month').toDate() : dayjs().add(boughtPlan.months, 'month').toDate()
                            const {
                                vlessLink,
                                urlLink
                            } = this.linkGeneratorService.generateConnectionLinks(client, streamSettings);

                            await this.prismaService.userSubscription.upsert({
                                where: {
                                    id: SubscriptionId
                                },
                                update: {
                                    nextBillingDate: new Date(subscriptionData.NextTransactionDateIso),
                                    expiredDate: expiredDate,
                                    lastInvoiceId: InvoiceId,
                                },
                                create: {
                                    id: SubscriptionId,
                                    status: 'Active',
                                    userId: user.id,
                                    lastInvoiceId: InvoiceId,
                                    subscriptionPlanId: boughtPlan.id,
                                    vlessLinkConnection: vlessLink,
                                    urlLinkConnection: urlLink,
                                    nextBillingDate: new Date(subscriptionData.NextTransactionDateIso),
                                    startBillingDate: new Date(),
                                    expiredDate: dayjs().add(boughtPlan.months, 'month').toDate(),
                                },
                            });


                            if ( CloudPayments?.type === 'pay' ) {
                                const messageText = `
*Оплата успешно завершена!*  
💰 Сумма: *${Amount} RUB*  
📋 Заказ: *${InvoiceId}*  

✨ *Подписка активирована!*  
🆔 ID подписки: \`${SubscriptionId}\`  

🔗 *Ваша ссылка для подключения:*
${urlLink}

🔒 *VLESS подключение:*  
\`${vlessLink}\` 
`
                                const replyMarkup = {
                                    inline_keyboard: [ [
                                        {
                                            text: 'Что дальше ?',
                                            url: 'https://telegra.ph/CHto-delat-posle-oplaty-03-31'
                                        },
                                        {
                                            text: '👤 Мой аккаунт',
                                            callback_data: 'my_account'
                                        }
                                    ], [
                                        {
                                            text: '🔙 Назад',
                                            callback_data: 'buy_vpn'
                                        }
                                    ] ]
                                }
                                if ( messageId ) {
                                    try {
                                        await this.bot.telegram.editMessageText(
                                            chatId, messageId, undefined, messageText
                                            , {
                                                reply_markup: replyMarkup,
                                                parse_mode: 'MarkdownV2',
                                            },
                                        );

                                    } catch ( editError ) {
                                        try {
                                            await this.bot.telegram.deleteMessage(chatId, messageId);
                                        } finally {
                                            await this.bot.telegram.sendMessage(chatId, messageText, {
                                                parse_mode: 'MarkdownV2',
                                                reply_markup: replyMarkup,
                                            })
                                        }
                                    }
                                } else {
                                    await this.bot.telegram.sendMessage(chatId, messageText, {
                                        parse_mode: 'MarkdownV2',
                                        reply_markup: replyMarkup,
                                    });
                                }
                            }


                        }
                    } catch ( error ) {
                        console.error('Ошибка при создании подписки:', error);
                        await this.bot.telegram.sendMessage(
                            chatId,
                            'Ошибка при создании подписки. Обратитесь в поддержку.',
                        );
                    }
                }
                break;

            case 'Declined':
                await this.bot.telegram.sendMessage(
                    chatId,
                    `Оплата отклонена. Заказ: ${InvoiceId}. Попробуйте снова.`,
                );
                break;
            case 'Cancelled':
                break
            case 'Check':
                break;
            case 'Confirmed':
                break;
        }

        return { code: 0 };
    }
}