"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentSubAgentFlight_controller_1 = __importDefault(require("../../controllers/agentSubAgentControllers/agentSubAgentFlight.controller"));
class AgentSubAgentFlightRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentSubAgentFlight_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/booking').get(this.controller.getAllBooking);
        this.router
            .route('/booking/:id')
            .get(this.controller.getSingleBooking)
            .patch(this.controller.updateBooking);
    }
}
exports.default = AgentSubAgentFlightRouter;
