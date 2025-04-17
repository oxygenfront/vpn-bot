import { PrismaService } from "nestjs-prisma";
import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
export declare class TwelfthLevelService {
    private readonly telegramUtils;
    private readonly prismaService;
    constructor(telegramUtils: TelegramUtils, prismaService: PrismaService);
    handleCreatePromocode(ctx: MyContext): Promise<void>;
}
