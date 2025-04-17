import { PrismaService } from "nestjs-prisma";
import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
export declare class ThirdLevelService {
    private readonly telegramUtils;
    private readonly prismaService;
    constructor(telegramUtils: TelegramUtils, prismaService: PrismaService);
    handleFaq(ctx: MyContext): Promise<void>;
    handleMySubscriptions(ctx: MyContext): any;
    handleAddPromocode(ctx: MyContext): Promise<void>;
    handleShowPromocodes(ctx: MyContext): Promise<void>;
}
