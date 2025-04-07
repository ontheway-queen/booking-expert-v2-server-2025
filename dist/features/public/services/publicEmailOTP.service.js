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
class PublicEmailOTPService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // send email otp service
    sendEmailOtp(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, type } = req.body;
            switch (type) {
                case constants_1.OTP_TYPES.reset_admin:
                    return yield this.sendOTPAdminSubService({ email });
                case constants_1.OTP_TYPES.verify_admin:
                    return yield this.sendOTPAdminSubService({ email });
                case constants_1.OTP_TYPES.reset_agent:
                    return yield this.sendOTPAgentSubService({ email });
                case constants_1.OTP_TYPES.verify_agent:
                    return yield this.sendOTPAgentSubService({ email });
                case constants_1.OTP_TYPES.reset_b2c:
                    return yield this.sendOTPB2CSubService({ email });
                case constants_1.OTP_TYPES.verify_b2c:
                    return yield this.sendOTPB2CSubService({ email });
                default:
                    break;
            }
        });
    }
    sendOTPAdminSubService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email }) { });
    }
    sendOTPAgentSubService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email }) { });
    }
    sendOTPB2CSubService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email }) { });
    }
}
exports.default = PublicEmailOTPService;
