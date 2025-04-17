import { PrismaService } from "nestjs-prisma";
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { CloudPaymentsService } from "../services/cloudpayments.service";
import { LinkGeneratorService } from "../services/link-generator.service";
import { XuiApiService } from "../services/xui-api.service";
import { TelegramUtils } from "../utils/telegram-utils";
export declare class WebhookController {
    private readonly cloudPaymentsService;
    private readonly linkGeneratorService;
    private readonly configService;
    private readonly xuiApiService;
    private readonly telegramUtils;
    private readonly prismaService;
    private readonly bot;
    private readonly apiUrl;
    constructor(cloudPaymentsService: CloudPaymentsService, linkGeneratorService: LinkGeneratorService, configService: ConfigService, xuiApiService: XuiApiService, telegramUtils: TelegramUtils, prismaService: PrismaService, bot: Telegraf);
    handleWebhook(body: any): Promise<{
        code: number;
    }>;
}
