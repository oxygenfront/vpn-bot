import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
export declare class NinthLevelService {
    private readonly telegramUtils;
    constructor(telegramUtils: TelegramUtils);
    handleChooseAvailableCountUses(ctx: MyContext): Promise<true | import("@telegraf/types").Message.TextMessage | undefined>;
}
