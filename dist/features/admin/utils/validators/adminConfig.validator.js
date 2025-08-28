"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AdminConfigValidator {
    constructor() {
        this.getAllCity = joi_1.default.object({
            country_id: joi_1.default.number().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            filter: joi_1.default.string().optional(),
        });
        this.createCity = joi_1.default.object({
            country_id: joi_1.default.number().required(),
            name: joi_1.default.string().required(),
            code: joi_1.default.string().optional(),
            lat: joi_1.default.string().optional(),
            lng: joi_1.default.string().optional(),
        });
        this.updateCity = joi_1.default.object({
            country_id: joi_1.default.number().optional(),
            name: joi_1.default.string().optional(),
            code: joi_1.default.string().optional(),
            lat: joi_1.default.string().optional(),
            lng: joi_1.default.string().optional(),
        });
        this.getAllAirport = joi_1.default.object({
            country_id: joi_1.default.number().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            name: joi_1.default.string().optional(),
        });
        //Create airport schema
        this.createAirportSchema = joi_1.default.object({
            country_id: joi_1.default.number().required(),
            name: joi_1.default.string().trim().max(500).required(),
            iata_code: joi_1.default.string().trim().max(12).uppercase().required(),
            city: joi_1.default.number().optional(),
        });
        //update airport schema
        this.updateAirportSchema = joi_1.default.object({
            country_id: joi_1.default.number().optional(),
            name: joi_1.default.string().trim().max(500).optional(),
            iata_code: joi_1.default.string().trim().max(12).uppercase().optional(),
            city: joi_1.default.number().optional(),
        });
        //insert airlines
        this.insertAirlines = joi_1.default.object({
            code: joi_1.default.string().trim().max(12).required().uppercase(),
            name: joi_1.default.string().trim().max(500).required(),
        });
        //update airlines
        this.updateAirlines = joi_1.default.object({
            code: joi_1.default.string().max(12).trim().optional().uppercase(),
            name: joi_1.default.string().max(500).trim().optional(),
        });
        //check slug
        this.checkSlugSchema = joi_1.default.object({
            slug: joi_1.default.string().required().trim().lowercase(),
            type: joi_1.default.string()
                .valid(constants_1.SLUG_TYPE_HOLIDAY, constants_1.SLUG_TYPE_UMRAH, constants_1.SLUG_TYPE_BLOG)
                .valid()
                .required(),
        });
        this.getAllAirlines = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            name: joi_1.default.string().optional(),
        });
        this.createAirlines = joi_1.default.object({
            name: joi_1.default.string().required(),
            code: joi_1.default.string().required(),
        });
        this.updateB2CMarkupSet = joi_1.default.object({
            flight_set_id: joi_1.default.number().optional(),
            hotel_set_id: joi_1.default.number().optional(),
        });
        this.getBanks = joi_1.default.object({
            status: joi_1.default.boolean().optional(),
            filter: joi_1.default.string().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
        this.updateBank = joi_1.default.object({
            name: joi_1.default.string().optional(),
            type: joi_1.default.string().valid('Bank', 'MFS').optional(),
            status: joi_1.default.boolean().optional(),
        });
        this.createBank = joi_1.default.object({
            name: joi_1.default.string().required(),
            type: joi_1.default.string().valid('Bank', 'MFS').required(),
        });
        this.getSocialMedia = joi_1.default.object({
            status: joi_1.default.boolean().optional(),
            filter: joi_1.default.string().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
        this.updateSocialMedia = joi_1.default.object({
            name: joi_1.default.string().optional(),
            status: joi_1.default.boolean().optional(),
        });
        this.createSocialMedia = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        this.insertCorsOrigin = joi_1.default.object({
            origins: joi_1.default.array()
                .items(joi_1.default.object({ name: joi_1.default.string().trim().required() }))
                .required(),
        });
        this.updateCorsOrigin = joi_1.default.object({
            name: joi_1.default.string().trim().required(),
            status: joi_1.default.boolean().optional(),
        });
    }
}
exports.default = AdminConfigValidator;
