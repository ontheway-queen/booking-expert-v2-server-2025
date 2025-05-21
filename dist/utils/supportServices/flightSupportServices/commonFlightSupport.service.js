"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonFlightSupportService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const redis_1 = require("../../../app/redis");
const flightConstent_1 = require("../../miscellaneous/flightConstent");
const sabreFlightSupport_service_1 = __importDefault(require("./sabreFlightSupport.service"));
class CommonFlightSupportService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx || {};
    }
    FlightRevalidate(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search_id, flight_id, markup_set_id } = payload;
            //get data from redis using the search id
            const retrievedData = yield (0, redis_1.getRedis)(search_id);
            if (!retrievedData) {
                return null;
            }
            const retrieveResponse = retrievedData.response;
            const foundItem = retrieveResponse.results.find((item) => item.flight_id === flight_id);
            if (!foundItem) {
                return null;
            }
            const apiData = yield this.Model.MarkupSetFlightApiModel(this.trx).getMarkupSetFlightApi({
                status: true,
                markup_set_id,
                api_name: foundItem.api,
            });
            let booking_block = foundItem.booking_block;
            let revalidate_data;
            if (foundItem.api === flightConstent_1.SABRE_API) {
                //SABRE REVALIDATE
                const sabreSubService = new sabreFlightSupport_service_1.default(this.trx);
                revalidate_data = yield sabreSubService.SabreFlightRevalidate(retrievedData.reqBody, foundItem, markup_set_id, apiData[0].id, flight_id, booking_block);
            }
            else {
                return null;
            }
            revalidate_data.leg_description = retrievedData.response.leg_descriptions;
            revalidate_data.price_changed = this.checkRevalidatePriceChange({ flight_search_price: Number(foundItem === null || foundItem === void 0 ? void 0 : foundItem.fare.total_price), flight_revalidate_price: Number(revalidate_data === null || revalidate_data === void 0 ? void 0 : revalidate_data.fare.total_price) });
            const redis_remaining_time = yield (0, redis_1.getRedisTTL)(search_id);
            return { revalidate_data, redis_remaining_time };
        });
    }
    checkRevalidatePriceChange(payload) {
        if (payload.flight_search_price === payload.flight_revalidate_price) {
            return false;
        }
        else {
            return true;
        }
    }
    checkBookingPriceChange(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const retrievedData = yield (0, redis_1.getRedis)(`${flightConstent_1.FLIGHT_REVALIDATE_REDIS_KEY}${payload.flight_id}`);
            if (!retrievedData) {
                return null;
            }
            if (retrievedData.fare.total_price === payload.booking_price) {
                return false;
            }
            else {
                return true;
            }
        });
    }
    checkDirectTicketIssue(payload) {
        const now = new Date();
        const diffInMs = new Date(payload.journey_date).getTime() - now.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        return diffInDays < flightConstent_1.MIN_DAYS_BEFORE_DEPARTURE_FOR_DIRECT_TICKET;
    }
}
exports.CommonFlightSupportService = CommonFlightSupportService;
