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
exports.AgentHotelService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const ctHotelSupport_service_1 = require("../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service");
class AgentHotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    hotelSearch(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const ctHotelSupport = new ctHotelSupport_service_1.CTHotelSupportService(trx);
                const agencyModel = this.Model.AgencyModel(trx);
                const OthersModel = this.Model.OthersModel(trx);
                const agent = yield agencyModel.checkAgency({
                    agency_id,
                    status: 'Active',
                });
                if (!agent) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                if (!agent.hotel_markup_set) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                const payload = req.body;
                yield OthersModel.insertHotelSearchHistory({
                    check_in_date: payload.checkin,
                    check_out_date: payload.checkout,
                    guest_n_rooms: JSON.stringify(payload.rooms),
                    destination_type: payload.destination,
                    user_id: user_id,
                    nationality: payload.client_nationality,
                    user_type: 'Agent',
                    agency_id,
                    code: payload.code,
                });
                const result = yield ctHotelSupport.HotelSearch(payload, agent.hotel_markup_set);
                if (result) {
                    return {
                        success: true,
                        message: this.ResMsg.HTTP_OK,
                        code: this.StatusCode.HTTP_OK,
                        data: result,
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
    getHotelRooms(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const ctHotelSupport = new ctHotelSupport_service_1.CTHotelSupportService(trx);
                const agencyModel = this.Model.AgencyModel(trx);
                const agent = yield agencyModel.checkAgency({
                    agency_id,
                    status: 'Active',
                });
                if (!agent) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                if (!agent.hotel_markup_set) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                const payload = req.body;
                const result = yield ctHotelSupport.HotelRooms(payload, agent.hotel_markup_set);
                if (result) {
                    return {
                        success: true,
                        message: this.ResMsg.HTTP_OK,
                        code: this.StatusCode.HTTP_OK,
                        data: result,
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
    hotelRoomRecheck(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const ctHotelSupport = new ctHotelSupport_service_1.CTHotelSupportService(trx);
                const agencyModel = this.Model.AgencyModel(trx);
                const agent = yield agencyModel.checkAgency({
                    agency_id,
                    status: 'Active',
                });
                if (!agent) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                if (!agent.hotel_markup_set) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                const payload = req.body;
                const data = yield ctHotelSupport.HotelRecheck(payload, agent.hotel_markup_set);
                if (!data) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                    data: data,
                };
            }));
        });
    }
    hotelBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const ctHotelSupport = new ctHotelSupport_service_1.CTHotelSupportService(trx);
                const agencyModel = this.Model.AgencyModel(trx);
                const agent = yield agencyModel.checkAgency({
                    agency_id,
                    status: 'Active',
                });
                if (!agent) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                if (!agent.hotel_markup_set) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                const files = req.files || [];
                if (files.length) {
                }
                const body = req.body;
                return {
                    success: true,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                    code: this.StatusCode.HTTP_OK,
                    data: body,
                };
            }));
        });
    }
}
exports.AgentHotelService = AgentHotelService;
