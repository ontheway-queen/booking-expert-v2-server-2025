"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentB2CMainValidator {
    constructor() {
        // send email otp input validator
        this.sendOtpInputValidator = joi_1.default.object({
            type: joi_1.default.string().valid(constants_1.OTP_TYPES.reset_agent_b2c).required().messages({
                'string.base': 'Please enter valid OTP type',
                'any.only': 'Please enter valid OTP type',
                'any.required': 'OTP type is required',
            }),
            email: joi_1.default.string().email().trim().lowercase().required().messages({
                'string.base': 'Enter valid email address',
                'string.email': 'Enter valid email address',
                'any.required': 'Email is required',
            }),
        });
        // match email otp input validator
        this.matchEmailOtpInputValidator = joi_1.default.object({
            email: joi_1.default.string().email().lowercase().trim().required().messages({
                'string.base': 'Enter valid email',
                'string.email': 'Enter valid email',
                'any.required': 'Email is required',
            }),
            otp: joi_1.default.string().length(6).required().messages({
                'string.base': 'Enter valid otp',
                'any.required': 'OTP is required',
            }),
            type: joi_1.default.string().valid(constants_1.OTP_TYPES.reset_agent_b2c).required().messages({
                'string.base': 'Enter valid otp type',
                'any.only': 'Enter valid otp type',
                'any.required': 'OTP type is required',
            }),
        });
    }
}
exports.default = AgentB2CMainValidator;
