"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const authChecker_1 = __importDefault(require("../../../middleware/authChecker/authChecker"));
const agentB2CUmrah_controller_1 = require("../controllers/agentB2CUmrah.controller");
class AgentB2CUmrahRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CUmrah_controller_1.AgentB2CUmrahController();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/').get(this.controller.getUmrahPackages);
        this.router
            .route('/booking')
            .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.getUmrahBookingList);
        this.router
            .route('/:id/book')
            .post(this.authChecker.agencyB2CUserAuthChecker, this.controller.bookUmrahPackage);
        this.router
            .route('/booking/:id')
            .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.getSingleUmrahBooking);
        this.router
            .route('/booking/:id/cancel')
            .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.cancelUmrahBooking);
        this.router.route('/:slug').get(this.controller.getSingleUmrahPackages);
    }
}
exports.default = AgentB2CUmrahRouter;
