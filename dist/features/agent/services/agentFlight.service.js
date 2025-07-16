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
exports.AgentFlightService = void 0;
const uuid_1 = require("uuid");
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const redis_1 = require("../../../app/redis");
const flightUtils_1 = __importDefault(require("../../../utils/lib/flight/flightUtils"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const flightConstent_1 = require("../../../utils/miscellaneous/flightConstent");
const agentFlightBookingSupport_service_1 = require("../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/agentFlightBookingSupport.service");
const commonFlightBookingSupport_service_1 = require("../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/commonFlightBookingSupport.service");
const commonFlightSupport_service_1 = require("../../../utils/supportServices/flightSupportServices/commonFlightSupport.service");
const sabreFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service"));
const wfttFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/wfttFlightSupport.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class AgentFlightService extends abstract_service_1.default {
    constructor() {
        super();
    }
    flightSearch(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, agency_type, ref_agent_id } = req.agencyUser;
                const body = req.body;
                if (body.JourneyType === '3') {
                    if (body.OriginDestinationInformation.length < 2) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Invalid JourneyType/OriginDestinationInformation',
                        };
                    }
                }
                else {
                    if (Number(body.JourneyType) !== body.OriginDestinationInformation.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Invalid JourneyType/OriginDestinationInformation',
                        };
                    }
                }
                //get flight markup set id
                const agencyModel = this.Model.AgencyModel(trx);
                const agency_details = yield agencyModel.checkAgency({
                    agency_id: ref_agent_id || agency_id,
                });
                if (!(agency_details === null || agency_details === void 0 ? void 0 : agency_details.flight_markup_set)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                //get sub agent markup
                let markup_amount = undefined;
                if (agency_type === 'Sub Agent') {
                    markup_amount = yield lib_1.default.getSubAgentTotalMarkup({
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
                }
                const markupSetFlightApiModel = this.Model.DynamicFareModel(trx);
                const apiData = yield markupSetFlightApiModel.getDynamicFareSuppliers({
                    status: true,
                    set_id: agency_details.flight_markup_set,
                });
                //extract API IDs
                let sabre_supplier_id = 0;
                let custom_supplier_id = 0;
                apiData.forEach((api) => {
                    if (api.sup_api === flightConstent_1.SABRE_API) {
                        sabre_supplier_id = api.id;
                    }
                    if (api.sup_api === flightConstent_1.CUSTOM_API) {
                        custom_supplier_id = api.id;
                    }
                });
                let sabreData = [];
                let customData = [];
                console.log({ set: agency_details.flight_markup_set, markup_amount });
                if (sabre_supplier_id) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    sabreData = yield sabreSubService.FlightSearch({
                        booking_block: false,
                        reqBody: body,
                        dynamic_fare_supplier_id: sabre_supplier_id,
                        markup_amount,
                    });
                }
                if (custom_supplier_id) {
                    const customSubService = new wfttFlightSupport_service_1.default(trx);
                    customData = yield customSubService.FlightSearch({
                        booking_block: false,
                        reqBody: body,
                        dynamic_fare_supplier_id: custom_supplier_id,
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
                const results = [...sabreData, ...customData];
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
                const { agency_id, agency_type, ref_agent_id } = req.agencyUser;
                const JourneyType = req.query.JourneyType;
                const OriginDestinationInformation = req.query
                    .OriginDestinationInformation;
                const PassengerTypeQuantity = req.query
                    .PassengerTypeQuantity;
                const airline_code = req.query
                    .airline_code;
                if (JourneyType === '3') {
                    if (OriginDestinationInformation.length < 2) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Invalid JourneyType/OriginDestinationInformation',
                        };
                    }
                }
                else {
                    if (Number(JourneyType) !== OriginDestinationInformation.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Invalid JourneyType/OriginDestinationInformation',
                        };
                    }
                }
                const body = {
                    JourneyType,
                    OriginDestinationInformation,
                    PassengerTypeQuantity,
                    airline_code,
                };
                //get flight markup set id
                const agencyModel = this.Model.AgencyModel(trx);
                const agency_details = yield agencyModel.checkAgency({
                    agency_id: ref_agent_id || agency_id,
                });
                if (!(agency_details === null || agency_details === void 0 ? void 0 : agency_details.flight_markup_set)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                //get sub agent markup
                let markup_amount = undefined;
                if (agency_type === 'Sub Agent') {
                    markup_amount = yield lib_1.default.getSubAgentTotalMarkup({
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
                }
                const markupSetFlightApiModel = this.Model.DynamicFareModel(trx);
                const apiData = yield markupSetFlightApiModel.getDynamicFareSuppliers({
                    status: true,
                    set_id: agency_details.flight_markup_set,
                });
                //extract API IDs
                let sabre_supplier_id = 0;
                let custom_supplier_id = 0;
                apiData.forEach((api) => {
                    if (api.sup_api === flightConstent_1.SABRE_API) {
                        sabre_supplier_id = api.id;
                    }
                    if (api.sup_api === flightConstent_1.CUSTOM_API) {
                        custom_supplier_id = api.id;
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
                if (sabre_supplier_id) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    yield sendResults('Sabre', () => __awaiter(this, void 0, void 0, function* () {
                        return sabreSubService.FlightSearch({
                            booking_block: false,
                            reqBody: body,
                            dynamic_fare_supplier_id: sabre_supplier_id,
                            markup_amount,
                        });
                    }));
                }
                //WFTT results
                if (custom_supplier_id) {
                    const wfttSubService = new wfttFlightSupport_service_1.default(trx);
                    yield sendResults('WFTT', () => __awaiter(this, void 0, void 0, function* () {
                        return wfttSubService.FlightSearch({
                            booking_block: false,
                            reqBody: body,
                            dynamic_fare_supplier_id: custom_supplier_id,
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
                const { agency_id, ref_agent_id, agency_type } = req.agencyUser;
                const { flight_id, search_id } = req.query;
                //get flight markup set id
                const agencyModel = this.Model.AgencyModel(trx);
                const agency_details = yield agencyModel.checkAgency({
                    agency_id: ref_agent_id || agency_id,
                });
                if (!(agency_details === null || agency_details === void 0 ? void 0 : agency_details.flight_markup_set)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                //get sub agent markup
                let markup_amount = undefined;
                if (agency_type === 'Sub Agent') {
                    markup_amount = yield lib_1.default.getSubAgentTotalMarkup({
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
                }
                //revalidate using the flight support service
                const flightSupportService = new commonFlightSupport_service_1.CommonFlightSupportService(trx);
                console.log({ set: agency_details.flight_markup_set, markup_amount });
                const data = yield flightSupportService.FlightRevalidate({
                    search_id,
                    flight_id,
                    dynamic_fare_set_id: agency_details.flight_markup_set,
                    markup_amount,
                });
                if (data) {
                    yield (0, redis_1.setRedis)(`${flightConstent_1.FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
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
            const { agency_id, ref_agent_id, agency_type, user_id, user_email, name, phone_number, agency_email, agency_name, agency_logo, address, } = req.agencyUser;
            const body = req.body;
            let booking_block = false;
            let refundable = false;
            let api_booking_ref = null;
            let data;
            let new_booking_id;
            let new_booking_ref;
            const payload = {
                status: flightConstent_1.FLIGHT_BOOKING_PENDING,
            };
            const preBookData = yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
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
                //get sub agent markup
                let markup_amount = undefined;
                if (agency_type === 'Sub Agent') {
                    markup_amount = yield lib_1.default.getSubAgentTotalMarkup({
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
                data = rev_data;
                refundable = data.refundable;
                // if price has been changed and no confirmation of booking then return
                if (!booking_confirm) {
                    const price_changed = yield flightSupportService.checkBookingPriceChange({
                        flight_id: body.flight_id,
                        booking_price: Number(data.fare.payable),
                    });
                    if (price_changed === true) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            data: {
                                new_fare: data.fare.payable,
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
                    route: new flightUtils_1.default().getRouteOfFlight(data.leg_description),
                    departure_date: data.flights[0].options[0].departure.date,
                    flight_number: `${data.flights[0].options[0].carrier.carrier_marketing_flight_number}`,
                    domestic_flight: data.domestic_flight,
                    passenger: body.passengers,
                });
                if (!checkEligibilityOfBooking.success) {
                    return checkEligibilityOfBooking;
                }
                //check if the booking is block
                const directBookingPermission = yield bookingSupportService.checkDirectFlightBookingPermission({
                    markup_set_id: agency_details.flight_markup_set,
                    api_name: data.api,
                    airline: data.carrier_code,
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
                    source: 'AGENT',
                    metadata: {
                        api: data.api,
                        request_body: {
                            flight_id: body.flight_id,
                            search_id: body.search_id,
                            api_search_id: data.api_search_id,
                        },
                        response: data,
                    },
                });
                //insert booking data with invoice
                const { booking_id, booking_ref } = yield bookingSupportService.insertFlightBookingData({
                    gds_pnr: payload.gds_pnr,
                    airline_pnr: payload.airline_pnr,
                    status: flightConstent_1.FLIGHT_BOOKING_PENDING,
                    api_booking_ref,
                    user_id,
                    user_name: name,
                    user_email,
                    files: req.files || [],
                    refundable,
                    flight_data: data,
                    traveler_data: body.passengers,
                    type: 'Agent_Flight',
                    source_type: constants_1.SOURCE_AGENT,
                    source_id: agency_id,
                    invoice_ref_type: constants_1.TYPE_FLIGHT,
                    booking_block: directBookingPermission.booking_block,
                });
                new_booking_id = booking_id;
                new_booking_ref = booking_ref;
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
            if (!preBookData.success) {
                return preBookData;
            }
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (booking_block === false) {
                        if (data.api === flightConstent_1.SABRE_API) {
                            const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                            const gds_pnr = yield sabreSubService.FlightBookingService({
                                body,
                                user_info: {
                                    id: user_id,
                                    name,
                                    email: user_email,
                                    phone: phone_number || '',
                                },
                                revalidate_data: data,
                            });
                            if (gds_pnr) {
                                payload.gds_pnr = gds_pnr;
                            }
                            //get airline pnr, refundable status
                            const grnData = yield sabreSubService.GRNUpdate({
                                pnr: String(gds_pnr),
                            });
                            refundable = grnData.refundable;
                            payload.status = flightConstent_1.FLIGHT_BOOKING_CONFIRMED;
                            if (grnData.airline_pnr) {
                                payload.airline_pnr = grnData.airline_pnr;
                            }
                        }
                        else if (data.api === flightConstent_1.CUSTOM_API) {
                            payload.status = flightConstent_1.FLIGHT_BOOKING_IN_PROCESS;
                        }
                    }
                    else {
                        payload.status = flightConstent_1.FLIGHT_BOOKING_IN_PROCESS;
                    }
                }
                catch (err) {
                    console.log({ err });
                    yield this.Model.ErrorLogsModel(trx).insertErrorLogs({
                        http_method: 'POST',
                        level: constants_1.ERROR_LEVEL_ERROR,
                        message: 'Error on flight booking.' + err,
                        url: '/flight/booking',
                        user_id: user_id,
                        source: 'AGENT',
                        metadata: {
                            api: data.api,
                            request_body: {
                                flight_id: body.flight_id,
                                search_id: body.search_id,
                                api_search_id: data.api_search_id,
                            },
                            response: data,
                        },
                    });
                    //check eligibility of the booking
                    const bookingSupportService = new commonFlightBookingSupport_service_1.CommonFlightBookingSupportService(trx);
                    yield bookingSupportService.deleteFlightBookingData({
                        id: new_booking_id,
                        source_type: constants_1.SOURCE_AGENT,
                    });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Cannot book the flight right now. Please try again.',
                    };
                }
                try {
                    const flightBookingModel = this.Model.FlightBookingModel(trx);
                    yield flightBookingModel.updateFlightBooking(payload, {
                        id: new_booking_id,
                        source_type: constants_1.SOURCE_AGENT,
                    });
                    //send email
                    const bookingSubService = new commonFlightBookingSupport_service_1.CommonFlightBookingSupportService(trx);
                    yield bookingSubService.sendFlightBookingMail({
                        booking_id: new_booking_id,
                        email: agency_email,
                        booked_by: constants_1.SOURCE_AGENT,
                        agency: {
                            email: agency_email,
                            name: agency_name,
                            phone: String(phone_number),
                            address: address,
                            photo: agency_logo,
                        },
                        panel_link: `${constants_1.AGENT_PROJECT_LINK}${constants_1.FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT}${new_booking_id}`,
                    });
                }
                catch (err) {
                    console.log({ err });
                    yield this.Model.ErrorLogsModel(trx).insertErrorLogs({
                        http_method: 'POST',
                        level: constants_1.ERROR_LEVEL_ERROR,
                        message: 'Error update booking or Email send after booking.' + err,
                        url: '/flight/booking',
                        user_id: user_id,
                        source: 'AGENT',
                        metadata: {
                            api: 'Update Booking or Email send.',
                            request_body: err,
                            response: data,
                        },
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'The flight has been booked successfully!',
                    data: {
                        new_booking_id,
                        new_booking_ref,
                        gds_pnr: payload.gds_pnr,
                        status: payload.status,
                    },
                };
            }));
        });
    }
    getAllBookingList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const query = req.query;
                const data = yield flightBookingModel.getFlightBookingList(Object.assign(Object.assign({}, query), { source_id: agency_id, booked_by: constants_1.SOURCE_AGENT }), true);
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
                const { agency_id } = req.agencyUser;
                const { id } = req.params;
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
                const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
                const flightPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(trx);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_AGENT,
                    agency_id,
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
    issueTicket(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params; //booking id
                const { agency_id, user_id, agency_email, agency_name, phone_number, agency_logo, address, } = req.agencyUser;
                //get flight details
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const bookingTravelerModel = this.Model.FlightBookingTravelerModel(trx);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_AGENT,
                    agency_id,
                });
                if (!booking_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                //get other information
                const get_travelers = yield bookingTravelerModel.getFlightBookingTraveler(Number(id));
                const { payment_type } = req.body;
                //get payment details
                const bookingSubService = new commonFlightBookingSupport_service_1.CommonFlightBookingSupportService(trx);
                const agentBookingSubService = new agentFlightBookingSupport_service_1.AgentFlightBookingSupportService(trx);
                const payment_data = yield agentBookingSubService.getPaymentInformation({
                    booking_id: Number(id),
                    payment_type: payment_type,
                    refundable: booking_data.refundable,
                    departure_date: booking_data.travel_date,
                    agency_id: agency_id,
                    ticket_price: booking_data.payable_amount,
                });
                if (payment_data.success === false) {
                    return payment_data;
                }
                //check direct ticket issue permission
                const flightSegmentsModel = this.Model.FlightBookingSegmentModel(trx);
                const flightSegment = yield flightSegmentsModel.getFlightBookingSegment(Number(id));
                const agentFlightBookingSupportService = new agentFlightBookingSupport_service_1.AgentFlightBookingSupportService(trx);
                const ticketIssuePermission = yield agentFlightBookingSupportService.checkAgentDirectTicketIssuePermission({
                    agency_id: agency_id,
                    api_name: booking_data.api,
                    airline: flightSegment[0].airline_code,
                });
                if (ticketIssuePermission.success === false) {
                    return ticketIssuePermission;
                }
                let status = null;
                if (ticketIssuePermission.issue_block === true) {
                    status = flightConstent_1.FLIGHT_TICKET_IN_PROCESS;
                }
                else if (booking_data.api === flightConstent_1.CUSTOM_API) {
                    status = flightConstent_1.FLIGHT_TICKET_IN_PROCESS;
                }
                else {
                    //issue ticket using API
                    if (booking_data.api === flightConstent_1.SABRE_API) {
                        const travelerSet = new Set(get_travelers.map((elem) => elem.type));
                        const unique_traveler = travelerSet.size;
                        const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                        const res = yield sabreSubService.TicketIssueService({
                            pnr: String(booking_data.gds_pnr),
                            unique_traveler,
                        });
                        if (res === null || res === void 0 ? void 0 : res.success) {
                            status = flightConstent_1.FLIGHT_TICKET_ISSUE;
                        }
                    }
                }
                if (status !== null) {
                    yield agentFlightBookingSupportService.updateDataAfterTicketIssue({
                        booking_id: Number(id),
                        status,
                        due: Number(payment_data.due),
                        agency_id: agency_id,
                        booking_ref: booking_data.booking_ref,
                        deduct_amount_from: payment_data.deduct_amount_from,
                        paid_amount: Number(payment_data.paid_amount),
                        loan_amount: Number(payment_data.loan_amount),
                        invoice_id: Number(payment_data.invoice_id),
                        user_id,
                        issued_by_type: constants_1.SOURCE_AGENT,
                        issued_by_user_id: user_id,
                        issue_block: ticketIssuePermission.issue_block,
                        api: booking_data.api,
                    });
                    //send email
                    yield bookingSubService.sendTicketIssueMail({
                        booking_id: Number(id),
                        email: agency_email,
                        booked_by: constants_1.SOURCE_AGENT,
                        agency: {
                            email: agency_email,
                            name: agency_name,
                            phone: String(phone_number),
                            address: address,
                            photo: agency_logo,
                        },
                        panel_link: `${constants_1.AGENT_PROJECT_LINK}${constants_1.FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT}${id}`,
                        due: Number(payment_data.due),
                    });
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'Ticket has been issued successfully!',
                        data: {
                            status,
                            due: payment_data.due,
                            paid_amount: payment_data.paid_amount,
                            loan_amount: payment_data.loan_amount,
                        },
                    };
                }
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'Cannot issue ticket for this booking. Contact support team.',
                };
            }));
        });
    }
    cancelBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, agency_id, agency_email, agency_logo } = req.agencyUser;
                const { id } = req.params; //booking id
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_AGENT,
                    agency_id,
                });
                if (!booking_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (![
                    flightConstent_1.FLIGHT_BOOKING_CONFIRMED,
                    flightConstent_1.FLIGHT_BOOKING_PENDING,
                    flightConstent_1.FLIGHT_BOOKING_IN_PROCESS,
                ].includes(booking_data.status)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Cancellation is not allowed for this booking. Contact support team.',
                    };
                }
                let status = false;
                if (booking_data.api === flightConstent_1.SABRE_API) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    const res = yield sabreSubService.SabreBookingCancelService({
                        pnr: String(booking_data.gds_pnr),
                    });
                    if (res === null || res === void 0 ? void 0 : res.success) {
                        status = true;
                    }
                }
                else if (booking_data.api === flightConstent_1.CUSTOM_API) {
                    status = true;
                }
                if (status) {
                    const flightBookingSupportService = new commonFlightBookingSupport_service_1.CommonFlightBookingSupportService(trx);
                    //update booking data
                    yield flightBookingSupportService.updateDataAfterBookingCancel({
                        booking_id: Number(id),
                        booking_ref: booking_data.booking_ref,
                        cancelled_by_type: constants_1.SOURCE_AGENT,
                        cancelled_by_user_id: user_id,
                        api: booking_data.api,
                    });
                    //send email
                    yield flightBookingSupportService.sendBookingCancelMail({
                        email: agency_email,
                        booking_data,
                        agency: {
                            photo: agency_logo,
                        },
                        panel_link: `${constants_1.AGENT_PROJECT_LINK}${constants_1.FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT}${id}`,
                    });
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'Booking has been cancelled successfully!',
                    };
                }
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'Cannot cancel this booking. Contact support team.',
                };
            }));
        });
    }
}
exports.AgentFlightService = AgentFlightService;
