"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class PublicCommonValidator {
    constructor() {
        //single param number validator
        this.singleParamNumValidator = (idFieldName = 'id') => {
            const schemaObject = {};
            schemaObject[idFieldName] = joi_1.default.number().required();
            return joi_1.default.object(schemaObject);
        };
        // single param string validator
        this.singleParamStringValidator = (idFieldName = 'id') => {
            const schemaObject = {};
            schemaObject[idFieldName] = joi_1.default.string().required();
            return joi_1.default.object(schemaObject);
        };
        // common forget password input validator
        this.commonForgetPassInputValidation = joi_1.default.object({
            token: joi_1.default.string().required().messages({
                'string.base': 'Provide valid token',
                'any.required': 'Token is required',
            }),
            email: joi_1.default.string().email().trim().optional().lowercase().messages({
                'string.base': 'Provide valid email',
                'string.email': 'Provide valid email',
            }),
            password: joi_1.default.string().min(8).required().messages({
                'string.base': 'Provide valid password',
                'string.min': "Please provide valid password that's length must be min 8",
                'any.required': 'Password is required',
            }),
        });
        // common change password input validation
        this.changePassInputValidation = joi_1.default.object({
            old_password: joi_1.default.string().min(8).required().messages({
                'string.base': 'Provide a valid old password',
                'string.min': 'Provide a valid old password minimum length is 8',
                'any.required': 'Old password is required',
            }),
            new_password: joi_1.default.string().min(8).required().messages({
                'string.base': 'Provide a valid new password',
                'string.min': 'Provide a valid new password minimum length is 8',
                'any.required': 'New password is required',
            }),
        });
        //airline get filter
        this.getAirlinesSchema = joi_1.default.object({
            code: joi_1.default.string().optional().uppercase(),
            name: joi_1.default.string().optional(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
        //airport get filter
        this.getAirportSchema = joi_1.default.object({
            country_id: joi_1.default.number().optional(),
            name: joi_1.default.string().optional(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
        //location Hotel get filter
        this.getLocationHotelSchema = joi_1.default.object({
            filter: joi_1.default.string().optional(),
        });
        // get country
        this.getCountry = joi_1.default.object({
            name: joi_1.default.string().optional(),
        });
        // get city
        this.getCity = joi_1.default.object({
            name: joi_1.default.string().optional(),
            country_id: joi_1.default.number().optional(),
            city_id: joi_1.default.number().optional(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
    }
    // multiple params number validator
    multipleParamsNumValidator(fields) {
        const schemaObject = {};
        fields.forEach((item) => {
            schemaObject[item] = joi_1.default.number().required();
        });
        return joi_1.default.object(schemaObject);
    }
    // multiple params string validator
    multipleParamsStringValidator(fields) {
        const schemaObject = {};
        fields.forEach((item) => {
            schemaObject[item] = joi_1.default.number().required();
        });
        return joi_1.default.object(schemaObject);
    }
}
exports.default = PublicCommonValidator;
