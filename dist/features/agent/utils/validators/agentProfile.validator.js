"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AgentProfileValidator {
    constructor() {
        //Update Profile schema
        this.updateProfileSchema = joi_1.default.object({
            name: joi_1.default.string().max(500).optional(),
            two_fa: joi_1.default.boolean().optional(),
            phone_number: joi_1.default.string().max(20).optional(),
        });
        this.changePassword = joi_1.default.object({
            old_password: joi_1.default.string().required().min(8).max(100),
            new_password: joi_1.default.string().required().min(8).max(100),
        });
    }
}
exports.default = AgentProfileValidator;
