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
exports.B2CHolidayController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const b2cHoliday_service_1 = require("../services/b2cHoliday.service");
const b2cHoliday_validator_1 = require("../utils/validators/b2cHoliday.validator");
class B2CHolidayController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new b2cHoliday_service_1.B2CHolidayService();
        this.validator = new b2cHoliday_validator_1.B2CHolidayValidator();
        this.searchHolidayPackage = this.asyncWrapper.wrap({
            querySchema: this.validator.holidayPackageSearchFilterQuerySchema
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.searchHolidayPackage(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getSingleHolidayPackage = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamStringValidator("slug")
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleHolidayPackage(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.bookHolidayPackage = this.asyncWrapper.wrap({
            bodySchema: this.validator.holidayPackageCreateBookingSchema
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.bookHolidayPackage(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getHolidayPackageBookingList = this.asyncWrapper.wrap({
            querySchema: this.validator.holidayPackageBookingListFilterQuery
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getHolidayPackageBookingList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getSingleHolidayPackageBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator()
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleHolidayPackageBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.cancelHolidayPackageBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator()
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.cancelHolidayPackageBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.B2CHolidayController = B2CHolidayController;
