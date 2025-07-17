"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const authChecker_1 = __importDefault(require("../../../middleware/authChecker/authChecker"));
const agentB2CFlight_controller_1 = __importDefault(require("../controllers/agentB2CFlight.controller"));
class AgentB2CFlightRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CFlight_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/search').post(this.controller.flightSearch);
        this.router.route('/search/sse').get(this.controller.FlightSearchSSE);
        this.router
            .route('/search/fare-rules')
            .get(this.controller.getFlightFareRule);
        this.router.route('/revalidate').post(this.controller.flightRevalidate);
        this.router
            .route('/booking')
            .post(new authChecker_1.default().agencyB2CUserAuthChecker, this.uploader.cloudUploadRaw(this.fileFolders.AGENT_B2C_FLIGHT_BOOKING_FILES), this.controller.flightBooking)
            .get(new authChecker_1.default().agencyB2CUserAuthChecker, this.controller.getAllBookingList);
        this.router
            .route('/booking/:id')
            .get(new authChecker_1.default().agencyB2CUserAuthChecker, this.controller.getSingleBooking);
    }
}
exports.default = AgentB2CFlightRouter;
