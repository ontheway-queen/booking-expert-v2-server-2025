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
const emailSendLib_1 = __importDefault(require("../../../utils/lib/emailSendLib"));
const sendEmailOtpTemplate_1 = require("../../../utils/templates/sendEmailOtpTemplate");
const config_1 = __importDefault(require("../../../config/config"));
class AgentB2CPublicService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // send email otp service
    sendEmailOtp(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, type } = req.body;
                const { agency_id } = req.agencyB2CWhiteLabel;
                let OTP_FOR = '';
                const agentB2CModel = this.Model.AgencyB2CUserModel(trx);
                switch (type) {
                    case constants_1.OTP_TYPES.register_agent_b2c:
                        const checkUserExist = yield agentB2CModel.checkUser({
                            agency_id,
                            email,
                        });
                        if (checkUserExist) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: 'User already exist with this email.',
                            };
                        }
                        OTP_FOR = 'register user.';
                        break;
                    case constants_1.OTP_TYPES.reset_agent_b2c:
                        const checkUser = yield agentB2CModel.checkUser({
                            agency_id,
                            email,
                        });
                        if (!checkUser) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: 'No user has been found with this email',
                            };
                        }
                        OTP_FOR = 'reset password.';
                        break;
                    default:
                        break;
                }
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
                            ? emailSendLib_1.default.sendEmail({
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
    matchEmailOtpService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, otp, type } = req.body;
                const { agency_id } = req.agencyB2CWhiteLabel;
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
                    let secret = config_1.default.JWT_SECRET_AGENT_B2C + agency_id;
                    let tokenValidity = '3m';
                    switch (type) {
                        case constants_1.OTP_TYPES.register_agent_b2c:
                            secret += 'register';
                            break;
                        case constants_1.OTP_TYPES.reset_agent_b2c:
                            secret += 'reset';
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
exports.default = AgentB2CPublicService;
