"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CVisaValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentB2CVisaValidator {
    constructor() {
        this.getAllVisaListQuerySchema = joi_1.default.object({
            country_id: joi_1.default.number().required(),
            visa_type_id: joi_1.default.number().required()
        });
        this.createVisaValidatorSchema = joi_1.default.object({
            application_ref: joi_1.default.string().required(),
            source_type: joi_1.default.string().required(),
            source_id: joi_1.default.number().required(),
            user_id: joi_1.default.number().required(),
            visa_is: joi_1.default.number().required(),
            from_date: joi_1.default.date().raw().required(),
            to_date: joi_1.default.date().raw().required(),
            traveler: joi_1.default.number().required(),
            visa_fee: joi_1.default.number().required(),
            processing_fee: joi_1.default.number().required(),
            contact_email: joi_1.default.string().email().trim().required(),
            contact_number: joi_1.default.string().trim().required(),
            whatsapp_number: joi_1.default.string().trim().optional(),
            nationality: joi_1.default.string().trim().optional(),
            residence: joi_1.default.string().trim().optional(),
        });
    }
}
exports.AgentB2CVisaValidator = AgentB2CVisaValidator;
