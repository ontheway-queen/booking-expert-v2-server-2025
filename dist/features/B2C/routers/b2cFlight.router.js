"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const b2cFlight_controller_1 = require("../controllers/b2cFlight.controller");
class B2CFlightRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new b2cFlight_controller_1.B2CFlightController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/search').post(this.controller.flightSearch);
        this.router.route('/search/sse').get(this.controller.FlightSearchSSE);
        this.router.route('/search/fare-rules').get(this.controller.getFareRules);
        this.router.route('/revalidate').get(this.controller.flightRevalidate);
        this.router.route('/booking');
        this.router.route('/booking/:id');
        this.router.route('/booking/:id/cancel');
        this.router.route('/booking/:id/payment');
    }
}
exports.default = B2CFlightRouter;
