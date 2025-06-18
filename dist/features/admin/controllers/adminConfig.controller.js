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
const adminConfig_service_1 = require("../services/adminConfig.service");
const adminConfig_validator_1 = __importDefault(require("../utils/validators/adminConfig.validator"));
class AdminConfigController extends abstract_controller_1.default {
    constructor() {
        super();
        this.validator = new adminConfig_validator_1.default();
        this.service = new adminConfig_service_1.AdminConfigService();
        this.checkSlug = this.asyncWrapper.wrap({ querySchema: this.validator.checkSlugSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.checkSlug(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createCity = this.asyncWrapper.wrap({ bodySchema: this.validator.createCity }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createCity(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllCity = this.asyncWrapper.wrap({ querySchema: this.validator.getAllCity }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllCity(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateCity = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updateCity,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateCity(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteCity = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteCity(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAirport = this.asyncWrapper.wrap({ querySchema: this.validator.getAllAirport }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllAirport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createAirport = this.asyncWrapper.wrap({ bodySchema: this.validator.createAirportSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createAirport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateAirport = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updateAirportSchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateAirport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteAirport = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteAirport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAirlines = this.asyncWrapper.wrap({ querySchema: this.validator.getAllAirlines }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllAirlines(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createAirlines = this.asyncWrapper.wrap({ bodySchema: this.validator.createAirlines }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createAirlines(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.updateAirlines = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updateAirlines,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateAirlines(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.deleteAirlines = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteAirlines(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = AdminConfigController;
