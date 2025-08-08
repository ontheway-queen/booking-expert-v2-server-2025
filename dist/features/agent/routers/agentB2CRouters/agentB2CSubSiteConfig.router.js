"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentB2CSubSiteConfig_controller_1 = require("../../controllers/agentB2CControllers/agentB2CSubSiteConfig.controller");
class AgentB2CSubSiteConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubSiteConfig_controller_1.AgentB2CSubSiteConfigController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/");
    }
}
exports.default = AgentB2CSubSiteConfigRouter;
