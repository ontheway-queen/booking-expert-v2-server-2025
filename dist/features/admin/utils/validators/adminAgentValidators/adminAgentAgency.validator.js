"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminAgentAgencyValidator {
    constructor() {
        this.getAgencySchema = joi_1.default.object({
            filter: joi_1.default.string().max(100).optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            status: joi_1.default.string()
                .valid('Pending', 'Active', 'Inactive', 'Rejected', 'Incomplete')
                .required(),
        });
        this.updateAgency = joi_1.default.object({
            agency_name: joi_1.default.string().trim().optional(),
            email: joi_1.default.string().trim().optional(),
            phone: joi_1.default.string().trim().optional(),
            address: joi_1.default.string().trim().optional(),
            flight_markup_set: joi_1.default.number().optional(),
            hotel_markup_set: joi_1.default.number().optional(),
            kam_id: joi_1.default.number().optional(),
            ref_id: joi_1.default.number().optional(),
            white_label: joi_1.default.boolean().optional(),
            allow_api: joi_1.default.boolean().optional(),
            status: joi_1.default.string().valid('Active', 'Inactive').optional(),
            book_permission: joi_1.default.boolean().optional(),
            white_label_permissions: joi_1.default.string()
                .optional()
                .custom((value, helpers) => {
                try {
                    const innerSchema = joi_1.default.object({
                        flight: joi_1.default.boolean().required(),
                        hotel: joi_1.default.boolean().required(),
                        visa: joi_1.default.boolean().required(),
                        holiday: joi_1.default.boolean().required(),
                        umrah: joi_1.default.boolean().required(),
                        group_fare: joi_1.default.boolean().required(),
                        blog: joi_1.default.boolean().required(),
                    });
                    const parsedValue = JSON.parse(value);
                    const { error } = innerSchema.validate(parsedValue);
                    if (error) {
                        return helpers.error('any.invalid');
                    }
                    else {
                        return parsedValue;
                    }
                }
                catch (err) {
                    return helpers.error('any.invalid');
                }
            }),
        });
        this.updateAgencyApplication = joi_1.default.object({
            status: joi_1.default.string().valid('Active', 'Rejected').required(),
            book_permission: joi_1.default.boolean().required(),
            flight_markup_set: joi_1.default.alternatives().conditional('status', {
                is: 'Active',
                then: joi_1.default.number().required(),
            }),
            hotel_markup_set: joi_1.default.alternatives().conditional('status', {
                is: 'Active',
                then: joi_1.default.number().required(),
            }),
            kam_id: joi_1.default.alternatives().conditional('status', {
                is: 'Active',
                then: joi_1.default.number().required(),
            }),
        });
        this.updateAgencyUser = joi_1.default.object({
            name: joi_1.default.string().trim().optional(),
            email: joi_1.default.string().lowercase().trim().optional(),
            phone_number: joi_1.default.string().optional().trim(),
            status: joi_1.default.boolean().optional(),
            is_main_user: joi_1.default.boolean().optional(),
        });
        this.createAgency = joi_1.default.object({
            agency_name: joi_1.default.string().trim().required(),
            email: joi_1.default.string().trim().required(),
            phone: joi_1.default.string().trim().required(),
            address: joi_1.default.string().trim().required(),
            user_name: joi_1.default.string().trim().required(),
            flight_markup_set: joi_1.default.number().required(),
            hotel_markup_set: joi_1.default.number().required(),
            kam_id: joi_1.default.number().required(),
            ref_id: joi_1.default.number().optional(),
            white_label: joi_1.default.boolean().required(),
            book_permission: joi_1.default.boolean().required(),
            allow_api: joi_1.default.boolean().required(),
            white_label_permissions: joi_1.default.string()
                .optional()
                .custom((value, helpers) => {
                try {
                    const innerSchema = joi_1.default.object({
                        flight: joi_1.default.boolean().required(),
                        hotel: joi_1.default.boolean().required(),
                        visa: joi_1.default.boolean().required(),
                        holiday: joi_1.default.boolean().required(),
                        umrah: joi_1.default.boolean().required(),
                        group_fare: joi_1.default.boolean().required(),
                        blog: joi_1.default.boolean().required(),
                    });
                    const parsedValue = JSON.parse(value);
                    const { error } = innerSchema.validate(parsedValue);
                    if (error) {
                        return helpers.error('any.invalid');
                    }
                    else {
                        return parsedValue;
                    }
                }
                catch (err) {
                    return helpers.error('any.invalid');
                }
            }),
        });
    }
}
exports.default = AdminAgentAgencyValidator;
