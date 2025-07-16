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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const ctHotelSupport_service_1 = require("../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class AgentB2CHotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    hotelSearch(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const ctHotelSupport = new ctHotelSupport_service_1.CTHotelSupportService(trx);
                const OthersModel = this.Model.OthersModel(trx);
                const { agency_id } = req.agencyB2CWhiteLabel;
                const _a = req.body, { name } = _a, payload = __rest(_a, ["name"]);
                yield OthersModel.insertHotelSearchHistory({
                    check_in_date: payload.checkin,
                    check_out_date: payload.checkout,
                    guest_n_rooms: JSON.stringify(payload.rooms),
                    destination_type: payload.destination,
                    nationality: payload.client_nationality,
                    user_type: 'Agent B2C',
                    agency_id: agency_id,
                    code: payload.code,
                    name: name,
                });
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
                //get b2c markup
                const markup_amount = yield lib_1.default.getAgentB2CTotalMarkup({
                    trx,
                    type: 'Hotel',
                    agency_id,
                });
                if (!markup_amount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Markup information is empty. Contact with the authority',
                    };
                }
                const result = yield ctHotelSupport.HotelSearch({
                    payload,
                    markup_set: agent.hotel_markup_set,
                    markup_amount,
                });
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
                const ctHotelSupport = new ctHotelSupport_service_1.CTHotelSupportService(trx);
                const agencyModel = this.Model.AgencyModel(trx);
                const { agency_id } = req.agencyB2CWhiteLabel;
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
                //get b2c markup
                const markup_amount = yield lib_1.default.getAgentB2CTotalMarkup({
                    trx,
                    type: 'Hotel',
                    agency_id,
                });
                if (!markup_amount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Markup information is empty. Contact with the authority',
                    };
                }
                const payload = req.body;
                const result = yield ctHotelSupport.HotelRooms({
                    payload,
                    markup_set: agent.hotel_markup_set,
                    markup_amount,
                });
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
                const payload = req.body;
                const { agency_id } = req.agencyB2CWhiteLabel;
                const agencyModel = this.Model.AgencyModel(trx);
                const ctHotelSupport = new ctHotelSupport_service_1.CTHotelSupportService(trx);
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
                //get b2c markup
                const markup_amount = yield lib_1.default.getAgentB2CTotalMarkup({
                    trx,
                    type: 'Hotel',
                    agency_id,
                });
                if (!markup_amount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Markup information is empty. Contact with the authority',
                    };
                }
                const data = yield ctHotelSupport.HotelRecheck({
                    payload,
                    markup_set: agent.hotel_markup_set,
                    markup_amount,
                });
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
    hotelBook(req) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    hotelHotelBookingList(req) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    singleHotelBooking(req) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.default = AgentB2CHotelService;
