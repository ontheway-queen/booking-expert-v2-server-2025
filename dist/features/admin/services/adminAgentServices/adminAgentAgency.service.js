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
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
class AdminAgentAgencyService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const AgencyModel = this.Model.AgencyModel();
            const data = yield AgencyModel.getAgencyList(query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    getSingleAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const agency_id = Number(id);
                const AgencyModel = this.Model.AgencyModel(trx);
                const data = yield AgencyModel.getSingleAgency(agency_id);
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                let whiteLabelPermissions = {
                    flight: false,
                    hotel: false,
                    visa: false,
                    holiday: false,
                    umrah: false,
                    group_fare: false,
                    blog: false,
                };
                if (data.white_label) {
                    const wPermissions = yield AgencyModel.getWhiteLabelPermission(agency_id);
                    const { token } = wPermissions, rest = __rest(wPermissions, ["token"]);
                    whiteLabelPermissions = rest;
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: Object.assign(Object.assign({}, data), { whiteLabelPermissions }),
                };
            }));
        });
    }
}
exports.default = AdminAgentAgencyService;
