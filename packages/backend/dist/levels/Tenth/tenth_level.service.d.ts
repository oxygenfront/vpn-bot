import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
export declare class TenthLevelService {
    private readonly telegramUtils;
    constructor(telegramUtils: TelegramUtils);
    handleChooseMaxUsesPerUser(ctx: MyContext): Promise<void>;
}
