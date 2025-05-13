"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentPayments_controller_1 = __importDefault(require("../controllers/agentPayments.controller"));
class AgentPaymentsRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentPayments_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/top-up')
            .post(this.controller.topUpUsingPaymentGateway);
    }
}
exports.default = AgentPaymentsRouter;
