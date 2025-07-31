"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubUmrahValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentB2CSubUmrahValidator {
    constructor() {
        this.parsedSchema = joi_1.default.array().items(joi_1.default.object({
            title: joi_1.default.string().required(),
            description: joi_1.default.string().optional(),
        }));
        this.createUmrahSchema = joi_1.default.object({
            title: joi_1.default.string().required(),
            description: joi_1.default.string().required(),
            short_description: joi_1.default.string().optional(),
            duration: joi_1.default.number().optional().positive(),
            valid_till_date: joi_1.default.string().isoDate().optional(),
            group_size: joi_1.default.number().optional().positive(),
            adult_price: joi_1.default.number().required().positive(),
            child_price: joi_1.default.number().required().positive(),
            package_details: joi_1.default.string().optional(),
            umrah_for: joi_1.default.string().valid('AGENT', 'B2C', 'BOTH').required(),
            slug: joi_1.default.string().required(),
            meta_title: joi_1.default.string().required(),
            meta_description: joi_1.default.string().required(),
            package_price_details: joi_1.default.string().optional(),
            package_accommodation_details: joi_1.default.string().optional(),
            // package_include: Joi.alternatives().custom((value, helpers) => {
            //   try {
            //     const parsed = JSON.parse(value);
            //     return parsed;
            //   } catch (error) {
            //     return helpers.error('any.invalid');
            //   }
            // }),
        });
    }
}
exports.AgentB2CSubUmrahValidator = AgentB2CSubUmrahValidator;
