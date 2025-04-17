import { TelegramUtils } from "../utils/telegram-utils";
export declare class LinkGeneratorService {
    private readonly telegramUtils;
    constructor(telegramUtils: TelegramUtils);
    generateConnectionLinks(client: any, streamSettings: any): {
        vlessLink: string;
        urlLink: string;
    };
}
