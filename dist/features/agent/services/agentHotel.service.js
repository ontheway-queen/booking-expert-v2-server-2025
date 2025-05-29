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
exports.AgentHotelService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const ctHotelSupport_service_1 = require("../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const dateTimeLib_1 = __importDefault(require("../../../utils/lib/dateTimeLib"));
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
                        message: 'Hotel markup set is not configured for this agency.',
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                const _a = req.body, { name } = _a, payload = __rest(_a, ["name"]);
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
                    name: name,
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
    hotelSearchHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const query = req.query;
            const OthersModel = this.Model.OthersModel();
            const data = yield OthersModel.getHotelSearchHistory(Object.assign({ agency_id, user_type: 'Agent' }, query));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
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
                        message: 'Hotel markup set is not configured for this agency.',
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
                        message: 'Hotel markup set is not configured for this agency.',
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
                const { supplier_fee, supplier_rates } = data, restData = __rest(data, ["supplier_fee", "supplier_rates"]);
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                    data: restData,
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
                        message: 'Hotel markup set is not configured for this agency.',
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                const files = req.files || [];
                const body = req.body;
                const recheckRoomsPayload = body.booking_items.map((item) => {
                    return {
                        rate_key: item.rate_key,
                        group_code: body.group_code,
                    };
                });
                const nights = dateTimeLib_1.default.nightsCount(body.checkin, body.checkout);
                const recheck = yield ctHotelSupport.HotelRecheck({
                    search_id: body.search_id,
                    rooms: recheckRoomsPayload,
                    nights: nights,
                }, agent.hotel_markup_set);
                if (!recheck) {
                    return {
                        success: false,
                        message: 'Booking failed. Please try again with another room.',
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                const booking = yield ctHotelSupport.HotelBooking(body, agent.hotel_markup_set);
                if (!booking) {
                    return {
                        success: false,
                        message: 'Booking failed. Please try again with another room.',
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                const payload = body;
                if (files.length) {
                    let totalPax = 0;
                    payload.booking_items.forEach((item) => {
                        item.rooms.forEach((room) => {
                            totalPax += room.paxes.length;
                        });
                    });
                    if (totalPax < files.length) {
                        return {
                            success: false,
                            message: 'Number of files does not match the total number of paxes.',
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                        };
                    }
                    files.forEach((file) => {
                        var _a, _b;
                        const splitName = file.fieldname.split('_');
                        if (splitName.length !== 4) {
                            throw new customError_1.default('Invalid file field name format.', this.StatusCode.HTTP_BAD_REQUEST);
                        }
                        if (!((_b = (_a = payload.booking_items[0]) === null || _a === void 0 ? void 0 : _a.rooms[Number(splitName[1]) - 1]) === null || _b === void 0 ? void 0 : _b.paxes[Number(splitName[3]) - 1])) {
                            throw new customError_1.default(`Room no or room pax no(${file.fieldname}) does not match with passport/id filename. Filename example: room_1_pax_1 - room_1(Room Number)_pax_1(Pax number)`, this.StatusCode.HTTP_BAD_REQUEST);
                        }
                        payload.booking_items[0].rooms[Number(splitName[1]) - 1].paxes[Number(splitName[3]) - 1].id_file = file.filename;
                    });
                }
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data: booking,
                };
            }));
        });
    }
}
exports.AgentHotelService = AgentHotelService;
