"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubSiteConfigController = void 0;
const abstract_controller_1 = __importDefault(require("../../../../abstract/abstract.controller"));
const agentB2CSubSiteConfig_service_1 = require("../../services/agentB2CServices/agentB2CSubSiteConfig.service");
class AgentB2CSubSiteConfigController extends abstract_controller_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubSiteConfig_service_1.AgentB2CSubSiteConfigService();
    }
}
exports.AgentB2CSubSiteConfigController = AgentB2CSubSiteConfigController;
