"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubUmrahController = void 0;
const abstract_controller_1 = __importDefault(require("../../../../abstract/abstract.controller"));
const agentB2CSubUmrah_service_1 = require("../../services/agentB2CServices/agentB2CSubUmrah.service");
class AgentB2CSubUmrahController extends abstract_controller_1.default {
    constructor() {
        super(...arguments);
        this.services = new agentB2CSubUmrah_service_1.AgentB2CSubUmrahService();
    }
}
exports.AgentB2CSubUmrahController = AgentB2CSubUmrahController;
