"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const adminAgentFlight_controller_1 = require("../../controllers/adminAgentControllers/adminAgentFlight.controller");
class AdminAgentFlightRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAgentFlight_controller_1.AdminAgentFlightController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/')
            .get(this.controller.getAllFlightBooking);
        this.router.route('/:id')
            .get(this.controller.getSingleBooking);
        this.router.route('/:id/tracking')
            .get(this.controller.getBookingTrackingData);
    }
}
exports.default = AdminAgentFlightRouter;
