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
class AdminProfileService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.admin;
            const adminModel = this.Model.AdminModel();
            const admin = yield adminModel.getSingleAdmin({ id: user_id });
            if (!admin) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const role = yield adminModel.getSingleRoleWithPermissions(admin.role_id);
            const tokenData = {
                user_id: admin.id,
                username: admin.username,
                user_email: admin.email,
                name: admin.name,
                is_main_user: admin.is_main_user,
                photo: admin.photo,
            };
            const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_ADMIN, '24h');
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.LOGIN_SUCCESSFUL,
                data: {
                    two_fa: admin.two_fa,
                    status: admin.status,
                    email: admin.email,
                    id: admin.id,
                    username: admin.username,
                    name: admin.name,
                    photo: admin.photo,
                    phone_number: admin.phone_number,
                    gender: admin.gender,
                    is_main_user: admin.is_main_user,
                    role,
                },
                token,
            };
        });
    }
    updateProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, photo } = req.admin;
                const body = req.body;
                const adminModel = this.Model.AdminModel(trx);
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
                yield adminModel.updateUserAdmin(payload, { id: user_id });
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
            const { user_id } = req.admin;
            const { new_password, old_password } = req.body;
            const adminModel = this.Model.AdminModel();
            const checkAdmin = yield adminModel.checkUserAdmin({ id: user_id });
            if (!checkAdmin) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const checkPass = lib_1.default.compareHashValue(old_password, checkAdmin.password_hash);
            if (!checkPass) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'Old password does not match.',
                };
            }
            const password_hash = yield lib_1.default.hashValue(new_password);
            yield adminModel.updateUserAdmin({ password_hash }, { id: user_id });
            return {
                success: false,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.PASSWORD_CHANGED,
            };
        });
    }
}
exports.default = AdminProfileService;
