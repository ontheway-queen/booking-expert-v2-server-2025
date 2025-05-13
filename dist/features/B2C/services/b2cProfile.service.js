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
const config_1 = __importDefault(require("../../../config/config"));
class B2CProfileService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.user;
            const B2CUserModel = this.Model.B2CUserModel();
            const user = yield B2CUserModel.checkUser({ id: user_id });
            if (!user) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const tokenData = {
                name: user.name,
                photo: user.photo,
                user_email: user.email,
                user_id: user.id,
                username: user.username,
                phone_number: user.phone_number,
            };
            const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_USER, '24h');
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.LOGIN_SUCCESSFUL,
                data: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    phone_number: user.phone_number,
                    two_fa: user.two_fa,
                    status: user.status,
                    photo: user.photo,
                    gender: user.gender,
                },
                token,
            };
        });
    }
    updateProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, photo } = req.user;
                const body = req.body;
                const B2CUserModel = this.Model.B2CUserModel(trx);
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
                yield B2CUserModel.updateUser(payload, user_id);
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
            const { user_id } = req.user;
            const { new_password, old_password } = req.body;
            const B2CUserModel = this.Model.B2CUserModel();
            const checkUser = yield B2CUserModel.checkUser({
                id: user_id,
            });
            if (!checkUser) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const checkPass = lib_1.default.compareHashValue(old_password, checkUser.password_hash);
            if (!checkPass) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'Old password does not match.',
                };
            }
            const password_hash = yield lib_1.default.hashValue(new_password);
            yield B2CUserModel.updateUser({ password_hash }, user_id);
            return {
                success: false,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.PASSWORD_CHANGED,
            };
        });
    }
}
exports.default = B2CProfileService;
