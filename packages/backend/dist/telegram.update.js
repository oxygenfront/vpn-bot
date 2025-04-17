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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramUpdate = void 0;
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const nestjs_prisma_1 = require("nestjs-prisma");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegram_interface_1 = require("./interfaces/telegram.interface");
const eighth_level_service_1 = require("./levels/Eighth/eighth_level.service");
const elventh_level_service_1 = require("./levels/Eleventh/elventh_level.service");
const fifth_level_service_1 = require("./levels/Fifth/fifth_level.service");
const first_level_service_1 = require("./levels/First/first_level.service");
const fourth_level_service_1 = require("./levels/Fourth/fourth_level.service");
const ninth_level_service_1 = require("./levels/Ninth/ninth_level.service");
const second_level_service_1 = require("./levels/Second/second_level.service");
const seventh_level_service_1 = require("./levels/Seventh/seventh_level.service");
const sixth_level_service_1 = require("./levels/Sixth/sixth_level.service");
const tenth_level_service_1 = require("./levels/Tenth/tenth_level.service");
const third_level_service_1 = require("./levels/Third/third_level.service");
const twelfth_level_service_1 = require("./levels/Twelfth/twelfth_level.service");
const cloudpayments_service_1 = require("./services/cloudpayments.service");
dayjs.extend(customParseFormat);
dayjs.locale("ru");
let TelegramUpdate = class TelegramUpdate {
    constructor(firstLevelService, secondLevelService, thirdLevelService, fourthLevelService, fifthLevelService, sixthLevelService, seventhLevelService, eighthLevelService, ninthLevelService, tenthLevelService, eleventhLevelService, twelfthLevelService, cloudPaymentsService, prismaService) {
        this.firstLevelService = firstLevelService;
        this.secondLevelService = secondLevelService;
        this.thirdLevelService = thirdLevelService;
        this.fourthLevelService = fourthLevelService;
        this.fifthLevelService = fifthLevelService;
        this.sixthLevelService = sixthLevelService;
        this.seventhLevelService = seventhLevelService;
        this.eighthLevelService = eighthLevelService;
        this.ninthLevelService = ninthLevelService;
        this.tenthLevelService = tenthLevelService;
        this.eleventhLevelService = eleventhLevelService;
        this.twelfthLevelService = twelfthLevelService;
        this.cloudPaymentsService = cloudPaymentsService;
        this.prismaService = prismaService;
    }
    isCallbackQuery(query) {
        return query?.data !== undefined;
    }
    async handleStart(ctx) {
        await ctx.answerCbQuery();
        await this.firstLevelService.handleStart(ctx);
    }
    async onStart(ctx) {
        await this.firstLevelService.handleStart(ctx);
    }
    async clearSession(ctx) {
        await ctx.reply('Сессия очищена');
    }
    async handleMyAccount(ctx) {
        await ctx.answerCbQuery();
        await this.secondLevelService.handleMyAccount(ctx);
    }
    async onMyAccount(ctx) {
        await this.secondLevelService.handleMyAccount(ctx);
    }
    async handleBuyToken(ctx) {
        await ctx.answerCbQuery();
        await this.secondLevelService.handleBuyToken(ctx);
    }
    async onVpnServices(ctx) {
        await this.secondLevelService.handleBuyToken(ctx);
    }
    async handleAddPromoCode(ctx) {
        await ctx.answerCbQuery();
        await this.thirdLevelService.handleAddPromocode(ctx);
    }
    async handleShowPromoCodes(ctx) {
        await ctx.answerCbQuery();
        await this.thirdLevelService.handleShowPromocodes(ctx);
    }
    async onMessage(ctx) {
        if ('message' in ctx.update && 'text' in ctx.update.message) {
            switch (ctx.session.step) {
                case (telegram_interface_1.StepsEnum.PROMOCODE):
                    await this.fourthLevelService.handleChooseTypePromocode(ctx);
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;
                case (telegram_interface_1.StepsEnum.PROMOCODE_VALUE):
                    await this.sixthLevelService.handleMinOrderAmount(ctx);
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;
                case (telegram_interface_1.StepsEnum.PROMOCODE_MIN_ORDER_AMOUNT):
                    await this.seventhLevelService.handleMinMonthsOrderAmount(ctx);
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;
                case (telegram_interface_1.StepsEnum.PROMOCODE_EXPIRED_DATE):
                    await this.ninthLevelService.handleChooseAvailableCountUses(ctx);
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;
                case telegram_interface_1.StepsEnum.PROMOCODE_AVAILABLE_COUNT_USES:
                    await this.tenthLevelService.handleChooseMaxUsesPerUser(ctx);
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;
                case telegram_interface_1.StepsEnum.PROMOCODE_MAX_USES_PER_USER:
                    await this.eleventhLevelService.handleCheckPromocode(ctx);
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;
                case telegram_interface_1.StepsEnum.ENTER_PROMOCODE:
                    const promocode = await this.prismaService.promocode.findUnique({
                        where: {
                            promocode: ctx.update.message.text
                        },
                        include: {
                            uses: {
                                where: {
                                    user: {
                                        telegramId: String(ctx.update.message.from.id)
                                    }
                                }
                            }
                        }
                    });
                    await this.eighthLevelService.handleShowPromocodeDetails(ctx, promocode);
                    await ctx.deleteMessage(ctx.update.message.message_id);
                    break;
            }
        }
    }
    async handleChooseTypePromocode(ctx) {
        await ctx.answerCbQuery();
        await this.fourthLevelService.handleChooseTypePromocode(ctx);
    }
    async handleChooseValue(ctx) {
        await ctx.answerCbQuery();
        ctx.session.promocodeType = ctx.match[1];
        await this.fifthLevelService.handleChooseValue(ctx);
    }
    async handleMinOrderAmount(ctx) {
        ctx.session.promocodeValue = ctx.match[1];
        await ctx.answerCbQuery();
        await this.sixthLevelService.handleMinOrderAmount(ctx);
    }
    async handleMinMonthsOrderAmount(ctx) {
        ctx.session.promocodeMinOrderAmount = ctx.match[1];
        await ctx.answerCbQuery();
        await this.seventhLevelService.handleMinMonthsOrderAmount(ctx);
    }
    async handleChooseExpiredDate(ctx) {
        ctx.session.promocodeMinMonthsOrderAmount = ctx.match[1];
        await ctx.answerCbQuery();
        await this.eighthLevelService.handleChooseExpiredDate(ctx);
    }
    async handleChooseAvailableCountUses(ctx) {
        const months = ctx.match[1];
        ctx.session.promocodeExpiredDate = dayjs().add(months, 'months').toDate();
        ctx.session.promocodeExpiredMonths = months;
        await ctx.answerCbQuery();
        await this.ninthLevelService.handleChooseAvailableCountUses(ctx);
    }
    async handleChooseMaxUsesPerUser(ctx) {
        ctx.session.promocodeAvailableCountUses = ctx.match[1];
        await ctx.answerCbQuery();
        await this.tenthLevelService.handleChooseMaxUsesPerUser(ctx);
    }
    async handleCheckPromocode(ctx) {
        ctx.session.promocodeMaxUsesPerUser = ctx.match[1];
        await ctx.answerCbQuery();
        await this.eleventhLevelService.handleCheckPromocode(ctx);
    }
    async handleCreatePromocode(ctx) {
        await ctx.answerCbQuery();
        await this.twelfthLevelService.handleCreatePromocode(ctx);
    }
    async handleFaq(ctx) {
        await ctx.answerCbQuery();
        await this.thirdLevelService.handleFaq(ctx);
    }
    async handlePlanSelect(ctx) {
        await ctx.answerCbQuery();
        if (this.isCallbackQuery(ctx.callbackQuery)) {
            const planName = ctx.callbackQuery.data.split('_')[1];
            await this.fourthLevelService.handleChoosePlan(ctx, planName);
        }
    }
    async handleSelectMembers(ctx) {
        await ctx.answerCbQuery();
        await this.fifthLevelService.handleSelectMembers(ctx);
    }
    async handleViewChosenPlan(ctx) {
        await ctx.answerCbQuery();
        await this.sixthLevelService.handleViewChosenPlan(ctx);
    }
    async handleWritePromocode(ctx) {
        await ctx.answerCbQuery();
        await this.seventhLevelService.handleWritePromocode(ctx);
    }
    async handleTakePromocode(ctx) {
        await ctx.answerCbQuery();
        ctx.session.promocodeTakedByUser = ctx.session.promocodeEnteredByUser;
        await this.sixthLevelService.handleViewChosenPlan(ctx);
    }
    async handleDeletePromocodeFromOrder(ctx) {
        ctx.session.promocodeTakedByUser = null;
        await ctx.answerCbQuery();
        await this.sixthLevelService.handleViewChosenPlan(ctx);
    }
    async handleMySubscriptions(ctx) {
        await ctx.answerCbQuery();
        await this.thirdLevelService.handleMySubscriptions(ctx);
    }
    async handlePagination(ctx) {
        await ctx.answerCbQuery();
        ctx.session.page = Number(ctx.match[1]);
        await this.handleMySubscriptions(ctx);
    }
    async handleSubscriptionDetails(ctx) {
        const subId = ctx.match[1];
        await ctx.answerCbQuery();
        await this.fourthLevelService.handleSubscriptionDetails(ctx, subId);
    }
    async cancelSubscription(ctx) {
        const subId = ctx.match[1];
        const action = ctx.match[2];
        await this.cloudPaymentsService.updateSubscription(ctx, subId, action);
        await ctx.answerCbQuery();
    }
    async handleDeleteFromUserSubscription(ctx) {
        const subId = ctx.match[1];
        await this.fourthLevelService.handleDeleteFromUserSubscription(ctx, subId);
    }
};
exports.TelegramUpdate = TelegramUpdate;
__decorate([
    (0, nestjs_telegraf_1.Action)('start'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleStart", null);
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onStart", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('clear'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "clearSession", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('my_account'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleMyAccount", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('my_account'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onMyAccount", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('buy_vpn'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleBuyToken", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('buy_vpn'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onVpnServices", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('handle_add_promocode'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleAddPromoCode", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('handle_show_promocodes'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleShowPromoCodes", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onMessage", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('handle_choose_type_promocode'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleChooseTypePromocode", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^promocode_type_(percent|fixed)/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleChooseValue", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^choose_value_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleMinOrderAmount", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^choose_min_order_amount_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleMinMonthsOrderAmount", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^choose_min_months_order_amount_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleChooseExpiredDate", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/choose_expired_(1|3|6|9|12)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleChooseAvailableCountUses", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^choose_available_count_uses_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleChooseMaxUsesPerUser", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^choose_max_uses_per_user_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleCheckPromocode", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('create_promocode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleCreatePromocode", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('faq'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleFaq", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^plan_(base|standard|premium)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handlePlanSelect", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^month_(1|3|6|12)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleSelectMembers", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^deviceRangeId_(1|2|3)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleViewChosenPlan", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('write_promocode'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleWritePromocode", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^take_promocode_(1|2|3)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleTakePromocode", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^delete_promocode_from_order_(1|2|3)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleDeletePromocodeFromOrder", null);
__decorate([
    (0, nestjs_telegraf_1.Action)("my_subscriptions"),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleMySubscriptions", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^page_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handlePagination", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^sub_(.+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleSubscriptionDetails", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^update_sub-([^-]+)-(Cancellation|Activate)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "cancelSubscription", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^delete_from_user_subscription-(.+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "handleDeleteFromUserSubscription", null);
exports.TelegramUpdate = TelegramUpdate = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    __metadata("design:paramtypes", [first_level_service_1.FirstLevelService,
        second_level_service_1.SecondLevelService,
        third_level_service_1.ThirdLevelService,
        fourth_level_service_1.FourthLevelService,
        fifth_level_service_1.FifthLevelService,
        sixth_level_service_1.SixthLevelService,
        seventh_level_service_1.SeventhLevelService,
        eighth_level_service_1.EighthLevelService,
        ninth_level_service_1.NinthLevelService,
        tenth_level_service_1.TenthLevelService,
        elventh_level_service_1.EleventhLevelService,
        twelfth_level_service_1.TwelfthLevelService,
        cloudpayments_service_1.CloudPaymentsService,
        nestjs_prisma_1.PrismaService])
], TelegramUpdate);
//# sourceMappingURL=telegram.update.js.map