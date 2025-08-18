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
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const agentPayments_service_1 = require("../services/agentPayments.service");
const agentPayments_validator_1 = require("../utils/validators/agentPayments.validator");
class AgentPaymentsController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new agentPayments_service_1.AgentPaymentsService();
        this.validator = new agentPayments_validator_1.AgentPaymentsValidator();
        this.createDepositRequest = this.asyncWrapper.wrap({ bodySchema: this.validator.createDeposit }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createDepositRequest(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        this.getSingleDepositRequest = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleDepositReq(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.cancelCurrentDepositRequest = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.cancelCurrentDepositRequest(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getDepositHistory = this.asyncWrapper.wrap({ bodySchema: this.validator.getDeposit }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getDepositHistory(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getADMList = this.asyncWrapper.wrap({ bodySchema: this.validator.getADM }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getADMList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getLoanHistory = this.asyncWrapper.wrap({ bodySchema: this.validator.getLoanHistory }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getLoanHistory(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getLedger = this.asyncWrapper.wrap({ bodySchema: this.validator.getLedger }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getLedger(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.topUpUsingPaymentGateway = this.asyncWrapper.wrap({ bodySchema: this.validator.topUpUsingPaymentGateway }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.topUpUsingPaymentGateway(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getInvoices = this.asyncWrapper.wrap({ bodySchema: this.validator.getInvoicesFilterQuery }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getInvoices(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getSingleInvoice = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleInvoice(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.clearDueOfInvoice = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.clearDueOfInvoice(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getPartialPaymentList = this.asyncWrapper.wrap({ bodySchema: this.validator.getPartialPaymentsFilterQuery }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getPartialPaymentList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getAgentBalance = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAgentBalance(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getAccounts = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAccounts(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.default = AgentPaymentsController;
