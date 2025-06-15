"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const telegram_utils_1 = require("../utils/telegram-utils");
let LinkGeneratorService = class LinkGeneratorService {
    constructor(telegramUtils) {
        this.telegramUtils = telegramUtils;
    }
    generateConnectionLinks(client, streamSettings) {
        const settings = JSON.parse(streamSettings);
        const ip = process.env.PANEL_HOST.split('//')[1];
        const vlessLink = `vless://${client.id}@${ip}:27976?type=${settings.network}&security=${settings.security}&pbk=${settings.realitySettings.settings.publicKey}&fp=${settings.realitySettings.settings.fingerprint}&sni=${settings.realitySettings.serverNames[0]}&sid=${settings.realitySettings.shortIds[0]}&spx=${encodeURIComponent(settings.realitySettings.settings.spiderX)}#Sell-${client.email}`;
        const urlLink = `${process.env.PANEL_HOST}:2096/sub/${client.subId}`;
        return { vlessLink, urlLink };
    }
};
exports.LinkGeneratorService = LinkGeneratorService;
exports.LinkGeneratorService = LinkGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_utils_1.TelegramUtils])
], LinkGeneratorService);
//# sourceMappingURL=link-generator.service.js.map