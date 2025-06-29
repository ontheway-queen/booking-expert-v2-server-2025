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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const wfttRequest_1 = __importDefault(require("../../lib/flight/wfttRequest"));
const wfttApiEndpoints_1 = __importDefault(require("../../miscellaneous/wfttApiEndpoints"));
const staticData_1 = require("../../miscellaneous/staticData");
const flightConstent_1 = require("../../miscellaneous/flightConstent");
const lib_1 = __importDefault(require("../../lib/lib"));
const constants_1 = require("../../miscellaneous/constants");
const customError_1 = __importDefault(require("../../lib/customError"));
const constants_2 = require("../../miscellaneous/constants");
class WfttFlightService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.request = new wfttRequest_1.default();
        this.trx = trx;
    }
    // Request body formatter
    FlightSearchReqFormatter(reqBody, set_flight_api_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { JourneyType, airline_code, OriginDestinationInformation, PassengerTypeQuantity, } = reqBody;
            const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
            const defaultAllowedAirlines = yield flightMarkupsModel.getAPIActiveAirlines(set_flight_api_id);
            let newAirlineCodes = [];
            if (airline_code === null || airline_code === void 0 ? void 0 : airline_code.length) {
                defaultAllowedAirlines.forEach((airline) => {
                    if (airline_code.some((code) => code.Code === airline.Code)) {
                        newAirlineCodes.push({ Code: airline.Code });
                    }
                });
            }
            else {
                newAirlineCodes = defaultAllowedAirlines;
            }
            // Format the request body as per WFTT API requirements
            return {
                JourneyType,
                airline_code: newAirlineCodes,
                OriginDestinationInformation,
                PassengerTypeQuantity,
            };
        });
    }
    // Flight search service
    FlightSearch(_a) {
        return __awaiter(this, arguments, void 0, function* ({ set_flight_api_id, reqBody, markup_amount, }) {
            const formattedReqBody = yield this.FlightSearchReqFormatter(reqBody, set_flight_api_id);
            const response = yield this.request.postRequest(wfttApiEndpoints_1.default.FLIGHT_SEARCH_ENDPOINT, formattedReqBody);
            if (!response) {
                return [];
            }
            if (response.data.total === 0) {
                return [];
            }
            const result = yield this.FlightSearchResFormatter({
                data: response.data.results,
                reqBody: reqBody,
                set_flight_api_id,
                search_id: response.data.search_id,
                markup_amount,
            });
            return result;
        });
    }
    // Flight search response formatter
    FlightSearchResFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, reqBody, set_flight_api_id, search_id, markup_amount, }) {
            // const result: IFormattedFlightItinerary[] = [];
            const airports = [];
            const OriginDest = reqBody.OriginDestinationInformation;
            OriginDest.forEach((item) => {
                airports.push(item.OriginLocation.LocationCode);
                airports.push(item.DestinationLocation.LocationCode);
            });
            const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
            const commonModel = this.Model.CommonModel(this.trx);
            return (yield Promise.all(data.map((item) => __awaiter(this, void 0, void 0, function* () {
                const domestic_flight = item.isDomesticFlight;
                let fare = {
                    base_fare: item.fare.base_fare,
                    total_tax: item.fare.total_tax,
                    discount: item.fare.discount,
                    convenience_fee: item.fare.convenience_fee,
                    total_price: item.fare.total_price,
                    payable: item.fare.payable,
                    ait: item.fare.ait,
                };
                // Markup data
                let finalMarkup = 0;
                let finalMarkupType = '';
                let finalMarkupMode = '';
                // Set Markup if route Markup is not available and airlines Markup is available
                if (!finalMarkup && !finalMarkupType && !finalMarkupMode) {
                    //airline markup
                    const markupCheck = yield flightMarkupsModel.getAllFlightMarkups({
                        airline: item.carrier_code,
                        status: true,
                        markup_set_flight_api_id: set_flight_api_id,
                        limit: 1,
                    }, false);
                    // Set Amount
                    if (markupCheck.data.length) {
                        const { markup_domestic, markup_from_dac, markup_to_dac, markup_soto, markup_type, markup_mode, } = markupCheck.data[0];
                        let allBdAirport = true;
                        let existBdAirport = false;
                        for (const airport of airports) {
                            if (staticData_1.BD_AIRPORT.includes(airport)) {
                                if (!existBdAirport) {
                                    existBdAirport = true;
                                }
                            }
                            else {
                                allBdAirport = false;
                            }
                        }
                        if (allBdAirport) {
                            // Domestic
                            finalMarkup = markup_domestic;
                            finalMarkupMode = markup_mode;
                            finalMarkupType = markup_type;
                        }
                        else if (staticData_1.BD_AIRPORT.includes(airports[0])) {
                            // From Dhaka
                            finalMarkup = markup_from_dac;
                            finalMarkupMode = markup_mode;
                            finalMarkupType = markup_type;
                        }
                        else if (existBdAirport) {
                            // To Dhaka
                            finalMarkup = markup_to_dac;
                            finalMarkupMode = markup_mode;
                            finalMarkupType = markup_type;
                        }
                        else {
                            // Soto
                            finalMarkup = markup_soto;
                            finalMarkupMode = markup_mode;
                            finalMarkupType = markup_type;
                        }
                    }
                }
                // Set Markup to fare
                if (finalMarkup && finalMarkupMode && finalMarkupType) {
                    if (finalMarkupType === constants_1.MARKUP_TYPE_PER) {
                        const markupAmount = (Number(fare.base_fare) * Number(finalMarkup)) / 100;
                        if (finalMarkupMode === constants_1.MARKUP_MODE_INCREASE) {
                            fare.convenience_fee += Number(markupAmount);
                        }
                        else {
                            fare.discount += Number(markupAmount);
                        }
                    }
                    else {
                        if (finalMarkupMode === constants_1.MARKUP_MODE_INCREASE) {
                            fare.convenience_fee += Number(finalMarkup);
                        }
                        else {
                            fare.discount += Number(finalMarkup);
                        }
                    }
                }
                //add addition markup(applicable for sub agent/agent b2c)
                if (markup_amount) {
                    if (markup_amount.markup_mode === 'INCREASE') {
                        fare.convenience_fee +=
                            markup_amount.markup_type === 'FLAT'
                                ? Number(markup_amount.markup)
                                : (Number(fare.total_price) * Number(markup_amount.markup)) /
                                    100;
                    }
                    else {
                        fare.discount +=
                            markup_amount.markup_type === 'FLAT'
                                ? Number(markup_amount.markup)
                                : (Number(fare.total_price) * Number(markup_amount.markup)) /
                                    100;
                    }
                }
                fare.payable =
                    Number(fare.total_price) +
                        Number(fare.convenience_fee) -
                        Number(fare.discount);
                const { isDomesticFlight, fare: wftt_fare, api, carrier_code, carrier_logo, api_search_id, flights } = item, rest = __rest(item, ["isDomesticFlight", "fare", "api", "carrier_code", "carrier_logo", "api_search_id", "flights"]);
                const newFlights = yield Promise.all(flights.map((flight) => __awaiter(this, void 0, void 0, function* () {
                    const { options } = flight;
                    const newOptions = yield Promise.all(options.map((option) => __awaiter(this, void 0, void 0, function* () {
                        const { carrier: optionsCareer } = option;
                        const newCareer = Object.assign({}, optionsCareer);
                        const careerMarketing = yield commonModel.getAirlineByCode(optionsCareer.carrier_marketing_code);
                        if (optionsCareer.carrier_marketing_code ===
                            optionsCareer.carrier_operating_code) {
                            newCareer.carrier_marketing_logo = careerMarketing.logo;
                            newCareer.carrier_operating_logo = careerMarketing.logo;
                        }
                        else {
                            const careerOperating = yield commonModel.getAirlineByCode(optionsCareer.carrier_operating_code);
                            newCareer.carrier_marketing_logo = careerMarketing.logo;
                            newCareer.carrier_operating_logo = careerOperating.logo;
                        }
                        return Object.assign(Object.assign({}, option), { carrier: newCareer, fare });
                    })));
                    return Object.assign(Object.assign({}, flight), { options: newOptions });
                })));
                const career = yield commonModel.getAirlineByCode(carrier_code);
                // const career =
                return Object.assign(Object.assign({ domestic_flight,
                    fare, price_changed: false, api_search_id: search_id, api: flightConstent_1.CUSTOM_API, carrier_code, carrier_logo: career.logo, flights: newFlights }, rest), { leg_description: [] });
            }))));
        });
    }
    //Revalidate service
    FlightRevalidate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ reqBody, revalidate_body, set_flight_api_id, markup_amount, }) {
            console.log({ revalidate_body });
            const endpoint = wfttApiEndpoints_1.default.FLIGHT_REVALIDATE_ENDPOINT +
                `?search_id=${revalidate_body.search_id}&flight_id=${revalidate_body.flight_id}`;
            const response = yield this.request.getRequest(endpoint);
            console.log({ response });
            if (!response) {
                lib_1.default.writeJsonFile('wftt_revalidate_request', revalidate_body);
                lib_1.default.writeJsonFile('wftt_revalidate_response', response);
                throw new customError_1.default('External API Error', 500, constants_2.ERROR_LEVEL_WARNING, {
                    api: flightConstent_1.WFTT_API,
                    endpoint: wfttApiEndpoints_1.default.FLIGHT_REVALIDATE_ENDPOINT,
                    payload: revalidate_body,
                    response,
                });
            }
            if (!response.data) {
                throw new customError_1.default(`Cannot revalidate flight with this flight id`, 400);
            }
            const result = yield this.FlightSearchResFormatter({
                data: [response.data],
                reqBody: reqBody,
                set_flight_api_id,
                search_id: '',
                markup_amount,
            });
            return result[0];
        });
    }
}
exports.default = WfttFlightService;
