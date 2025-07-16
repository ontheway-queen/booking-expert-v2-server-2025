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
exports.AgentB2CFlightService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const flightConstent_1 = require("../../../utils/miscellaneous/flightConstent");
const sabreFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service"));
const wfttFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/wfttFlightSupport.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const uuid_1 = require("uuid");
const redis_1 = require("../../../app/redis");
const commonFlightSupport_service_1 = require("../../../utils/supportServices/flightSupportServices/commonFlightSupport.service");
const commonFlightBookingSupport_service_1 = require("../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/commonFlightBookingSupport.service");
const flightUtils_1 = __importDefault(require("../../../utils/lib/flight/flightUtils"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class AgentB2CFlightService extends abstract_service_1.default {
    flightSearch(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
                const body = req.body;
                //get flight markup set id
                const agencyModel = this.Model.AgencyModel(trx);
                const agency_details = yield agencyModel.checkAgency({ agency_id });
                if (!(agency_details === null || agency_details === void 0 ? void 0 : agency_details.flight_markup_set)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                //get b2c markup
                const markup_amount = yield lib_1.default.getAgentB2CTotalMarkup({
                    trx,
                    type: 'Flight',
                    agency_id,
                });
                if (!markup_amount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Markup information is empty. Contact with the authority',
                    };
                }
                const markupSetFlightApiModel = this.Model.DynamicFareModel(trx);
                const apiData = yield markupSetFlightApiModel.getDynamicFareSuppliers({
                    status: true,
                    set_id: agency_details.flight_markup_set,
                });
                //extract API IDs
                let sabre_set_flight_api_id = 0;
                let wftt_set_flight_api_id = 0;
                apiData.forEach((api) => {
                    if (api.sup_api === flightConstent_1.SABRE_API) {
                        sabre_set_flight_api_id = api.id;
                    }
                    if (api.sup_api === flightConstent_1.CUSTOM_API) {
                        wftt_set_flight_api_id = api.id;
                    }
                });
                let sabreData = [];
                let wfttData = [];
                if (sabre_set_flight_api_id) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    sabreData = yield sabreSubService.FlightSearch({
                        booking_block: false,
                        reqBody: body,
                        dynamic_fare_supplier_id: sabre_set_flight_api_id,
                        markup_amount,
                    });
                }
                if (wftt_set_flight_api_id) {
                    const wfttSubService = new wfttFlightSupport_service_1.default(trx);
                    wfttData = yield wfttSubService.FlightSearch({
                        booking_block: false,
                        reqBody: body,
                        dynamic_fare_supplier_id: wftt_set_flight_api_id,
                        markup_amount,
                    });
                }
                //generate search ID
                const search_id = (0, uuid_1.v4)();
                const leg_descriptions = body.OriginDestinationInformation.map((OrDeInfo) => {
                    return {
                        departureDate: OrDeInfo.DepartureDateTime,
                        departureLocation: OrDeInfo.OriginLocation.LocationCode,
                        arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
                    };
                });
                const results = [...sabreData, ...wfttData];
                results.sort((a, b) => a.fare.payable - b.fare.payable);
                const responseData = {
                    search_id,
                    journey_type: body.JourneyType,
                    leg_descriptions,
                    total: results.length,
                    results,
                };
                //save data to redis
                const dataForStore = {
                    reqBody: body,
                    response: responseData,
                };
                yield (0, redis_1.setRedis)(search_id, dataForStore);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: responseData,
                };
            }));
        });
    }
    flightSearchSSE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
                const JourneyType = req.query.JourneyType;
                const OriginDestinationInformation = req.query
                    .OriginDestinationInformation;
                const PassengerTypeQuantity = req.query
                    .PassengerTypeQuantity;
                const airline_code = req.query
                    .airline_code;
                const body = {
                    JourneyType,
                    OriginDestinationInformation,
                    PassengerTypeQuantity,
                    airline_code,
                };
                //get flight markup set id
                const agencyModel = this.Model.AgencyModel(trx);
                const agency_details = yield agencyModel.checkAgency({ agency_id });
                if (!(agency_details === null || agency_details === void 0 ? void 0 : agency_details.flight_markup_set)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                const markupSetFlightApiModel = this.Model.DynamicFareModel(trx);
                const apiData = yield markupSetFlightApiModel.getDynamicFareSuppliers({
                    status: true,
                    set_id: agency_details === null || agency_details === void 0 ? void 0 : agency_details.flight_markup_set,
                });
                //get b2c markup
                const markup_amount = yield lib_1.default.getAgentB2CTotalMarkup({
                    trx,
                    type: 'Flight',
                    agency_id,
                });
                if (!markup_amount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Markup information is empty. Contact with the authority',
                    };
                }
                //extract API IDs
                let sabre_set_flight_api_id = 0;
                let wftt_set_flight_api_id = 0;
                apiData.forEach((api) => {
                    if (api.sup_api === flightConstent_1.SABRE_API) {
                        sabre_set_flight_api_id = api.id;
                    }
                    if (api.sup_api === flightConstent_1.CUSTOM_API) {
                        wftt_set_flight_api_id = api.id;
                    }
                });
                //generate search ID
                const search_id = (0, uuid_1.v4)();
                const leg_descriptions = body.OriginDestinationInformation.map((OrDeInfo) => {
                    return {
                        departureDate: OrDeInfo.DepartureDateTime,
                        departureLocation: OrDeInfo.OriginLocation.LocationCode,
                        arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
                    };
                });
                res.write('event: search_info\n');
                res.write(`data: ${JSON.stringify({
                    search_id,
                    leg_description: leg_descriptions,
                })}\n\n`);
                // Initialize Redis storage
                const responseData = {
                    search_id,
                    journey_type: JourneyType,
                    leg_descriptions,
                    total: 0,
                    results: [],
                };
                yield (0, redis_1.setRedis)(search_id, { reqBody: body, response: responseData });
                const data = [];
                const sendResults = (apiName, fetchResults) => __awaiter(this, void 0, void 0, function* () {
                    const results = yield fetchResults();
                    // Update results list and Redis
                    responseData.results.push(...results);
                    responseData.total = responseData.results.length;
                    // Stream results to client
                    results.forEach((result) => {
                        data.push(result);
                        res.write(`data: ${JSON.stringify(result)}\n\n`);
                    });
                    // Update Redis after receiving results
                    yield (0, redis_1.setRedis)(search_id, { reqBody: body, response: responseData });
                });
                // Sabre results
                if (sabre_set_flight_api_id) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    yield sendResults('Sabre', () => __awaiter(this, void 0, void 0, function* () {
                        return sabreSubService.FlightSearch({
                            booking_block: false,
                            reqBody: body,
                            dynamic_fare_supplier_id: sabre_set_flight_api_id,
                            markup_amount,
                        });
                    }));
                }
                //WFTT results
                if (wftt_set_flight_api_id) {
                    const wfttSubService = new wfttFlightSupport_service_1.default(trx);
                    yield sendResults('WFTT', () => __awaiter(this, void 0, void 0, function* () {
                        return wfttSubService.FlightSearch({
                            booking_block: false,
                            reqBody: body,
                            dynamic_fare_supplier_id: wftt_set_flight_api_id,
                            markup_amount,
                        });
                    }));
                }
            }));
        });
    }
    getFlightFareRule(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { flight_id, search_id } = req.query;
                //get data from redis using the search id
                const retrievedData = yield (0, redis_1.getRedis)(search_id);
                if (!retrievedData) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const retrieveResponse = retrievedData.response;
                const foundItem = retrieveResponse.results.find((item) => item.flight_id === flight_id);
                if (!foundItem) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                let res = false;
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: res ? res : flightConstent_1.FLIGHT_FARE_RESPONSE,
                };
            }));
        });
    }
    flightRevalidate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
                const { flight_id, search_id } = req.query;
                //get flight markup set id
                const agencyModel = this.Model.AgencyModel(trx);
                const agency_details = yield agencyModel.checkAgency({ agency_id });
                if (!(agency_details === null || agency_details === void 0 ? void 0 : agency_details.flight_markup_set)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                //get b2c markup
                const markup_amount = yield lib_1.default.getAgentB2CTotalMarkup({
                    trx,
                    type: 'Flight',
                    agency_id,
                });
                if (!markup_amount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Markup information is empty. Contact with the authority',
                    };
                }
                //revalidate using the flight support service
                const flightSupportService = new commonFlightSupport_service_1.CommonFlightSupportService(trx);
                const data = yield flightSupportService.FlightRevalidate({
                    search_id,
                    flight_id,
                    dynamic_fare_set_id: agency_details.flight_markup_set,
                    markup_amount,
                });
                if (data) {
                    const { fare, modifiedFare } = data, restData = __rest(data, ["fare", "modifiedFare"]);
                    const { vendor_price } = fare, restFare = __rest(fare, ["vendor_price"]);
                    return {
                        success: true,
                        message: 'Flight has been revalidated successfully!',
                        data: Object.assign(Object.assign({}, restData), { fare: restFare }),
                        code: this.StatusCode.HTTP_OK,
                    };
                }
                return {
                    success: false,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }));
        });
    }
    flightBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, ref_agent_id, agency_type, user_id, user_email, name, phone_number, agency_email, agency_name, agency_logo, address, } = req.agencyUser;
                const body = req.body;
                const booking_confirm = body.booking_confirm;
                //get flight markup set id
                const agencyModel = this.Model.AgencyModel(trx);
                const agency_details = yield agencyModel.checkAgency({
                    agency_id: ref_agent_id || agency_id,
                });
                if (!(agency_details === null || agency_details === void 0 ? void 0 : agency_details.flight_markup_set)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No markup set has been found for the agency',
                    };
                }
                //get b2c markup
                const markup_amount = yield lib_1.default.getAgentB2CTotalMarkup({
                    trx,
                    type: 'Flight',
                    agency_id,
                });
                if (!markup_amount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Markup information is empty. Contact with the authority',
                    };
                }
                //get data from redis using the search id
                const retrievedData = yield (0, redis_1.getRedis)(body.search_id);
                if (!retrievedData) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                //revalidate the flight
                const flightSupportService = new commonFlightSupport_service_1.CommonFlightSupportService(trx);
                // Match search request pax and booking request pax details=====
                const searchReqBody = retrievedData.reqBody;
                flightSupportService.crossCheckPax({
                    bookingPax: body.passengers,
                    searchPax: searchReqBody.PassengerTypeQuantity,
                });
                // ============================================================
                let rev_data = yield flightSupportService.FlightRevalidate({
                    search_id: body.search_id,
                    flight_id: body.flight_id,
                    dynamic_fare_set_id: agency_details.flight_markup_set,
                    markup_amount,
                });
                if (!rev_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                // if price has been changed and no confirmation of booking then return
                if (!booking_confirm) {
                    const price_changed = yield flightSupportService.checkBookingPriceChange({
                        flight_id: body.flight_id,
                        booking_price: Number(rev_data.fare.payable),
                    });
                    if (price_changed === true) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            data: {
                                new_fare: rev_data.fare.payable,
                            },
                            message: this.ResMsg.BOOKING_PRICE_CHANGED,
                        };
                    }
                    else if (price_changed === null) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: this.ResMsg.REVALIDATE_BEFORE_BOOKING,
                        };
                    }
                }
                //check eligibility of the booking
                const bookingSupportService = new commonFlightBookingSupport_service_1.CommonFlightBookingSupportService(trx);
                const checkEligibilityOfBooking = yield bookingSupportService.checkEligibilityOfBooking({
                    route: new flightUtils_1.default().getRouteOfFlight(rev_data.leg_description),
                    departure_date: rev_data.flights[0].options[0].departure.date,
                    flight_number: `${rev_data.flights[0].options[0].carrier.carrier_marketing_flight_number}`,
                    domestic_flight: rev_data.domestic_flight,
                    passenger: body.passengers,
                });
                if (!checkEligibilityOfBooking.success) {
                    return checkEligibilityOfBooking;
                }
                //check if the booking is block
                const directBookingPermission = yield bookingSupportService.checkDirectFlightBookingPermission({
                    markup_set_id: agency_details.flight_markup_set,
                    api_name: rev_data.api,
                    airline: rev_data.carrier_code,
                });
                if (directBookingPermission.success === false) {
                    return directBookingPermission;
                }
                //insert the revalidate data as info log
                yield this.Model.ErrorLogsModel(trx).insertErrorLogs({
                    http_method: 'POST',
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: 'Flight booking revalidate data',
                    url: '/flight/booking',
                    user_id: user_id,
                    source: 'AGENT B2C',
                    metadata: {
                        api: rev_data.api,
                        request_body: {
                            flight_id: body.flight_id,
                            search_id: body.search_id,
                            api_search_id: rev_data.api_search_id,
                        },
                        response: rev_data,
                    },
                });
                //insert booking data with invoice
                const { booking_id, booking_ref } = yield bookingSupportService.insertFlightBookingData({
                    status: flightConstent_1.FLIGHT_BOOKING_IN_PROCESS,
                    user_id,
                    user_name: name,
                    user_email,
                    files: req.files || [],
                    refundable: rev_data.refundable,
                    flight_data: rev_data,
                    traveler_data: body.passengers,
                    type: 'Agent_Flight',
                    source_type: constants_1.SOURCE_AGENT_B2C,
                    source_id: agency_id,
                    invoice_ref_type: constants_1.TYPE_FLIGHT,
                    booking_block: directBookingPermission.booking_block,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        booking_id,
                        booking_ref,
                    },
                };
            }));
        });
    }
    getAllBookingList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
                const { user_id } = req.agencyB2CUser;
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const query = req.query;
                const data = yield flightBookingModel.getFlightBookingList(Object.assign(Object.assign({}, query), { source_id: agency_id, created_by: user_id, booked_by: constants_1.SOURCE_AGENT_B2C }), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: data.total,
                    data: data.data,
                };
            }));
        });
    }
    getSingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
                const { user_id } = req.agencyB2CUser;
                const { id } = req.params;
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
                const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
                const flightPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(trx);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_AGENT_B2C,
                    agency_id,
                    user_id,
                });
                if (!booking_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const price_breakdown_data = yield flightPriceBreakdownModel.getFlightBookingPriceBreakdown(Number(id));
                const segment_data = yield flightSegmentModel.getFlightBookingSegment(Number(id));
                const traveler_data = yield flightTravelerModel.getFlightBookingTraveler(Number(id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: Object.assign(Object.assign({}, booking_data), { price_breakdown_data,
                        segment_data,
                        traveler_data }),
                };
            }));
        });
    }
}
exports.AgentB2CFlightService = AgentB2CFlightService;
