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
exports.SubAgentHolidayService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const holidayConstants_1 = require("../../../utils/miscellaneous/holidayConstants");
const constants_1 = require("../../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class SubAgentHolidayService extends abstract_service_1.default {
    searchHolidayPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const query = req.query;
                const { agency_id } = req.agencyB2CWhiteLabel;
                console.log({ query, agency_id });
                const data = yield holidayPackageModel.getHolidayPackageList(Object.assign(Object.assign({}, query), { created_by: holidayConstants_1.HOLIDAY_CREATED_BY_AGENT, holiday_for: constants_1.SOURCE_AGENT, status: true, agency_id }), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: data.total,
                    data: data.data,
                };
            }));
        });
    }
    getSingleHolidayPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
                const { slug } = req.params;
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const get_holiday_data = yield holidayPackageModel.getSingleHolidayPackage({
                    slug,
                    created_by: holidayConstants_1.HOLIDAY_CREATED_BY_AGENT,
                    holiday_for: constants_1.SOURCE_AGENT,
                    status: true,
                    agency_id,
                });
                if (!get_holiday_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                else {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: get_holiday_data,
                    };
                }
            }));
        });
    }
    bookHolidayPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const { agency_id: main_agency_id } = req.agencyB2CWhiteLabel;
                const body = req.body;
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
                const get_holiday_data = yield holidayPackageModel.getSingleHolidayPackage({
                    id: body.holiday_package_id,
                    created_by: holidayConstants_1.HOLIDAY_CREATED_BY_AGENT,
                    holiday_for: constants_1.SOURCE_AGENT,
                    agency_id: main_agency_id,
                });
                if (!get_holiday_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                //check duplicate booking
                const check_duplicate_booking = yield holidayPackageBookingModel.getHolidayBookingList({
                    holiday_package_id: body.holiday_package_id,
                    source_type: constants_1.SOURCE_SUB_AGENT,
                    source_id: agency_id,
                    status: [
                        holidayConstants_1.HOLIDAY_BOOKING_STATUS.PENDING,
                        holidayConstants_1.HOLIDAY_BOOKING_STATUS.CONFIRMED,
                        holidayConstants_1.HOLIDAY_BOOKING_STATUS.IN_PROGRESS,
                        holidayConstants_1.HOLIDAY_BOOKING_STATUS.COMPLETED,
                    ],
                });
                if (check_duplicate_booking.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.HOLIDAY_PACKAGE_ALREADY_BOOKED,
                    };
                }
                //calculate the price
                const price_details = get_holiday_data.pricing.find((item) => item.price_for === constants_1.SOURCE_AGENT);
                if (!price_details) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.PRICE_NOT_FOUND,
                    };
                }
                const total_adult_price = Number(price_details.adult_price) * body.total_adult;
                const total_child_price = Number(price_details.child_price) * body.total_child;
                let total_price = total_adult_price + total_child_price;
                let total_markup = 0;
                if (price_details.markup_type) {
                    total_markup =
                        price_details.markup_type === 'FLAT'
                            ? Number(price_details.markup_price)
                            : Number(total_price) * (Number(price_details.markup_price) / 100);
                    total_price -= total_markup;
                }
                const booking_ref = yield lib_1.default.generateNo({
                    trx,
                    type: constants_1.GENERATE_AUTO_UNIQUE_ID.agent_holiday,
                });
                const booking_body = Object.assign(Object.assign({}, body), { booking_ref, source_type: constants_1.SOURCE_SUB_AGENT, source_id: agency_id, user_id,
                    total_adult_price,
                    total_child_price,
                    total_markup,
                    total_price, status: holidayConstants_1.HOLIDAY_BOOKING_STATUS.PENDING });
                const booking_res = yield holidayPackageBookingModel.insertHolidayBooking(booking_body);
                if (booking_res.length) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_SUCCESSFUL,
                        message: 'Holiday package has been booked successfully',
                        data: {
                            id: booking_res[0].id,
                            booking_ref,
                            total_adult_price,
                            total_child_price,
                            total_markup,
                            total_price,
                        },
                    };
                }
                else {
                    throw new customError_1.default('An error occurred while booking the holiday package', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
                }
            }));
        });
    }
    getHolidayPackageBookingList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
                const query = req.query;
                const getBookingList = yield holidayPackageBookingModel.getHolidayBookingList(Object.assign({ source_type: constants_1.SOURCE_SUB_AGENT, source_id: agency_id }, query), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: getBookingList.total,
                    data: getBookingList.data,
                };
            }));
        });
    }
    getSingleHolidayPackageBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
                const { id } = req.params;
                const get_booking = yield holidayPackageBookingModel.getSingleHolidayBooking({
                    id,
                    booked_by: constants_1.SOURCE_AGENT,
                    source_id: agency_id,
                });
                if (!get_booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                else {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: get_booking,
                    };
                }
            }));
        });
    }
    cancelHolidayPackageBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
                const { id } = req.params;
                const get_booking = yield holidayPackageBookingModel.getSingleHolidayBooking({
                    id,
                    booked_by: constants_1.SOURCE_AGENT,
                    source_id: agency_id,
                });
                if (!get_booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if ([
                    holidayConstants_1.HOLIDAY_BOOKING_STATUS.CONFIRMED,
                    holidayConstants_1.HOLIDAY_BOOKING_STATUS.CANCELLED,
                    holidayConstants_1.HOLIDAY_BOOKING_STATUS.REJECTED,
                    holidayConstants_1.HOLIDAY_BOOKING_STATUS.COMPLETED,
                    holidayConstants_1.HOLIDAY_BOOKING_STATUS.REFUNDED,
                ].includes(get_booking.status)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.BOOKING_CANCELLATION_NOT_ALLOWED,
                    };
                }
                const cancel_res = yield holidayPackageBookingModel.updateHolidayBooking({
                    status: holidayConstants_1.HOLIDAY_BOOKING_STATUS.CANCELLED,
                    cancelled_by: user_id,
                    cancelled_at: new Date(),
                }, id);
                if (cancel_res) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'Booking has been cancelled successfully',
                    };
                }
                else {
                    throw new customError_1.default('Something went wrong while cancelling the holiday package booking', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
                }
            }));
        });
    }
}
exports.SubAgentHolidayService = SubAgentHolidayService;
