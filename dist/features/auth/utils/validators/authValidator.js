"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AuthValidator {
    constructor() {
        // common login input validator
        this.loginValidator = joi_1.default.object({
            user_or_email: joi_1.default.string().required().lowercase().trim(),
            password: joi_1.default.string().min(8).max(100).trim().required().messages({
                'string.base': 'Enter valid password',
                'string.min': 'Enter valid password minimum length 8',
                'any.required': 'Password is required',
            }),
        });
        //common register validator
        this.registerValidator = joi_1.default.object({
            first_name: joi_1.default.string().min(1).max(255).required(),
            last_name: joi_1.default.string().min(1).max(255).required(),
            gender: joi_1.default.string().valid('Male', 'Female', 'Other').required(),
            email: joi_1.default.string().email().lowercase().min(1).max(255).required(),
            password: joi_1.default.string().min(8).max(100).required().trim(),
            phone_number: joi_1.default.string().min(7).max(20).required(),
        });
        //login with google validator
        this.loginWithGoogleValidator = joi_1.default.object({
            accessToken: joi_1.default.string().required(),
            image: joi_1.default.string().optional(),
            name: joi_1.default.string().min(1).max(255).required(),
            email: joi_1.default.string().email().lowercase().min(1).max(255).required(),
        });
        // reset password validator
        this.resetPasswordValidator = joi_1.default.object({
            token: joi_1.default.string().required(),
            password: joi_1.default.string().min(8).max(100).required().trim(),
        });
    }
}
exports.default = AuthValidator;
