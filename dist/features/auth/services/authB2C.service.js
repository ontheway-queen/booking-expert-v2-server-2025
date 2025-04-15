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
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const publicEmailOTP_service_1 = __importDefault(require("../../public/services/publicEmailOTP.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const config_1 = __importDefault(require("../../../config/config"));
class AuthB2CService extends abstract_service_1.default {
    constructor() {
        super();
    }
    login(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { password, user_or_email } = req.body;
                const AgentUserModel = this.Model.B2CUserModel(trx);
                const checkUser = yield AgentUserModel.checkUser({
                    username: user_or_email,
                    email: user_or_email,
                });
                if (!checkUser) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const { status, two_fa, gender, password_hash, email, id, username, name, photo, phone_number, } = checkUser;
                if (!status) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: 'Account disabled! Please contact us.',
                    };
                }
                const checkPassword = yield lib_1.default.compareHashValue(password, password_hash);
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
                        type: constants_1.OTP_TYPES.verify_b2c,
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
                    photo,
                    phone_number,
                };
                const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_USER, '24h');
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
                        gender,
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
                const UserModel = this.Model.B2CUserModel(trx);
                const checkUser = yield UserModel.checkUser({
                    email: user_email,
                });
                if (!checkUser) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const { status, phone_number, two_fa, gender, email, id, username, name, photo, } = checkUser;
                if (!status) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_ACCOUNT_INACTIVE,
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
                    photo,
                    phone_number,
                };
                const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_USER, '24h');
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
                        gender,
                    },
                    token,
                };
            }));
        });
    }
}
exports.default = AuthB2CService;
