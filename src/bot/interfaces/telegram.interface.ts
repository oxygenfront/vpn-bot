import { Context } from 'telegraf';

export enum StepsEnum {
    PROMOCODE = 'promocode',
    SELECT_PLAN = 'select_plan',
    SELECT_PAYMENT = 'select_payment',
    CONFIRM_PAYMENT = 'confirm_payment',
    WAITING_PAYMENT = 'waiting_payment'
}

export enum AvailablePlansEnum {
    base = 1,
    standard = 2,
    premium = 3,
}


export enum MembersInPlan {
    '1-3' = 1,
    '3-5' = 2,
    '5-7' = 3
}

export enum Plans {
    Базовый = 1,
    Стандарт = 2,
    Премиум = 3
}


export interface MyContext extends Context {
    session: {
        promocode: string;
        step: StepsEnum | null;
        selectedPayment?: string;
        paymentAmount?: number;
        selectedPlan?: AvailablePlansEnum
        deviceRangeId?: number
        selectedMonths?: number
    };
}