import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CloudPaymentsService {
    private readonly apiUrl = 'https://api.cloudpayments.ru';
    private readonly publicId: string;
    private readonly apiSecret: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.publicId = this.configService.get<string>('CLOUDPAYMENTS_PUBLIC_ID') as string;
        this.apiSecret = this.configService.get<string>('CLOUDPAYMENTS_API_SECRET') as string;
    }


    // async createPaymentLink(
    //     amount: number,
    //     description: string,
    //     invoiceId: string,
    //     accountId: string,
    //     email?: string,
    // ): Promise<{ url: string, token: string }> {
    //     const url = `${this.apiUrl}/orders/create`;
    //     const data = {
    //         Amount: amount,
    //         Currency: 'RUB',
    //         Description: description,
    //         InvoiceId: invoiceId,
    //         AccountId: accountId,
    //         ...(email && { Email: email }),
    //         requireToken: true
    //     };
    //
    //     const response = await firstValueFrom(
    //         this.httpService.post(url, data, {
    //             auth: { username: this.publicId, password: this.apiSecret },
    //         }),
    //     );
    //
    //     if ( response.data.Success ) {
    //         return {
    //             url: response.data.Model.Url,
    //             token: response.data.Model.CardToken || undefined
    //         };
    //     } else {
    //         throw new Error(response.data.Message || 'Ошибка при создании счета');
    //     }
    // }

    async createSubscription(
        token: string,
        amount: number,
        accountId: string,
        interval: string,
        period: number,
    ): Promise<string> {

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startDate = tomorrow.toISOString().split('.')[0];

        const url = `${this.apiUrl}/subscriptions/create`;
        const data = {
            Token: token,
            AccountId: accountId,
            Description: 'Подписка на услугу',
            Amount: amount,
            Currency: 'RUB',
            Interval: interval,
            Period: period,
            StartDate: startDate,
        };

        const response = await firstValueFrom(
            this.httpService.post(url, data, {
                auth: { username: this.publicId, password: this.apiSecret },
            }),
        );


        if ( response.data.Success ) {
            return response.data.Model.Id;
        } else {
            throw new Error(response.data.Message || 'Ошибка при создании подписки');
        }
    }
}