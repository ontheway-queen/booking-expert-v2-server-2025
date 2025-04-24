"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminConfigValidator {
    constructor() {
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
    }
}
exports.default = AdminConfigValidator;
