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
exports.AgentB2CVisaController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const agentB2CVisa_service_1 = require("../services/agentB2CVisa.service");
const agentB2CVisa_validator_1 = require("../utils/validators/agentB2CVisa.validator");
class AgentB2CVisaController extends abstract_controller_1.default {
    constructor() {
        super(...arguments);
        this.service = new agentB2CVisa_service_1.AgentB2CVisaService();
        this.validator = new agentB2CVisa_validator_1.AgentB2CVisaValidator();
        //get all visa type
        this.getAllVisaType = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllVisaType(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //get all visa list
        this.getAllVisaList = this.asyncWrapper.wrap({
            querySchema: this.validator.getAllVisaListQuerySchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllVisaList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //get single visa
        this.getSingleVisa = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamStringValidator('slug'),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleVisa(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //create visa
        this.createVisaApplication = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.createVisaValidatorSchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createVisaApplication(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //get visa application list
        this.getVisaApplicationList = this.asyncWrapper.wrap({
            querySchema: this.validator.getVisaApplicationListQuerySchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getVisaApplicationList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //get single visa application
        this.getSingleVisaApplication = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleVisaApplication(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.AgentB2CVisaController = AgentB2CVisaController;
