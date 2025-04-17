import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "nestjs-prisma";
import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
export declare class FirstLevelService {
    private readonly telegramUtils;
    private readonly httpService;
    private readonly prismaService;
    private readonly configService;
    private readonly apiUrl;
    private readonly publicId;
    private readonly apiSecret;
    constructor(telegramUtils: TelegramUtils, httpService: HttpService, prismaService: PrismaService, configService: ConfigService);
    handleStart(ctx: MyContext): Promise<void>;
}
