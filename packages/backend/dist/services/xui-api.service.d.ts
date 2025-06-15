import { HttpService } from '@nestjs/axios';
interface IGetOrCreateClient {
    sessionCookie: string;
    username: string;
    tgId: string;
    inboundId?: number;
    expiredDays: number;
    limit: number;
    limitIp: number;
}
export declare class XuiApiService {
    private readonly httpService;
    constructor(httpService: HttpService);
    login(): Promise<string | undefined>;
    getOrCreateClient({ sessionCookie, username, tgId, inboundId, expiredDays, limit, limitIp }: IGetOrCreateClient): Promise<{
        client: any;
        inboundPassword: any;
        streamSettings: any;
    }>;
}
export {};
