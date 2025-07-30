"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const adminAgentHotel_controller_1 = require("../../controllers/adminAgentControllers/adminAgentHotel.controller");
class AdminAgentHotelRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAgentHotel_controller_1.AdminAgentHotelController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/booking').get(this.controller.getBooking);
        this.router
            .route('/booking/:id')
            .get(this.controller.getSingleBooking)
            .put(this.controller.updateBooking);
        this.router.route('/booking/:id/tracking');
        this.router.route('/booking/:id/cancel');
        this.router.route('/booking/:id/refund');
    }
}
exports.default = AdminAgentHotelRouter;
