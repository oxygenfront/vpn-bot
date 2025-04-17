import { MyContext } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";
export declare class EighthLevelService {
    private readonly telegramUtils;
    constructor(telegramUtils: TelegramUtils);
    handleChooseExpiredDate(ctx: MyContext): Promise<void>;
    handleShowPromocodeDetails(ctx: MyContext, promocode: any): Promise<void>;
}
