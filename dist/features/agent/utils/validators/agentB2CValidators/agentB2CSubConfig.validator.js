"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubConfigValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../../utils/miscellaneous/constants");
class AgentB2CSubConfigValidator {
    constructor() {
        this.upsertB2CMarkup = joi_1.default.object({
            flight_markup_type: joi_1.default.string()
                .valid(constants_1.MARKUP_TYPE_PER, constants_1.MARKUP_TYPE_FLAT)
                .required(),
            hotel_markup_type: joi_1.default.string()
                .valid(constants_1.MARKUP_TYPE_PER, constants_1.MARKUP_TYPE_FLAT)
                .required(),
            flight_markup_mode: joi_1.default.string()
                .valid(constants_1.MARKUP_MODE_INCREASE, constants_1.MARKUP_MODE_DECREASE)
                .required(),
            hotel_markup_mode: joi_1.default.string()
                .valid(constants_1.MARKUP_MODE_INCREASE, constants_1.MARKUP_MODE_DECREASE)
                .required(),
            flight_markup: joi_1.default.number().required(),
            hotel_markup: joi_1.default.number().required(),
        });
        this.updateAccounts = joi_1.default.object({
            account_name: joi_1.default.string().optional().trim(),
            account_number: joi_1.default.string().optional().trim(),
            branch: joi_1.default.string().optional().trim(),
            routing_no: joi_1.default.string().optional().trim(),
            swift_code: joi_1.default.string().optional().trim(),
            status: joi_1.default.boolean().optional(),
        });
        this.createAccounts = joi_1.default.object({
            bank_id: joi_1.default.number().required(),
            account_name: joi_1.default.string().required().trim(),
            account_number: joi_1.default.string().required().trim(),
            branch: joi_1.default.string().optional().trim(),
            routing_no: joi_1.default.string().optional().trim(),
            swift_code: joi_1.default.string().optional().trim(),
        });
        this.createHeroBGContent = joi_1.default.object({
            type: joi_1.default.string().valid(constants_1.CONTENT_TYPE_PHOTO, constants_1.CONTENT_TYPE_VIDEO).required(),
            quote: joi_1.default.string().optional().trim(),
            sub_quote: joi_1.default.string().optional().trim(),
            tab: joi_1.default.string()
                .valid(constants_1.FUNCTION_TYPE_FLIGHT, constants_1.FUNCTION_TYPE_HOTEL, constants_1.FUNCTION_TYPE_HOLIDAY, constants_1.FUNCTION_TYPE_VISA, constants_1.FUNCTION_TYPE_GROUP, constants_1.FUNCTION_TYPE_BLOG, constants_1.FUNCTION_TYPE_UMRAH)
                .optional(),
        });
        this.updateHeroBGContent = joi_1.default.object({
            type: joi_1.default.string().valid(constants_1.CONTENT_TYPE_PHOTO, constants_1.CONTENT_TYPE_VIDEO).optional(),
            quote: joi_1.default.string().optional().trim(),
            sub_quote: joi_1.default.string().optional().trim(),
            status: joi_1.default.boolean().optional(),
            order_number: joi_1.default.number().optional(),
            tab: joi_1.default.string()
                .valid(constants_1.FUNCTION_TYPE_FLIGHT, constants_1.FUNCTION_TYPE_HOTEL, constants_1.FUNCTION_TYPE_HOLIDAY, constants_1.FUNCTION_TYPE_VISA, constants_1.FUNCTION_TYPE_GROUP, constants_1.FUNCTION_TYPE_BLOG, constants_1.FUNCTION_TYPE_UMRAH)
                .optional(),
        });
        this.createPopularDestination = joi_1.default.object({
            from_airport: joi_1.default.number().required(),
            to_airport: joi_1.default.number().required(),
        });
        this.updatePopularDestination = joi_1.default.object({
            from_airport: joi_1.default.number().optional(),
            to_airport: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
            order_number: joi_1.default.number().optional(),
        });
        this.createPopularPlace = joi_1.default.object({
            country_id: joi_1.default.number().required(),
            location_id: joi_1.default.number().required(),
            location_type: joi_1.default.string().required(),
            location_name: joi_1.default.string().required(),
            short_description: joi_1.default.string().required(),
        });
        this.updatePopularPlace = joi_1.default.object({
            country_id: joi_1.default.number().optional(),
            location_id: joi_1.default.number().optional(),
            location_type: joi_1.default.string().optional(),
            location_name: joi_1.default.string().optional().trim(),
            short_description: joi_1.default.string().optional().trim(),
            status: joi_1.default.boolean().optional(),
            order_number: joi_1.default.number().optional(),
        });
        this.createHotDeals = joi_1.default.object({
            title: joi_1.default.string().required().trim(),
            link: joi_1.default.string().required().trim(),
        });
        this.updateHotDeals = joi_1.default.object({
            title: joi_1.default.string().optional().trim(),
            link: joi_1.default.string().optional().trim(),
            status: joi_1.default.boolean().optional(),
            order_number: joi_1.default.number().optional(),
        });
    }
}
exports.AgentB2CSubConfigValidator = AgentB2CSubConfigValidator;
