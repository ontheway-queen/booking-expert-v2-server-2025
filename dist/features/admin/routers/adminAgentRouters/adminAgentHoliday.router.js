"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const adminAgentHoliday_controller_1 = require("../../controllers/adminAgentControllers/adminAgentHoliday.controller");
class AdminAgentHolidayRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAgentHoliday_controller_1.AdminAgentHolidayController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/booking')
            .get(this.controller.getHolidayPackageBookingList);
        this.router.route('/booking/:id')
            .get(this.controller.getSingleHolidayPackageBooking)
            .patch(this.controller.updateHolidayPackageBooking);
    }
}
exports.default = AdminAgentHolidayRouter;
