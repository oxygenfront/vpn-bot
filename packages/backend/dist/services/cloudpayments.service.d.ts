import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from "nestjs-prisma";
import { Telegraf } from "telegraf";
import { MyContext } from "../interfaces/telegram.interface";
import { FourthLevelService } from "../levels/Fourth/fourth_level.service";
export declare class CloudPaymentsService {
    private readonly httpService;
    private readonly configService;
    private readonly fourthLevelService;
    private readonly prismaService;
    private readonly bot;
    private readonly apiUrl;
    private readonly publicId;
    private readonly apiSecret;
    constructor(httpService: HttpService, configService: ConfigService, fourthLevelService: FourthLevelService, prismaService: PrismaService, bot: Telegraf);
    responseFunction(url: any, data: any): Promise<import("axios").AxiosResponse<any, any>>;
    updateSubscription(ctx: MyContext, subId: string, action: string): Promise<"Что то пошло не так :( " | undefined>;
}
