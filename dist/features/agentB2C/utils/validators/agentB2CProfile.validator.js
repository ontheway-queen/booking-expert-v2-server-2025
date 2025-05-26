"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CProfileValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentB2CProfileValidator {
    constructor() {
        //Update Profile schema
        this.updateProfileSchema = joi_1.default.object({
            gender: joi_1.default.string().valid('Male', 'Female', 'Other').optional(),
            name: joi_1.default.string().trim().max(500).optional(),
            phone_number: joi_1.default.string().trim().max(20).optional(),
        });
        this.changePassword = joi_1.default.object({
            old_password: joi_1.default.string().required().trim().min(8).max(50),
            new_password: joi_1.default.string().required().trim().min(8).max(50)
                .invalid(joi_1.default.ref('old_password'))
                .messages({
                'any.invalid': 'New password must be different from the old password.',
            }),
        });
    }
}
exports.AgentB2CProfileValidator = AgentB2CProfileValidator;
