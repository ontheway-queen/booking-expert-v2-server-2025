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
exports.AgentSubAgentUmrahService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
class AgentSubAgentUmrahService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // get umrah booking
    getUmrahBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const query = req.query;
            const model = this.Model.UmrahBookingModel();
            const data = yield model.getAgentB2CUmrahBookingList(Object.assign(Object.assign({ agency_id }, query), { source_type: SOURCE_AGENT_B2C }), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    // get single umrah booking
    getSingleUmrahBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const { id } = req.params;
            const booking_id = Number(id);
            const UmrahBookingModel = this.Model.UmrahBookingModel();
            const data = yield UmrahBookingModel.getSingleAgentB2CUmrahBookingDetails({
                id: booking_id,
                source_id: agency_id,
                source_type: SOURCE_AGENT_B2C,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const contact = yield UmrahBookingModel.getUmrahBookingContacts(booking_id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { contact }),
            };
        });
    }
    //update umrah booking status
    updateUmrahBookingStatus(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const { id } = req.params;
            const { status } = req.body;
            const booking_id = Number(id);
            const UmrahBookingModel = this.Model.UmrahBookingModel();
            const data = yield UmrahBookingModel.getSingleAgentB2CUmrahBookingDetails({
                id: booking_id,
                source_id: agency_id,
                source_type: SOURCE_AGENT_B2C,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield UmrahBookingModel.updateUmrahBooking({ status }, booking_id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
}
exports.AgentSubAgentUmrahService = AgentSubAgentUmrahService;
