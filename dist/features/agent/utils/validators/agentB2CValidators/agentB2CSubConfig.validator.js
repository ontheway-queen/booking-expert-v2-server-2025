"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubConfigValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentB2CSubConfigValidator {
    constructor() {
        this.upsertB2CMarkup = joi_1.default.object({
            flight_markup_type: joi_1.default.string().valid("PER", "FLAT").required(),
            hotel_markup_type: joi_1.default.string().valid("PER", "FLAT").required(),
            flight_markup_mode: joi_1.default.string().valid("INCREASE", "DECREASE").required(),
            hotel_markup_mode: joi_1.default.string().valid("INCREASE", "DECREASE").required(),
            flight_markup: joi_1.default.number().required(),
            hotel_markup: joi_1.default.number().required(),
        });
    }
}
exports.AgentB2CSubConfigValidator = AgentB2CSubConfigValidator;
