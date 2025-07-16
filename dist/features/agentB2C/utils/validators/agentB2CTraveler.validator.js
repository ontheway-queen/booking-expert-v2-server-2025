"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AgentB2CTravelerValidator {
    constructor() {
        this.create = joi_1.default.object({
            reference: joi_1.default.string().required().valid('Mr', 'Mrs', 'Ms', 'Miss', 'MSTR'),
            first_name: joi_1.default.string()
                .min(2)
                .max(50)
                .pattern(/^[a-zA-Z\s\-']+$/) // Allows letters, spaces, hyphens, apostrophes
                .pattern(/^(?!.*(.)\1{3})/)
                .required(), // Blocks >3 repeating chars
            last_name: joi_1.default.string()
                .min(2)
                .max(50)
                .pattern(/^[a-zA-Z\s\-']+$/) // Allows letters, spaces, hyphens, apostrophes
                .pattern(/^(?!.*(.)\1{3})/)
                .required(), // Blocks >3 repeating chars
            type: joi_1.default.string()
                .required()
                .valid('ADT', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10', 'C11', 'INF'),
            date_of_birth: joi_1.default.string()
                .required()
                .pattern(/^\d{4}-\d{2}-\d{2}$/)
                .messages({
                'string.pattern.base': 'date_of_birth must be in the format yyyy-mm-dd',
                'any.custom': 'date_of_birth cannot be in the future',
            })
                .custom((value, helpers) => {
                const today = new Date();
                const inputDate = new Date(value);
                if (inputDate > today) {
                    return helpers.error('any.custom');
                }
                return value;
            }),
            gender: joi_1.default.string().required().valid('Male', 'Female'),
            issuing_country: joi_1.default.number().required(),
            nationality: joi_1.default.number().required(),
            passport_number: joi_1.default.string().optional(),
            passport_expiry_date: joi_1.default.string()
                .optional()
                .pattern(/^\d{4}-\d{2}-\d{2}$/)
                .messages({
                'string.pattern.base': 'passport_expiry_date must be in the format yyyy-mm-dd',
                'any.custom': 'passport_expiry_date must be at least 6 months from the current date',
            })
                .custom((value, helpers) => {
                const today = new Date();
                const sixMonthsFromToday = new Date();
                sixMonthsFromToday.setMonth(today.getMonth() + 6);
                const expiryDate = new Date(value);
                if (expiryDate < sixMonthsFromToday) {
                    return helpers.error('any.custom');
                }
                return value;
            }),
            contact_number: joi_1.default.string().optional(),
            contact_email: joi_1.default.string().email().optional(),
            frequent_flyer_airline: joi_1.default.string().optional(),
            frequent_flyer_number: joi_1.default.string().optional(),
        });
        this.update = joi_1.default.object({
            reference: joi_1.default.string().optional().valid('Mr', 'Mrs', 'Ms', 'Miss', 'MSTR'),
            first_name: joi_1.default.string()
                .min(2)
                .max(50)
                .pattern(/^[a-zA-Z\s\-']+$/) // Allows letters, spaces, hyphens, apostrophes
                .pattern(/^(?!.*(.)\1{3})/), // Blocks >3 repeating chars
            last_name: joi_1.default.string()
                .min(2)
                .max(50)
                .pattern(/^[a-zA-Z\s\-']+$/) // Allows letters, spaces, hyphens, apostrophes
                .pattern(/^(?!.*(.)\1{3})/), // Blocks >3 repeating chars
            type: joi_1.default.string()
                .optional()
                .valid('ADT', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10', 'C11', 'INF'),
            date_of_birth: joi_1.default.string()
                .optional()
                .pattern(/^\d{4}-\d{2}-\d{2}$/)
                .messages({
                'string.pattern.base': 'date_of_birth must be in the format yyyy-mm-dd',
                'any.custom': 'date_of_birth cannot be in the future',
            })
                .custom((value, helpers) => {
                const today = new Date();
                const inputDate = new Date(value);
                if (inputDate > today) {
                    return helpers.error('any.custom');
                }
                return value;
            }),
            gender: joi_1.default.string().optional().valid('Male', 'Female'),
            issuing_country: joi_1.default.number().optional(),
            nationality: joi_1.default.number().optional(),
            passport_number: joi_1.default.string().optional(),
            passport_expiry_date: joi_1.default.string()
                .optional()
                .pattern(/^\d{4}-\d{2}-\d{2}$/)
                .messages({
                'string.pattern.base': 'passport_expiry_date must be in the format yyyy-mm-dd',
                'any.custom': 'passport_expiry_date must be at least 6 months from the current date',
            })
                .custom((value, helpers) => {
                const today = new Date();
                const sixMonthsFromToday = new Date();
                sixMonthsFromToday.setMonth(today.getMonth() + 6);
                const expiryDate = new Date(value);
                if (expiryDate < sixMonthsFromToday) {
                    return helpers.error('any.custom');
                }
                return value;
            }),
            contact_number: joi_1.default.string().optional(),
            contact_email: joi_1.default.string().email().optional(),
            frequent_flyer_airline: joi_1.default.string().optional(),
            frequent_flyer_number: joi_1.default.string().optional(),
        });
    }
}
exports.default = AgentB2CTravelerValidator;
