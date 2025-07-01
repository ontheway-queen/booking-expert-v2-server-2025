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
exports.B2CFlightService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const flightConstent_1 = require("../../../utils/miscellaneous/flightConstent");
const sabreFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service"));
const wfttFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/wfttFlightSupport.service"));
const uuid_1 = require("uuid");
const redis_1 = require("../../../app/redis");
const commonFlightSupport_service_1 = require("../../../utils/supportServices/flightSupportServices/commonFlightSupport.service");
const constants_1 = require("../../../utils/miscellaneous/constants");
class B2CFlightService extends abstract_service_1.default {
    constructor() {
        super();
    }
    flightSearch(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                //get flight markup set id
                const b2cMarkupConfig = this.Model.B2CMarkupConfigModel(trx);
                const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
                const markupSet = yield b2cMarkupConfig.getB2CMarkupConfigData('Flight');
                if (!markupSet.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                const markup_set_id = markupSet[0].markup_set_id;
                const apiData = yield markupSetFlightApiModel.getMarkupSetFlightApi({
                    status: true,
                    markup_set_id,
                });
                //extract API IDs
                let sabre_set_flight_api_id = 0;
                let wftt_set_flight_api_id = 0;
                apiData.forEach((api) => {
                    if (api.api_name === flightConstent_1.SABRE_API) {
                        sabre_set_flight_api_id = api.id;
                    }
                    if (api.api_name === flightConstent_1.WFTT_API) {
                        wftt_set_flight_api_id = api.id;
                    }
                });
                let sabreData = [];
                let wfttData = [];
                if (sabre_set_flight_api_id) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    sabreData = yield sabreSubService.FlightSearch({
                        booking_block: false,
                        markup_set_id,
                        reqBody: body,
                        set_flight_api_id: sabre_set_flight_api_id,
                    });
                }
                if (wftt_set_flight_api_id) {
                    const wfttSubService = new wfttFlightSupport_service_1.default(trx);
                    wfttData = yield wfttSubService.FlightSearch({
                        booking_block: false,
                        markup_set_id,
                        reqBody: body,
                        set_flight_api_id: wftt_set_flight_api_id,
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
                const JourneyType = req.query.JourneyType;
                const OriginDestinationInformation = req.query
                    .OriginDestinationInformation;
                const PassengerTypeQuantity = req.query
                    .PassengerTypeQuantity;
                const airline_code = req.query
                    .airline_code;
                const b2cMarkupConfig = this.Model.B2CMarkupConfigModel(trx);
                const markupSet = yield b2cMarkupConfig.getB2CMarkupConfigData('Flight');
                if (!markupSet.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                const markup_set_id = markupSet[0].markup_set_id;
                const body = {
                    JourneyType,
                    OriginDestinationInformation,
                    PassengerTypeQuantity,
                    airline_code,
                };
                const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
                const apiData = yield markupSetFlightApiModel.getMarkupSetFlightApi({
                    status: true,
                    markup_set_id,
                });
                //extract API IDs
                let sabre_set_flight_api_id = 0;
                let wftt_set_flight_api_id = 0;
                apiData.forEach((api) => {
                    if (api.api_name === flightConstent_1.SABRE_API) {
                        sabre_set_flight_api_id = api.id;
                    }
                    if (api.api_name === flightConstent_1.WFTT_API) {
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
                            markup_set_id,
                            reqBody: body,
                            set_flight_api_id: sabre_set_flight_api_id,
                        });
                    }));
                }
                //WFTT results
                if (wftt_set_flight_api_id) {
                    const wfttSubService = new wfttFlightSupport_service_1.default(trx);
                    yield sendResults('WFTT', () => __awaiter(this, void 0, void 0, function* () {
                        return wfttSubService.FlightSearch({
                            booking_block: false,
                            markup_set_id,
                            reqBody: body,
                            set_flight_api_id: wftt_set_flight_api_id,
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
                const { flight_id, search_id } = req.query;
                const b2cMarkupConfigModel = this.Model.B2CMarkupConfigModel(trx);
                const markup_set = yield b2cMarkupConfigModel.getB2CMarkupConfigData('Flight');
                if (!markup_set.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                const flight_markup_set = markup_set[0].markup_set_id;
                //revalidate using the flight support service
                const flightSupportService = new commonFlightSupport_service_1.CommonFlightSupportService(trx);
                const data = yield flightSupportService.FlightRevalidate({
                    search_id,
                    flight_id,
                    markup_set_id: flight_markup_set,
                });
                if (data === null || data === void 0 ? void 0 : data.revalidate_data) {
                    yield (0, redis_1.setRedis)(`${flightConstent_1.FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
                    return {
                        success: true,
                        message: 'Ticket has been revalidated successfully!',
                        data: Object.assign(Object.assign({}, data.revalidate_data), { remaining_time: data.redis_remaining_time }),
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
    getAllBookingList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const query = req.query;
                const data = yield flightBookingModel.getFlightBookingList(Object.assign(Object.assign({}, query), { booked_by: constants_1.SOURCE_B2C }), true);
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
                const { id } = req.params;
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
                const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
                const flightPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(trx);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_B2C,
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
exports.B2CFlightService = B2CFlightService;
