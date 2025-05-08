"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const adminB2CHoliday_controller_1 = require("../../controllers/adminB2CControllers/adminB2CHoliday.controller");
class AdminB2CHolidayRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminB2CHoliday_controller_1.AdminB2CHolidayController();
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
exports.default = AdminB2CHolidayRouter;
