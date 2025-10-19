"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentSubAgent_router_1 = __importDefault(require("./agentSubAgentRouters/agentSubAgent.router"));
const agentSubAgentFlight_router_1 = __importDefault(require("./agentSubAgentRouters/agentSubAgentFlight.router"));
const agentSubAgentHotel_router_1 = __importDefault(require("./agentSubAgentRouters/agentSubAgentHotel.router"));
const agentSubAgentPayment_router_1 = __importDefault(require("./agentSubAgentRouters/agentSubAgentPayment.router"));
class AgentSubAgentMainRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.agentSubAgentRouter = new agentSubAgent_router_1.default();
        this.agentSubAgentFlightRouter = new agentSubAgentFlight_router_1.default();
        this.agentSubAgentPaymentRouter = new agentSubAgentPayment_router_1.default();
        this.agentSubAgentHotelRouter = new agentSubAgentHotel_router_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.use('/', this.agentSubAgentRouter.router);
        this.router.use('/flight', this.agentSubAgentFlightRouter.router);
        this.router.use('/hotel', this.agentSubAgentHotelRouter.router);
        this.router.use('/payments', this.agentSubAgentPaymentRouter.router);
    }
}
exports.default = AgentSubAgentMainRouter;
