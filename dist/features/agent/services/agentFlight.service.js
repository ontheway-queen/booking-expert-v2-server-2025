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
exports.AgentFlightService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const flightConstent_1 = require("../../../utils/miscellaneous/flightConstent");
const uuid_1 = require("uuid");
const redis_1 = require("../../../app/redis");
const sabreFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service"));
const commonFlightSupport_service_1 = require("../../../utils/supportServices/flightSupportServices/commonFlightSupport.service");
const flightUtils_1 = __importDefault(require("../../../utils/lib/flight/flightUtils"));
const commonFlightBookingSupport_service_1 = require("../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/commonFlightBookingSupport.service");
const constants_1 = require("../../../utils/miscellaneous/constants");
class AgentFlightService extends abstract_service_1.default {
    constructor() {
        super();
    }
    flightSearch(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
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
                const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
                const apiData = yield markupSetFlightApiModel.getMarkupSetFlightApi({
                    status: true,
                    markup_set_id: agency_details.flight_markup_set
                });
                //extract API IDs
                let sabre_set_flight_api_id = 0;
                apiData.forEach((api) => {
                    if (api.api_name === flightConstent_1.SABRE_API) {
                        sabre_set_flight_api_id = api.id;
                    }
                });
                let sabreData = [];
                if (sabre_set_flight_api_id) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    sabreData = yield sabreSubService.FlightSearch({
                        booking_block: false,
                        markup_set_id: agency_details.flight_markup_set,
                        reqBody: body,
                        set_flight_api_id: sabre_set_flight_api_id,
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
                const results = [...sabreData];
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
                const { agency_id } = req.agencyUser;
                const JourneyType = req.query.JourneyType;
                const OriginDestinationInformation = req.query.OriginDestinationInformation;
                const PassengerTypeQuantity = req.query.PassengerTypeQuantity;
                const airline_code = req.query.airline_code;
                const body = {
                    JourneyType,
                    OriginDestinationInformation,
                    PassengerTypeQuantity,
                    airline_code
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
                const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
                const apiData = yield markupSetFlightApiModel.getMarkupSetFlightApi({
                    status: true,
                    markup_set_id: agency_details.flight_markup_set
                });
                //extract API IDs
                let sabre_set_flight_api_id = 0;
                apiData.forEach((api) => {
                    if (api.api_name === flightConstent_1.SABRE_API) {
                        sabre_set_flight_api_id = api.id;
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
                res.write(`data: ${JSON.stringify({ search_id, leg_description: leg_descriptions })}\n\n`);
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
                            markup_set_id: agency_details.flight_markup_set,
                            reqBody: body,
                            set_flight_api_id: sabre_set_flight_api_id,
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
                    data: res ? res : flightConstent_1.FLIGHT_FARE_RESPONSE
                };
            }));
        });
    }
    flightRevalidate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
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
                //revalidate using the flight support service
                const flightSupportService = new commonFlightSupport_service_1.CommonFlightSupportService(trx);
                const data = yield flightSupportService.FlightRevalidate({
                    search_id,
                    flight_id,
                    markup_set_id: agency_details.flight_markup_set
                });
                if (data) {
                    yield (0, redis_1.setRedis)(`${flightConstent_1.FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
                    return {
                        success: true,
                        message: "Ticket has been revalidated successfully!",
                        data,
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
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id, user_email, name, phone_number } = req.agencyUser;
                const body = req.body;
                const booking_confirm = req.query.booking_confirm;
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
                //revalidate
                const flightSupportService = new commonFlightSupport_service_1.CommonFlightSupportService(trx);
                const data = yield flightSupportService.FlightRevalidate({
                    search_id: body.search_id,
                    flight_id: body.flight_id,
                    markup_set_id: agency_details.flight_markup_set
                });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                //if price has been changed and no confirmation of booking then return
                if (!booking_confirm) {
                    const price_changed = yield flightSupportService.checkBookingPriceChange({ flight_id: body.flight_id, booking_price: data.fare.total_price });
                    if (price_changed === true) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: this.ResMsg.BOOKING_PRICE_CHANGED
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
                    passenger: body.passengers
                });
                if (!checkEligibilityOfBooking.success) {
                    return checkEligibilityOfBooking;
                }
                //check if the booking is block
                const directBookingPermission = yield bookingSupportService.checkDirectFlightBookingPermission({
                    markup_set_id: agency_details.flight_markup_set,
                    api_name: data.api,
                    airline: data.carrier_code
                });
                if (directBookingPermission.success === false) {
                    return directBookingPermission;
                }
                //if booking is not blocked then book the flight using API
                let airline_pnr = null;
                let refundable = data.refundable;
                let gds_pnr = null;
                let api_booking_ref = null;
                if (directBookingPermission.booking_block === false) {
                    if (data.api === flightConstent_1.SABRE_API) {
                        const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                        gds_pnr = yield sabreSubService.FlightBookingService({
                            body,
                            user_info: { id: user_id, name, email: user_email, phone: phone_number || "" },
                            revalidate_data: data
                        });
                        //get airline pnr, refundable status
                        const grnData = yield sabreSubService.GRNUpdate({
                            pnr: String(gds_pnr),
                        });
                        airline_pnr = grnData.airline_pnr;
                        refundable = grnData.refundable;
                    }
                }
                //insert booking data
                const { booking_id, booking_ref } = yield bookingSupportService.insertFlightBookingData({
                    gds_pnr,
                    airline_pnr,
                    status: directBookingPermission.booking_block ? flightConstent_1.FLIGHT_BOOKING_IN_PROCESS : flightConstent_1.FLIGHT_BOOKING_CONFIRMED,
                    api_booking_ref,
                    user_id,
                    user_name: name,
                    user_email,
                    files: req.files || [],
                    refundable,
                    last_time: data.ticket_last_time,
                    flight_data: data,
                    traveler_data: body.passengers,
                    type: "Agent_Flight",
                    source_type: constants_1.SOURCE_AGENT,
                    source_id: agency_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "The flight has been booked successfully!",
                    data: {
                        booking_id,
                        booking_ref,
                        gds_pnr,
                        status: directBookingPermission.booking_block ? flightConstent_1.FLIGHT_BOOKING_IN_PROCESS : flightConstent_1.FLIGHT_BOOKING_CONFIRMED
                    }
                };
            }));
        });
    }
}
exports.AgentFlightService = AgentFlightService;
