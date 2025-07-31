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
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class AgentB2CUmrahService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getUmrahPackages(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const umrahModel = this.Model.UmrahPackageModel();
            const data = yield umrahModel.getAgentB2CUmrahPackageList({
                source_id: agency_id,
                status: true,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    getSingleUmrahPackages(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const { slug } = req.params;
            const umrahModel = this.Model.UmrahPackageModel();
            const data = yield umrahModel.getSingleAgentB2CUmrahPackageDetails({
                slug,
                source_id: agency_id,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                    data,
                };
            }
            const photos = yield umrahModel.getSingleUmrahPackageImages({
                source_id: agency_id,
                umrah_id: data.id,
            });
            const includes = yield umrahModel.getUmrahPackageInclude(data.id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { photos,
                    includes }),
            };
        });
    }
    bookUmrahPackages(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
                const { user_id } = req.agencyB2CUser;
                const { id } = req.params;
                const _a = req.body, { traveler_adult, traveler_child, note } = _a, contact = __rest(_a, ["traveler_adult", "traveler_child", "note"]);
                const umrahBookingModel = this.Model.UmrahBookingModel(trx);
                const umrahModel = this.Model.UmrahPackageModel(trx);
                const check = yield umrahModel.getSingleAgentB2CUmrahPackageDetails({
                    source_id: agency_id,
                    umrah_id: Number(id),
                });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const booking_ref = yield lib_1.default.generateNo({ trx, type: 'Agent_Umrah' });
                const total_adult_price = Number(check.adult_price) * traveler_adult;
                let total_child_price = 0;
                if (traveler_child) {
                    total_child_price = Number(check.child_price) * traveler_child;
                }
                const booking = yield umrahBookingModel.insertUmrahBooking({
                    booking_ref,
                    source_id: agency_id,
                    user_id,
                    umrah_id: check.id,
                    note_from_customer: note,
                    per_adult_price: Number(check.adult_price),
                    per_child_price: Number(check.child_price),
                    source_type: constants_1.SOURCE_AGENT_B2C,
                    traveler_adult: traveler_adult,
                    traveler_child: traveler_child,
                    total_price: total_adult_price + total_adult_price,
                });
                yield umrahBookingModel.insertUmrahBookingContact(Object.assign({ booking_id: booking[0].id }, contact));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: booking[0].id,
                    },
                };
            }));
        });
    }
    getUmrahPackagesBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const { user_id } = req.agencyB2CUser;
            const UmrahBookingModel = this.Model.UmrahBookingModel();
            const query = req.query;
            const data = yield UmrahBookingModel.getAgentB2CUmarhBookingList(Object.assign({ agency_id,
                user_id }, query), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    getSingleUmrahBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const { user_id } = req.agencyB2CUser;
            const { id } = req.params;
            const booking_id = Number(id);
            const UmrahBookingModel = this.Model.UmrahBookingModel();
            const data = yield UmrahBookingModel.getSingleAgentB2CUmrahBookingDetails({
                id: booking_id,
                source_id: agency_id,
                user_id,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const contact = yield UmrahBookingModel.getUmrahBookingContacts(booking_id);
            console.log({ contact });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { contact }),
            };
        });
    }
}
exports.default = AgentB2CUmrahService;
