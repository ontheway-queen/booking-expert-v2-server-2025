"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentB2CSubConfig_controller_1 = __importDefault(require("../../controllers/agentB2CControllers/agentB2CSubConfig.controller"));
class AgentB2CSubConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubConfig_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/markup')
            .get(this.controller.getB2CMarkup)
            .post(this.controller.upsertB2CMarkup);
    }
}
exports.default = AgentB2CSubConfigRouter;
