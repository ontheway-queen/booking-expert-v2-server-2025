"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CVisaController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const agentB2CVisa_service_1 = require("../services/agentB2CVisa.service");
class AgentB2CVisaController extends abstract_controller_1.default {
    constructor() {
        super(...arguments);
        this.service = new agentB2CVisa_service_1.AgentB2CVisaService();
    }
}
exports.AgentB2CVisaController = AgentB2CVisaController;
