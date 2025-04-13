"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminMarkupSetValidator {
    constructor() {
        this.createMarkupSetSchema = joi_1.default.object({
            name: joi_1.default.string().required(),
            api: joi_1.default.array()
                .items(joi_1.default.object({
                api_id: joi_1.default.number().required(),
                airlines: joi_1.default.array()
                    .min(1)
                    .items(joi_1.default.string().length(2).required())
                    .required(),
                markup_domestic: joi_1.default.number().required(),
                markup_from_dac: joi_1.default.number().required(),
                markup_to_dac: joi_1.default.number().required(),
                markup_soto: joi_1.default.number().required(),
                markup_type: joi_1.default.string().valid('PER', 'FLAT').required(),
                markup_mode: joi_1.default.string().valid('INCREASE', 'DECREASE').required(),
            }))
                .min(1)
                .optional(),
        });
    }
}
exports.default = AdminMarkupSetValidator;
