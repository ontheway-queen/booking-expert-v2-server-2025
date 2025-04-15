"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const staticData_1 = require("../../miscellaneous/staticData");
class FlightUtils {
    constructor() {
        // Get layover time
        this.getLayoverTime = (options) => {
            const layoverTime = options.map((item, index) => {
                var _a, _b;
                let firstArrival = options[index].arrival.time;
                let secondDeparture = (_b = (_a = options[index + 1]) === null || _a === void 0 ? void 0 : _a.departure) === null || _b === void 0 ? void 0 : _b.time;
                let layoverTimeString = 0;
                if (secondDeparture) {
                    const startDate = new Date(`2020-01-01T${firstArrival}`);
                    let endDate = new Date(`2020-01-01T${secondDeparture}`);
                    if (endDate < startDate) {
                        endDate = new Date(`2020-01-02T${secondDeparture}`);
                        // Calculate the difference in milliseconds
                        const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
                        // Convert the difference minutes
                        layoverTimeString = Math.abs(differenceInMilliseconds / (1000 * 60));
                    }
                    else {
                        const layoverTimeInMilliseconds = endDate.getTime() - startDate.getTime();
                        layoverTimeString = Math.abs(layoverTimeInMilliseconds) / (1000 * 60);
                    }
                }
                return layoverTimeString;
            });
            return layoverTime;
        };
    }
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
    // Get legs desc
    getLegsDesc(legItems, legDesc, OriginDest) {
        const legsDesc = [];
        for (const [index, leg_item] of legItems.entries()) {
            const leg_id = leg_item.ref;
            const legs = legDesc.find((legDecs) => legDecs.id === leg_id);
            if (legs) {
                const options = [];
                const date = OriginDest[index].DepartureDateTime;
                for (const option of legs.options) {
                    const { departureDateAdjustment } = option, rest = __rest(option, ["departureDateAdjustment"]);
                    let departure_date = new Date(date);
                    if (departureDateAdjustment) {
                        departure_date.setDate(departure_date.getDate() + Number(departureDateAdjustment));
                    }
                    let year = departure_date.getFullYear();
                    let month = String(departure_date.getMonth() + 1).padStart(2, '0');
                    let day = String(departure_date.getDate()).padStart(2, '0');
                    const departureDate = `${year}-${month}-${day}`;
                    const arrivalDate = new Date(departureDate);
                    if (option.arrival.date_adjustment) {
                        arrivalDate.setDate(arrivalDate.getDate() + option.arrival.date_adjustment);
                    }
                    const arrivalYear = arrivalDate.getFullYear();
                    const arrivalMonth = String(arrivalDate.getMonth() + 1).padStart(2, '0');
                    const arrivalDay = String(arrivalDate.getDate()).padStart(2, '0');
                    const formattedArrivalDate = `${arrivalYear}-${arrivalMonth}-${arrivalDay}`;
                    options.push(Object.assign(Object.assign({}, rest), { departure: Object.assign(Object.assign({}, option.departure), { date: departureDate }), arrival: Object.assign(Object.assign({}, option.arrival), { date: formattedArrivalDate }) }));
                }
                const layoverTime = this.getLayoverTime(options);
                legsDesc.push({
                    id: legs.id,
                    stoppage: options.length - 1,
                    elapsed_time: legs.elapsed_time,
                    layover_time: layoverTime,
                    options,
                });
            }
        }
        return legsDesc;
    }
}
exports.default = FlightUtils;
