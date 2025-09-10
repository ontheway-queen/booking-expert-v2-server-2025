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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const config_1 = __importDefault(require("../../../config/config"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const publicEmailOTP_service_1 = __importDefault(require("../../public/services/publicEmailOTP.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const emailSendLib_1 = __importDefault(require("../../../utils/lib/emailSendLib"));
const sendEmailOtpTemplate_1 = require("../../../utils/templates/sendEmailOtpTemplate");
class AuthSubAgentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    register(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, agency_name, user_name, address, phone, password } = req.body;
                const { agency_id: main_agent, agency_name: main_agent_name, agency_logo: main_agent_logo, } = req.agencyB2CWhiteLabel;
                const AgentModel = this.Model.AgencyModel(trx);
                const AgencyUserModel = this.Model.AgencyUserModel(trx);
                const commonModel = this.Model.CommonModel(trx);
                const files = req.files || [];
                const checkAgentName = yield AgentModel.checkAgency({
                    name: agency_name,
                    ref_agent_id: main_agent,
                    agency_type: constants_1.SOURCE_SUB_AGENT,
                });
                if (checkAgentName) {
                    if (checkAgentName.status !== 'Incomplete') {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: 'Duplicate agency name! Already exist an agency with this name.',
                        };
                    }
                }
                const checkAgentUser = yield AgencyUserModel.checkUser({
                    email,
                    agency_type: constants_1.SOURCE_SUB_AGENT,
                    ref_agent_id: main_agent,
                });
                if (checkAgentUser) {
                    if (checkAgentUser.agency_status !== 'Incomplete') {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: 'Duplicate email! Already exist an agency with this email.',
                        };
                    }
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
                const agent_no = yield lib_1.default.generateNo({ trx, type: 'Sub_Agent' });
                if (checkAgentUser) {
                    const checkOtp = yield commonModel.getOTP({
                        email: email,
                        type: 'register_sub_agent',
                    });
                    if (checkOtp.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_GONE,
                            message: this.ResMsg.THREE_TIMES_EXPIRED,
                        };
                    }
                    const otp = lib_1.default.otpGenNumber(6);
                    const hashed_otp = yield lib_1.default.hashValue(otp);
                    yield emailSendLib_1.default.sendEmailAgent(trx, main_agent, {
                        email,
                        emailSub: `${main_agent_name} - Agency Registration Verification`,
                        emailBody: (0, sendEmailOtpTemplate_1.sendEmailOtpTemplate)({
                            otpFor: 'Registration',
                            project: main_agent_name,
                            otp: otp,
                            logo: '',
                        }),
                    });
                    yield commonModel.insertOTP({
                        hashed_otp: hashed_otp,
                        email: email,
                        type: 'register_sub_agent',
                    });
                }
                else {
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
                        agency_type: constants_1.SOURCE_SUB_AGENT,
                        ref_agent_id: main_agent,
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
                    const hashed_password = yield lib_1.default.hashValue(password);
                    yield AgencyUserModel.createUser({
                        agency_id: newAgency[0].id,
                        email,
                        hashed_password,
                        is_main_user: true,
                        name: user_name,
                        phone_number: phone,
                        role_id: newRole[0].id,
                        username,
                    });
                    const checkOtp = yield commonModel.getOTP({
                        email: email,
                        type: 'register_sub_agent',
                    });
                    if (checkOtp.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_GONE,
                            message: this.ResMsg.THREE_TIMES_EXPIRED,
                        };
                    }
                    const otp = lib_1.default.otpGenNumber(6);
                    const hashed_otp = yield lib_1.default.hashValue(otp);
                    yield emailSendLib_1.default.sendEmailAgent(trx, main_agent, {
                        email,
                        emailSub: `${main_agent_name} - Agency Registration Verification`,
                        emailBody: (0, sendEmailOtpTemplate_1.sendEmailOtpTemplate)({
                            otpFor: 'Registration',
                            project: main_agent_name,
                            otp: otp,
                            logo: `${constants_1.LOGO_ROOT_LINK}${main_agent_logo}`,
                        }),
                    });
                    yield commonModel.insertOTP({
                        hashed_otp: hashed_otp,
                        email: email,
                        type: 'register_sub_agent',
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'OTP has been sent to your email.',
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
                const { email, otp } = req.body;
                const { agency_id: main_agency_id } = req.agencyB2CWhiteLabel;
                const AgentModel = this.Model.AgencyModel(trx);
                const AgencyUserModel = this.Model.AgencyUserModel(trx);
                const commonModel = this.Model.CommonModel(trx);
                const checkAgency = yield AgencyUserModel.checkUser({
                    agency_type: constants_1.SOURCE_SUB_AGENT,
                    ref_agent_id: main_agency_id,
                    email,
                });
                if (!checkAgency || checkAgency.agency_status !== 'Incomplete') {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'No Inactive agency found with this email!',
                    };
                }
                const checkOtp = yield commonModel.getOTP({
                    email,
                    type: 'register_sub_agent',
                });
                if (!checkOtp.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: this.ResMsg.OTP_EXPIRED,
                    };
                }
                const { id: email_otp_id, otp: hashed_otp, tried } = checkOtp[0];
                if (tried > 3) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_GONE,
                        message: this.ResMsg.TOO_MUCH_ATTEMPT,
                    };
                }
                const otpValidation = yield lib_1.default.compareHashValue(otp.toString(), hashed_otp);
                if (otpValidation) {
                    yield commonModel.updateOTP({
                        tried: tried + 1,
                        matched: 1,
                    }, { id: email_otp_id });
                    yield AgentModel.updateAgency({ status: 'Pending' }, checkAgency.agency_id);
                }
                else {
                    yield commonModel.updateOTP({
                        tried: tried + 1,
                    }, { id: email_otp_id });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.OTP_INVALID,
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: `Registration successful. Please wait for admin approval.`,
                };
            }));
        });
    }
    login(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { password, user_or_email } = req.body;
                const { agency_id: main_agency_id } = req.agencyB2CWhiteLabel;
                const AgentUserModel = this.Model.AgencyUserModel(trx);
                const checkUserAgency = yield AgentUserModel.checkUser({
                    username: user_or_email,
                    email: user_or_email,
                    agency_type: constants_1.SOURCE_SUB_AGENT,
                    ref_agent_id: main_agency_id,
                });
                if (!checkUserAgency) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const { two_fa, status, email, id, username, name, role_id, photo, agency_id, agent_no, agency_status, hashed_password, phone_number, agency_email, agency_phone_number, agency_logo, agency_name, is_main_user, agency_type, ref_agent_id, civil_aviation, national_id, trade_license, address, } = checkUserAgency;
                console.log({ agency_status });
                if (agency_status === 'Inactive' ||
                    agency_status === 'Incomplete' ||
                    agency_status === 'Rejected') {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Unauthorized agency! Please contact with us.',
                    };
                }
                if (agency_status === 'Pending') {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Agency Request is in process. Please wait for approval.',
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
                    agency_type,
                    ref_agent_id,
                    address,
                    agency_logo,
                };
                const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_AGENT + main_agency_id, '24h');
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
                            civil_aviation,
                            national_id,
                            trade_license,
                            agency_type,
                            ref_agent_id,
                        },
                        role,
                    },
                    token,
                };
            }));
        });
    }
    login2FA(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_or_email, otp } = req.body;
                const { agency_id: main_agency_id } = req.agencyB2CWhiteLabel;
                const AgencyUserModel = this.Model.AgencyUserModel(trx);
                const checkAgencyUser = yield AgencyUserModel.checkUser({
                    email: user_or_email,
                    username: user_or_email,
                    ref_agent_id: main_agency_id,
                    agency_type: constants_1.SOURCE_SUB_AGENT,
                });
                if (!checkAgencyUser) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { two_fa, status, email, id, username, name, role_id, photo, agency_id, agent_no, agency_status, phone_number, agency_phone_number, agency_email, agency_logo, agency_name, is_main_user, civil_aviation, national_id, trade_license, address, } = checkAgencyUser;
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
                const tokenData = {
                    user_id: id,
                    username,
                    user_email: email,
                    name,
                    agency_id,
                    agency_email,
                    agency_name,
                    phone_number,
                    is_main_user,
                    photo,
                    address,
                    agency_logo,
                    agency_type: constants_1.SOURCE_SUB_AGENT,
                };
                const authToken = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_AGENT + main_agency_id, '24h');
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
                            civil_aviation,
                            national_id,
                            trade_license,
                        },
                        role,
                    },
                    token: authToken,
                };
            }));
        });
    }
    resetPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { password, token } = req.body;
            const data = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_AGENT + constants_1.OTP_TYPES.reset_sub_agent);
            console.log({ data });
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
exports.default = AuthSubAgentService;
