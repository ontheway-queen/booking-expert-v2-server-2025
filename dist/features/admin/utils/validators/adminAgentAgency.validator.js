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
            agency_name: joi_1.default.string().optional(),
            email: joi_1.default.string().optional(),
            phone: joi_1.default.string().optional(),
            address: joi_1.default.string().optional(),
            flight_markup_set: joi_1.default.number().optional(),
            hotel_markup_set: joi_1.default.number().optional(),
            white_label: joi_1.default.boolean().optional(),
            allow_api: joi_1.default.boolean().optional(),
            status: joi_1.default.string()
                .valid('Pending', 'Active', 'Inactive', 'Rejected', 'Incomplete')
                .optional(),
            white_label_permissions: joi_1.default.object({
                flight: joi_1.default.boolean().required(),
                hotel: joi_1.default.boolean().required(),
                visa: joi_1.default.boolean().required(),
                holiday: joi_1.default.boolean().required(),
                umrah: joi_1.default.boolean().required(),
                group_fare: joi_1.default.boolean().required(),
                blog: joi_1.default.boolean().required(),
            }).optional(),
        });
    }
}
exports.default = AdminAgentAgencyValidator;
