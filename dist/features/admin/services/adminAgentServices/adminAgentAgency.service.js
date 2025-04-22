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
const customError_1 = __importDefault(require("../../../../utils/lib/customError"));
const uuid_1 = require("uuid");
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
                    token: '',
                };
                if (data.white_label) {
                    const wPermissions = yield AgencyModel.getWhiteLabelPermission(agency_id);
                    if (wPermissions) {
                        whiteLabelPermissions = wPermissions;
                    }
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
    updateAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const agency_id = Number(id);
                const AgentModel = this.Model.AgencyModel(trx);
                const checkAgency = yield AgentModel.checkAgency({
                    agency_id,
                });
                if (!checkAgency) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (checkAgency.status === 'Incomplete' ||
                    checkAgency.status === 'Pending' ||
                    checkAgency.status === 'Rejected') {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                const { user_id } = req.admin;
                const _a = req.body, { white_label_permissions } = _a, restBody = __rest(_a, ["white_label_permissions"]);
                const files = req.files || [];
                const payload = Object.assign({}, restBody);
                files.forEach((file) => {
                    switch (file.fieldname) {
                        case 'agency_logo':
                            payload.agency_logo = file.filename;
                            break;
                        case 'civil_aviation':
                            payload.civil_aviation = file.filename;
                            break;
                        case 'trade_license':
                            payload.trade_license = file.filename;
                            break;
                        case 'national_id':
                            payload.national_id = file.filename;
                            break;
                        default:
                            throw new customError_1.default('Invalid files. Please provide valid trade license, civil aviation, NID, logo.', this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                });
                if (restBody.white_label && !white_label_permissions) {
                    const checkPermission = yield AgentModel.getWhiteLabelPermission(agency_id);
                    if (!checkPermission) {
                        const uuid = (0, uuid_1.v4)();
                        yield AgentModel.createWhiteLabelPermission({
                            agency_id,
                            token: uuid,
                            blog: false,
                            flight: false,
                            group_fare: false,
                            holiday: false,
                            hotel: false,
                            umrah: false,
                            visa: false,
                        });
                    }
                }
                if (white_label_permissions) {
                    const checkPermission = yield AgentModel.getWhiteLabelPermission(agency_id);
                    if (checkPermission && white_label_permissions) {
                        yield AgentModel.updateWhiteLabelPermission(white_label_permissions, agency_id);
                    }
                    else {
                        const uuid = (0, uuid_1.v4)();
                        yield AgentModel.createWhiteLabelPermission(Object.assign({ agency_id, token: uuid }, white_label_permissions));
                    }
                }
                yield AgentModel.updateAgency(payload, agency_id);
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    type: 'UPDATE',
                    details: `Agency Updated. Data: ${JSON.stringify(payload)}`,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    updateAgencyApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const agency_id = Number(id);
                const AgentModel = this.Model.AgencyModel(trx);
                const MarkupSetModel = this.Model.MarkupSetModel(trx);
                const checkAgency = yield AgentModel.checkAgency({
                    agency_id,
                });
                if (!checkAgency) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (checkAgency.status === 'Incomplete' ||
                    checkAgency.status === 'Pending' ||
                    checkAgency.status === 'Rejected') {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                const body = req.body;
                let payload = {};
                if (body.status === 'Active') {
                    const checkFlightMarkupSet = yield MarkupSetModel.getSingleMarkupSet(body.flight_markup_set, true, 'Flight');
                    if (!checkFlightMarkupSet) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                            message: 'Invalid flight markup set.',
                        };
                    }
                    const checkHotelMarkupSet = yield MarkupSetModel.getSingleMarkupSet(body.flight_markup_set, true, 'Hotel');
                    if (!checkHotelMarkupSet) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                            message: 'Invalid hotel markup set.',
                        };
                    }
                    payload.status = body.status;
                    payload.flight_markup_set = body.flight_markup_set;
                    payload.hotel_markup_set = body.hotel_markup_set;
                }
                else {
                    payload.status = body.status;
                }
                yield AgentModel.updateAgency(payload, agency_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.default = AdminAgentAgencyService;
