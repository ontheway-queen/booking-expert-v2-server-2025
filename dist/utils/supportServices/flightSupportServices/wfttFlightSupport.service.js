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
const flightConstent_1 = require("../../miscellaneous/flightConstent");
const lib_1 = __importDefault(require("../../lib/lib"));
const customError_1 = __importDefault(require("../../lib/customError"));
const constants_1 = require("../../miscellaneous/constants");
const flightUtils_1 = __importDefault(require("../../lib/flight/flightUtils"));
const commonFlightSupport_service_1 = require("./commonFlightSupport.service");
class WfttFlightService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.request = new wfttRequest_1.default();
        this.flightUtils = new flightUtils_1.default();
        this.trx = trx;
        this.flightSupport = new commonFlightSupport_service_1.CommonFlightSupportService(trx);
    }
    // Request body formatter
    FlightSearchReqFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, reqBody, route_type, }) {
            const AirlinesPrefModel = this.Model.AirlinesPreferenceModel(this.trx);
            const prefAirlinesQuery = {
                dynamic_fare_supplier_id,
                pref_type: 'PREFERRED',
                status: true,
            };
            if (route_type === flightConstent_1.ROUTE_TYPE.DOMESTIC) {
                prefAirlinesQuery.domestic = true;
            }
            else if (route_type === flightConstent_1.ROUTE_TYPE.FROM_DAC) {
                prefAirlinesQuery.domestic = true;
            }
            else if (route_type === flightConstent_1.ROUTE_TYPE.TO_DAC) {
                prefAirlinesQuery.domestic = true;
            }
            else if (route_type === flightConstent_1.ROUTE_TYPE.SOTO) {
                prefAirlinesQuery.domestic = true;
            }
            // Get preferred airlines
            const cappingAirlinesRaw = yield AirlinesPrefModel.getAirlinePrefCodes(prefAirlinesQuery);
            const { JourneyType, airline_code, OriginDestinationInformation, PassengerTypeQuantity, } = reqBody;
            let finalAirlineCodes = [];
            if (airline_code.length) {
                for (const code of airline_code) {
                    const found = cappingAirlinesRaw.find((item) => item.Code === code.Code);
                    if (found) {
                        finalAirlineCodes.push({ Code: found.Code });
                    }
                }
            }
            else {
                if (cappingAirlinesRaw.length) {
                    finalAirlineCodes = cappingAirlinesRaw;
                }
            }
            return {
                JourneyType,
                airline_code: finalAirlineCodes,
                OriginDestinationInformation,
                PassengerTypeQuantity,
            };
        });
    }
    // Flight search service
    FlightSearch(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, reqBody, markup_amount, }) {
            const route_type = this.flightUtils.routeTypeFinder({
                originDest: reqBody.OriginDestinationInformation,
            });
            const formattedReqBody = yield this.FlightSearchReqFormatter({
                dynamic_fare_supplier_id,
                reqBody,
                route_type,
            });
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
                dynamic_fare_supplier_id,
                search_id: response.data.search_id,
                markup_amount,
                route_type,
            });
            return result;
        });
    }
    // Flight search response formatter
    FlightSearchResFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, reqBody, dynamic_fare_supplier_id, search_id, markup_amount, route_type, }) {
            // const result: IFormattedFlightItinerary[] = [];
            const airports = [];
            const OriginDest = reqBody.OriginDestinationInformation;
            OriginDest.forEach((item) => {
                airports.push(item.OriginLocation.LocationCode);
                airports.push(item.DestinationLocation.LocationCode);
            });
            const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
            const commonModel = this.Model.CommonModel(this.trx);
            const formattedData = yield Promise.all(data.map((item) => __awaiter(this, void 0, void 0, function* () {
                const domestic_flight = route_type === flightConstent_1.ROUTE_TYPE.DOMESTIC;
                const { isDomesticFlight, fare: vendor_fare, api, carrier_code, carrier_logo, api_search_id, flights } = item, rest = __rest(item, ["isDomesticFlight", "fare", "api", "carrier_code", "carrier_logo", "api_search_id", "flights"]);
                let fare = {
                    base_fare: vendor_fare.base_fare,
                    total_tax: vendor_fare.total_tax,
                    discount: vendor_fare.discount,
                    payable: vendor_fare.payable,
                    ait: vendor_fare.ait,
                    vendor_price: {
                        base_fare: vendor_fare.base_fare,
                        charge: 0,
                        discount: vendor_fare.discount,
                        gross_fare: vendor_fare.total_price,
                        net_fare: vendor_fare.payable,
                        tax: vendor_fare.total_tax,
                    },
                };
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
                let total_segments = 0;
                flights.map((elm) => {
                    elm.options.map((elm2) => {
                        total_segments++;
                    });
                });
                const { markup, commission, pax_markup } = yield this.flightSupport.calculateFlightMarkup({
                    dynamic_fare_supplier_id,
                    airline: carrier_code,
                    flight_class: this.flightUtils.getClassFromId(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref
                        .Cabin),
                    base_fare: vendor_fare.base_fare,
                    total_segments,
                    route_type,
                });
                const career = yield commonModel.getAirlineByCode(carrier_code);
                // const career =
                return Object.assign(Object.assign({ domestic_flight,
                    fare, price_changed: false, api_search_id: search_id, api: flightConstent_1.CUSTOM_API, carrier_code, carrier_logo: career.logo, flights: newFlights }, rest), { leg_description: [] });
            })));
            return formattedData;
        });
    }
    //Revalidate service
    FlightRevalidate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ reqBody, revalidate_body, dynamic_fare_supplier_id, markup_amount, }) {
            const route_type = this.flightUtils.routeTypeFinder({
                originDest: reqBody.OriginDestinationInformation,
            });
            const endpoint = wfttApiEndpoints_1.default.FLIGHT_REVALIDATE_ENDPOINT +
                `?search_id=${revalidate_body.search_id}&flight_id=${revalidate_body.flight_id}`;
            const response = yield this.request.getRequest(endpoint);
            if (!response) {
                lib_1.default.writeJsonFile('wftt_revalidate_request', revalidate_body);
                lib_1.default.writeJsonFile('wftt_revalidate_response', response);
                throw new customError_1.default('External API Error', 500, constants_1.ERROR_LEVEL_WARNING, {
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
                dynamic_fare_supplier_id,
                search_id: '',
                markup_amount,
                route_type,
            });
            return result[0];
        });
    }
}
exports.default = WfttFlightService;
