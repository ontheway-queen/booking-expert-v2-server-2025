"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AgentB2CBlogValidator {
    constructor() {
        this.getBlog = joi_1.default.object({
            skip: joi_1.default.number().optional(),
            limit: joi_1.default.number().optional(),
        });
    }
}
exports.default = AgentB2CBlogValidator;
