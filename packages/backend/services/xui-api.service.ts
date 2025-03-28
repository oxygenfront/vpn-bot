import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as process from "node:process";
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

interface IGetOrCreateClient {
    sessionCookie: string,
    username: string,
    tgId: string,
    inboundId?: number,
    expiredDays: number,
    limit: number
}

@Injectable()
export class XuiApiService {
    constructor( private readonly httpService: HttpService ) {
    }

    async login(): Promise<string | undefined> {
        const response = await firstValueFrom(
            this.httpService.post(
                `${process.env.PANEL_LINK}/login`,
                {
                    username: process.env.PANEL_USERNAME,
                    password: process.env.PANEL_PASSWORD
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                },
            ),
        );
        return response.headers['set-cookie']?.find(( cookie ) => cookie.startsWith('3x-ui='));
    }


    async getOrCreateClient( {
                                 sessionCookie,
                                 username,
                                 tgId,
                                 inboundId = 1,
                                 expiredDays,
                                 limit,
                             }: IGetOrCreateClient ) {

        const inboundResponse = await firstValueFrom(
            this.httpService.get(
                `${process.env.PANEL_LINK}/panel/api/inbounds/get/${inboundId}`,
                {
                    headers: {
                        'Cookie': sessionCookie,
                        'Accept': 'application/json'
                    },
                    withCredentials: true
                },
            ),
        );


        const { settings, streamSettings } = inboundResponse.data.obj;
        const { password, clients } = JSON.parse(settings);
        let client = clients.find(( c: any ) => c.email === username);
        const gbLimit = limit * 1024 * 1024 * 1024
        if ( !client ) {
            const currentTime = Date.now();
            const expiryTime = currentTime + expiredDays * 24 * 60 * 60 * 1000;

            client = {
                id: uuidv4(),
                flow: '',
                password: randomBytes(64).toString('base64'),
                email: username,
                limitIp: 1,
                totalGB: gbLimit,
                expiryTime: expiryTime,
                subId: uuidv4(),
                enable: true,
                tgId: tgId,
                reset: 0,
            };

            const requestSettings = { clients: [ client ] };
            const addClientResponse = await firstValueFrom(
                this.httpService.post(
                    `${process.env.PANEL_LINK}/panel/api/inbounds/addClient`,
                    {
                        id: inboundId,
                        settings: JSON.stringify(requestSettings)
                    },
                    {
                        headers: {
                            'Cookie': sessionCookie,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true,
                    },
                ),
            );


            if ( !addClientResponse.data.success ) {
                throw new Error(`Не удалось создать пользователя: ${addClientResponse.data.msg}`);
            }
        }

        return { client, inboundPassword: password, streamSettings };
    }
}