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
const uuid_1 = require("uuid");
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const config_1 = __importDefault(require("../../../config/config"));
const customError_1 = __importDefault(require("../../lib/customError"));
const flightUtils_1 = __importDefault(require("../../lib/flight/flightUtils"));
const sabreRequest_1 = __importDefault(require("../../lib/flight/sabreRequest"));
const flightConstent_1 = require("../../miscellaneous/flightConstent");
const constants_1 = require("../../miscellaneous/constants");
const sabreApiEndpoints_1 = __importDefault(require("../../miscellaneous/endpoints/sabreApiEndpoints"));
const commonFlightSupport_service_1 = require("./commonFlightSupport.service");
class SabreFlightService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.request = new sabreRequest_1.default();
        this.flightUtils = new flightUtils_1.default();
        this.trx = trx;
        this.flightSupport = new commonFlightSupport_service_1.CommonFlightSupportService(trx);
    }
    ////////////==================FLIGHT SEARCH (START)=========================///////////
    // Flight Search Request formatter
    FlightReqFormatterV5(body, dynamic_fare_supplier_id, route_type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
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
            const preferredAirlines = cappingAirlinesRaw.map((el) => el.Code);
            let finalAirlineCodes = [];
            if ((_a = body.airline_code) === null || _a === void 0 ? void 0 : _a.length) {
                const requestedAirlines = body.airline_code.map((el) => el.Code);
                if (preferredAirlines.length) {
                    // Use common values only
                    finalAirlineCodes = requestedAirlines.filter((code) => preferredAirlines.includes(code));
                    if (finalAirlineCodes.length === 0) {
                        return false;
                    }
                }
                else {
                    // No preferred, use all requested
                    finalAirlineCodes = requestedAirlines;
                }
            }
            else {
                if (preferredAirlines.length) {
                    // Only preferred exist
                    finalAirlineCodes = preferredAirlines;
                }
            }
            // Return in the format: { Code: string }[]
            const airlines = finalAirlineCodes.map((code) => ({
                Code: code,
            }));
            const originDestinationInfo = [];
            body.OriginDestinationInformation.forEach((item) => {
                let cabin = 'Y';
                switch (item.TPA_Extensions.CabinPref.Cabin) {
                    case '1':
                        cabin = 'Y';
                        break;
                    case '2':
                        cabin = 'S';
                        break;
                    case '3':
                        cabin = 'C';
                        break;
                    case '4':
                        cabin = 'F';
                        break;
                    default:
                        break;
                }
                originDestinationInfo.push(Object.assign(Object.assign({}, item), { TPA_Extensions: {
                        CabinPref: {
                            Cabin: cabin,
                            PreferLevel: item.TPA_Extensions.CabinPref.PreferLevel,
                        },
                    } }));
            });
            const reqBody = {
                OTA_AirLowFareSearchRQ: {
                    Version: '5',
                    POS: {
                        Source: [
                            {
                                PseudoCityCode: config_1.default.SABRE_USERNAME.split('-')[1],
                                RequestorID: {
                                    Type: '1',
                                    ID: '1',
                                    CompanyName: {
                                        Code: 'TN',
                                        content: 'TN',
                                    },
                                },
                            },
                        ],
                    },
                    AvailableFlightsOnly: true,
                    OriginDestinationInformation: originDestinationInfo,
                    TravelPreferences: {
                        VendorPref: airlines.length ? airlines : undefined,
                        TPA_Extensions: {
                            LongConnectTime: {
                                Enable: true,
                                Max: 1439,
                                Min: 59,
                            },
                            XOFares: {
                                Value: true,
                            },
                            KeepSameCabin: {
                                Enabled: true,
                            },
                        },
                    },
                    TravelerInfoSummary: {
                        SeatsRequested: [1],
                        AirTravelerAvail: [
                            {
                                PassengerTypeQuantity: body.PassengerTypeQuantity,
                            },
                        ],
                    },
                    TPA_Extensions: {
                        IntelliSellTransaction: {
                            RequestType: {
                                Name: flightConstent_1.SABRE_FLIGHT_ITINS,
                            },
                        },
                    },
                },
            };
            return reqBody;
        });
    }
    // Flight search service
    FlightSearch(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, booking_block, reqBody, markup_amount, }) {
            let route_type = this.flightUtils.routeTypeFinder({
                originDest: reqBody.OriginDestinationInformation,
            });
            const flightRequestBody = yield this.FlightReqFormatterV5(reqBody, dynamic_fare_supplier_id, route_type);
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.FLIGHT_SEARCH_ENDPOINT_V5, flightRequestBody);
            // return [response];
            if (!response) {
                return [];
            }
            if (response.groupedItineraryResponse.statistics.itineraryCount === 0) {
                return [];
            }
            const result = yield this.FlightSearchResFormatter({
                data: response.groupedItineraryResponse,
                reqBody: reqBody,
                dynamic_fare_supplier_id,
                booking_block,
                route_type,
                markup_amount,
            });
            return result;
        });
    }
    // Flight search Response formatter
    FlightSearchResFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, booking_block, data, reqBody, markup_amount, route_type, flight_id, }) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
            const commonModel = this.Model.CommonModel(this.trx);
            const AirlinesPreferenceModel = this.Model.AirlinesPreferenceModel(this.trx);
            const getBlockedAirlinesPayload = {
                dynamic_fare_supplier_id,
                pref_type: 'BLOCKED',
            };
            if (route_type === flightConstent_1.ROUTE_TYPE.DOMESTIC) {
                getBlockedAirlinesPayload.domestic = true;
            }
            else if (route_type === flightConstent_1.ROUTE_TYPE.FROM_DAC) {
                getBlockedAirlinesPayload.from_dac = true;
            }
            else if (route_type === flightConstent_1.ROUTE_TYPE.TO_DAC) {
                getBlockedAirlinesPayload.to_dac = true;
            }
            else {
                getBlockedAirlinesPayload.soto = true;
            }
            const blockedAirlines = yield AirlinesPreferenceModel.getAirlinePrefCodes(getBlockedAirlinesPayload);
            const OriginDest = reqBody.OriginDestinationInformation;
            const scheduleDesc = [];
            for (const item of data.scheduleDescs) {
                const dAirport = yield commonModel.getAirport({
                    code: item.departure.airport,
                });
                const AAirport = yield commonModel.getAirport({
                    code: item.arrival.airport,
                });
                const DCity = yield commonModel.getCity({ code: item.departure.city });
                const ACity = yield commonModel.getCity({ code: item.arrival.city });
                const marketing_airline = yield commonModel.getAirlines({ code: item.carrier.marketing }, false);
                const aircraft = yield commonModel.getAircraft(item.carrier.equipment.code);
                let operating_airline = marketing_airline;
                if (item.carrier.marketing !== item.carrier.operating) {
                    operating_airline = yield commonModel.getAirlines({ code: item.carrier.operating }, false);
                }
                const departure = {
                    airport_code: item.departure.airport,
                    city_code: item.departure.city,
                    airport: ((_c = (_b = dAirport.data) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.name) || '-',
                    city: ((_e = (_d = DCity.data) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.name) || '-',
                    country: item.departure.country,
                    terminal: item.departure.terminal,
                    time: item.departure.time,
                    date: '',
                    date_adjustment: item.departure.dateAdjustment,
                };
                const arrival = {
                    airport: ((_g = (_f = AAirport.data) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.name) || '-',
                    city: ((_j = (_h = ACity.data) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.name) || '-',
                    airport_code: item.arrival.airport,
                    city_code: item.arrival.city,
                    country: item.arrival.country,
                    time: item.arrival.time,
                    terminal: item.arrival.terminal,
                    date: '',
                    date_adjustment: item.arrival.dateAdjustment,
                };
                const carrier = {
                    carrier_marketing_code: item.carrier.marketing,
                    carrier_marketing_airline: ((_l = (_k = marketing_airline.data) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.name) || '-',
                    carrier_marketing_logo: ((_o = (_m = marketing_airline.data) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.logo) || '-',
                    carrier_marketing_flight_number: String(item.carrier.marketingFlightNumber),
                    carrier_operating_code: item.carrier.operating,
                    carrier_operating_airline: ((_q = (_p = operating_airline.data) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.name) || '-',
                    carrier_operating_logo: ((_s = (_r = operating_airline.data) === null || _r === void 0 ? void 0 : _r[0]) === null || _s === void 0 ? void 0 : _s.logo) || '-',
                    carrier_operating_flight_number: String(item.carrier.operatingFlightNumber),
                    carrier_aircraft_code: aircraft.code,
                    carrier_aircraft_name: aircraft.name,
                };
                const new_item = {
                    id: item.id,
                    elapsedTime: item.elapsedTime,
                    stopCount: item.stopCount,
                    message: item.message,
                    message_type: item.messageType,
                    total_miles_flown: item.totalMilesFlown,
                    departure,
                    arrival,
                    carrier,
                };
                scheduleDesc.push(new_item);
            }
            const legDesc = data.legDescs.map((leg) => {
                const schedules = leg.schedules;
                const options = [];
                for (const schedule of schedules) {
                    const founded = scheduleDesc.find((item) => item.id === schedule.ref);
                    if (founded) {
                        options.push(Object.assign(Object.assign({}, founded), { departureDateAdjustment: schedule.departureDateAdjustment }));
                    }
                }
                return {
                    id: leg.id,
                    elapsed_time: leg.elapsedTime,
                    options,
                };
            });
            const itineraryGroup = data.itineraryGroups[0];
            const itineraries = [];
            for (let i = 0; i < ((_t = itineraryGroup.itineraries) === null || _t === void 0 ? void 0 : _t.length); i++) {
                const itinerary = itineraryGroup.itineraries[i];
                const fare = itinerary.pricingInformation[0].fare;
                const validatingCarrier = yield commonModel.getAirlines({ code: fare.validatingCarrierCode }, false);
                if (blockedAirlines.find((ba) => ba.Code === fare.validatingCarrierCode)) {
                    continue;
                }
                const passenger_lists = [];
                let refundable = false;
                const baggageAndAvailabilityAllSeg = [];
                const legsDesc = this.flightUtils.getLegsDesc(itinerary.legs, legDesc, OriginDest);
                const ait = Math.round(((Number(fare.totalFare.equivalentAmount) +
                    Number(fare.totalFare.totalTaxAmount)) /
                    100) *
                    0.3);
                const new_fare = {
                    base_fare: fare.totalFare.equivalentAmount,
                    total_tax: fare.totalFare.totalTaxAmount,
                    ait,
                    discount: 0,
                    payable: fare.totalFare.equivalentAmount + fare.totalFare.totalTaxAmount + ait,
                    vendor_price: {
                        base_fare: fare.totalFare.equivalentAmount,
                        tax: fare.totalFare.totalTaxAmount,
                        ait: 0,
                        charge: 0,
                        discount: 0,
                        gross_fare: Number(fare.totalFare.totalPrice),
                        net_fare: Number(fare.totalFare.totalPrice),
                    },
                };
                let partial_payment = {
                    partial_payment: false,
                    payment_percentage: 100,
                    travel_date_from_now: 0,
                };
                if (route_type === flightConstent_1.ROUTE_TYPE.DOMESTIC) {
                    //domestic
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstent_1.SABRE_API,
                        airline: fare.validatingCarrierCode,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                        domestic: true,
                    });
                }
                else if (route_type === flightConstent_1.ROUTE_TYPE.FROM_DAC) {
                    //from dac
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstent_1.SABRE_API,
                        airline: fare.validatingCarrierCode,
                        from_dac: true,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    });
                }
                else if (route_type === flightConstent_1.ROUTE_TYPE.TO_DAC) {
                    //to dac
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstent_1.SABRE_API,
                        airline: fare.validatingCarrierCode,
                        to_dac: true,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    });
                }
                else {
                    //soto
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstent_1.SABRE_API,
                        airline: fare.validatingCarrierCode,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                        soto: true,
                    });
                }
                let total_segments = 0;
                legsDesc.map((elm) => {
                    elm.options.map((elm2) => {
                        total_segments++;
                    });
                });
                const { markup, commission, pax_markup } = yield this.flightSupport.calculateFlightMarkup({
                    dynamic_fare_supplier_id,
                    airline: fare.validatingCarrierCode,
                    flight_class: this.flightUtils.getClassFromId(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref
                        .Cabin),
                    base_fare: fare.totalFare.equivalentAmount,
                    total_segments,
                    route_type,
                });
                let pax_count = 0;
                reqBody.PassengerTypeQuantity.map((reqPax) => {
                    pax_count += reqPax.Quantity;
                });
                for (const passenger of fare.passengerInfoList) {
                    const passenger_info = passenger.passengerInfo;
                    refundable = !passenger_info.nonRefundable;
                    const segmentDetails = [];
                    let legInd = 0;
                    let segInd = 0;
                    let segments = [];
                    for (let i = 0; i < ((_u = passenger_info.fareComponents) === null || _u === void 0 ? void 0 : _u.length); i++) {
                        const pfd = passenger_info.fareComponents[i];
                        for (let j = 0; j < ((_v = pfd.segments) === null || _v === void 0 ? void 0 : _v.length); j++) {
                            const segd = pfd.segments[j];
                            const segment = segd === null || segd === void 0 ? void 0 : segd.segment;
                            if (segment !== undefined) {
                                const meal_type = this.flightUtils.getMeal((segment === null || segment === void 0 ? void 0 : segment.mealCode) || '');
                                const cabin_type = this.flightUtils.getCabin((segment === null || segment === void 0 ? void 0 : segment.cabinCode) || '');
                                segments.push({
                                    id: j + 1,
                                    name: `Segment-${j + 1}`,
                                    meal_type: meal_type === null || meal_type === void 0 ? void 0 : meal_type.name,
                                    meal_code: meal_type === null || meal_type === void 0 ? void 0 : meal_type.code,
                                    cabin_code: cabin_type === null || cabin_type === void 0 ? void 0 : cabin_type.code,
                                    cabin_type: cabin_type === null || cabin_type === void 0 ? void 0 : cabin_type.name,
                                    booking_code: segment === null || segment === void 0 ? void 0 : segment.bookingCode,
                                    available_seat: segment === null || segment === void 0 ? void 0 : segment.seatsAvailable,
                                    available_break: segment === null || segment === void 0 ? void 0 : segment.availabilityBreak,
                                    available_fare_break: segment === null || segment === void 0 ? void 0 : segment.fareBreakPoint,
                                });
                            }
                            segInd++;
                        }
                        let newBaggage = {};
                        if (passenger_info.baggageInformation) {
                            const baggage = passenger_info.baggageInformation[i];
                            if (baggage) {
                                const allowance_id = (_w = baggage === null || baggage === void 0 ? void 0 : baggage.allowance) === null || _w === void 0 ? void 0 : _w.ref;
                                newBaggage = data.baggageAllowanceDescs.find((all_item) => all_item.id === allowance_id);
                            }
                        }
                        //all the segments are in one fareComponents object for each leg
                        if (pfd.endAirport ===
                            reqBody.OriginDestinationInformation[legInd].DestinationLocation
                                .LocationCode) {
                            legInd++;
                            segInd = 0;
                        }
                        //segments are in different fareComponents object for each leg
                        else {
                            continue;
                        }
                        segmentDetails.push({
                            id: i + 1,
                            from_airport: reqBody.OriginDestinationInformation[legInd - 1].OriginLocation
                                .LocationCode,
                            to_airport: reqBody.OriginDestinationInformation[legInd - 1]
                                .DestinationLocation.LocationCode,
                            segments,
                            baggage: (newBaggage === null || newBaggage === void 0 ? void 0 : newBaggage.id)
                                ? {
                                    id: newBaggage === null || newBaggage === void 0 ? void 0 : newBaggage.id,
                                    unit: newBaggage.unit || 'pieces',
                                    count: newBaggage.weight || newBaggage.pieceCount,
                                }
                                : {
                                    id: 1,
                                    unit: 'N/A',
                                    count: 'N/A',
                                },
                        });
                        segments = [];
                    }
                    baggageAndAvailabilityAllSeg.push({
                        passenger_type: passenger.passengerInfo.passengerType,
                        passenger_count: passenger.passengerInfo.passengerNumber,
                        segmentDetails,
                    });
                    const per_pax_discount = commission / pax_count;
                    const per_pax_markup = markup / pax_count;
                    const total_pax_markup = pax_markup + per_pax_markup;
                    const per_pax_ait = ait / pax_count;
                    const per_pax_tax = passenger_info.passengerTotalFare.totalTaxAmount;
                    const new_passenger = {
                        type: passenger_info.passengerType,
                        number: passenger_info.passengerNumber,
                        per_pax_fare: {
                            base_fare: (Number(passenger_info.passengerTotalFare.equivalentAmount) +
                                total_pax_markup).toFixed(2),
                            tax: per_pax_tax.toFixed(2),
                            ait: per_pax_ait.toFixed(2),
                            discount: per_pax_discount.toFixed(2),
                            total_fare: (per_pax_ait +
                                total_pax_markup +
                                per_pax_tax +
                                Number(passenger_info.passengerTotalFare.equivalentAmount) -
                                per_pax_discount).toFixed(2),
                        },
                    };
                    passenger_lists.push(new_passenger);
                }
                const availability = [];
                baggageAndAvailabilityAllSeg.forEach((item) => {
                    const { segmentDetails } = item;
                    segmentDetails.forEach((item2) => {
                        const foundData = availability.find((avItem) => avItem.from_airport === item2.from_airport &&
                            avItem.to_airport === item2.to_airport);
                        if (foundData) {
                            const { segments } = foundData;
                            item2.segments.forEach((item3) => {
                                const segmentFound = segments.find((segs) => item3.name === segs.name);
                                if (segmentFound) {
                                    const passenger = segmentFound.passenger.find((pas) => pas.type === item.passenger_type);
                                    if (!passenger) {
                                        segmentFound.passenger.push({
                                            type: item.passenger_type,
                                            count: item.passenger_count,
                                            meal_type: item3.meal_type,
                                            meal_code: item3.meal_code,
                                            cabin_code: item3.cabin_code,
                                            cabin_type: item3.cabin_type,
                                            booking_code: item3.booking_code,
                                            available_seat: item3.available_seat,
                                            available_break: item3.available_break,
                                            available_fare_break: item3.available_fare_break,
                                            baggage_unit: item2.baggage.unit,
                                            baggage_count: item2.baggage.count,
                                        });
                                    }
                                }
                                else {
                                    segments.push({
                                        name: item3.name,
                                        passenger: [
                                            {
                                                type: item.passenger_type,
                                                count: item.passenger_count,
                                                meal_type: item3.meal_type,
                                                meal_code: item3.meal_code,
                                                cabin_code: item3.cabin_code,
                                                cabin_type: item3.cabin_type,
                                                booking_code: item3.booking_code,
                                                available_seat: item3.available_seat,
                                                available_break: item3.available_break,
                                                available_fare_break: item3.available_fare_break,
                                                baggage_unit: item2.baggage.unit,
                                                baggage_count: item2.baggage.count,
                                            },
                                        ],
                                    });
                                }
                            });
                        }
                        else {
                            const segments = [];
                            item2.segments.forEach((item3) => {
                                segments.push({
                                    name: item3.name,
                                    passenger: [
                                        {
                                            type: item.passenger_type,
                                            count: item.passenger_count,
                                            meal_type: item3.meal_type,
                                            meal_code: item3.meal_code,
                                            cabin_code: item3.cabin_code,
                                            cabin_type: item3.cabin_type,
                                            booking_code: item3.booking_code,
                                            available_seat: item3.available_seat,
                                            available_break: item3.available_break,
                                            available_fare_break: item3.available_fare_break,
                                            baggage_unit: item2.baggage.unit,
                                            baggage_count: item2.baggage.count,
                                        },
                                    ],
                                });
                            });
                            availability.push({
                                from_airport: item2.from_airport,
                                to_airport: item2.to_airport,
                                segments,
                            });
                        }
                    });
                });
                const total_pax_markup = pax_markup * pax_count;
                new_fare.base_fare = (markup +
                    total_pax_markup +
                    Number(new_fare.base_fare)).toFixed(2);
                new_fare.discount = (Number(new_fare.discount) + commission).toFixed(2);
                new_fare.payable = (Number(new_fare.base_fare) +
                    Number(new_fare.total_tax) +
                    Number(new_fare.ait) -
                    Number(new_fare.discount)).toFixed(2);
                const newItinerary = {
                    flight_id: flight_id || (0, uuid_1.v4)(),
                    api_search_id: '',
                    booking_block,
                    domestic_flight: route_type === flightConstent_1.ROUTE_TYPE.DOMESTIC,
                    price_changed: false,
                    direct_ticket_issue: new commonFlightSupport_service_1.CommonFlightSupportService().checkDirectTicketIssue({
                        journey_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    }),
                    journey_type: reqBody.JourneyType,
                    api: flightConstent_1.SABRE_API,
                    fare: new_fare,
                    refundable,
                    carrier_code: fare.validatingCarrierCode,
                    carrier_name: ((_y = (_x = validatingCarrier.data) === null || _x === void 0 ? void 0 : _x[0]) === null || _y === void 0 ? void 0 : _y.name) || '-',
                    carrier_logo: ((_0 = (_z = validatingCarrier.data) === null || _z === void 0 ? void 0 : _z[0]) === null || _0 === void 0 ? void 0 : _0.logo) || '-',
                    ticket_last_date: fare.lastTicketDate,
                    ticket_last_time: fare.lastTicketTime,
                    flights: legsDesc,
                    passengers: passenger_lists,
                    availability,
                    leg_description: [],
                };
                itineraries.push(newItinerary);
            }
            return itineraries;
        });
    }
    ///==================FLIGHT SEARCH (END)=========================///
    //////==================FLIGHT REVALIDATE (START)=========================//////
    //sabre flight revalidate service
    SabreFlightRevalidate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ reqBody, retrieved_response, dynamic_fare_supplier_id, flight_id, booking_block, markup_amount, }) {
            var _b;
            const revalidate_req_body = yield this.RevalidateFlightReqFormatter(reqBody, retrieved_response);
            const route_type = this.flightUtils.routeTypeFinder({
                originDest: reqBody.OriginDestinationInformation,
            });
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.FLIGHT_REVALIDATE_ENDPOINT, revalidate_req_body);
            if (!response) {
                throw new customError_1.default('External API Error', 500);
            }
            if (((_b = response.groupedItineraryResponse) === null || _b === void 0 ? void 0 : _b.statistics.itineraryCount) === 0) {
                throw new customError_1.default(`Cannot revalidate flight with this flight id`, 400);
            }
            const data = yield this.FlightSearchResFormatter({
                dynamic_fare_supplier_id,
                booking_block,
                reqBody,
                data: response.groupedItineraryResponse,
                flight_id,
                markup_amount,
                route_type,
            });
            return data[0];
        });
    }
    // Revalidate Flight Request Formatter
    RevalidateFlightReqFormatter(reqBody, retrieved_response) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let cabin = 'Y';
            switch ((_c = (_b = (_a = reqBody.OriginDestinationInformation[0]) === null || _a === void 0 ? void 0 : _a.TPA_Extensions) === null || _b === void 0 ? void 0 : _b.CabinPref) === null || _c === void 0 ? void 0 : _c.Cabin) {
                case '1':
                    cabin = 'Y';
                    break;
                case '2':
                    cabin = 'S';
                    break;
                case '3':
                    cabin = 'C';
                    break;
                case '4':
                    cabin = 'F';
                    break;
                default:
                    break;
            }
            const OriginDestinationInformation = reqBody.OriginDestinationInformation.map((item, index) => {
                const req_depart_air = item.OriginLocation.LocationCode;
                const flights = [];
                const flight = retrieved_response.flights[index];
                const depart_time = flight.options[0].departure.time;
                const depart_air = flight.options[0].departure.airport_code;
                if (req_depart_air === depart_air) {
                    for (const option of flight.options) {
                        const DepartureDateTime = this.flightUtils.convertDateTime(option.departure.date, option.departure.time);
                        const ArrivalDateTime = this.flightUtils.convertDateTime(option.arrival.date, option.arrival.time);
                        const flight_data = {
                            Number: Number(option === null || option === void 0 ? void 0 : option.carrier.carrier_marketing_flight_number),
                            ClassOfService: 'V',
                            DepartureDateTime,
                            ArrivalDateTime,
                            Type: 'A',
                            OriginLocation: {
                                LocationCode: option === null || option === void 0 ? void 0 : option.departure.airport_code,
                            },
                            DestinationLocation: {
                                LocationCode: option === null || option === void 0 ? void 0 : option.arrival.airport_code,
                            },
                            Airline: {
                                Marketing: option === null || option === void 0 ? void 0 : option.carrier.carrier_marketing_code,
                                Operating: option === null || option === void 0 ? void 0 : option.carrier.carrier_operating_code,
                            },
                        };
                        flights.push(flight_data);
                    }
                    const origin_destination_info = {
                        RPH: item.RPH,
                        DepartureDateTime: this.flightUtils.convertDateTime(item.DepartureDateTime, depart_time),
                        OriginLocation: item['OriginLocation'],
                        DestinationLocation: item['DestinationLocation'],
                        TPA_Extensions: {
                            Flight: flights,
                        },
                    };
                    return origin_destination_info;
                }
            });
            const PassengerTypeQuantity = reqBody.PassengerTypeQuantity.map((item) => {
                const passenger_info = {
                    Code: item.Code,
                    Quantity: item.Quantity,
                    TPA_Extensions: {
                        VoluntaryChanges: {
                            Match: 'Info',
                        },
                    },
                };
                return passenger_info;
            });
            const request_body = {
                OTA_AirLowFareSearchRQ: {
                    POS: {
                        Source: [
                            {
                                PseudoCityCode: config_1.default.SABRE_USERNAME.split('-')[1],
                                RequestorID: {
                                    Type: '1',
                                    ID: '1',
                                    CompanyName: {
                                        Code: 'TN',
                                    },
                                },
                            },
                        ],
                    },
                    OriginDestinationInformation: OriginDestinationInformation,
                    TPA_Extensions: {
                        IntelliSellTransaction: {
                            CompressResponse: {
                                Value: false,
                            },
                            RequestType: {
                                Name: '50ITINS',
                            },
                        },
                    },
                    TravelerInfoSummary: {
                        AirTravelerAvail: [
                            {
                                PassengerTypeQuantity: PassengerTypeQuantity,
                            },
                        ],
                        SeatsRequested: [1],
                    },
                    TravelPreferences: {
                        TPA_Extensions: {
                            DataSources: {
                                NDC: 'Disable',
                                ATPCO: 'Enable',
                                LCC: 'Disable',
                            },
                            VerificationItinCallLogic: {
                                AlwaysCheckAvailability: true,
                                Value: 'L',
                            },
                            // FlexibleFares: {
                            //   FareParameters: [
                            //     {
                            //       Cabin: {
                            //         Type: cabin,
                            //       },
                            //     },
                            //   ],
                            // },
                        },
                    },
                    Version: '5',
                },
            };
            return request_body;
        });
    }
    ///==================FLIGHT REVALIDATE (END)=========================///
    /////////==================FLIGHT BOOKING (START)=========================/////////
    //pnr create request formatter
    pnrReqBody(body, foundItem, user_info) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const formattedDate = (dateString) => `${String(new Date(dateString).getDate()).padStart(2, '0')}${new Date(dateString)
                .toLocaleString('default', { month: 'short' })
                .toUpperCase()}${String(new Date(dateString).getFullYear()).slice(-2)}`;
            const monthDiff = (date) => {
                const diff = Math.ceil((new Date().getTime() - new Date(date).getTime()) /
                    (1000 * 60 * 60 * 24 * 30));
                return String(diff).padStart(2, '0');
            };
            const passengers = body.passengers;
            const filteredPassengers = passengers.filter((passenger) => passenger.type !== 'INF');
            const passengerLength = filteredPassengers.length;
            const SecureFlight = [];
            const AdvancePassenger = [];
            const Service = [];
            const ContactNumber = [];
            Service.push({
                SSR_Code: 'CTCM',
                Text: user_info.phone,
                PersonName: {
                    NameNumber: '1.1',
                },
                SegmentNumber: 'A',
            });
            Service.push({
                SSR_Code: 'OTHS',
                Text: user_info.name,
                PersonName: {
                    NameNumber: '1.1',
                },
                SegmentNumber: 'A',
            });
            Service.push({
                SSR_Code: 'CTCE',
                Text: constants_1.PROJECT_EMAIL.replace('@', '//'),
                PersonName: {
                    NameNumber: '1.1',
                },
                SegmentNumber: 'A',
            });
            ContactNumber.push({
                NameNumber: '1.1',
                Phone: user_info.phone,
                PhoneUseType: 'M',
            });
            const Email = [];
            Email.push({
                NameNumber: '1.1',
                Address: constants_1.PROJECT_EMAIL,
                Type: 'CC',
            });
            let inf_ind = 1;
            const PersonName = yield Promise.all(passengers.map((item, index) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const name_number = `${index + 1}.1`;
                const secure_fl_data = {
                    PersonName: {
                        NameNumber: item.type === 'INF' ? inf_ind + '.1' : name_number,
                        DateOfBirth: (_a = String(item.date_of_birth)) === null || _a === void 0 ? void 0 : _a.split('T')[0],
                        Gender: item.type === 'INF' && item.gender === 'Male'
                            ? 'MI'
                            : item.type === 'INF' && item.gender === 'Female'
                                ? 'FI'
                                : item.gender[0],
                        GivenName: item.first_name,
                        Surname: item.last_name,
                    },
                    SegmentNumber: 'A',
                    VendorPrefs: {
                        Airline: {
                            Hosted: false,
                        },
                    },
                };
                if (item.type.startsWith('C')) {
                    Service.push({
                        SSR_Code: 'CHLD',
                        Text: formattedDate(item.date_of_birth),
                        PersonName: {
                            NameNumber: name_number,
                        },
                        SegmentNumber: 'A',
                    });
                }
                if (item.type === 'INF') {
                    Service.push({
                        SSR_Code: 'INFT',
                        Text: item.first_name +
                            '/' +
                            item.last_name +
                            '/' +
                            formattedDate(item.date_of_birth),
                        PersonName: {
                            NameNumber: inf_ind + '.1',
                        },
                        SegmentNumber: 'A',
                    });
                }
                SecureFlight.push(secure_fl_data);
                if (item.passport_number) {
                    const issuing_country = yield this.Model.CommonModel().getCountry({
                        id: Number(item.issuing_country),
                    });
                    let nationality = issuing_country;
                    if (item.nationality !== item.issuing_country) {
                        nationality = yield this.Model.CommonModel().getCountry({
                            id: Number(item.nationality),
                        });
                    }
                    AdvancePassenger.push({
                        Document: {
                            IssueCountry: issuing_country[0].iso3,
                            NationalityCountry: nationality[0].iso3,
                            ExpirationDate: (_b = String(item.passport_expiry_date)) === null || _b === void 0 ? void 0 : _b.split('T')[0],
                            Number: item.passport_number,
                            Type: 'P',
                        },
                        PersonName: {
                            Gender: item.type === 'INF' && item.gender === 'Male'
                                ? 'MI'
                                : item.type === 'INF' && item.gender === 'Female'
                                    ? 'FI'
                                    : item.gender[0],
                            GivenName: item.first_name,
                            Surname: item.last_name,
                            DateOfBirth: (_c = String(item.date_of_birth)) === null || _c === void 0 ? void 0 : _c.split('T')[0],
                            NameNumber: item.type === 'INF' ? inf_ind + '.1' : name_number,
                        },
                        SegmentNumber: 'A',
                    });
                }
                const person = {
                    NameNumber: name_number,
                    NameReference: item.type === 'INF'
                        ? 'I' + monthDiff(item.date_of_birth)
                        : item.type === 'ADT'
                            ? ''
                            : item.type,
                    GivenName: item.first_name + ' ' + item.reference,
                    Surname: item.last_name,
                    PassengerType: item.type,
                    Infant: item.type === 'INF' ? true : false,
                };
                if (item.type === 'INF') {
                    inf_ind++;
                }
                return person;
            })));
            const flight = foundItem;
            let passenger_qty = 0;
            const PassengerType = flight.passengers.map((passenger) => {
                passenger_qty = passenger.number;
                return {
                    Code: passenger.type,
                    Quantity: String(passenger_qty),
                };
            });
            // flight segments
            const FlightSegment = [];
            const booking_code = ((_a = flight.availability) === null || _a === void 0 ? void 0 : _a.flatMap((avElem) => {
                var _a;
                return (_a = avElem === null || avElem === void 0 ? void 0 : avElem.segments) === null || _a === void 0 ? void 0 : _a.map((segElem) => { var _a, _b; return (_b = (_a = segElem === null || segElem === void 0 ? void 0 : segElem.passenger) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.booking_code; });
            })) || [];
            let booking_code_index = 0;
            for (const item of flight.flights) {
                for (const option of item.options) {
                    const mar_code = option.carrier.carrier_marketing_code;
                    const segment = {
                        ArrivalDateTime: this.flightUtils.convertDateTime(option.arrival.date, option.arrival.time),
                        DepartureDateTime: this.flightUtils.convertDateTime(option.departure.date, option.departure.time),
                        FlightNumber: String(option.carrier.carrier_marketing_flight_number),
                        NumberInParty: String(passengerLength),
                        ResBookDesigCode: booking_code === null || booking_code === void 0 ? void 0 : booking_code[booking_code_index],
                        Status: 'NN',
                        DestinationLocation: {
                            LocationCode: option.arrival.airport_code,
                        },
                        MarketingAirline: {
                            Code: mar_code,
                            FlightNumber: String(option.carrier.carrier_marketing_flight_number),
                        },
                        OriginLocation: {
                            LocationCode: option.departure.airport_code,
                        },
                    };
                    FlightSegment.push(segment);
                    booking_code_index++;
                }
            }
            const request_body = {
                CreatePassengerNameRecordRQ: {
                    version: '2.5.0',
                    targetCity: config_1.default.SABRE_USERNAME.split('-')[1],
                    haltOnAirPriceError: true,
                    TravelItineraryAddInfo: {
                        AgencyInfo: {
                            Address: {
                                AddressLine: 'OTA',
                                CityName: 'DHAKA BANGLADESH',
                                CountryCode: 'BD',
                                PostalCode: '1213',
                                StateCountyProv: {
                                    StateCode: 'BD',
                                },
                                StreetNmbr: 'DHAKA',
                            },
                            Ticketing: {
                                TicketType: '7TAW',
                            },
                        },
                        CustomerInfo: {
                            ContactNumbers: {
                                ContactNumber,
                            },
                            Email,
                            PersonName,
                        },
                    },
                    AirBook: {
                        HaltOnStatus: [
                            {
                                Code: 'HL',
                            },
                            {
                                Code: 'KK',
                            },
                            {
                                Code: 'LL',
                            },
                            {
                                Code: 'NN',
                            },
                            {
                                Code: 'NO',
                            },
                            {
                                Code: 'UC',
                            },
                            {
                                Code: 'US',
                            },
                        ],
                        OriginDestinationInformation: {
                            FlightSegment,
                        },
                        RedisplayReservation: {
                            NumAttempts: 5,
                            WaitInterval: 1000,
                        },
                    },
                    AirPrice: [
                        {
                            PriceRequestInformation: {
                                Retain: true,
                                OptionalQualifiers: {
                                    FOP_Qualifiers: {
                                        BasicFOP: {
                                            Type: 'CASH',
                                        },
                                    },
                                    PricingQualifiers: {
                                        PassengerType,
                                    },
                                },
                            },
                        },
                    ],
                    SpecialReqDetails: {
                        SpecialService: {
                            SpecialServiceInfo: {
                                AdvancePassenger,
                                SecureFlight,
                                Service,
                            },
                        },
                    },
                    PostProcessing: {
                        EndTransaction: {
                            Source: {
                                ReceivedFrom: 'WEB',
                            },
                            Email: {
                                Ind: true,
                            },
                        },
                        RedisplayReservation: {
                            waitInterval: 1000,
                        },
                    },
                },
            };
            return request_body;
        });
    }
    //flight booking service
    FlightBookingService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ body, user_info, revalidate_data, }) {
            var _b, _c, _d, _e, _f;
            const requestBody = yield this.pnrReqBody(body, revalidate_data, {
                email: user_info.email,
                phone: user_info.phone,
                name: user_info.name,
            });
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.FLIGHT_BOOKING_ENDPOINT, requestBody);
            if (!response) {
                throw new customError_1.default('Something went wrong. Please try again later', 500);
            }
            if (((_c = (_b = response === null || response === void 0 ? void 0 : response.CreatePassengerNameRecordRS) === null || _b === void 0 ? void 0 : _b.ApplicationResults) === null || _c === void 0 ? void 0 : _c.status) !==
                'Complete') {
                throw new customError_1.default('This flight is already booked. Please try booking another flight', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR, constants_1.ERROR_LEVEL_WARNING, {
                    api: flightConstent_1.SABRE_API,
                    endpoint: sabreApiEndpoints_1.default.FLIGHT_BOOKING_ENDPOINT,
                    payload: requestBody,
                    response: (_d = response === null || response === void 0 ? void 0 : response.CreatePassengerNameRecordRS) === null || _d === void 0 ? void 0 : _d.ApplicationResults,
                });
            }
            //return GDS PNR
            return (_f = (_e = response === null || response === void 0 ? void 0 : response.CreatePassengerNameRecordRS) === null || _e === void 0 ? void 0 : _e.ItineraryRef) === null || _f === void 0 ? void 0 : _f.ID;
        });
    }
    ///==================FLIGHT BOOKING (END)=========================///
    ////////==================TICKET ISSUE (START)=========================//////////
    // // ticket issue req formatter
    SabreTicketIssueReqFormatter(pnrId, unique_traveler) {
        let Record = [];
        for (let i = 1; i <= unique_traveler; i++) {
            Record.push({
                Number: i,
            });
        }
        return {
            AirTicketRQ: {
                version: '1.3.0',
                targetCity: config_1.default.SABRE_USERNAME.split('-')[1],
                DesignatePrinter: {
                    Printers: {
                        Ticket: {
                            CountryCode: 'BD',
                        },
                        Hardcopy: {
                            LNIATA: config_1.default.SABRE_LNIATA_CODE,
                        },
                        InvoiceItinerary: {
                            LNIATA: config_1.default.SABRE_LNIATA_CODE,
                        },
                    },
                },
                Itinerary: {
                    ID: pnrId,
                },
                Ticketing: [
                    {
                        MiscQualifiers: {
                            Commission: {
                                Percent: 7,
                            },
                        },
                        PricingQualifiers: {
                            PriceQuote: [
                                {
                                    Record,
                                },
                            ],
                        },
                    },
                ],
                PostProcessing: {
                    EndTransaction: {
                        Source: {
                            ReceivedFrom: 'SABRE WEB',
                        },
                        Email: {
                            eTicket: {
                                PDF: {
                                    Ind: true,
                                },
                                Ind: true,
                            },
                            PersonName: {
                                NameNumber: '1.1',
                            },
                            Ind: true,
                        },
                    },
                },
            },
        };
    }
    //ticket issue service
    TicketIssueService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr, unique_traveler, }) {
            var _b, _c, _d;
            const ticketReqBody = this.SabreTicketIssueReqFormatter(pnr, unique_traveler);
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.TICKET_ISSUE_ENDPOINT, ticketReqBody);
            if (((_c = (_b = response === null || response === void 0 ? void 0 : response.AirTicketRS) === null || _b === void 0 ? void 0 : _b.ApplicationResults) === null || _c === void 0 ? void 0 : _c.status) === 'Complete') {
                const retrieve_booking = yield this.request.postRequest(sabreApiEndpoints_1.default.GET_BOOKING_ENDPOINT, {
                    confirmationId: pnr,
                });
                if (!retrieve_booking || !(retrieve_booking === null || retrieve_booking === void 0 ? void 0 : retrieve_booking.flightTickets)) {
                    yield this.Model.ErrorLogsModel().insertErrorLogs({
                        level: constants_1.ERROR_LEVEL_WARNING,
                        message: 'Error from sabre while ticket issue',
                        url: sabreApiEndpoints_1.default.GET_BOOKING_ENDPOINT,
                        http_method: 'POST',
                        metadata: {
                            api: flightConstent_1.SABRE_API,
                            endpoint: sabreApiEndpoints_1.default.GET_BOOKING_ENDPOINT,
                            payload: { confirmationId: pnr },
                            response: retrieve_booking,
                        },
                    });
                    // return {
                    //   success: true,
                    //   code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    //   message: 'An error occurred while retrieving the ticket numbers',
                    //   error: retrieve_booking?.errors,
                    // };
                }
                const ticket_number = [];
                for (let i = 0; i < ((_d = retrieve_booking.flightTickets) === null || _d === void 0 ? void 0 : _d.length); i++) {
                    ticket_number.push(retrieve_booking.flightTickets[i].number);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Ticket has been issued',
                    data: ticket_number,
                };
            }
            else {
                yield this.Model.ErrorLogsModel().insertErrorLogs({
                    level: constants_1.ERROR_LEVEL_WARNING,
                    message: 'Error from sabre while ticket issue',
                    url: sabreApiEndpoints_1.default.TICKET_ISSUE_ENDPOINT,
                    http_method: 'POST',
                    metadata: {
                        api: flightConstent_1.SABRE_API,
                        endpoint: sabreApiEndpoints_1.default.TICKET_ISSUE_ENDPOINT,
                        payload: ticketReqBody,
                        response: response,
                    },
                });
                // return {
                //   success: false,
                //   code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                //   message: 'An error occurred while issuing the ticket',
                //   error: response?.errors,
                // };
            }
        });
    }
    ///==================TICKET ISSUE (END)=========================///
    /////////==================BOOKING CANCEL (START)=========================//////////
    //sabre booking cancel req formatter
    SabreBookingCancelReqFormatter(pnr) {
        return {
            confirmationId: pnr,
            retrieveBooking: true,
            cancelAll: true,
            errorHandlingPolicy: 'ALLOW_PARTIAL_CANCEL',
        };
    }
    //sabre booking cancel service
    SabreBookingCancelService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr }) {
            //cancel booking req formatter
            const cancelBookingBody = this.SabreBookingCancelReqFormatter(pnr);
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.CANCEL_BOOKING_ENDPOINT, cancelBookingBody);
            //if there is error then return
            if (!response || response.errors) {
                // await this.Model.errorLogsModel(trx).insert({
                //   level: ERROR_LEVEL_WARNING,
                //   message: 'Error from sabre while cancel booking',
                //   url: SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
                //   http_method: 'POST',
                //   metadata: {
                //     api: SABRE_API,
                //     endpoint: SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
                //     payload: cancelBookingBody,
                //     response: response,
                //   },
                //   source,
                // });
                throw new customError_1.default('An error occurred while cancelling the booking', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR, constants_1.ERROR_LEVEL_WARNING, {
                    api: flightConstent_1.SABRE_API,
                    endpoint: sabreApiEndpoints_1.default.CANCEL_BOOKING_ENDPOINT,
                    payload: cancelBookingBody,
                    response: response,
                });
                // return {
                //   success: false,
                //   code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                //   message: 'An error occurred while cancelling the booking',
                //   error: response?.errors,
                // };
            }
            return {
                success: true,
            };
        });
    }
    ///==================BOOKING CANCEL (END)=========================///
    /////==================GET BOOKING(START)=========================//////////////
    GRNUpdate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr, booking_status, }) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.GET_BOOKING_ENDPOINT, {
                confirmationId: pnr,
            });
            let status = booking_status;
            let ticket_number = [];
            let last_time = null;
            let airline_pnr = null;
            let refundable = false;
            if (response) {
                //pnr status
                if (((_d = (_c = (_b = response === null || response === void 0 ? void 0 : response.flightTickets) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.ticketStatusName) === null || _d === void 0 ? void 0 : _d.toLowerCase()) ===
                    flightConstent_1.FLIGHT_BOOKING_VOID) {
                    status = flightConstent_1.FLIGHT_BOOKING_VOID;
                }
                else if (((_g = (_f = (_e = response === null || response === void 0 ? void 0 : response.flightTickets) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.ticketStatusName) === null || _g === void 0 ? void 0 : _g.toLowerCase()) ===
                    flightConstent_1.FLIGHT_BOOKING_REFUNDED) {
                    status = flightConstent_1.FLIGHT_BOOKING_REFUNDED;
                }
                else if (response === null || response === void 0 ? void 0 : response.isTicketed) {
                    status = flightConstent_1.FLIGHT_TICKET_ISSUE;
                    //get ticket number
                    for (let i = 0; i < ((_h = response === null || response === void 0 ? void 0 : response.flightTickets) === null || _h === void 0 ? void 0 : _h.length); i++) {
                        ticket_number.push(response === null || response === void 0 ? void 0 : response.flightTickets[i].number);
                    }
                }
                else {
                    if ((response === null || response === void 0 ? void 0 : response.bookingId) &&
                        (response === null || response === void 0 ? void 0 : response.startDate) === undefined &&
                        (response === null || response === void 0 ? void 0 : response.endDate) === undefined) {
                        status = flightConstent_1.FLIGHT_BOOKING_CANCELLED;
                    }
                }
                //get last time of ticket issue
                (_j = response === null || response === void 0 ? void 0 : response.specialServices) === null || _j === void 0 ? void 0 : _j.map((elem) => {
                    if (elem.code === 'ADTK') {
                        last_time = elem.message;
                    }
                });
                //get airline pnr
                airline_pnr =
                    [
                        ...new Set((_k = response === null || response === void 0 ? void 0 : response.flights) === null || _k === void 0 ? void 0 : _k.map((flight) => flight === null || flight === void 0 ? void 0 : flight.confirmationId).filter((id) => id)),
                    ].join(', ') || '';
                //get refundable status
                refundable = (_m = (_l = response === null || response === void 0 ? void 0 : response.fareRules) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.isRefundable;
            }
            return {
                success: response ? true : false,
                status,
                ticket_number,
                last_time,
                airline_pnr,
                refundable,
            };
        });
    }
}
exports.default = SabreFlightService;
