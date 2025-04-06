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
class PublicEmailOTPService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // send email otp service
    sendEmailOtp(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, type } = req.body;
            let error = false;
            switch (type) {
                case OTP_TYPE_RESET_BTOC_USER:
                    const { agency_id } = req.btocAgency;
                    const btocUserModel = this.Model.userModel();
                    const checkbtocUser = yield btocUserModel.getUser({ agency_id, email });
                    if (!checkbtocUser.length) {
                        error = true;
                    }
                    break;
                case OTP_TYPE_RESET_BTOB_USER:
                    const btobUserModel = this.Model.btobUsersModel();
                    const checkbtobUser = yield btobUserModel.getSingleUser({ email });
                    if (!checkbtobUser.length) {
                        error = true;
                    }
                    break;
                case OTP_TYPE_RESET_ADMIN_USER:
                    const adminModel = this.Model.adminModel();
                    const checkAdmin = yield adminModel.getSingleAdmin({
                        email,
                    });
                    if (!checkAdmin.length) {
                        error = true;
                    }
                    break;
                default:
                    throw new Error('Invalid type.');
                    break;
            }
        });
    }
}
exports.default = PublicEmailOTPService;
