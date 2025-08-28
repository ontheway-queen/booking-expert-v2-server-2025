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
const flightConstant_1 = require("../../miscellaneous/flightConstant");
const sabreFlightSupport_service_1 = __importDefault(require("./sabreFlightSupport.service"));
const wfttFlightSupport_service_1 = __importDefault(require("./wfttFlightSupport.service"));
const customError_1 = __importDefault(require("../../lib/customError"));
const dateTimeLib_1 = __importDefault(require("../../lib/dateTimeLib"));
const staticData_1 = require("../../miscellaneous/staticData");
const verteilFlightSupport_service_1 = __importDefault(require("./verteilFlightSupport.service"));
class CommonFlightSupportService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx || {};
    }
    FlightRevalidate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_set_id, flight_id, search_id, markup_amount, }) {
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
            const dynamicFareModel = this.Model.DynamicFareModel(this.trx);
            const apiData = yield dynamicFareModel.getDynamicFareSuppliers({
                status: true,
                set_id: dynamic_fare_set_id,
                api_name: foundItem.api,
            });
            let booking_block = foundItem.booking_block;
            if (foundItem.api === flightConstant_1.SABRE_API) {
                //SABRE REVALIDATE
                const sabreSubService = new sabreFlightSupport_service_1.default(this.trx);
                const formattedResBody = yield sabreSubService.SabreFlightRevalidate({
                    booking_block,
                    dynamic_fare_supplier_id: apiData[0].id,
                    flight_id,
                    reqBody: retrievedData.reqBody,
                    retrieved_response: foundItem,
                    markup_amount,
                });
                formattedResBody.price_changed = this.checkRevalidatePriceChange({
                    flight_revalidate_price: formattedResBody.fare.payable,
                    flight_search_price: foundItem.fare.payable,
                });
                formattedResBody.leg_description =
                    retrievedData.response.leg_descriptions;
                return formattedResBody;
            }
            else if (foundItem.api === flightConstant_1.VERTEIL_API) {
                const verteilSubService = new verteilFlightSupport_service_1.default(this.trx);
                const formattedResBody = yield verteilSubService.FlightRevalidateService({
                    search_id,
                    reqBody: retrievedData.reqBody,
                    oldData: foundItem,
                    dynamic_fare_supplier_id: apiData[0].id,
                    markup_amount
                });
                formattedResBody[0].price_changed = this.checkRevalidatePriceChange({
                    flight_revalidate_price: formattedResBody[0].fare.payable,
                    flight_search_price: foundItem.fare.payable,
                });
                formattedResBody[0].leg_description =
                    retrievedData.response.leg_descriptions;
                return formattedResBody[0];
            }
            else if (foundItem.api === flightConstant_1.CUSTOM_API) {
                const customFlightService = new wfttFlightSupport_service_1.default(this.trx);
                const formattedResBody = yield customFlightService.FlightRevalidate({
                    reqBody: retrievedData.reqBody,
                    dynamic_fare_supplier_id: apiData[0].id,
                    revalidate_body: {
                        flight_id: foundItem.flight_id,
                        search_id: foundItem.api_search_id,
                    },
                });
                formattedResBody.price_changed = this.checkRevalidatePriceChange({
                    flight_revalidate_price: formattedResBody.fare.payable,
                    flight_search_price: foundItem.fare.payable,
                });
                formattedResBody.leg_description =
                    retrievedData.response.leg_descriptions;
                return formattedResBody;
            }
            else {
                return null;
            }
        });
    }
    checkRevalidatePriceChange(payload) {
        if (Number(payload.flight_search_price) ===
            Number(payload.flight_revalidate_price)) {
            return false;
        }
        else {
            return true;
        }
    }
    checkBookingPriceChange(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const retrievedData = yield (0, redis_1.getRedis)(`${flightConstant_1.FLIGHT_REVALIDATE_REDIS_KEY}${payload.flight_id}`);
            if (!retrievedData) {
                return null;
            }
            if (Number(retrievedData.fare.payable) === payload.booking_price) {
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
        return diffInDays < flightConstant_1.MIN_DAYS_BEFORE_DEPARTURE_FOR_DIRECT_TICKET;
    }
    calculateFlightMarkup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ airline, base_fare, flight_class, dynamic_fare_supplier_id, route_type, total_segments, markup_amount, }) {
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
                const dynamic_fare_supplier = yield dynamicFareModel.getDynamicFareSuppliers({
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
            let agent_markup = 0.0;
            let agent_discount = 0.0;
            if (markup_amount) {
                let extra_amount = 0;
                if (markup_amount.markup_type === 'FLAT') {
                    extra_amount = markup_amount.markup;
                }
                if (markup_amount.markup_type === 'PER') {
                    extra_amount = Number(base_fare) * (Number(markup_amount.markup) / 100);
                }
                if (markup_amount.markup_mode === 'INCREASE') {
                    agent_markup = extra_amount;
                }
                if (markup_amount.markup_mode === 'DECREASE') {
                    agent_discount = extra_amount;
                }
            }
            return {
                markup: Number(Number(markup).toFixed(2)),
                commission: Number(Number(commission).toFixed(2)),
                pax_markup: Number(Number(pax_markup).toFixed(2)),
                agent_discount: Number(Number(agent_discount).toFixed(2)),
                agent_markup: Number(Number(agent_markup).toFixed(2)),
            };
        });
    }
    calculateFlightTaxMarkup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, tax, route_type, airline, markup_amount, }) {
            const getFareMarkupQuery = {
                dynamic_fare_supplier_id
            };
            const dynamicFareModel = this.Model.DynamicFareModel(this.trx);
            if (route_type === "DOMESTIC") {
                getFareMarkupQuery.domestic = true;
            }
            else if (route_type === "FROM_DAC") {
                getFareMarkupQuery.from_dac = true;
            }
            else if (route_type === "TO_DAC") {
                getFareMarkupQuery.to_dac = true;
            }
            else {
                getFareMarkupQuery.soto = true;
            }
            let markup = 0;
            let commission = 0;
            for (const taxItem of tax) {
                for (const tax_elm of taxItem) {
                    const supplier_data = yield dynamicFareModel.getFareTaxes(Object.assign(Object.assign({}, getFareMarkupQuery), { tax_name: tax_elm.code.substring(0, 2), airline, status: true }));
                    if (supplier_data.length) {
                        if (supplier_data[0].markup_type === "FLAT") {
                            markup += Number(supplier_data[0].markup);
                        }
                        else if (supplier_data[0].markup_type === "PER") {
                            markup +=
                                Number(tax_elm.amount) * (Number(supplier_data[0].markup) / 100);
                        }
                        if (supplier_data[0].commission_type === "FLAT") {
                            commission += Number(supplier_data[0].commission);
                        }
                        else if (supplier_data[0].commission_type === "PER") {
                            commission +=
                                Number(tax_elm.amount) * (Number(supplier_data[0].commission) / 100);
                        }
                    }
                }
            }
            let agent_markup = 0.0;
            let agent_discount = 0.0;
            if (markup_amount) {
                if (markup_amount.markup_type === 'PER') {
                    if (markup_amount.markup_mode === 'INCREASE') {
                        agent_markup = Number(markup) * (Number(markup_amount.markup) / 100);
                    }
                    if (markup_amount.markup_mode === 'DECREASE') {
                        agent_discount = Number(commission) * (Number(markup_amount.markup) / 100);
                    }
                }
            }
            return {
                tax_markup: Number(markup),
                tax_commission: Number(commission),
                agent_tax_markup: agent_markup,
                agent_tax_discount: agent_discount
            };
        });
    }
    crossCheckPax({ bookingPax, searchPax, }) {
        for (const reqPax of searchPax) {
            const { Code, Quantity } = reqPax;
            const found = bookingPax.filter((pax) => pax.type === Code);
            if (!found.length) {
                throw new customError_1.default('Passenger data is invalid.', this.StatusCode.HTTP_BAD_REQUEST);
            }
            if (found.length !== Quantity) {
                throw new customError_1.default('Passenger data is invalid.', this.StatusCode.HTTP_BAD_REQUEST);
            }
            if (Code.startsWith('C')) {
                const childAge = Number(Code.split('C')[1]);
                if (!childAge || childAge > 11) {
                    throw new customError_1.default(`Passenger data ${Code} is invalid.`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                const DobAge = dateTimeLib_1.default.calculateAge(found[0].date_of_birth);
                if (childAge === 11) {
                    // if (DobAge < 12 && DobAge > 4) {
                    //   throw new CustomError(
                    //     `Passenger(${Code}) age and dob is invalid.`,
                    //     this.StatusCode.HTTP_BAD_REQUEST
                    //   );
                    // }
                }
                else if (childAge === 4) {
                    // if (DobAge < 5 && DobAge > 3) {
                    //   throw new CustomError(
                    //     `Passenger(${Code}) age and dob is invalid.`,
                    //     this.StatusCode.HTTP_BAD_REQUEST
                    //   );
                    // }
                }
                else if (DobAge !== childAge) {
                    throw new customError_1.default(`Passenger(${Code}) age and dob is invalid.`, this.StatusCode.HTTP_BAD_REQUEST);
                }
            }
        }
    }
    // find route type
    routeTypeFinder({ airportsPayload, originDest, }) {
        let route_type = flightConstant_1.ROUTE_TYPE.SOTO;
        let airports = [];
        if (originDest) {
            originDest.forEach((item) => {
                airports.push(item.OriginLocation.LocationCode);
                airports.push(item.DestinationLocation.LocationCode);
            });
        }
        else if (airportsPayload) {
            airports = airportsPayload;
        }
        if (airports.every((airport) => staticData_1.BD_AIRPORT.includes(airport))) {
            route_type = flightConstant_1.ROUTE_TYPE.DOMESTIC;
        }
        else if (staticData_1.BD_AIRPORT.includes(airports[0])) {
            route_type = flightConstant_1.ROUTE_TYPE.FROM_DAC;
        }
        else if (airports.some((code) => staticData_1.BD_AIRPORT.includes(code))) {
            route_type = flightConstant_1.ROUTE_TYPE.TO_DAC;
        }
        else {
            route_type = flightConstant_1.ROUTE_TYPE.SOTO;
        }
        return route_type;
    }
}
exports.CommonFlightSupportService = CommonFlightSupportService;
