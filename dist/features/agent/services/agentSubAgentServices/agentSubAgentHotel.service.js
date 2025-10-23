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
exports.AgentSubAgentHotelService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentSubAgentHotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { filter, from_date, limit, skip, to_date, agent_id } = req.query;
            const { agency_id } = req.agencyUser;
            const hotelBookingModel = this.Model.HotelBookingModel();
            const data = yield hotelBookingModel.getAgentHotelBooking({
                source_type: constants_1.SOURCE_SUB_AGENT,
                filter,
                from_date,
                to_date,
                limit,
                skip,
                source_id: Number(agent_id),
                ref_agent_id: agency_id,
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
            const booking_id = Number(id);
            const { agency_id } = req.agencyUser;
            const hotelBookingModel = this.Model.HotelBookingModel();
            const data = yield hotelBookingModel.getSingleHotelBooking({
                booking_id,
                source_type: constants_1.SOURCE_SUB_AGENT,
                ref_agent_id: agency_id,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const travelers = yield hotelBookingModel.getHotelBookingTraveler(booking_id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { travelers }),
            };
        });
    }
    updateBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const booking_id = Number(id);
                const { agency_id } = req.agencyUser;
                const payload = req.body;
                const hotelBookingModel = this.Model.HotelBookingModel(trx);
                const checkBooking = yield hotelBookingModel.getSingleHotelBooking({
                    booking_id,
                    source_type: constants_1.SOURCE_SUB_AGENT,
                    ref_agent_id: agency_id,
                });
                if (!checkBooking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield hotelBookingModel.updateHotelBooking(payload, {
                    id: booking_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.AgentSubAgentHotelService = AgentSubAgentHotelService;
