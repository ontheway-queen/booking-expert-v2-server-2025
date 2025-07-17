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
const flightConstant_1 = require("../../miscellaneous/flightConstant");
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
            if (route_type === flightConstant_1.ROUTE_TYPE.DOMESTIC) {
                prefAirlinesQuery.domestic = true;
            }
            else if (route_type === flightConstant_1.ROUTE_TYPE.FROM_DAC) {
                prefAirlinesQuery.from_dac = true;
            }
            else if (route_type === flightConstant_1.ROUTE_TYPE.TO_DAC) {
                prefAirlinesQuery.to_dac = true;
            }
            else if (route_type === flightConstant_1.ROUTE_TYPE.SOTO) {
                prefAirlinesQuery.soto = true;
            }
            // Get preferred airlines
            const cappingAirlinesRaw = yield AirlinesPrefModel.getAirlinePrefCodes(prefAirlinesQuery);
            const { JourneyType, airline_code, OriginDestinationInformation, PassengerTypeQuantity, } = reqBody;
            let finalAirlineCodes = [];
            if (airline_code === null || airline_code === void 0 ? void 0 : airline_code.length) {
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
        return __awaiter(this, arguments, void 0, function* ({ data, reqBody, dynamic_fare_supplier_id, search_id, markup_amount, route_type, with_modified_fare, with_vendor_fare, }) {
            // const result: IFormattedFlightItinerary[] = [];
            const airports = [];
            const OriginDest = reqBody.OriginDestinationInformation;
            OriginDest.forEach((item) => {
                airports.push(item.OriginLocation.LocationCode);
                airports.push(item.DestinationLocation.LocationCode);
            });
            const commonModel = this.Model.CommonModel(this.trx);
            let pax_count = 0;
            reqBody.PassengerTypeQuantity.map((reqPax) => {
                pax_count += reqPax.Quantity;
            });
            const formattedData = yield Promise.all(data.map((item) => __awaiter(this, void 0, void 0, function* () {
                const domestic_flight = route_type === flightConstant_1.ROUTE_TYPE.DOMESTIC;
                const { isDomesticFlight, fare: vendor_fare, api, carrier_code, carrier_logo, api_search_id, flights, passengers, refundable } = item, rest = __rest(item, ["isDomesticFlight", "fare", "api", "carrier_code", "carrier_logo", "api_search_id", "flights", "passengers", "refundable"]);
                let partial_payment = {
                    partial_payment: false,
                    payment_percentage: 0,
                    travel_date_from_now: '',
                };
                if (route_type === flightConstant_1.ROUTE_TYPE.DOMESTIC) {
                    //domestic
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstant_1.CUSTOM_API,
                        airline: carrier_code,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                        domestic: true,
                    });
                }
                else if (route_type === flightConstant_1.ROUTE_TYPE.FROM_DAC) {
                    //from dac
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstant_1.CUSTOM_API,
                        airline: carrier_code,
                        from_dac: true,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    });
                }
                else if (route_type === flightConstant_1.ROUTE_TYPE.TO_DAC) {
                    //to dac
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstant_1.CUSTOM_API,
                        airline: carrier_code,
                        to_dac: true,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    });
                }
                else {
                    //soto
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstant_1.CUSTOM_API,
                        airline: carrier_code,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                        soto: true,
                    });
                }
                let total_segments = 0;
                flights.map((elm) => {
                    elm.options.forEach((elm2) => {
                        total_segments++;
                    });
                });
                const { markup, commission, pax_markup, agent_discount, agent_markup } = yield this.flightSupport.calculateFlightMarkup({
                    dynamic_fare_supplier_id,
                    airline: carrier_code,
                    flight_class: this.flightUtils.getClassFromId(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref
                        .Cabin),
                    base_fare: vendor_fare.base_fare,
                    total_segments,
                    route_type,
                    markup_amount,
                });
                const total_pax_markup = pax_markup * pax_count;
                let fare = {
                    base_fare: vendor_fare.base_fare + markup + agent_markup + total_pax_markup,
                    total_tax: vendor_fare.total_tax,
                    discount: commission + agent_discount,
                    ait: vendor_fare.ait,
                    payable: (vendor_fare.base_fare +
                        markup +
                        agent_markup +
                        total_pax_markup +
                        vendor_fare.total_tax +
                        vendor_fare.ait -
                        commission -
                        agent_discount).toFixed(2),
                    vendor_price: with_vendor_fare
                        ? {
                            base_fare: vendor_fare.base_fare,
                            charge: 0,
                            discount: vendor_fare.discount,
                            ait: vendor_fare.ait,
                            gross_fare: vendor_fare.total_price,
                            net_fare: vendor_fare.payable,
                            tax: vendor_fare.total_tax,
                        }
                        : undefined,
                };
                const newPassenger = passengers.map((oldPax) => {
                    const per_pax_discount = (commission + agent_discount) / pax_count;
                    const per_pax_markup = (markup + agent_markup) / pax_count;
                    const total_pax_markup = pax_markup + per_pax_markup;
                    const per_pax_ait = Number(fare.ait) / pax_count;
                    const per_pax_tax = oldPax.fare.tax / oldPax.number;
                    const per_pax_base_fare = oldPax.fare.base_fare / oldPax.number;
                    return {
                        type: oldPax.type,
                        number: oldPax.number,
                        per_pax_fare: {
                            base_fare: (per_pax_base_fare + total_pax_markup).toFixed(2),
                            tax: per_pax_tax.toFixed(2),
                            ait: per_pax_ait.toFixed(2),
                            discount: per_pax_discount.toFixed(2),
                            total_fare: (per_pax_base_fare +
                                total_pax_markup +
                                per_pax_ait +
                                per_pax_tax -
                                per_pax_discount).toFixed(2),
                        },
                    };
                });
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
                // console.log({
                //   agent_discount,
                //   agent_markup,
                //   commission,
                //   markup,
                //   pax_markup,
                // });
                // console.log({ fare });
                return Object.assign(Object.assign({ domestic_flight,
                    fare, price_changed: false, api_search_id: search_id, api: flightConstant_1.CUSTOM_API, api_name: flightConstant_1.CUSTOM_API_NAME, carrier_code, carrier_logo: career.logo, flights: newFlights, passengers: newPassenger, refundable,
                    partial_payment, modifiedFare: with_modified_fare
                        ? {
                            agent_discount,
                            agent_markup,
                            commission,
                            markup,
                            pax_markup,
                        }
                        : undefined }, rest), { leg_description: [] });
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
                    api: flightConstant_1.CUSTOM_API,
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
                with_modified_fare: true,
                with_vendor_fare: true,
            });
            return result[0];
        });
    }
}
exports.default = WfttFlightService;
