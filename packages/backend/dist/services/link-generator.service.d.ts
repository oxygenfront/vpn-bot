export declare class LinkGeneratorService {
    constructor();
    generateConnectionLinks(client: any, streamSettings: any, inboundPort: number): {
        vlessLink: string;
        urlLink: string;
    };
}
