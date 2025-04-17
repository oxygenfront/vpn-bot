import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
export declare class SeventhLevelService {
    private readonly telegramUtils;
    constructor(telegramUtils: TelegramUtils);
    handleMinMonthsOrderAmount(ctx: MyContext): Promise<void>;
    handleWritePromocode(ctx: MyContext): Promise<void>;
}
