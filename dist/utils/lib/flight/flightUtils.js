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
    //convert data time
    convertDateTime(dateStr, timeStr) {
        const date = new Date(dateStr);
        // Validate date
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date format");
        }
        // Extract HH:mm:ss from time string
        const match = timeStr.match(/^(\d{2}):(\d{2}):(\d{2})/);
        if (!match) {
            throw new Error("Invalid time format");
        }
        const [_, hours, minutes, seconds] = match.map(Number);
        // Set time in UTC
        date.setUTCHours(hours, minutes, seconds, 0);
        // Format output: YYYY-MM-DDTHH:mm:ss
        return date.toISOString().slice(0, 19);
    }
    ;
}
exports.default = FlightUtils;
