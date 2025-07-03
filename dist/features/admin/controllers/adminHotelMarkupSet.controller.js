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
const adminHotelMarkupSet_service_1 = require("../services/adminHotelMarkupSet.service");
const adminHotelMarkupSet_validator_1 = __importDefault(require("../utils/validators/adminHotelMarkupSet.validator"));
class AdminHotelMarkupSetController extends abstract_controller_1.default {
    constructor() {
        super();
        this.validator = new adminHotelMarkupSet_validator_1.default();
        this.service = new adminHotelMarkupSet_service_1.AdminHotelMarkupSetService();
        this.getMarkupSet = this.asyncWrapper.wrap({ querySchema: this.validator.getMarkupSetSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getMarkupSet(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteMarkupSet = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteMarkupSet(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createHotelMarkupSet = this.asyncWrapper.wrap({ bodySchema: this.validator.createHotelMarkup }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createHotelMarkupSet(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateHotelMarkupSet = this.asyncWrapper.wrap({
            bodySchema: this.validator.updateHotelMarkup,
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateHotelMarkupSet(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleHotelMarkup = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleHotelMarkupSet(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = AdminHotelMarkupSetController;
