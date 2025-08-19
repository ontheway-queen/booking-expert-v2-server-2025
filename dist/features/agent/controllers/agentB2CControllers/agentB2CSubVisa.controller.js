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
exports.AgentB2CSubVisaController = void 0;
const abstract_controller_1 = __importDefault(require("../../../../abstract/abstract.controller"));
const agentB2CSubVisa_service_1 = require("../../services/agentB2CServices/agentB2CSubVisa.service");
const agentB2CSubVisa_validator_1 = require("../../utils/validators/agentB2CValidators/agentB2CSubVisa.validator");
class AgentB2CSubVisaController extends abstract_controller_1.default {
    constructor() {
        super(...arguments);
        this.service = new agentB2CSubVisa_service_1.AgentB2CSubVisaService();
        this.validator = new agentB2CSubVisa_validator_1.AgentB2CSubVisaValidator();
        //create visa
        this.createVisa = this.asyncWrapper.wrap({ bodySchema: this.validator.createVisaValidatorSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createVisa(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //get visa list
        this.getVisaList = this.asyncWrapper.wrap({ querySchema: this.validator.getVisaListValidatorSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getVisaList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //get single visa
        this.getSingleVisa = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleVisa(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.updateVisa = this.asyncWrapper.wrap({ bodySchema: this.validator.updateVisaValidatorSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateVisa(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        this.deleteVisa = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteVisa(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getAgentB2CApplicationList = this.asyncWrapper.wrap({ querySchema: this.validator.getAgentB2CApplicationListValidatorSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAgentB2CApplicationList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getAgentB2CSingleApplication = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAgentB2CSingleVisaApplication(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.AgentB2CSubVisaController = AgentB2CSubVisaController;
