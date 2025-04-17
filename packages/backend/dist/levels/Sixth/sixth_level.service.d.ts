import 'dayjs/locale/ru';
import { PrismaService } from 'nestjs-prisma';
import { MyContext } from '../../interfaces/telegram.interface';
import { TelegramUtils } from '../../utils/telegram-utils';
export declare class SixthLevelService {
    private readonly telegramUtils;
    private readonly prismaService;
    constructor(telegramUtils: TelegramUtils, prismaService: PrismaService);
    handleMinOrderAmount(ctx: MyContext): Promise<void>;
    handleViewChosenPlan(ctx: MyContext): Promise<void>;
}
