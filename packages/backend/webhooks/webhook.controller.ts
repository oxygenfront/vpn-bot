// webhook.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from 'telegraf';
import { CloudPaymentsService } from "../services/cloudpayments.service";
import { TelegramUtils } from "../utils/telegram-utils";

@Controller('webhook')
export class WebhookController {

    constructor(
        private readonly cloudPaymentsService: CloudPaymentsService,
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
            Amount
        } = body;


        const chatId = AccountId
        if ( !chatId ) {
            console.error(`Не найден chat_id для InvoiceId: ${InvoiceId}`);
            return { code: 0 };
        }

        switch ( Status ) {
            case 'Completed':
                console.log(`Успешный платеж ${TransactionId}, InvoiceId: ${InvoiceId}`);
                try {
                    await this.bot.telegram.sendMessage(
                        chatId,
                        `Оплата на сумму ${Amount} RUB прошла успешно! Заказ: ${InvoiceId}`,
                    );
                } catch ( error ) {
                    console.error('Ошибка отправки сообщения в Telegram:', error);
                }

                if ( Token ) {
                    console.log(`Токен для подписки: ${Token}`);
                    try {
                        const subscriptionId = await this.cloudPaymentsService.createSubscription(
                            Token,
                            Amount,
                            InvoiceId,
                            AccountId,
                            'Month',
                            1,
                        );
                        console.log(`Создана подписка: ${subscriptionId}`);
                        await this.bot.telegram.sendMessage(
                            chatId,
                            `Подписка успешно создана! ID подписки: ${subscriptionId}`,
                        );
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
                console.log(`Платеж ${TransactionId} отклонен`);
                await this.bot.telegram.sendMessage(
                    chatId,
                    `Оплата отклонена. Заказ: ${InvoiceId}. Попробуйте снова.`,
                );
                break;

            case 'Check':
                console.log(`Проверка платежа ${TransactionId}`);
                break;

            case 'Confirmed':
                console.log(`Платеж ${TransactionId} подтвержден`);
                break;
        }

        return { code: 0 };
    }
}