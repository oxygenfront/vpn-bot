import { PrismaService } from "nestjs-prisma";
import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
export declare class FifthLevelService {
    private readonly telegramUtils;
    private readonly prismaService;
    constructor(telegramUtils: TelegramUtils, prismaService: PrismaService);
    handleChooseValue(ctx: MyContext): Promise<void>;
    handleSelectMembers(ctx: MyContext): Promise<void>;
}
