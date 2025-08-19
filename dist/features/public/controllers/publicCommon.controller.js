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
const publicCommon_service_1 = __importDefault(require("../services/publicCommon.service"));
class PublicCommonController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new publicCommon_service_1.default();
        this.getCountry = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.getCountry }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllCountry(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getCity = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.getCity }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllCity(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getAirlines = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.getAirlinesSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllAirlines(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getAirport = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.getAirportSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllAirport(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getLocationHotel = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.getLocationHotelSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getLocationHotel(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getBank = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.getBanks }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getBank(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getVisaType = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getVisaType(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.default = PublicCommonController;
