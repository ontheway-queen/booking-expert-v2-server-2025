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
exports.CTHotelSupportService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const ctHotelRequest_1 = __importDefault(require("../../lib/hotel/ctHotelRequest"));
const ctHotelApiEndpoints_1 = __importDefault(require("../../miscellaneous/endpoints/ctHotelApiEndpoints"));
const hotelMarkupsModel_1 = __importDefault(require("../../../models/markupSetModel/hotelMarkupsModel"));
const constants_1 = require("../../miscellaneous/constants");
const dateTimeLib_1 = __importDefault(require("../../lib/dateTimeLib"));
class CTHotelSupportService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.request = new ctHotelRequest_1.default();
        this.trx = trx;
    }
    // Get Balance
    GetBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.request.getRequest(ctHotelApiEndpoints_1.default.GET_BALANCE));
            if (response.success) {
                return {
                    success: true,
                    message: response.message,
                    data: response.data,
                };
            }
            else {
                return {
                    success: false,
                    message: response.message,
                };
            }
        });
    }
    // Search Location
    SearchLocation(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.request.getRequest(`${ctHotelApiEndpoints_1.default.SEARCH_LOCATION}?filter=${filter}`);
            if (response === null || response === void 0 ? void 0 : response.success) {
                return {
                    success: true,
                    message: response.message,
                    data: response.data,
                };
            }
            else {
                return {
                    success: false,
                    message: response.message,
                };
            }
        });
    }
    // Hotel Search
    HotelSearch(payload, markup_set) {
        return __awaiter(this, void 0, void 0, function* () {
            const { code, destination } = payload, restBody = __rest(payload, ["code", "destination"]);
            const response = (yield this.request.postRequest(ctHotelApiEndpoints_1.default.HOTEL_SEARCH, Object.assign(Object.assign({}, restBody), { code: `${destination === 'City' ? 'location' : 'hotel'}-${code}` })));
            if (!response.success) {
                return false;
            }
            const hotelMarkupModel = new hotelMarkupsModel_1.default(this.trx);
            const markupSet = yield hotelMarkupModel.getHotelMarkup({
                markup_for: 'Book',
                set_id: markup_set,
                status: true,
            });
            if (!markupSet.length || markupSet[0].set_status === false) {
                return response.data;
            }
            const _a = response.data, { hotels } = _a, restData = __rest(_a, ["hotels"]);
            if (!hotels) {
                return false;
            }
            const modifiedHotels = [];
            const { markup, mode, type } = markupSet[0];
            for (const hotel of hotels) {
                modifiedHotels.push(Object.assign(Object.assign({}, hotel), { price_details: this.getMarkupPrice({
                        prices: hotel.price_details,
                        markup: { markup: Number(markup), mode, type },
                    }) }));
            }
            if (!modifiedHotels.length) {
                return false;
            }
            return Object.assign(Object.assign({}, restData), { hotels: modifiedHotels });
        });
    }
    HotelRooms(payload, markup_set) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.request.postRequest(ctHotelApiEndpoints_1.default.HOTEL_ROOMS, payload);
            if (!response.success) {
                return false;
            }
            else {
                if (response.data.success === false) {
                    return false;
                }
                else {
                    const hotels = response.data;
                    const hotelMarkupModel = new hotelMarkupsModel_1.default(this.trx);
                    const markupSet = yield hotelMarkupModel.getHotelMarkup({
                        markup_for: 'Both',
                        set_id: markup_set,
                        status: true,
                    });
                    let bookMarkup = {
                        markup: 0,
                        mode: constants_1.MARKUP_MODE_INCREASE,
                        type: constants_1.MARKUP_TYPE_PER,
                    };
                    let cancelMarkup = {
                        markup: 0,
                        mode: constants_1.MARKUP_MODE_INCREASE,
                        type: constants_1.MARKUP_TYPE_PER,
                    };
                    for (const markup of markupSet) {
                        if (markup.markup_for === 'Book') {
                            bookMarkup = {
                                markup: Number(markup.markup),
                                mode: markup.mode,
                                type: markup.type,
                            };
                        }
                        else if (markup.markup_for === 'Cancel') {
                            cancelMarkup = {
                                markup: Number(markup.markup),
                                mode: markup.mode,
                                type: markup.type,
                            };
                        }
                    }
                    return hotels.map((hotel) => {
                        const { cancellation_policy, price_details } = hotel;
                        const modifiedPrice = this.getMarkupPrice({
                            prices: price_details,
                            markup: bookMarkup,
                        });
                        hotel.price_details = modifiedPrice;
                        if (cancellation_policy) {
                            const modifiedCancellationPolicy = this.getCancellationMarkupPrice({
                                markup: cancelMarkup,
                                cancellation_policy,
                            });
                            hotel.cancellation_policy = modifiedCancellationPolicy;
                        }
                        return hotel;
                    });
                }
            }
        });
    }
    HotelRecheck(payload, markup_set) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.request.postRequest(ctHotelApiEndpoints_1.default.ROOM_RECHECK, payload);
            if (!response) {
                return false;
            }
            const RecheckHotel = response.data;
            delete RecheckHotel.agency_fee;
            const hotelMarkupModel = new hotelMarkupsModel_1.default(this.trx);
            const markupSet = yield hotelMarkupModel.getHotelMarkup({
                markup_for: 'Both',
                set_id: markup_set,
                status: true,
            });
            let bookMarkup = {
                markup: 0,
                mode: constants_1.MARKUP_MODE_INCREASE,
                type: constants_1.MARKUP_TYPE_PER,
            };
            let cancelMarkup = {
                markup: 0,
                mode: constants_1.MARKUP_MODE_INCREASE,
                type: constants_1.MARKUP_TYPE_PER,
            };
            for (const markup of markupSet) {
                if (markup.markup_for === 'Book') {
                    bookMarkup = {
                        markup: Number(markup.markup),
                        mode: markup.mode,
                        type: markup.type,
                    };
                }
                else if (markup.markup_for === 'Cancel') {
                    cancelMarkup = {
                        markup: Number(markup.markup),
                        mode: markup.mode,
                        type: markup.type,
                    };
                }
            }
            const { rates, fee } = RecheckHotel, restData = __rest(RecheckHotel, ["rates", "fee"]);
            const price_details = this.getMarkupPrice({
                markup: bookMarkup,
                prices: {
                    price: fee.fee,
                    tax: fee.total_tax,
                    total_price: fee.total_fee,
                },
            });
            const newRates = rates.map((rate) => {
                const newRate = this.getMarkupPrice({
                    markup: bookMarkup,
                    prices: rate.price_details,
                });
                delete rate.agency_price_details;
                if (rate.cancellation_policy) {
                    rate.cancellation_policy = this.getCancellationMarkupPrice({
                        markup: cancelMarkup,
                        cancellation_policy: rate.cancellation_policy,
                    });
                }
                rate.price_details = newRate;
                return rate;
            });
            return Object.assign(Object.assign({}, restData), { fee: price_details, rates: newRates, supplier_fee: {
                    price: fee.fee,
                    tax: fee.total_tax,
                    total_price: fee.total_fee,
                }, supplier_rates: rates });
        });
    }
    HotelBooking(payload, markup_set) {
        return __awaiter(this, void 0, void 0, function* () {
            const recheckRoomsPayload = payload.booking_items.map((item) => {
                return {
                    rate_key: item.rate_key,
                    group_code: payload.group_code,
                };
            });
            const nights = dateTimeLib_1.default.nightsCount(payload.checkin, payload.checkout);
            const recheck = yield this.HotelRecheck({
                search_id: payload.search_id,
                rooms: recheckRoomsPayload,
                nights: nights,
            }, markup_set);
            if (!recheck) {
                return false;
            }
            const response = yield this.request.postRequest(ctHotelApiEndpoints_1.default.HOTEL_BOOK, payload);
            if (!response.success) {
                return false;
            }
            const bookingData = response.data;
            const hotelMarkupModel = new hotelMarkupsModel_1.default(this.trx);
            const markupSet = yield hotelMarkupModel.getHotelMarkup({
                markup_for: 'Book',
                set_id: markup_set,
                status: true,
            });
            if (!markupSet.length || markupSet[0].set_status === false) {
                return bookingData;
            }
            const { markup, mode, type } = markupSet[0];
            bookingData.price_details = this.getMarkupPrice({
                prices: bookingData.price_details,
                markup: { markup: Number(markup), mode, type },
            });
            return bookingData;
        });
    }
    // get markup price func
    getMarkupPrice({ prices, markup, }) {
        let tax = Number(prices.tax);
        let main_price = Number(prices.price);
        let amount = main_price;
        if (markup.markup > 0) {
            if (markup.type === constants_1.MARKUP_TYPE_PER) {
                if (markup.mode === constants_1.MARKUP_MODE_INCREASE) {
                    amount = Math.ceil((main_price * markup.markup) / 100);
                    amount = main_price + amount;
                }
                else {
                    amount = Math.ceil((main_price * markup.markup) / 100);
                    amount = main_price - amount;
                }
            }
            else {
                if (markup.mode === constants_1.MARKUP_MODE_INCREASE) {
                    amount = main_price + markup.markup;
                }
                else {
                    amount = main_price - markup.markup;
                }
            }
        }
        return {
            price: amount,
            tax: tax,
            total_price: amount + tax,
        };
    }
    getCancellationMarkupPrice({ markup, cancellation_policy, }) {
        const { no_show_fee, details } = cancellation_policy, policy = __rest(cancellation_policy, ["no_show_fee", "details"]);
        let modified_no_show_fee = no_show_fee;
        if (markup.markup > 0) {
            if (markup.type === constants_1.MARKUP_TYPE_PER) {
                if (markup.mode === constants_1.MARKUP_MODE_INCREASE) {
                    modified_no_show_fee = Math.ceil((no_show_fee * markup.markup) / 100);
                    modified_no_show_fee = no_show_fee + modified_no_show_fee;
                }
                else {
                    modified_no_show_fee = Math.ceil((no_show_fee * markup.markup) / 100);
                    modified_no_show_fee = no_show_fee - modified_no_show_fee;
                }
            }
            else {
                if (markup.mode === constants_1.MARKUP_MODE_INCREASE) {
                    modified_no_show_fee = no_show_fee + markup.markup;
                }
                else {
                    modified_no_show_fee = no_show_fee - markup.markup;
                }
            }
        }
        const modifiedDetails = details.map((detail) => {
            let modified_fee = detail.fee;
            if (markup.markup > 0) {
                if (markup.type === constants_1.MARKUP_TYPE_PER) {
                    if (markup.mode === constants_1.MARKUP_MODE_INCREASE) {
                        modified_fee = Math.ceil((detail.fee * markup.markup) / 100);
                        modified_fee = detail.fee + modified_fee;
                    }
                    else {
                        modified_fee = Math.ceil((detail.fee * markup.markup) / 100);
                        modified_fee = detail.fee - modified_fee;
                    }
                }
                else {
                    if (markup.mode === constants_1.MARKUP_MODE_INCREASE) {
                        modified_fee = detail.fee + markup.markup;
                    }
                    else {
                        modified_fee = detail.fee - markup.markup;
                    }
                }
            }
            return Object.assign(Object.assign({}, detail), { fee: modified_fee });
        });
        return Object.assign({ no_show_fee: modified_no_show_fee, details: modifiedDetails }, policy);
    }
}
exports.CTHotelSupportService = CTHotelSupportService;
