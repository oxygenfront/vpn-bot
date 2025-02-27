import { Context } from 'telegraf';

export enum StepsEnum {
    PROMOCODE = 'promocode',
    SELECT_PLAN = 'select_plan',
    SELECT_PAYMENT = 'select_payment',
    CONFIRM_PAYMENT = 'confirm_payment',
    WAITING_PAYMENT = 'waiting_payment'
}

export interface MyContext extends Context {
    session: {
        promocode: string;
        step: StepsEnum | null;
        selectedPlan?: string;
        selectedPayment?: string;
        paymentAmount?: number;
    };
}