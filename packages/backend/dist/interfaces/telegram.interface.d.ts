import { Context } from 'telegraf';
export declare enum StepsEnum {
    PROMOCODE = "promocode",
    PROMOCODE_EXPIRED_DATE = "expired_date_promocode",
    PROMOCODE_AVAILABLE_COUNT_USES = "available_count_uses",
    PROMOCODE_MAX_USES_PER_USER = "max_uses_per_user",
    PROMOCODE_VALUE = "promocode_value",
    PROMOCODE_MIN_ORDER_AMOUNT = "promocode_order_amount",
    ENTER_PROMOCODE = "enter_promocode"
}
export declare enum PromocodeTypes {
    fixed = "\u0424\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439",
    percent = "\u041F\u0440\u043E\u0446\u0435\u043D\u0442\u043D\u044B\u0439"
}
export declare enum AvailablePlansEnum {
    base = 1,
    standard = 2,
    premium = 3
}
export declare enum Plans {
    Базовый = 1,
    Стандарт = 2,
    Премиум = 3
}
export declare enum MembersInPlan {
    '1-3' = 1,
    '3-5' = 2,
    '5-7' = 3
}
export declare enum PlanTrafficLimits {
    Base = 100,
    Standard = 200,
    Premium = 0
}
export interface MyContext extends Context {
    match: () => void;
    session: {
        promocodeEnteredByUser: string | null;
        promocodeTakedByUser: string | null;
        promocodeMessageId: number | null;
        promocode: string | null;
        promocodeType: "fixed" | "percent" | null;
        promocodeValue: number | null;
        promocodeMinOrderAmount: number | null;
        promocodeExpiredDate: Date | null;
        promocodeExpiredMonths: number | null;
        promocodeAvailableCountUses: number | null;
        promocodeMaxUsesPerUser: number | null;
        promocodeMinMonthsOrderAmount: number | null;
        step: StepsEnum | null;
        selectedPayment: string | null;
        paymentAmount: number | null;
        selectedPlan: AvailablePlansEnum | null;
        deviceRangeId: number | null;
        selectedMonths: number | null;
        expiryReminder: boolean | null;
        newsAndUpdates: boolean | null;
        promotions: boolean | null;
        serviceStatus: boolean | null;
        page: number | null;
        autoRenew: boolean | null;
    };
}
