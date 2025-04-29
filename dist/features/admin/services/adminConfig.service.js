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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminConfigService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const holidayConstants_1 = require("../../../utils/miscellaneous/holidayConstants");
class AdminConfigService extends abstract_service_1.default {
    checkSlug(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { slug, type } = req.query;
                if (type === constants_1.SLUG_TYPE_HOLIDAY) {
                    const holidayModel = this.Model.HolidayPackageModel(trx);
                    const check_slug = yield holidayModel.getHolidayPackageList({
                        slug,
                        created_by: holidayConstants_1.HOLIDAY_CREATED_BY_ADMIN
                    });
                    if (check_slug.data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: this.ResMsg.SLUG_ALREADY_EXISTS
                        };
                    }
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.AVAILABLE_SLUG
                };
            }));
        });
    }
}
exports.AdminConfigService = AdminConfigService;
