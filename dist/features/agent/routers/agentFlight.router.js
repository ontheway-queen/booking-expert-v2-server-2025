"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentFlight_controller_1 = __importDefault(require("../controllers/agentFlight.controller"));
class AgentFlightRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentFlight_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/search')
            .post(this.controller.flightSearch);
        this.router.route('/search/sse')
            .get(this.controller.FlightSearchSSE);
        this.router.route('/search/fare-rules')
            .get(this.controller.getFlightFareRule);
        this.router.route('/revalidate')
            .get(this.controller.flightRevalidate);
        this.router.route('/booking')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.FLIGHT_BOOKING_FILES), this.controller.flightBooking);
    }
}
exports.default = AgentFlightRouter;
