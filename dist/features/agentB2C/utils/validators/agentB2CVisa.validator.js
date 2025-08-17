"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CVisaValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentB2CVisaValidator {
    constructor() {
        this.getAllVisaListQuerySchema = joi_1.default.object({
            country_id: joi_1.default.number().required(),
            visa_type_id: joi_1.default.number().required()
        });
        this.createVisaValidatorSchema = joi_1.default.object({});
    }
}
exports.AgentB2CVisaValidator = AgentB2CVisaValidator;
