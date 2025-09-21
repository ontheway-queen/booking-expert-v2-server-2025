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
exports.AgentSubAgentController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const agentSubAgent_service_1 = __importDefault(require("../services/agentSubAgent.service"));
const agentSubAgent_validator_1 = require("../utils/validators/agentSubAgent.validator");
class AgentSubAgentController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new agentSubAgent_service_1.default();
        this.validator = new agentSubAgent_validator_1.AgentSubAgentValidator();
        this.createSubAgency = this.asyncWrapper.wrap({
            bodySchema: this.validator.createSubAgencySchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createSubAgency(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getAllSubAgency = this.asyncWrapper.wrap({
            querySchema: this.validator.getSubAgencyQuerySchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllSubAgency(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getSingleSubAgency = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleSubAgency(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.updateAgency = this.asyncWrapper.wrap({
            bodySchema: this.validator.updateSubAgencySchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateAgency(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getAllUsersOfAgency = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            querySchema: this.validator.getSubAgencyUsersQuerySchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllUsersOfAgency(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.updateAgencyUser = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.multipleParamsNumValidator([
                'agency_id',
                'user_id',
            ]),
            bodySchema: this.validator.updateAgencyUser,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateAgencyUser(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.AgentSubAgentController = AgentSubAgentController;
