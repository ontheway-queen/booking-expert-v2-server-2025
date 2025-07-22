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
const hotelMarkupsModel_1 = __importDefault(require("../../../models/dynamicFareRuleModel/hotelMarkupsModel"));
const constants_1 = require("../../miscellaneous/constants");
const lib_1 = __importDefault(require("../../lib/lib"));
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
    HotelSearch(_a) {
        return __awaiter(this, arguments, void 0, function* ({ markup_set, payload, markup_amount, }) {
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
            const _b = response.data, { hotels } = _b, restData = __rest(_b, ["hotels"]);
            if (!hotels) {
                return false;
            }
            const modifiedHotels = [];
            const { markup, mode, type } = markupSet[0];
            for (const hotel of hotels) {
                const price_details = this.getMarkupPrice({
                    prices: hotel.price_details,
                    markup: { markup: Number(markup), mode, type },
                });
                if (markup_amount) {
                    price_details.price = lib_1.default.markupCalculation({
                        amount: price_details.total_price,
                        markup: markup_amount,
                    });
                    price_details.total_price = price_details.price + price_details.tax;
                }
                modifiedHotels.push(Object.assign(Object.assign({}, hotel), { price_details }));
            }
            if (!modifiedHotels.length) {
                return false;
            }
            return Object.assign(Object.assign({}, restData), { hotels: modifiedHotels });
        });
    }
    HotelRooms(_a) {
        return __awaiter(this, arguments, void 0, function* ({ markup_set, payload, markup_amount, }) {
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
                        if (markup_amount) {
                            price_details.price = lib_1.default.markupCalculation({
                                amount: price_details.total_price,
                                markup: markup_amount,
                            });
                            price_details.total_price = price_details.price + price_details.tax;
                        }
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
    HotelRecheck(_a) {
        return __awaiter(this, arguments, void 0, function* ({ markup_set, payload, markup_amount, with_agent_markup, with_vendor_price, }) {
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
                markup_amount,
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
            const formData = new FormData();
            Object.keys(payload).forEach((key) => {
                if (key === 'booking_items') {
                    formData.append(key, JSON.stringify(payload[key]));
                }
                else if (key === 'holder') {
                    formData.append(key, JSON.stringify(payload[key]));
                }
                else {
                    formData.append(key, payload[key]);
                }
            });
            const response = yield this.request.postRequestFormData(ctHotelApiEndpoints_1.default.HOTEL_BOOK, formData);
            if (!response.success) {
                return false;
            }
            const bookingData = response.data;
            return bookingData;
        });
    }
    // get markup price func
    getMarkupPrice({ prices, markup, markup_amount, }) {
        let tax = Number(prices.tax);
        let main_price = Number(prices.price);
        let new_markup = 0;
        let new_discount = 0;
        let agent_discount = 0;
        let agent_markup = 0;
        if (markup.markup > 0) {
            if (markup.type === constants_1.MARKUP_TYPE_PER) {
                if (markup.mode === constants_1.MARKUP_MODE_INCREASE) {
                    new_markup = Math.ceil((main_price * markup.markup) / 100);
                }
                else {
                    new_discount = Math.ceil((main_price * markup.markup) / 100);
                }
            }
            else {
                if (markup.mode === constants_1.MARKUP_MODE_INCREASE) {
                    new_markup = markup.markup;
                }
                else {
                    new_discount = markup.markup;
                }
            }
        }
        main_price += new_markup - new_discount;
        if (markup_amount) {
            if (markup_amount.markup > 0) {
                if (markup_amount.markup_type === constants_1.MARKUP_TYPE_PER) {
                    if (markup_amount.markup_mode === constants_1.MARKUP_MODE_INCREASE) {
                        agent_markup = Math.ceil((main_price * markup_amount.markup) / 100);
                    }
                    else {
                        agent_discount = Math.ceil((main_price * markup_amount.markup) / 100);
                    }
                }
                else {
                    if (markup_amount.markup_mode === constants_1.MARKUP_MODE_INCREASE) {
                        agent_markup = markup_amount.markup;
                    }
                    else {
                        agent_discount = markup_amount.markup;
                    }
                }
            }
        }
        main_price += agent_markup - agent_discount;
        return {
            price: main_price,
            tax: tax,
            total_price: main_price + tax,
            markup: new_markup,
            discount: new_discount,
            agent_markup,
            agent_discount,
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
