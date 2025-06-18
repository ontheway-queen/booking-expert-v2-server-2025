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
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
class AdminAgentHotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id, filter, from_date, limit, skip, to_date } = req.query;
            const hotelBookingModel = this.Model.HotelBookingModel();
            const data = yield hotelBookingModel.getHotelBooking({
                source_type: 'AGENT',
                filter,
                from_date,
                to_date,
                limit,
                skip,
                source_id: agency_id,
            }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    getSingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const hotelBookingModel = this.Model.HotelBookingModel();
            const data = yield hotelBookingModel.getSingleBooking({
                booking_id: Number(id),
                source_type: 'AGENT',
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
}
exports.default = AdminAgentHotelService;
