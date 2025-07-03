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
const adminDynamicFare_service_1 = __importDefault(require("../services/adminDynamicFare.service"));
const adminDynamicFare_validator_1 = require("../utils/validators/adminDynamicFare.validator");
class AdminDynamicFareController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new adminDynamicFare_service_1.default();
        this.validator = new adminDynamicFare_validator_1.AdminDynamicFareValidator();
        this.createSupplier = this.asyncWrapper.wrap({ bodySchema: this.validator.createSupplier }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createSupplier(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getSuppliers = this.asyncWrapper.wrap({ querySchema: this.validator.getSupplier }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSuppliers(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateSupplier = this.asyncWrapper.wrap({
            bodySchema: this.validator.updateSupplier,
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateSupplier(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteSupplier = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteSupplier(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createSupplierAirlinesFare = this.asyncWrapper.wrap({
            bodySchema: this.validator.createSupplierAirlinesFare,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createSupplierAirlinesFare(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getSupplierAirlinesFares = this.asyncWrapper.wrap({
            querySchema: this.validator.getSupplierAirlinesFare,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSupplierAirlinesFares(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateSupplierAirlinesFare = this.asyncWrapper.wrap({
            bodySchema: this.validator.updateSupplierAirlinesFare,
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateSupplierAirlinesFare(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteSupplierAirlinesFare = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteSupplierAirlinesFare(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createFareTax = this.asyncWrapper.wrap({
            bodySchema: this.validator.createFareTax,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createFareTax(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getFareTaxes = this.asyncWrapper.wrap({
            querySchema: this.validator.getFareTax,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getFareTaxes(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateFareTax = this.asyncWrapper.wrap({
            bodySchema: this.validator.updateFareTax,
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateFareTax(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteFareTax = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteFareTax(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = AdminDynamicFareController;
