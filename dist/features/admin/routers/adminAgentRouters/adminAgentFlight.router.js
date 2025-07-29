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
        this.router.route('/booking').get(this.controller.getAllFlightBooking);
        this.router
            .route('/booking/:id')
            .get(this.controller.getSingleBooking)
            .put(this.controller.updateBooking);
        this.router
            .route('/booking/:id/cancel')
            .post(this.controller.cancelBooking);
        this.router.route('/booking/:id/issue').post(this.controller.issueTicket);
        this.router.route('/booking/:id/split').post(this.controller.issueTicket);
        this.router
            .route('/booking/:id/tracking')
            .get(this.controller.getBookingTrackingData);
    }
}
exports.default = AdminAgentFlightRouter;
