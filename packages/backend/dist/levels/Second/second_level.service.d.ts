import { PrismaService } from "nestjs-prisma";
import { Telegraf } from "telegraf";
import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
export declare class SecondLevelService {
    private readonly bot;
    private readonly telegramUtils;
    private readonly prismaService;
    constructor(bot: Telegraf, telegramUtils: TelegramUtils, prismaService: PrismaService);
    handleMyAccount(ctx: MyContext): Promise<void>;
    handleBuyToken(ctx: MyContext): Promise<void>;
}
