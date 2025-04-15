import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from "nestjs-prisma";
import { InjectBot } from "nestjs-telegraf";
import { firstValueFrom } from 'rxjs';
import { Telegraf } from "telegraf";
import { MyContext } from "../interfaces/telegram.interface";
import { FourthLevelService } from "../levels/Fourth/fourth_level.service";
import * as dayjs from 'dayjs';

@Injectable()
export class CloudPaymentsService {
    private readonly apiUrl: string;
    private readonly publicId: string;
    private readonly apiSecret: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly fourthLevelService: FourthLevelService,
        private readonly prismaService: PrismaService,
        @InjectBot() private readonly bot: Telegraf
    ) {
        this.publicId = this.configService.get<string>('CLOUDPAYMENTS_PUBLIC_ID') as string;
        this.apiSecret = this.configService.get<string>('CLOUDPAYMENTS_API_SECRET') as string;
        this.apiUrl = this.configService.get<string>('CLOUDPAYMENTS_API_URL') as string;
    }

    async responseFunction( url, data ) {
        return await firstValueFrom(
            this.httpService.post(url, data, {
                auth: { username: this.publicId, password: this.apiSecret },
            }),
        )
    }

    // async createSubscription(
    //     token: string,
    //     amount: number,
    //     accountId: string,
    //     interval: string,
    //     period: number,
    // ) {
    //
    //     const StartDate = dayjs().add(period, 'month')
    //     const url = `${this.apiUrl}/subscriptions/create`;
    //     const data = {
    //         Token: token,
    //         AccountId: accountId,
    //         Description: 'Подписка на услугу',
    //         Amount: amount,
    //         Currency: 'RUB',
    //         Interval: interval,
    //         Period: period,
    //         StartDate,
    //     }
    //
    //     const response = await this.responseFunction(url, data);
    //
    //     if ( response.data.Success ) {
    //         return response.data.Model;
    //     } else {
    //         throw new Error(response.data.Message || 'Ошибка при создании подписки');
    //     }
    // }

    async updateSubscription( ctx: MyContext, subId: string, action: string ) {
        const url = action === 'Cancellation' ? `${this.apiUrl}/subscriptions/cancel` : `${this.apiUrl}/subscriptions/update`;
        if ( action === 'Activate' ) {
            const userSubscription = await this.prismaService.userSubscription.findFirst({
                where: {
                    id: subId,
                }
            })
            if ( !userSubscription ) {
                await ctx.reply('Не удалось активировать подписку, обратитесь в техподдержку')
                return
            }

            const data = {
                Id: subId,
                Status: 'Active'
            }
            const response = await this.responseFunction(url, data)
            if ( response.data.Success ) {
                await this.prismaService.userSubscription.update({
                    where: {
                        id: subId
                    },
                    data: {
                        status: 'Active'
                    }
                })
                await this.fourthLevelService.handleSubscriptionDetails(ctx, subId);
                return
            }
        } else if ( action === 'Cancellation' ) {
            const data = {
                Id: subId,
            }
            const response = await this.responseFunction(url, data)

            if ( response.data.Success ) {
                await this.prismaService.userSubscription.update({
                    where: {
                        id: subId,
                    },
                    data: {
                        status: 'Cancelled'
                    }
                })
                await this.fourthLevelService.handleSubscriptionDetails(ctx, subId);
                return
            }
        } else {
            return 'Что то пошло не так :( '
        }


    }
}