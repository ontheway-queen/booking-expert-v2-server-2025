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
const agentB2CSubConfig_service_1 = require("../../services/agentB2CServices/agentB2CSubConfig.service");
const agentB2CSubConfig_validator_1 = require("../../utils/validators/agentB2CValidators/agentB2CSubConfig.validator");
class AgentB2CSubConfigController extends abstract_controller_1.default {
    constructor() {
        super();
        this.validator = new agentB2CSubConfig_validator_1.AgentB2CSubConfigValidator();
        this.service = new agentB2CSubConfig_service_1.AgentB2CSubConfigService();
        this.getB2CMarkup = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getB2CMarkup(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.upsertB2CMarkup = this.asyncWrapper.wrap({ bodySchema: this.validator.upsertB2CMarkup }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.upsertB2CMarkup(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAccounts = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAccounts(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateAccounts = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updateAccounts,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateAccounts(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createAccounts = this.asyncWrapper.wrap({
            bodySchema: this.validator.createAccounts,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createAccounts(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteAccounts = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteAccounts(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getHeroBGContent = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getHeroBGContent(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createHeroBGContent = this.asyncWrapper.wrap({ bodySchema: this.validator.createHeroBGContent }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createHeroBGContent(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.updateHeroBGContent = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updateHeroBGContent,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateHeroBGContent(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.deleteHeroBGContent = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteHeroBGContent(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getPopularDestination = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getPopularDestination(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createPopularDestination = this.asyncWrapper.wrap({ bodySchema: this.validator.createPopularDestination }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createPopularDestination(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.updatePopularDestination = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updatePopularDestination,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updatePopularDestination(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.deletePopularDestination = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deletePopularDestination(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getPopularPlace = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getPopularPlace(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createPopularPlace = this.asyncWrapper.wrap({ bodySchema: this.validator.createPopularPlace }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createPopularPlace(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.updatePopularPlace = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updatePopularPlace,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updatePopularPlace(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.deletePopularPlace = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deletePopularPlace(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getHotDeals = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getHotDeals(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createHotDeals = this.asyncWrapper.wrap({ bodySchema: this.validator.createHotDeals }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createHotDeals(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.updateHotDeals = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updateHotDeals,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateHotDeals(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.deleteHotDeals = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteHotDeals(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createVisaType = this.asyncWrapper.wrap({ bodySchema: this.validator.createVisaType }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createVisaType(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getAllVisaType = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllVisaType(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteVisaType = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteVisaType(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createVisaMode = this.asyncWrapper.wrap({ bodySchema: this.validator.createVisaMode }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createVisaMode(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getAllVisaMode = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllVisaMode(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteVisaMode = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteVisaMode(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = AgentB2CSubConfigController;
