"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentB2CPayment_controller_1 = __importDefault(require("../controllers/agentB2CPayment.controller"));
class AgentB2CPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CPayment_controller_1.default();
        this.callRouter();
    }
    callRouter() { }
}
exports.default = AgentB2CPaymentRouter;
