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
exports.AdminAgentHolidayService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
const customError_1 = __importDefault(require("../../../../utils/lib/customError"));
const holidayConstants_1 = require("../../../../utils/miscellaneous/holidayConstants");
class AdminAgentHolidayService extends abstract_service_1.default {
    getHolidayPackageBookingList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
                const query = req.query;
                const getBookingList = yield holidayPackageBookingModel.getHolidayBookingList(Object.assign({ booked_by: constants_1.SOURCE_AGENT }, query));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: getBookingList.total,
                    data: getBookingList.data
                };
            }));
        });
    }
    getSingleHolidayPackageBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
                const { id } = req.params;
                const get_booking = yield holidayPackageBookingModel.getSingleHolidayBooking({
                    id,
                    booked_by: constants_1.SOURCE_AGENT
                });
                if (!get_booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                else {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: get_booking
                    };
                }
                ;
            }));
        });
    }
    updateHolidayPackageBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
                const { id } = req.params;
                const get_booking = yield holidayPackageBookingModel.getSingleHolidayBooking({
                    id,
                    booked_by: constants_1.SOURCE_AGENT
                });
                if (!get_booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                if ([holidayConstants_1.HOLIDAY_BOOKING_STATUS.CONFIRMED, holidayConstants_1.HOLIDAY_BOOKING_STATUS.CANCELLED, holidayConstants_1.HOLIDAY_BOOKING_STATUS.REJECTED, holidayConstants_1.HOLIDAY_BOOKING_STATUS.COMPLETED, holidayConstants_1.HOLIDAY_BOOKING_STATUS.REFUNDED].includes(get_booking.status)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.BOOKING_STATUS_NOT_ALLOWED_TO_CHANGE
                    };
                }
                const update_res = yield holidayPackageBookingModel.updateHolidayBooking({ status: req.body.status, updated_by: user_id, updated_at: new Date() }, id);
                if (update_res) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Booking has been updated successfully"
                    };
                }
                else {
                    throw new customError_1.default("Something went wrong while updating the holiday package booking", this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
                }
                ;
            }));
        });
    }
}
exports.AdminAgentHolidayService = AdminAgentHolidayService;
