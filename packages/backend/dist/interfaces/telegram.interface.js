"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanTrafficLimits = exports.MembersInPlan = exports.Plans = exports.AvailablePlansEnum = exports.PromocodeTypes = exports.StepsEnum = void 0;
var StepsEnum;
(function (StepsEnum) {
    StepsEnum["PROMOCODE"] = "promocode";
    StepsEnum["PROMOCODE_EXPIRED_DATE"] = "expired_date_promocode";
    StepsEnum["PROMOCODE_AVAILABLE_COUNT_USES"] = "available_count_uses";
    StepsEnum["PROMOCODE_MAX_USES_PER_USER"] = "max_uses_per_user";
    StepsEnum["PROMOCODE_VALUE"] = "promocode_value";
    StepsEnum["PROMOCODE_MIN_ORDER_AMOUNT"] = "promocode_order_amount";
    StepsEnum["ENTER_PROMOCODE"] = "enter_promocode";
})(StepsEnum || (exports.StepsEnum = StepsEnum = {}));
var PromocodeTypes;
(function (PromocodeTypes) {
    PromocodeTypes["fixed"] = "\u0424\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439";
    PromocodeTypes["percent"] = "\u041F\u0440\u043E\u0446\u0435\u043D\u0442\u043D\u044B\u0439";
})(PromocodeTypes || (exports.PromocodeTypes = PromocodeTypes = {}));
var AvailablePlansEnum;
(function (AvailablePlansEnum) {
    AvailablePlansEnum[AvailablePlansEnum["base"] = 1] = "base";
    AvailablePlansEnum[AvailablePlansEnum["standard"] = 2] = "standard";
    AvailablePlansEnum[AvailablePlansEnum["premium"] = 3] = "premium";
})(AvailablePlansEnum || (exports.AvailablePlansEnum = AvailablePlansEnum = {}));
var Plans;
(function (Plans) {
    Plans[Plans["\u0411\u0430\u0437\u043E\u0432\u044B\u0439"] = 1] = "\u0411\u0430\u0437\u043E\u0432\u044B\u0439";
    Plans[Plans["\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442"] = 2] = "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442";
    Plans[Plans["\u041F\u0440\u0435\u043C\u0438\u0443\u043C"] = 3] = "\u041F\u0440\u0435\u043C\u0438\u0443\u043C";
})(Plans || (exports.Plans = Plans = {}));
var MembersInPlan;
(function (MembersInPlan) {
    MembersInPlan[MembersInPlan["1-3"] = 1] = "1-3";
    MembersInPlan[MembersInPlan["3-5"] = 2] = "3-5";
    MembersInPlan[MembersInPlan["5-7"] = 3] = "5-7";
})(MembersInPlan || (exports.MembersInPlan = MembersInPlan = {}));
var PlanTrafficLimits;
(function (PlanTrafficLimits) {
    PlanTrafficLimits[PlanTrafficLimits["Base"] = 100] = "Base";
    PlanTrafficLimits[PlanTrafficLimits["Standard"] = 200] = "Standard";
    PlanTrafficLimits[PlanTrafficLimits["Premium"] = 0] = "Premium";
})(PlanTrafficLimits || (exports.PlanTrafficLimits = PlanTrafficLimits = {}));
//# sourceMappingURL=telegram.interface.js.map