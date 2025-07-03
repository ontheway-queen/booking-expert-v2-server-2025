"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDynamicFareSetValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminDynamicFareSetValidator {
    constructor() {
        this.createSet = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        this.updateSet = joi_1.default.object({
            name: joi_1.default.string().optional(),
        });
    }
}
exports.AdminDynamicFareSetValidator = AdminDynamicFareSetValidator;
