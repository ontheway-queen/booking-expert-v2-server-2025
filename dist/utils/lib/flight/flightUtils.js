"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const staticData_1 = require("../../miscellaneous/staticData");
class FlightUtils {
    // get meal by code
    getMeal(code) {
        return staticData_1.SABRE_MEAL_CODE.find((item) => item.code === code);
    }
    // get cabin by code
    getCabin(code) {
        return staticData_1.SABRE_CABIN_CODE.find((item) => item.code === code);
    }
}
exports.default = FlightUtils;
