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
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const registrationVerificationTemplate_1 = require("../../../utils/templates/registrationVerificationTemplate");
const registrationVerificationCompletedTemplate_1 = require("../../../utils/templates/registrationVerificationCompletedTemplate");
const emailSendLib_1 = __importDefault(require("../../../utils/lib/emailSendLib"));
class AuthAgentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    register(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, agency_name, user_name, address, phone } = req.body;
                const AgentModel = this.Model.AgencyModel(trx);
                const AgencyUserModel = this.Model.AgencyUserModel(trx);
                const files = req.files || [];
                const checkAgentName = yield AgentModel.checkAgency({
                    name: agency_name,
                });
                const checkAgentUser = yield AgencyUserModel.checkUser({ email });
                if (checkAgentUser) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Email already exist. Please use another email.',
                    };
                }
                if (checkAgentName) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Duplicate agency name! Already exist an agency with this name.',
                    };
                }
                let agency_logo = '';
                let civil_aviation = '';
                let trade_license = '';
                let national_id = '';
                files.forEach((file) => {
                    switch (file.fieldname) {
                        case 'agency_logo':
                            agency_logo = file.filename;
                            break;
                        case 'civil_aviation':
                            civil_aviation = file.filename;
                            break;
                        case 'trade_license':
                            trade_license = file.filename;
                            break;
                        case 'national_id':
                            national_id = file.filename;
                            break;
                        default:
                            throw new customError_1.default('Invalid files. Please provide valid trade license, civil aviation, NID, logo.', this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                });
                const agent_no = yield lib_1.default.generateNo({ trx, type: 'Agent' });
                const newAgency = yield AgentModel.createAgency({
                    address,
                    status: 'Incomplete',
                    agent_no,
                    agency_name,
                    email,
                    phone,
                    agency_logo,
                    civil_aviation,
                    trade_license,
                    national_id,
                });
                const newRole = yield AgencyUserModel.createRole({
                    agency_id: newAgency[0].id,
                    name: 'Super Admin',
                    is_main_role: true,
                });
                const permissions = yield AgencyUserModel.getAllPermissions();
                const permissionPayload = [];
                permissions.forEach((item) => {
                    if (!constants_1.WHITE_LABEL_PERMISSIONS_MODULES.includes(item.name)) {
                        permissionPayload.push({
                            agency_id: newAgency[0].id,
                            role_id: newRole[0].id,
                            permission_id: item.id,
                            delete: true,
                            read: true,
                            update: true,
                            write: true,
                        });
                    }
                });
                yield AgencyUserModel.insertRolePermission(permissionPayload);
                let username = lib_1.default.generateUsername(user_name);
                let suffix = 1;
                while (yield AgencyUserModel.checkUser({ username })) {
                    username = `${username}${suffix}`;
                    suffix += 1;
                }
                const password = lib_1.default.generateRandomPassword(8);
                const hashed_password = yield lib_1.default.hashValue(password);
                const newUser = yield AgencyUserModel.createUser({
                    agency_id: newAgency[0].id,
                    email,
                    hashed_password,
                    is_main_user: true,
                    name: user_name,
                    phone_number: phone,
                    role_id: newRole[0].id,
                    username,
                });
                const verificationToken = lib_1.default.createToken({ agency_id: newAgency[0].id, email, user_id: newUser[0].id }, config_1.default.JWT_SECRET_AGENT + constants_1.OTP_TYPES.register_agent, '24h');
                yield emailSendLib_1.default.sendEmail({
                    email,
                    emailSub: `Booking Expert Agency Registration Verification`,
                    emailBody: (0, registrationVerificationTemplate_1.registrationVerificationTemplate)(agency_name, '/sign-up/verification?token=' + verificationToken),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: `Your registration has been successfully placed. Agency ID: ${agent_no}. To complete your registration please check your email and complete registration with the link we have sent to your email.`,
                    data: {
                        email,
                    },
                };
            }));
        });
    }
    registerComplete(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { token } = req.body;
                const AgentModel = this.Model.AgencyModel(trx);
                const AgencyUserModel = this.Model.AgencyUserModel(trx);
                const parsedToken = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_AGENT + constants_1.OTP_TYPES.register_agent);
                if (!parsedToken) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: 'Invalid token or token expired. Please contact us.',
                    };
                }
                const { agency_id, email, user_id, agency_name } = parsedToken;
                yield AgentModel.updateAgency({ status: 'Pending' }, agency_id);
                const password = lib_1.default.generateRandomPassword(8);
                const hashed_password = yield lib_1.default.hashValue(password);
                yield AgencyUserModel.updateUser({
                    hashed_password,
                }, { agency_id, id: user_id });
                yield emailSendLib_1.default.sendEmail({
                    email,
                    emailSub: `Booking Expert Agency Registration Verification`,
                    emailBody: (0, registrationVerificationCompletedTemplate_1.registrationVerificationCompletedTemplate)(agency_name, {
                        email,
                        password,
                    }),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: `Registration successful. Please check you will receive login credentials at the email address ${email}.`,
                };
            }));
        });
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
                const { two_fa, status, email, id, username, name, role_id, photo, agency_id, agent_no, agency_status, hashed_password, phone_number, white_label, agency_email, agency_phone_number, agency_logo, agency_name, is_main_user, ref_id, allow_api, civil_aviation, kam_id, national_id, trade_license, address } = checkUserAgency;
                if (agency_status === 'Inactive' ||
                    agency_status === 'Incomplete' ||
                    agency_status === 'Rejected' ||
                    agency_status === 'Pending') {
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
                    const wPermissions = yield AgentModel.getWhiteLabelPermission({ agency_id });
                    if (wPermissions) {
                        const { token } = wPermissions, rest = __rest(wPermissions, ["token"]);
                        whiteLabelPermissions = rest;
                    }
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
                    phone_number,
                    photo,
                    ref_id,
                    address,
                    agency_logo
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
                        phone_number,
                        agency: {
                            agency_id,
                            agent_no,
                            agency_email,
                            agency_name,
                            agency_status,
                            phone_number: agency_phone_number,
                            agency_logo,
                            allow_api,
                            civil_aviation,
                            kam_id,
                            national_id,
                            trade_license
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
                const { two_fa, status, email, id, username, name, role_id, photo, agency_id, agent_no, agency_status, phone_number, white_label, agency_phone_number, agency_email, agency_logo, agency_name, is_main_user, ref_id, address, } = checkAgencyUser;
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
                    const wPermissions = yield AgencyModel.getWhiteLabelPermission({ agency_id });
                    if (wPermissions) {
                        const { token } = wPermissions, rest = __rest(wPermissions, ["token"]);
                        whiteLabelPermissions = rest;
                    }
                }
                const tokenData = {
                    user_id: id,
                    username,
                    user_email,
                    name,
                    agency_id,
                    agency_email,
                    agency_name,
                    phone_number,
                    is_main_user,
                    photo,
                    ref_id,
                    address,
                    agency_logo
                };
                const authToken = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_AGENT, '24h');
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
                        phone_number,
                        agency: {
                            agency_id,
                            agent_no,
                            agency_email,
                            agency_name,
                            agency_status,
                            phone_number: agency_phone_number,
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
            yield AgencyUserModel.updateUserByEmail({ hashed_password }, email);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.PASSWORD_CHANGED,
            };
        });
    }
}
exports.default = AuthAgentService;
