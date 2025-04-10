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
const config_1 = __importDefault(require("../../../config/config"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const publicEmailOTP_service_1 = __importDefault(require("../../public/services/publicEmailOTP.service"));
class AuthAgentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    login(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { password, user_or_email } = req.body;
                const AgentUserModel = this.Model.AgencyUserModel(trx);
                const AgentModel = this.Model.AgencyModel(trx);
                const checkUserAgency = yield AgentUserModel.checkUser({
                    username: user_or_email,
                    email: user_or_email,
                });
                if (!checkUserAgency) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const { two_fa, status, email, id, username, name, role_id, photo, agency_id, agency_no, agency_status, hashed_password, mobile_number, white_label, agency_email, agency_logo, agency_name, is_main_user, } = checkUserAgency;
                if (agency_status === 'Inactive') {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Unauthorized agency! Please contact with us.',
                    };
                }
                if (!status) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_ACCOUNT_INACTIVE,
                    };
                }
                const checkPassword = yield lib_1.default.compareHashValue(password, hashed_password);
                if (!checkPassword) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                if (two_fa) {
                    const data = yield new publicEmailOTP_service_1.default(trx).sendEmailOtp({
                        email,
                        type: constants_1.OTP_TYPES.verify_agent,
                    });
                    if (data.success) {
                        return {
                            success: true,
                            code: data.code,
                            message: data.message,
                            data: {
                                email,
                                two_fa,
                            },
                        };
                    }
                    else {
                        return data;
                    }
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
                if (white_label) {
                    const wPermissions = yield AgentModel.getWhiteLabelPermission(agency_id);
                    const { token } = wPermissions, rest = __rest(wPermissions, ["token"]);
                    whiteLabelPermissions = rest;
                }
                const tokenData = {
                    user_id: id,
                    username,
                    user_email: email,
                    name,
                    agency_id,
                    agency_email,
                    agency_name,
                    is_main_user,
                };
                const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_AGENT, '24h');
                const role = yield AgentUserModel.getSingleRoleWithPermissions(role_id, agency_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.LOGIN_SUCCESSFUL,
                    data: {
                        id,
                        username,
                        name,
                        email,
                        two_fa,
                        status,
                        photo,
                        is_main_user,
                        agency: {
                            agency_id,
                            agency_no,
                            agency_email,
                            agency_name,
                            agency_status,
                            mobile_number,
                            agency_logo,
                        },
                        role,
                        white_label,
                        whiteLabelPermissions,
                    },
                    token,
                };
            }));
        });
    }
    login2FA(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email: user_email, otp } = req.body;
                const AgencyUserModel = this.Model.AgencyUserModel(trx);
                const AgencyModel = this.Model.AgencyModel(trx);
                const checkAgencyUser = yield AgencyUserModel.checkUser({
                    email: user_email,
                });
                if (!checkAgencyUser) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const { two_fa, status, email, id, username, name, role_id, photo, agency_id, agency_no, agency_status, mobile_number, white_label, agency_email, agency_logo, agency_name, is_main_user, } = checkAgencyUser;
                if (!status) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_ACCOUNT_INACTIVE,
                    };
                }
                if (agency_status === 'Inactive') {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Unauthorized agency! Please contact with us.',
                    };
                }
                const data = yield new publicEmailOTP_service_1.default(trx).matchEmailOtpService({
                    email,
                    otp,
                    type: constants_1.OTP_TYPES.verify_agent,
                });
                if (!data.success) {
                    return data;
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
                if (white_label) {
                    const wPermissions = yield AgencyModel.getWhiteLabelPermission(agency_id);
                    const { token } = wPermissions, rest = __rest(wPermissions, ["token"]);
                    whiteLabelPermissions = rest;
                }
                const tokenData = {
                    user_id: id,
                    username,
                    user_email,
                    name,
                    agency_id,
                    agency_email,
                    agency_name,
                    is_main_user,
                };
                const authToken = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_ADMIN, '24h');
                const role = yield AgencyUserModel.getSingleRoleWithPermissions(role_id, agency_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.LOGIN_SUCCESSFUL,
                    data: {
                        id,
                        username,
                        name,
                        email,
                        two_fa,
                        status,
                        photo,
                        is_main_user,
                        agency: {
                            agency_id,
                            agency_no,
                            agency_email,
                            agency_name,
                            agency_status,
                            mobile_number,
                            agency_logo,
                        },
                        role,
                        white_label,
                        whiteLabelPermissions,
                    },
                    token: authToken,
                };
            }));
        });
    }
    resetPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { password, token } = req.body;
            const data = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_AGENT + constants_1.OTP_TYPES.reset_agent);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            const { email, type } = data;
            if (type !== constants_1.OTP_TYPES.reset_agent) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: this.StatusCode.HTTP_FORBIDDEN,
                };
            }
            const AgencyUserModel = this.Model.AgencyUserModel();
            const hashed_password = yield lib_1.default.hashValue(password);
            yield AgencyUserModel.updateUser({ hashed_password }, email);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.PASSWORD_CHANGED,
            };
        });
    }
}
exports.default = AuthAgentService;
