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
exports.AgentSubAgentHolidayService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentSubAgentHolidayService extends abstract_service_1.default {
    constructor() {
        super();
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
                    booked_by: constants_1.SOURCE_SUB_AGENT,
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
}
exports.AgentSubAgentHolidayService = AgentSubAgentHolidayService;
