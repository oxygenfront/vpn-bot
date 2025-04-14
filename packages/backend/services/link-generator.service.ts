import { Injectable } from '@nestjs/common';
import { PrismaService } from "nestjs-prisma";
import { TelegramUtils } from "../utils/telegram-utils";

@Injectable()
export class LinkGeneratorService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
    ) {
    }

    generateConnectionLinks( client: any, streamSettings: any ) {
        const settings = JSON.parse(streamSettings)
        const ip = process.env.PANEL_HOST!.split('//')[1]
        const vlessLink = `vless://${client.id}@${ip}:27976?type=${settings.network}&security=${settings.security}&pbk=${settings.realitySettings.settings.publicKey}&fp=${settings.realitySettings.settings.fingerprint}&sni=${settings.realitySettings.serverNames[0]}&sid=${settings.realitySettings.shortIds[0]}&spx=${encodeURIComponent(settings.realitySettings.settings.spiderX)}#Sell-${client.email}`
        const urlLink = `${process.env.PANEL_HOST}:2096/sub/${client.subId}`
        return { vlessLink, urlLink }
    }
}

