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
        this.trx = trx;
    }
    FlightRevalidate(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
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
                const apiData = yield this.Model.MarkupSetFlightApiModel(trx).getMarkupSetFlightApi({
                    status: true,
                    markup_set_id,
                    api_name: foundItem.api,
                });
                let booking_block = foundItem.booking_block;
                if (foundItem.api === flightConstent_1.SABRE_API) {
                    //SABRE REVALIDATE
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    const formattedReqBody = yield sabreSubService.SabreFlightRevalidate(retrievedData.reqBody, foundItem, markup_set_id, apiData[0].id, flight_id, booking_block);
                    formattedReqBody[0].leg_description =
                        retrievedData.response.leg_descriptions;
                    return formattedReqBody[0];
                }
                else {
                    return null;
                }
            }));
        });
    }
}
exports.CommonFlightSupportService = CommonFlightSupportService;
