import { PrismaService } from "nestjs-prisma";
import { AvailablePlansEnum, MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
import { ThirdLevelService } from "../Third/third_level.service";
export declare class FourthLevelService {
    private readonly telegramUtils;
    private readonly thirdLevelService;
    private readonly prismaService;
    constructor(telegramUtils: TelegramUtils, thirdLevelService: ThirdLevelService, prismaService: PrismaService);
    getDayDeclension(days: number): string;
    handleChoosePlan(ctx: MyContext, planName: keyof typeof AvailablePlansEnum): Promise<void>;
    handleSubscriptionDetails(ctx: MyContext, subId: string): Promise<void>;
    handleDeleteFromUserSubscription(ctx: MyContext, subId: string): Promise<any>;
    handleChooseTypePromocode(ctx: MyContext): Promise<true | (import("@telegraf/types").Update.Edited & import("@telegraf/types").Message.TextMessage) | undefined>;
}
