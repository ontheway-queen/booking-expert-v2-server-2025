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
class SubAgentProfileService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, agency_id } = req.agencyUser;
            const agencyUserModel = this.Model.AgencyUserModel();
            const AgentModel = this.Model.AgencyModel();
            const user = yield agencyUserModel.checkUser({ id: user_id, agency_id });
            if (!user) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const role = yield agencyUserModel.getSingleRoleWithPermissions(user.role_id, agency_id);
            let whiteLabelPermissions = {
                flight: false,
                hotel: false,
                visa: false,
                holiday: false,
                umrah: false,
                group_fare: false,
                blog: false,
            };
            if (user.white_label) {
                const wPermissions = yield AgentModel.getWhiteLabelPermission({
                    agency_id,
                });
                if (wPermissions) {
                    const { token } = wPermissions, rest = __rest(wPermissions, ["token"]);
                    whiteLabelPermissions = rest;
                }
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.LOGIN_SUCCESSFUL,
                data: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    two_fa: user.two_fa,
                    status: user.status,
                    photo: user.photo,
                    is_main_user: user.is_main_user,
                    agency: {
                        agency_id,
                        agent_no: user.agent_no,
                        agency_email: user.agency_email,
                        agency_name: user.agency_name,
                        agency_status: user.agency_status,
                        phone_number: user.phone_number,
                        agency_logo: user.agency_logo,
                    },
                    role,
                    white_label: user.white_label,
                    whiteLabelPermissions,
                },
            };
        });
    }
    updateProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, photo, agency_id } = req.agencyUser;
                const body = req.body;
                const agencyUserModel = this.Model.AgencyUserModel(trx);
                const files = req.files || [];
                const payload = Object.assign({}, body);
                if (files.length === 1 || files.length === 0) {
                    files.forEach((file) => {
                        payload.photo = file.filename;
                    });
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                if (!Object.keys(payload).length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                yield agencyUserModel.updateUser(payload, { agency_id, id: user_id });
                if (photo && payload.photo) {
                    yield this.manageFile.deleteFromCloud([photo]);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        photo: payload.photo,
                    },
                };
            }));
        });
    }
    changePassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, agency_id } = req.agencyUser;
            const { new_password, old_password } = req.body;
            const agencyUserModel = this.Model.AgencyUserModel();
            const checkUser = yield agencyUserModel.checkUser({
                id: user_id,
                agency_id,
            });
            if (!checkUser) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const checkPass = yield lib_1.default.compareHashValue(old_password, checkUser.hashed_password);
            if (!checkPass) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Old password does not match.",
                };
            }
            const hashed_password = yield lib_1.default.hashValue(new_password);
            yield agencyUserModel.updateUser({ hashed_password }, { id: user_id, agency_id });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.PASSWORD_CHANGED,
            };
        });
    }
    getDashboardData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const agencyModel = this.Model.AgencyModel();
            const agency = yield agencyModel.checkAgency({ agency_id });
            const balance = yield agencyModel.getAgencyBalance(agency_id);
            const kam = {
                name: "Not available",
                phone: "Not available",
                email: "Not available",
            };
            if (agency === null || agency === void 0 ? void 0 : agency.kam_id) {
                const adminModel = this.Model.AdminModel();
                const admin = yield adminModel.getSingleAdmin({ id: agency.kam_id });
                if (admin) {
                    kam.email = admin.email;
                    kam.name = admin.name;
                    kam.phone = admin.phone_number;
                }
            }
            const dashboardData = yield agencyModel.getDashboardData(agency_id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    balance: {
                        balance,
                        usable_loan: agency === null || agency === void 0 ? void 0 : agency.usable_loan,
                    },
                    kam,
                    dashboard: dashboardData,
                },
            };
        });
    }
    searchData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const filter = req.query.filter;
                const { agency_id } = req.agencyUser;
                const agencyModel = this.Model.AgencyModel(trx);
                const data = yield agencyModel.searchModel(filter, agency_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data,
                };
            }));
        });
    }
}
exports.default = SubAgentProfileService;
