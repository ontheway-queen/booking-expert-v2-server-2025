"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const staticData_1 = require("../../miscellaneous/staticData");
class FlightUtils {
    // get meal by code
    getMeal(code) {
        return staticData_1.mealData.find((item) => item.code === code);
    }
    // get cabin by code
    getCabin(code) {
        return staticData_1.cabinCode.find((item) => item.code === code);
    }
}
exports.default = FlightUtils;
