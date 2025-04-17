import { MyContext } from '../interfaces/telegram.interface';
export declare class TelegramUtils {
    escapeMarkdown(text: string): string;
    sendOrEditMessage(ctx: MyContext, text: string, keyboard?: any): Promise<true | import("@telegraf/types").Message.TextMessage>;
}
