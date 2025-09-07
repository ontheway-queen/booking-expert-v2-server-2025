"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubVisaValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentB2CSubVisaValidator {
    constructor() {
        this.createVisaValidatorSchema = joi_1.default.object({
            country_id: joi_1.default.number().required(),
            visa_fee: joi_1.default.number().required().max(9999999999999999.99),
            processing_fee: joi_1.default.number().required().max(9999999999999999.99),
            max_validity: joi_1.default.number().required(),
            stay_validity: joi_1.default.number().required(),
            visa_type_id: joi_1.default.number().required(),
            visa_mode_id: joi_1.default.number().required(),
            title: joi_1.default.string().required(),
            description: joi_1.default.string().optional(),
            documents_details: joi_1.default.string().optional(),
            slug: joi_1.default.string().required(),
            meta_title: joi_1.default.string().required(),
            meta_description: joi_1.default.string().required(),
            visa_for: joi_1.default.string().valid('AGENT', 'B2C', 'BOTH').required(),
            required_fields: joi_1.default.alternatives()
                .try(joi_1.default.object().optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedRequiredFields = JSON.parse(value);
                    return parsedRequiredFields;
                }
                catch (error) {
                    console.error('Error parsing passengers field:', error);
                    return helpers.error('any.invalid');
                }
            }))
                .optional(),
        });
        this.getVisaListValidatorSchema = joi_1.default.object({
            filter: joi_1.default.string().max(100).optional(),
            country_id: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
        this.updateVisaValidatorSchema = joi_1.default.object({
            country_id: joi_1.default.number().optional(),
            visa_fee: joi_1.default.number().optional().max(9999999999999999.99),
            processing_fee: joi_1.default.number().optional().max(9999999999999999.99),
            max_validity: joi_1.default.number().optional(),
            stay_validity: joi_1.default.number().optional(),
            visa_type_id: joi_1.default.number().optional(),
            visa_mode_id: joi_1.default.number().optional(),
            title: joi_1.default.string().optional(),
            description: joi_1.default.string().optional(),
            documents_details: joi_1.default.string().optional(),
            slug: joi_1.default.string().optional(),
            meta_title: joi_1.default.string().optional(),
            meta_description: joi_1.default.string().optional(),
            visa_for: joi_1.default.string().valid('AGENT', 'B2C', 'BOTH').optional(),
            status: joi_1.default.boolean().optional(),
            required_fields: joi_1.default.alternatives()
                .try(joi_1.default.object().optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedRequiredFields = JSON.parse(value);
                    return parsedRequiredFields;
                }
                catch (error) {
                    console.error('Error parsing passengers field:', error);
                    return helpers.error('any.invalid');
                }
            }))
                .optional(),
        });
        this.getAgentB2CApplicationListValidatorSchema = joi_1.default.object({
            from_date: joi_1.default.date().optional(),
            to_date: joi_1.default.date().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            status: joi_1.default.custom((value, helpers) => {
                const splitArray = value.split(',');
                return splitArray;
            }).optional(),
            filter: joi_1.default.string().max(100).optional(),
        });
        this.updateVisaApplicationValidatorSchema = joi_1.default.object({
            status: joi_1.default.string()
                .valid('Pending', 'Papers Submitted', 'Application Received', 'In Process', 'Document Verification', 'Approved', 'Rejected', 'Collected')
                .required(),
            details: joi_1.default.string().required(),
        });
    }
}
exports.AgentB2CSubVisaValidator = AgentB2CSubVisaValidator;
