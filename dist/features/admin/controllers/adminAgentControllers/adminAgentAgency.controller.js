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
const abstract_controller_1 = __importDefault(require("../../../../abstract/abstract.controller"));
const adminAgentAgency_service_1 = __importDefault(require("../../services/adminAgentServices/adminAgentAgency.service"));
const adminAgentAgency_validator_1 = __importDefault(require("../../utils/validators/adminAgentValidators/adminAgentAgency.validator"));
class AdminAgentAgencyController extends abstract_controller_1.default {
    constructor() {
        super();
        this.services = new adminAgentAgency_service_1.default();
        this.validator = new adminAgentAgency_validator_1.default();
        this.getAgency = this.asyncWrapper.wrap({ querySchema: this.validator.getAgencySchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAgency(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getSingleAgency = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getSingleAgency(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.updateAgencyUser = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.multipleParamsNumValidator([
                'agency_id',
                'user_id',
            ]),
            bodySchema: this.validator.updateAgencyUser,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateAgencyUser(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        this.updateAgencyApplication = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator('id'),
            bodySchema: this.validator.updateAgencyApplication,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateAgencyApplication(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        this.updateAgency = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator('id'),
            bodySchema: this.validator.updateAgency,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateAgency(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        this.agencyLogin = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.agencyLogin(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.createAgency = this.asyncWrapper.wrap({ bodySchema: this.validator.createAgency }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.createAgency(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        this.upsertAgencyEmailCredential = this.asyncWrapper.wrap({
            bodySchema: this.validator.upsertAgencyEmailCredential,
            paramSchema: this.commonValidator.singleParamNumValidator('agency_id')
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.upsertAgencyEmailCredential(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        this.upsertAgencyPaymentGatewayCredential = this.asyncWrapper.wrap({
            bodySchema: this.validator.upsertAgencyPaymentGatewayCredential,
            paramSchema: this.commonValidator.singleParamNumValidator('agency_id')
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.upsertAgencyPaymentGatewayCredential(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
    }
}
exports.default = AdminAgentAgencyController;
