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
            type: joi_1.default.string().valid('Flight', 'Hotel').required(),
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
        this.getMarkupSetSchema = joi_1.default.object({
            name: joi_1.default.string().optional(),
            status: joi_1.default.boolean().optional(),
            type: joi_1.default.string().valid('Flight', 'Hotel').required(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional()
        });
        this.updateCommissionSetSchema = joi_1.default.object({
            name: joi_1.default.string().optional(),
            add: joi_1.default.array().items(joi_1.default.number().required()).optional(),
            update: joi_1.default.array().items(joi_1.default.object({
                id: joi_1.default.number().required(),
                status: joi_1.default.boolean().required(),
            })),
        });
        this.updateFlightMarkupsSchema = joi_1.default.object({
            api_status: joi_1.default.boolean(),
            add: joi_1.default.array()
                .items(joi_1.default.object({
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
            update: joi_1.default.array()
                .items(joi_1.default.object({
                id: joi_1.default.number().required(),
                airline: joi_1.default.string().length(2),
                markup_domestic: joi_1.default.number(),
                markup_from_dac: joi_1.default.number(),
                markup_to_dac: joi_1.default.number(),
                markup_soto: joi_1.default.number(),
                status: joi_1.default.boolean(),
                markup_type: joi_1.default.string().valid('PER', 'FLAT'),
                markup_mode: joi_1.default.string().valid('INCREASE', 'DECREASE'),
            }))
                .min(1)
                .optional(),
            remove: joi_1.default.array().items(joi_1.default.number()).min(1).optional(),
        });
    }
}
exports.default = AdminMarkupSetValidator;
