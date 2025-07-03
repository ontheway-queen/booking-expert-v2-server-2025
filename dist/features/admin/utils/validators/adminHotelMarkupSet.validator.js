"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminHotelMarkupSetValidator {
    constructor() {
        this.getMarkupSetSchema = joi_1.default.object({
            filter: joi_1.default.string().optional(),
            status: joi_1.default.boolean().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
        this.createHotelMarkup = joi_1.default.object({
            name: joi_1.default.string().trim().required(),
            book: joi_1.default.object({
                markup: joi_1.default.number().required(),
                type: joi_1.default.string().valid('PER', 'FLAT').required(),
                mode: joi_1.default.string().valid('INCREASE', 'DECREASE').required(),
            }),
            cancel: joi_1.default.object({
                markup: joi_1.default.number().required(),
                type: joi_1.default.string().valid('PER', 'FLAT').required(),
                mode: joi_1.default.string().valid('INCREASE', 'DECREASE').required(),
            }),
        });
        this.updateHotelMarkup = joi_1.default.object({
            name: joi_1.default.string().optional(),
            status: joi_1.default.boolean().optional(),
            book: joi_1.default.object({
                markup: joi_1.default.number().required(),
                type: joi_1.default.string().valid('PER', 'FLAT').required(),
                mode: joi_1.default.string().valid('INCREASE', 'DECREASE').required(),
            }).optional(),
            cancel: joi_1.default.object({
                markup: joi_1.default.number().required(),
                type: joi_1.default.string().valid('PER', 'FLAT').required(),
                mode: joi_1.default.string().valid('INCREASE', 'DECREASE').required(),
            }).optional(),
        });
    }
}
exports.default = AdminHotelMarkupSetValidator;
