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
exports.AgentSubAgentPaymentController = void 0;
const abstract_controller_1 = __importDefault(require("../../../../abstract/abstract.controller"));
const agentSubAgentPayment_service_1 = require("../../services/agentSubAgentServices/agentSubAgentPayment.service");
const agentSubAgentPayment_validator_1 = require("../../utils/validators/agentSubAgentValidators/agentSubAgentPayment.validator");
class AgentSubAgentPaymentController extends abstract_controller_1.default {
    constructor() {
        super();
        this.validator = new agentSubAgentPayment_validator_1.AgentSubAgentPaymentValidator();
        this.services = new agentSubAgentPayment_service_1.AgentSubAgentPaymentService();
        this.getDepositRequestList = this.asyncWrapper.wrap({ querySchema: this.validator.getDepositRequest }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getDepositRequestList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getSingleDepositRequest = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getSingleDepositRequest(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.updateDepositRequest = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updateDepositRequest,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateDepositRequest(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getLedger = this.asyncWrapper.wrap({ querySchema: this.validator.getLedger }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getLedger(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.balanceAdjust = this.asyncWrapper.wrap({ bodySchema: this.validator.balanceAdjust }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.balanceAdjust(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.AgentSubAgentPaymentController = AgentSubAgentPaymentController;
