import { PrismaService } from "nestjs-prisma";
import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
export declare class EleventhLevelService {
    private readonly telegramUtils;
    private readonly prismaService;
    constructor(telegramUtils: TelegramUtils, prismaService: PrismaService);
    handleCheckPromocode(ctx: MyContext): Promise<void>;
}
