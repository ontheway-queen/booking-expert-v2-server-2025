"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentB2CSubFlight_controller_1 = __importDefault(require("../../controllers/agentB2CControllers/agentB2CSubFlight.controller"));
class AgentB2CSubFlightRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubFlight_controller_1.default();
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
exports.default = AgentB2CSubFlightRouter;
