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
const constants_1 = require("../../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const config_1 = __importDefault(require("../../../config/config"));
const sendEmailOtpTemplate_1 = require("../../../utils/templates/sendEmailOtpTemplate");
class PublicEmailOTPService extends abstract_service_1.default {
    constructor(DBCon) {
        super();
        this.DBCon = DBCon || this.db;
    }
    // send email otp service
    sendEmailOtp(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.DBCon.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, type } = payload;
                let OTP_FOR = '';
                switch (type) {
                    case constants_1.OTP_TYPES.reset_admin:
                        const userAdminModel = this.Model.AdminModel(trx);
                        const check = yield userAdminModel.checkUserAdmin({ email });
                        if (!check) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: 'No user has been found with this email',
                            };
                        }
                        OTP_FOR = 'reset password.';
                        break;
                    case constants_1.OTP_TYPES.reset_agent:
                        const agencyUserModel = this.Model.AgencyUserModel(trx);
                        const checkAgent = yield agencyUserModel.checkUser({ email });
                        if (!checkAgent) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: 'No user has been found with this email',
                            };
                        }
                        OTP_FOR = 'reset password.';
                        break;
                    case constants_1.OTP_TYPES.reset_b2c:
                        const b2cUserModel = this.Model.B2CUserModel(trx);
                        const checkUser = yield b2cUserModel.checkUser({ email });
                        if (!checkUser) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: 'No user has been found with this email',
                            };
                        }
                        OTP_FOR = 'reset password.';
                        break;
                    case constants_1.OTP_TYPES.register_agent:
                        const agencyUserModel2 = this.Model.AgencyUserModel(trx);
                        const checkAdmin2 = yield agencyUserModel2.checkUser({ email });
                        if (checkAdmin2) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: 'User already exist with this email.',
                            };
                        }
                        OTP_FOR = 'register as an agent.';
                        break;
                    case constants_1.OTP_TYPES.register_b2c:
                        const b2cUserModel2 = this.Model.B2CUserModel(trx);
                        const checkUser2 = yield b2cUserModel2.checkUser({ email });
                        if (checkUser2) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: 'User already exist with this email.',
                            };
                        }
                        OTP_FOR = 'registration.';
                        break;
                    case constants_1.OTP_TYPES.verify_admin:
                        OTP_FOR = 'admin login.';
                        break;
                    case constants_1.OTP_TYPES.verify_agent:
                        OTP_FOR = 'agent login.';
                        break;
                    case constants_1.OTP_TYPES.verify_b2c:
                        OTP_FOR = 'user login.';
                        break;
                    default:
                        break;
                }
                console.log({ OTP_FOR });
                const commonModel = this.Model.CommonModel(trx);
                const checkOtp = yield commonModel.getOTP({
                    email: email,
                    type: type,
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
                try {
                    const [send_email] = yield Promise.all([
                        email
                            ? lib_1.default.sendEmail({
                                email,
                                emailSub: constants_1.OTP_EMAIL_SUBJECT,
                                emailBody: (0, sendEmailOtpTemplate_1.sendEmailOtpTemplate)(otp, OTP_FOR),
                            })
                            : undefined,
                    ]);
                    if (send_email) {
                        yield commonModel.insertOTP({
                            hashed_otp: hashed_otp,
                            email: email,
                            type: type,
                        });
                        return {
                            success: true,
                            code: this.StatusCode.HTTP_OK,
                            message: this.ResMsg.OTP_SENT,
                            data: {
                                email,
                            },
                        };
                    }
                    else {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                            message: this.ResMsg.OTP_NOT_SENT,
                        };
                    }
                }
                catch (error) {
                    console.error('Error sending email or SMS:', error);
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: this.ResMsg.OTP_NOT_SENT,
                    };
                }
            }));
        });
    }
    //match email otp service
    matchEmailOtpService(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.DBCon.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, otp, type } = payload;
                const commonModel = this.Model.CommonModel(trx);
                const checkOtp = yield commonModel.getOTP({
                    email,
                    type,
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
                    //--change it for member
                    let secret = config_1.default.JWT_SECRET_ADMIN;
                    let tokenValidity = '3m';
                    switch (type) {
                        case constants_1.OTP_TYPES.reset_admin:
                            secret = config_1.default.JWT_SECRET_ADMIN;
                            break;
                        case constants_1.OTP_TYPES.reset_agent:
                            secret = config_1.default.JWT_SECRET_AGENT;
                            break;
                        case constants_1.OTP_TYPES.reset_b2c:
                            secret = config_1.default.JWT_SECRET_USER;
                            break;
                        case constants_1.OTP_TYPES.register_agent:
                            tokenValidity = '15m';
                            secret = config_1.default.JWT_SECRET_AGENT;
                            break;
                        case constants_1.OTP_TYPES.register_b2c:
                            tokenValidity = '15m';
                            secret = config_1.default.JWT_SECRET_USER;
                            break;
                        case constants_1.OTP_TYPES.verify_admin:
                            secret = config_1.default.JWT_SECRET_ADMIN;
                            break;
                        case constants_1.OTP_TYPES.verify_agent:
                            secret = config_1.default.JWT_SECRET_AGENT;
                            break;
                        case constants_1.OTP_TYPES.verify_b2c:
                            secret = config_1.default.JWT_SECRET_USER;
                            break;
                        default:
                            break;
                    }
                    const token = lib_1.default.createToken({
                        email: email,
                        type: type,
                    }, secret + type, tokenValidity);
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_ACCEPTED,
                        message: this.ResMsg.OTP_MATCHED,
                        token,
                    };
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
            }));
        });
    }
}
exports.default = PublicEmailOTPService;
