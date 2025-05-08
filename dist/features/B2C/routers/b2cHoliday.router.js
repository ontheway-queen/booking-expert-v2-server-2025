"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const authChecker_1 = __importDefault(require("../../../middleware/authChecker/authChecker"));
const b2cHoliday_controller_1 = require("../controllers/b2cHoliday.controller");
class B2CHolidayRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new b2cHoliday_controller_1.B2CHolidayController();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/search')
            .post(this.controller.searchHolidayPackage);
        this.router.route('/search/:slug')
            .get(this.controller.getSingleHolidayPackage);
        this.router.route('/booking')
            .post(this.authChecker.b2cUserAuthChecker, this.controller.bookHolidayPackage)
            .get(this.authChecker.b2cUserAuthChecker, this.controller.getHolidayPackageBookingList);
        this.router.route('/booking/:id')
            .get(this.authChecker.b2cUserAuthChecker, this.controller.getSingleHolidayPackageBooking);
        this.router.route('/booking/:id/cancel')
            .post(this.authChecker.b2cUserAuthChecker, this.controller.cancelHolidayPackageBooking);
    }
}
exports.default = B2CHolidayRouter;
