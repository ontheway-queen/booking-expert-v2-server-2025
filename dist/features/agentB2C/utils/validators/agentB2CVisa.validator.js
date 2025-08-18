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
            visa_type_id: joi_1.default.number().required(),
        });
        this.traveler_types = [
            'ADT',
            'INF',
            'C02',
            'C03',
            'C04',
            'C05',
            'C06',
            'C07',
            'C08',
            'C09',
            'C10',
            'C11',
        ];
        this.traveler_titles = ['MISS', 'MASTER', 'MS', 'MR', 'MRS'];
        this.passengerSchema = joi_1.default.array().items(joi_1.default.object({
            key: joi_1.default.number().required(),
            title: joi_1.default.string()
                .trim()
                .valid(...this.traveler_titles)
                .required(),
            type: joi_1.default.string()
                .trim()
                .valid(...this.traveler_types)
                .required(),
            first_name: joi_1.default.string().required(),
            last_name: joi_1.default.string().required(),
            date_of_birth: joi_1.default.date().raw().required(),
            passport_number: joi_1.default.string().required(),
            passport_expiry_date: joi_1.default.date().raw().required(),
            passport_type: joi_1.default.string().required(),
            city: joi_1.default.string().optional(),
            country_id: joi_1.default.number().optional(),
            address: joi_1.default.string().optional(),
        }));
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
            passengers: joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const { error } = this.passengerSchema.validate(parsed);
                    if (error)
                        throw new Error(error.details[0].message);
                    return parsed;
                }
                catch (err) {
                    return helpers.error('any.invalid', { message: err.message });
                }
            }),
        });
    }
}
exports.AgentB2CVisaValidator = AgentB2CVisaValidator;
