import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import { PrismaService } from "nestjs-prisma";
import { MyContext, PromocodeTypes } from "../../interfaces/telegram.interface";
import { TelegramUtils } from "../../utils/telegram-utils";

@Injectable()
export class TwelfthLevelService {
    constructor(
        private readonly telegramUtils: TelegramUtils,
        private readonly prismaService: PrismaService,
    ) {
    }

    async handleCreatePromocode( ctx: MyContext ) {
        const {
            promocode,
            promocodeType: type,
            promocodeValue: value,
            promocodeMinOrderAmount: minOrderAmount,
            promocodeExpiredDate: expiredDate,
            promocodeAvailableCountUses: availableCountUses,
            promocodeMaxUsesPerUser: maxUsesPerUser,
            promocodeMinMonthsOrderAmount: minMonthsOrderAmount
        } = ctx.session

        if ( promocode &&
            type &&
            value &&
            minOrderAmount &&
            expiredDate &&
            availableCountUses &&
            maxUsesPerUser &&
            minMonthsOrderAmount ) {

            const text = `🎉 Промокод \`${ctx.session.promocode}\` успешно создан ✅

📋 *_Детали промокода:_*

• 🎟️ Промокод: \`${ctx.session.promocode}\`
• ⚙️ Тип промокода: \`${PromocodeTypes[ctx.session.promocodeType as 'fixed' | 'percent']}\`
• 💸 Скидка: \`${ctx.session.promocodeValue} ${ctx.session.promocodeType === 'percent' ? '%' : '₽'}\`
• 💸 Мин. сумма для активации: \`${ctx.session.promocodeMinOrderAmount} ₽\`
• 📅 Мин. кол-во месяцев для активации: \`${ctx.session.promocodeMinMonthsOrderAmount}\`
• 📅 Действителен до: \`${dayjs(ctx.session.promocodeExpiredDate).format('D MMMM YYYY [г.] HH:MM')}\`
• 🔢 Всего использований: \`${ctx.session.promocodeAvailableCountUses}\`
• 👤 На одного пользователя: \`${ctx.session.promocodeMaxUsesPerUser}\`.`
            const keyboard = {
                inline_keyboard: [
                    [
                        {
                            text: '🎟️ Создать еще один промокод',
                            callback_data: 'handle_add_promocode',
                        }
                    ],
                    [
                        {
                            text: '🔙 В главное меню',
                            callback_data: 'start',
                        }
                    ]
                ]
            }

            const response = await this.prismaService.promocode.create({
                data: {
                    promocode,
                    type,
                    value: Number(value),
                    expiredDate,
                    availableCountUses: Number(availableCountUses),
                    maxUsesPerUser: Number(maxUsesPerUser),
                    minOrderAmount: Number(minOrderAmount),
                    minMonthsOrderAmount: Number(minMonthsOrderAmount),
                }
            })
            if ( Object(response).hasOwnProperty('id') ) {
                ctx.session = {
                    ...ctx.session,
                    promocode: null,
                    promocodeMessageId: null,
                    promocodeType: null,
                    promocodeExpiredDate: null,
                    promocodeExpiredMonths: null,
                    promocodeAvailableCountUses: null,
                    promocodeMaxUsesPerUser: null,
                    promocodeValue: null,
                    promocodeMinOrderAmount: null,
                    promocodeMinMonthsOrderAmount: null,
                    step: null,
                }
                await this.telegramUtils.sendOrEditMessage(ctx, text, keyboard)
            }
        }


    }
}