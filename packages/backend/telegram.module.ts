import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectBot, TelegrafModule } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { FifthLevelService } from './levels/Fifth/fifth_level.service';
import { FirstLevelService } from "./levels/First/first_level.service";
import { FourthLevelService } from "./levels/Fourth/fourth_level.service";
import { SecondLevelService } from "./levels/Second/second_level.service";
import { SixthLevelService } from "./levels/Sixth/sixth_level.service";
import { ThirdLevelService } from "./levels/Third/third_service.service";
import { SessionMiddleware } from './middlewares/session.middleware';
import { CloudPaymentsService } from "./services/cloudpayments.service";
import { LinkGeneratorService } from "./services/link-generator.service";
import { NotificationService } from "./services/notification.service";
import { UserService } from "./services/user.service";
import { XuiApiService } from "./services/xui-api.service";
import { TelegramUpdate } from './telegram.update';
import { TelegramUtils } from "./utils/telegram-utils";
import {
    TelegramWebhookController
} from "./webhooks/telegram-webhook.controller";
import { WebhookController } from "./webhooks/webhook.controller";


@Module({
    imports: [
        ConfigModule,
        HttpModule,
        TelegrafModule.forRootAsync({
            imports: [ ConfigModule ],
            inject: [ ConfigService ],
            useFactory: ( configService: ConfigService ) => {

                const webhookDomain = configService.get<string>('WEBHOOK_DOMAIN') || '';
                return {
                    token: configService.get<string>('TELEGRAM_TOKEN') || '',
                    launchOptions: {
                        webhook: {
                            domain: webhookDomain,
                            path: '/telegram-webhook',
                            allowedUpdates: [ 'message', 'callback_query', 'edited_message', 'channel_post', 'inline_query' ],
                            dropPendingUpdates: true,
                        },
                    },
                };
            },
        })
    ],
    providers: [
        TelegramUpdate,
        FirstLevelService,
        SecondLevelService,
        ThirdLevelService,
        FourthLevelService,
        XuiApiService,
        LinkGeneratorService,
        UserService,
        NotificationService,
        TelegramUtils,
        FifthLevelService,
        SixthLevelService,
        CloudPaymentsService,
        WebhookController
    ],
    controllers: [ WebhookController, TelegramWebhookController ]
})
export class TelegramModule {
    constructor( @InjectBot() private readonly bot: Telegraf ) {
        SessionMiddleware.configure(this.bot);
    }
}