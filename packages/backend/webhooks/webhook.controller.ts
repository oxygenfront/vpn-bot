// webhook.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from 'telegraf';
import { CloudPaymentsService } from "../services/cloudpayments.service";
import { LinkGeneratorService } from "../services/link-generator.service";
import { XuiApiService } from "../services/xui-api.service";
import { TelegramUtils } from "../utils/telegram-utils";


@Controller('webhook')
export class WebhookController {

    constructor(
        private readonly cloudPaymentsService: CloudPaymentsService,
        private readonly linkGeneratorService: LinkGeneratorService,
        private readonly xuiApiService: XuiApiService,
        private readonly telegramUtils: TelegramUtils,
        @InjectBot() private readonly bot: Telegraf
    ) {
    }


    @Post('cloudpayments')
    async handleWebhook( @Body() body: any ) {
        const {
            TransactionId,
            Status,
            Token,
            InvoiceId,
            AccountId,
            Amount,
            Data
        } = body;
        const chatId = AccountId
        const { CloudPayments } = JSON.parse(Data)
        const messageId = CloudPayments?.messageId;
        const period = Number(CloudPayments.recurrent.period)
        if ( !chatId ) {
            console.error(`Не найден chat_id для InvoiceId: ${InvoiceId}`);
            return { code: 0 };
        }

        switch ( Status ) {
            case 'Completed':
                if ( Token ) {
                    const tgId = AccountId
                    const username = AccountId
                    try {
                        const sessionCookie = await this.xuiApiService.login()
                        if ( !sessionCookie ) {
                            await this.bot.telegram.sendMessage(chatId, 'Ошибка: не удалось авторизоваться в панели.');
                            return;
                        }


                        const {
                            client,
                            streamSettings
                        } = await this.xuiApiService.getOrCreateClient({
                            sessionCookie,
                            username,
                            tgId,
                            expiredDays: 30 * period,
                            limit: 100
                        });

                        console.log(JSON.parse(streamSettings))


                        const subscriptionId = await this.cloudPaymentsService.createSubscription(
                            Token,
                            Amount,
                            AccountId,
                            'Month',
                            period,
                        );

                        const link = this.linkGeneratorService.generateVlessLink(client, streamSettings)

                        const messageText = `
*Оплата успешно завершена\\!*  
💰 Сумма: *${this.telegramUtils.escapeMarkdown(Amount)} RUB*  
📋 Заказ: *${InvoiceId}*  

✨ *Подписка активирована\\!*  
🆔 ID подписки: \`${subscriptionId}\`  

🔗 *Ваша ссылка для подключения:*
${this.telegramUtils.escapeMarkdown(`${process.env.PANEL_HOST}:2096/sub/${client.subId}`)}

🔒 *VLESS подключение:*  
\`${this.telegramUtils.escapeMarkdown(link)}\` 
`
                        const replyMarkup = {
                            inline_keyboard: [ [ {
                                text: '🔙 Назад',
                                callback_data: 'buy_vpn'
                            }, {
                                text: '👤 Мой аккаунт',
                                callback_data: 'my_account'
                            } ] ]
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

            case 'Check':
                break;

            case 'Confirmed':
                break;
        }

        return { code: 0 };
    }
}