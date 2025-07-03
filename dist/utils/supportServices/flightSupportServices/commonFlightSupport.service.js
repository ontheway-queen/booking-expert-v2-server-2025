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
const wfttFlightSupport_service_1 = __importDefault(require("./wfttFlightSupport.service"));
const customError_1 = __importDefault(require("../../lib/customError"));
class CommonFlightSupportService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx || {};
    }
    FlightRevalidate(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { search_id, flight_id, markup_set_id, markup_amount } = payload;
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
                api_name: foundItem.api === flightConstent_1.CUSTOM_API ? flightConstent_1.WFTT_API : foundItem.api,
            });
            if (!((_a = apiData[0]) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new customError_1.default('Set Flight API ID not found. Contact with the support team', 500);
            }
            let booking_block = foundItem.booking_block;
            let revalidate_data;
            if (foundItem.api === flightConstent_1.SABRE_API) {
                //SABRE REVALIDATE
                const sabreSubService = new sabreFlightSupport_service_1.default(this.trx);
                revalidate_data = yield sabreSubService.SabreFlightRevalidate({
                    reqBody: retrievedData.reqBody,
                    retrieved_response: foundItem,
                    markup_set_id: markup_set_id,
                    set_flight_api_id: apiData[0].id,
                    flight_id: flight_id,
                    booking_block: booking_block,
                    markup_amount,
                });
            }
            else if (foundItem.api === flightConstent_1.CUSTOM_API) {
                //WFTT REVALIDATE
                const wfttSubService = new wfttFlightSupport_service_1.default(this.trx);
                revalidate_data = yield wfttSubService.FlightRevalidate({
                    reqBody: retrievedData.reqBody,
                    set_flight_api_id: apiData[0].id,
                    revalidate_body: {
                        flight_id: foundItem.flight_id,
                        search_id: foundItem.api_search_id,
                    },
                    markup_amount,
                });
            }
            else {
                return null;
            }
            revalidate_data.leg_description = retrievedData.response.leg_descriptions;
            revalidate_data.price_changed = this.checkRevalidatePriceChange({
                flight_search_price: Number(foundItem === null || foundItem === void 0 ? void 0 : foundItem.fare.total_price),
                flight_revalidate_price: Number(revalidate_data === null || revalidate_data === void 0 ? void 0 : revalidate_data.fare.total_price),
            });
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
            if (retrievedData.revalidate_data.fare.total_price === payload.booking_price) {
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
    //calculate convenience fee and discount
    calculateFlightMarkup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ airline, base_fare, flight_class, dynamic_fare_supplier_id, route_type, total_segments, }) {
            const dynamicFareModel = this.Model.DynamicFareModel(this.trx);
            let markup = 0;
            let commission = 0;
            let pax_markup = 0;
            const getFareMarkupQuery = {
                dynamic_fare_supplier_id,
                airline,
                flight_class,
            };
            if (route_type === 'DOMESTIC') {
                getFareMarkupQuery.domestic = true;
            }
            else if (route_type === 'FROM_DAC') {
                getFareMarkupQuery.from_dac = true;
            }
            else if (route_type === 'TO_DAC') {
                getFareMarkupQuery.to_dac = true;
            }
            else {
                getFareMarkupQuery.soto = true;
            }
            //get airline wise fare
            const supplier_airline_fare = yield dynamicFareModel.getSupplierAirlinesFares(getFareMarkupQuery);
            if (supplier_airline_fare.length) {
                if (supplier_airline_fare[0].markup_type === 'FLAT') {
                    markup += Number(supplier_airline_fare[0].markup);
                }
                else if (supplier_airline_fare[0].markup_type === 'PER') {
                    markup +=
                        Number(base_fare) * (Number(supplier_airline_fare[0].markup) / 100);
                }
                if (supplier_airline_fare[0].commission_type === 'FLAT') {
                    commission += Number(supplier_airline_fare[0].commission);
                }
                else if (supplier_airline_fare[0].commission_type === 'PER') {
                    commission +=
                        Number(base_fare) *
                            (Number(supplier_airline_fare[0].commission) / 100);
                }
                if (supplier_airline_fare[0].segment_markup_type === 'FLAT') {
                    markup +=
                        Number(supplier_airline_fare[0].segment_markup) * total_segments;
                }
                else if (supplier_airline_fare[0].segment_markup_type === 'PER') {
                    markup +=
                        Number(base_fare) *
                            (Number(supplier_airline_fare[0].segment_markup) / 100) *
                            total_segments;
                }
                if (supplier_airline_fare[0].segment_commission_type === 'FLAT') {
                    commission +=
                        Number(supplier_airline_fare[0].segment_commission) * total_segments;
                }
                else if (supplier_airline_fare[0].segment_commission_type === 'PER') {
                    commission +=
                        Number(base_fare) *
                            (Number(supplier_airline_fare[0].segment_commission) / 100) *
                            total_segments;
                }
                if (supplier_airline_fare[0].pax_markup) {
                    pax_markup += Number(supplier_airline_fare[0].pax_markup);
                }
            }
            else {
                //get default fare for the current API if separate commission not exist
                const dynamic_fare_supplier = yield dynamicFareModel.getSuppliers({
                    id: dynamic_fare_supplier_id,
                    status: true,
                });
                if (dynamic_fare_supplier.length) {
                    if (dynamic_fare_supplier[0].commission_type === 'FLAT') {
                        commission += Number(dynamic_fare_supplier[0].commission);
                    }
                    else if (dynamic_fare_supplier[0].commission_type === 'PER') {
                        commission +=
                            Number(base_fare) *
                                (Number(dynamic_fare_supplier[0].commission) / 100);
                    }
                    if (dynamic_fare_supplier[0].markup_type === 'FLAT') {
                        markup += Number(dynamic_fare_supplier[0].markup);
                    }
                    else if (dynamic_fare_supplier[0].markup_type === 'PER') {
                        markup +=
                            Number(base_fare) * (Number(dynamic_fare_supplier[0].markup) / 100);
                    }
                    if (dynamic_fare_supplier[0].pax_markup) {
                        pax_markup += Number(dynamic_fare_supplier[0].pax_markup);
                    }
                    if (dynamic_fare_supplier[0].segment_markup_type === 'FLAT') {
                        markup +=
                            Number(dynamic_fare_supplier[0].segment_markup) * total_segments;
                    }
                    else if (dynamic_fare_supplier[0].segment_markup_type === 'PER') {
                        markup +=
                            Number(base_fare) *
                                (Number(dynamic_fare_supplier[0].segment_markup) / 100) *
                                total_segments;
                    }
                    if (dynamic_fare_supplier[0].segment_commission_type === 'FLAT') {
                        commission +=
                            Number(dynamic_fare_supplier[0].segment_commission) *
                                total_segments;
                    }
                    else if (dynamic_fare_supplier[0].segment_commission_type === 'PER') {
                        commission +=
                            Number(base_fare) *
                                (Number(dynamic_fare_supplier[0].segment_commission) / 100) *
                                total_segments;
                    }
                }
            }
            return {
                markup: Number(Number(markup).toFixed(2)),
                commission: Number(Number(commission).toFixed(2)),
                pax_markup: Number(Number(pax_markup).toFixed(2)),
            };
        });
    }
}
exports.CommonFlightSupportService = CommonFlightSupportService;
