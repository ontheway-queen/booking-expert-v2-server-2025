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
const registrationVerificationTemplate_1 = require("../../../utils/templates/registrationVerificationTemplate");
const registrationVerificationCompletedTemplate_1 = require("../../../utils/templates/registrationVerificationCompletedTemplate");
const emailSendLib_1 = __importDefault(require("../../../utils/lib/emailSendLib"));
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
    resetPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { password, token } = req.body;
            const data = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_USER + constants_1.OTP_TYPES.reset_b2c);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            const { email, type } = data;
            if (type !== constants_1.OTP_TYPES.reset_b2c) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: this.StatusCode.HTTP_FORBIDDEN,
                };
            }
            const B2CUserModel = this.Model.B2CUserModel();
            const password_hash = yield lib_1.default.hashValue(password);
            yield B2CUserModel.updateUserByEmail({ password_hash }, email);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.PASSWORD_CHANGED,
            };
        });
    }
    register(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, name, phone_number, gender } = req.body;
                const UserModel = this.Model.B2CUserModel(trx);
                const checkAgentUser = yield UserModel.checkUser({ email });
                if (checkAgentUser) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Email already exist. Please use another email.',
                    };
                }
                let username = lib_1.default.generateUsername(name);
                let suffix = 1;
                while (yield UserModel.checkUser({ username })) {
                    username = `${username}${suffix}`;
                    suffix += 1;
                }
                const password = lib_1.default.generateRandomPassword(8);
                const password_hash = yield lib_1.default.hashValue(password);
                const newUser = yield UserModel.createUser({
                    email,
                    password_hash,
                    name,
                    phone_number,
                    username,
                    gender,
                });
                const verificationToken = lib_1.default.createToken({ email, user_id: newUser[0].id, username, name }, config_1.default.JWT_SECRET_USER + constants_1.OTP_TYPES.register_b2c, '24h');
                yield emailSendLib_1.default.sendEmail({
                    email,
                    emailSub: `Booking Expert User Registration Verification`,
                    emailBody: (0, registrationVerificationTemplate_1.registrationVerificationTemplate)(name, '/registration/verification?token=' + verificationToken),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: `Your registration has been successfully placed. To complete your registration please check your email and complete registration with the link we have sent to your email.`,
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
                const B2CUserModel = this.Model.B2CUserModel(trx);
                const parsedToken = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_AGENT + constants_1.OTP_TYPES.register_agent);
                if (!parsedToken) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: 'Invalid token or token expired. Please contact us.',
                    };
                }
                const { email, username, user_id, name } = parsedToken;
                const user = yield B2CUserModel.checkUser({ id: user_id });
                if (!user) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.HTTP_UNAUTHORIZED,
                    };
                }
                const password = lib_1.default.generateRandomPassword(8);
                const password_hash = yield lib_1.default.hashValue(password);
                yield B2CUserModel.updateUser({ password_hash }, user_id);
                const tokenData = {
                    user_id,
                    username,
                    user_email: email,
                    name,
                    photo: user.photo,
                    phone_number: user.phone_number,
                };
                const AuthToken = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_USER, '24h');
                yield emailSendLib_1.default.sendEmail({
                    email,
                    emailSub: `Booking Expert User Registration Completed`,
                    emailBody: (0, registrationVerificationCompletedTemplate_1.registrationVerificationCompletedTemplate)(name, {
                        email,
                        password,
                    }),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: `Registration successful. Please check your email address ${email} for login credentials.`,
                    data: {
                        id: user_id,
                        username,
                        name,
                        email,
                        two_fa: user.two_fa,
                        status: user.status,
                        photo: user.photo,
                        gender: user.gender,
                    },
                    token: AuthToken,
                };
            }));
        });
    }
}
exports.default = AuthB2CService;
