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
        this.router.route('/booking')
            .get(this.controller.getAllFlightBooking);
        this.router.route('/booking/:id')
            .get(this.controller.getSingleBooking)
            .delete(this.controller.cancelBooking) //cancel booking using API
            .post(this.controller.issueTicket) //issue ticket using API
            .patch(this.controller.updateBooking); //Expire a booking
        this.router.route('/booking/:id/booked')
            .post(this.controller.updatePendingBookingManually); //update pending booking to booked or issued manually
        this.router.route('/booking/:id/confirm')
            .post(this.controller.updateProcessingTicketManually); //update processing ticket to issued manually
        this.router.route('/booking/:id/tracking')
            .get(this.controller.getBookingTrackingData);
    }
}
exports.default = AdminAgentFlightRouter;
