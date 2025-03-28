import { Injectable } from '@nestjs/common';

@Injectable()
export class LinkGeneratorService {
    generateVlessLink( client: any, streamSettings: any ): string {
        const settings = JSON.parse(streamSettings)
        return `\`${process.env.PANEL_HOST}:443/sub/${client.subId}\`\n\n\`vless://${client.id}@194.58.59.223:443?type=${settings.network}@security=${settings.security}&pbk=${settings.realitySettings.settings.publicKey}&fp=${settings.realitySettings.settings.fingerprint}&sni=${settings.realitySettings.serverNames[0]}&sid=${settings.realitySettings.shortIds[0]}&sxp=${encodeURIComponent(settings.realitySettings.settings.spiderX)}#Sell-${client.email}\``;
    }
}

