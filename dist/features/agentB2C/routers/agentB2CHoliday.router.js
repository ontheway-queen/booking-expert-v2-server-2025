"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const authChecker_1 = __importDefault(require("../../../middleware/authChecker/authChecker"));
const agentB2CHoliday_controller_1 = require("../controllers/agentB2CHoliday.controller");
class AgentB2CHolidayRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.authChecker = new authChecker_1.default();
        this.controller = new agentB2CHoliday_controller_1.AgentB2CHolidayController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/search').post(this.controller.searchHolidayPackage);
        this.router
            .route('/search/:slug')
            .get(this.controller.getSingleHolidayPackage);
        this.router
            .route('/booking')
            .post(this.authChecker.agencyB2CUserAuthChecker, this.controller.bookHolidayPackage)
            .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.getHolidayPackageBookingList);
        this.router
            .route('/booking/:id')
            .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.getSingleHolidayPackageBooking);
        this.router
            .route('/booking/:id/cancel')
            .post(this.authChecker.agencyB2CUserAuthChecker, this.controller.cancelHolidayPackageBooking);
    }
}
exports.default = AgentB2CHolidayRouter;
