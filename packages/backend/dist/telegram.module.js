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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const eighth_level_service_1 = require("./levels/Eighth/eighth_level.service");
const elventh_level_service_1 = require("./levels/Eleventh/elventh_level.service");
const fifth_level_service_1 = require("./levels/Fifth/fifth_level.service");
const first_level_service_1 = require("./levels/First/first_level.service");
const fourth_level_service_1 = require("./levels/Fourth/fourth_level.service");
const ninth_level_service_1 = require("./levels/Ninth/ninth_level.service");
const second_level_service_1 = require("./levels/Second/second_level.service");
const seventh_level_service_1 = require("./levels/Seventh/seventh_level.service");
const sixth_level_service_1 = require("./levels/Sixth/sixth_level.service");
const tenth_level_service_1 = require("./levels/Tenth/tenth_level.service");
const third_level_service_1 = require("./levels/Third/third_level.service");
const twelfth_level_service_1 = require("./levels/Twelfth/twelfth_level.service");
const session_middleware_1 = require("./middlewares/session.middleware");
const cloudpayments_service_1 = require("./services/cloudpayments.service");
const link_generator_service_1 = require("./services/link-generator.service");
const xui_api_service_1 = require("./services/xui-api.service");
const telegram_update_1 = require("./telegram.update");
const telegram_utils_1 = require("./utils/telegram-utils");
const telegram_webhook_controller_1 = require("./webhooks/telegram-webhook.controller");
const webhook_controller_1 = require("./webhooks/webhook.controller");
let TelegramModule = class TelegramModule {
    constructor(bot) {
        this.bot = bot;
        session_middleware_1.SessionMiddleware.configure(this.bot);
    }
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            axios_1.HttpModule,
            nestjs_telegraf_1.TelegrafModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const webhookDomain = configService.get('WEBHOOK_DOMAIN') || '';
                    return {
                        token: configService.get('TELEGRAM_TOKEN') || '',
                        launchOptions: {
                            webhook: {
                                domain: webhookDomain,
                                path: '/telegram-webhook',
                                allowedUpdates: ['message', 'callback_query', 'edited_message', 'channel_post', 'inline_query'],
                                dropPendingUpdates: true,
                            },
                        },
                    };
                },
            }),
        ],
        providers: [
            telegram_update_1.TelegramUpdate,
            first_level_service_1.FirstLevelService,
            second_level_service_1.SecondLevelService,
            third_level_service_1.ThirdLevelService,
            fourth_level_service_1.FourthLevelService,
            fifth_level_service_1.FifthLevelService,
            sixth_level_service_1.SixthLevelService,
            seventh_level_service_1.SeventhLevelService,
            eighth_level_service_1.EighthLevelService,
            ninth_level_service_1.NinthLevelService,
            tenth_level_service_1.TenthLevelService,
            elventh_level_service_1.EleventhLevelService,
            twelfth_level_service_1.TwelfthLevelService,
            xui_api_service_1.XuiApiService,
            link_generator_service_1.LinkGeneratorService,
            telegram_utils_1.TelegramUtils,
            cloudpayments_service_1.CloudPaymentsService,
            webhook_controller_1.WebhookController,
        ],
        controllers: [webhook_controller_1.WebhookController, telegram_webhook_controller_1.TelegramWebhookController],
    }),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf])
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map