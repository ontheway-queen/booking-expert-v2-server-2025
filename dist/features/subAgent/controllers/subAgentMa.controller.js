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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubAgentMainController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const subAgentMain_service_1 = require("../services/subAgentMain.service");
const subAgentMa_validator_1 = __importDefault(require("../utils/validator/subAgentMa.validator"));
class SubAgentMainController extends abstract_controller_1.default {
    constructor() {
        super(...arguments);
        this.validator = new subAgentMa_validator_1.default();
        this.service = new subAgentMain_service_1.SubAgentMainService();
        this.sendEmailOTP = this.asyncWrapper.wrap({ bodySchema: this.validator.sendOtpInputValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.sendEmailOtp(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.matchEmailOTP = this.asyncWrapper.wrap({ bodySchema: this.validator.matchEmailOtpInputValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.matchEmailOtpService(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.SubAgentMainController = SubAgentMainController;
