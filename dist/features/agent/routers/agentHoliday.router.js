"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentHoliday_controller_1 = require("../controllers/agentHoliday.controller");
class AgentHolidayRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentHoliday_controller_1.AgentHolidayController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/search').post(this.controller.searchHolidayPackage);
        this.router
            .route('/search/:slug')
            .get(this.controller.getSingleHolidayPackage);
        this.router
            .route('/booking')
            .post(this.controller.bookHolidayPackage)
            .get(this.controller.getHolidayPackageBookingList);
        this.router
            .route('/booking/:id')
            .get(this.controller.getSingleHolidayPackageBooking);
        this.router
            .route('/booking/:id/cancel')
            .post(this.controller.cancelHolidayPackageBooking);
    }
}
exports.default = AgentHolidayRouter;
