"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentSubAgentHotel_controller_1 = require("../../controllers/agentSubAgentControllers/agentSubAgentHotel.controller");
class AgentSubAgentHotelRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentSubAgentHotel_controller_1.AgentSubAgentHotelController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/booking').get(this.controller.getBooking);
        this.router
            .route('/booking/:id')
            .get(this.controller.getSingleBooking)
            .put(this.controller.updateBooking);
    }
}
exports.default = AgentSubAgentHotelRouter;
