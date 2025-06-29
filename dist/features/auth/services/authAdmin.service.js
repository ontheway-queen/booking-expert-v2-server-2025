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
class AuthAdminService extends abstract_service_1.default {
    constructor() {
        super();
    }
    login(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { password, user_or_email } = req.body;
                const AdminModel = this.Model.AdminModel(trx);
                const checkUserAdmin = yield AdminModel.checkUserAdmin({
                    username: user_or_email,
                    email: user_or_email,
                });
                if (!checkUserAdmin) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const { password_hash, two_fa, status, email, id, username, name, role_id, photo, phone_number, gender, is_main_user, } = checkUserAdmin;
                if (!status) {
                    yield this.insertAdminAudit(trx, {
                        created_by: id,
                        type: 'GET',
                        details: 'Tried to login with inactive account.',
                    });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_ACCOUNT_INACTIVE,
                    };
                }
                const checkPassword = yield lib_1.default.compareHashValue(password, password_hash);
                if (!checkPassword) {
                    yield this.insertAdminAudit(trx, {
                        created_by: id,
                        type: 'GET',
                        details: 'Tried to login with wrong password.',
                    });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                if (two_fa) {
                    const data = yield new publicEmailOTP_service_1.default(trx).sendEmailOtp({
                        email,
                        type: constants_1.OTP_TYPES.verify_admin,
                    });
                    yield this.insertAdminAudit(trx, {
                        created_by: id,
                        type: 'GET',
                        details: 'OTP Send for login with 2fa.',
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
                    is_main_user,
                    phone_number,
                    photo,
                };
                const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_ADMIN, '24h');
                const role = yield AdminModel.checkRole({ id: role_id });
                const permissions = yield AdminModel.getAllPermissionsOfSingleRole(role_id);
                yield this.insertAdminAudit(trx, {
                    created_by: id,
                    type: 'GET',
                    details: 'User logged in.',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.LOGIN_SUCCESSFUL,
                    data: {
                        two_fa,
                        status,
                        email,
                        id,
                        username,
                        name,
                        photo,
                        phone_number,
                        gender,
                        is_main_user,
                        role: Object.assign(Object.assign({}, role), { permissions }),
                    },
                    token,
                };
            }));
        });
    }
    login2FA(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, otp } = req.body;
                const AdminModel = this.Model.AdminModel(trx);
                const checkUserAdmin = yield AdminModel.checkUserAdmin({
                    email: email,
                });
                if (!checkUserAdmin) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const { status, two_fa, id, username, name, role_id, photo, phone_number, gender, is_main_user, } = checkUserAdmin;
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
                    type: constants_1.OTP_TYPES.verify_admin,
                });
                if (!data.success) {
                    return data;
                }
                const tokenData = {
                    user_id: id,
                    username,
                    user_email: email,
                    name,
                    is_main_user,
                    phone_number,
                    photo,
                };
                const authToken = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_ADMIN, '24h');
                const role = yield AdminModel.checkRole({ id: role_id });
                yield this.insertAdminAudit(trx, {
                    created_by: id,
                    type: 'GET',
                    details: 'User logged in with 2fa.',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.LOGIN_SUCCESSFUL,
                    data: {
                        two_fa,
                        status,
                        email,
                        id,
                        username,
                        name,
                        photo,
                        phone_number,
                        gender,
                        is_main_user,
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
            const data = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_ADMIN + constants_1.OTP_TYPES.reset_admin);
            console.log({ data });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            const { email, type } = data;
            if (type !== constants_1.OTP_TYPES.reset_admin) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: this.StatusCode.HTTP_FORBIDDEN,
                };
            }
            const AdminModel = this.Model.AdminModel();
            const password_hash = yield lib_1.default.hashValue(password);
            yield AdminModel.updateUserAdminByEmail({ password_hash }, { email });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.PASSWORD_CHANGED,
            };
        });
    }
}
exports.default = AuthAdminService;
