"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AgentAdministrationValidator {
    constructor() {
        this.createRole = joi_1.default.object({
            role_name: joi_1.default.string().required().max(100),
            permissions: joi_1.default.array()
                .items(joi_1.default.object({
                permission_id: joi_1.default.number().required(),
                read: joi_1.default.boolean().required(),
                write: joi_1.default.boolean().required(),
                update: joi_1.default.boolean().required(),
                delete: joi_1.default.boolean().required(),
            }))
                .required(),
        });
        this.getRoleList = joi_1.default.object({
            name: joi_1.default.string().optional(),
            status: joi_1.default.boolean().optional(),
        });
        this.updateRolePermissions = joi_1.default.object({
            role_name: joi_1.default.string().max(100),
            permissions: joi_1.default.array()
                .items(joi_1.default.object({
                permission_id: joi_1.default.number().required(),
                read: joi_1.default.boolean().required(),
                write: joi_1.default.boolean().required(),
                update: joi_1.default.boolean().required(),
                delete: joi_1.default.boolean().required(),
            }))
                .optional(),
        });
        this.createAgencyUser = joi_1.default.object({
            name: joi_1.default.string().required().trim(),
            email: joi_1.default.string().lowercase().trim().required(),
            gender: joi_1.default.string().valid('Male', 'Female', 'Other').required(),
            phone_number: joi_1.default.string().required().trim(),
            role_id: joi_1.default.number().required(),
            password: joi_1.default.string().trim().required(),
        });
        this.getAllAgencyUsers = joi_1.default.object({
            filter: joi_1.default.string().optional().trim(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            role_id: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
        });
        this.updateAgencyUser = joi_1.default.object({
            name: joi_1.default.string().trim().optional(),
            email: joi_1.default.string().lowercase().trim().optional(),
            gender: joi_1.default.string().valid('Male', 'Female', 'Other').optional(),
            phone_number: joi_1.default.string().optional().trim(),
            role_id: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
        });
    }
}
exports.default = AgentAdministrationValidator;
