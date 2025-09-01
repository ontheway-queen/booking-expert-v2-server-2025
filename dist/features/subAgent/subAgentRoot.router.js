"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subAgentConfig_router_1 = __importDefault(require("./routers/subAgentConfig.router"));
const subAgentMain_router_1 = __importDefault(require("./routers/subAgentMain.router"));
const subAgentProfile_router_1 = __importDefault(require("./routers/subAgentProfile.router"));
const authChecker_1 = __importDefault(require("../../middleware/authChecker/authChecker"));
const subAgentSupportTic_router_1 = __importDefault(require("./routers/subAgentSupportTic.router"));
const subAgentPayments_router_1 = __importDefault(require("./routers/subAgentPayments.router"));
const subAgentHotel_router_1 = __importDefault(require("./routers/subAgentHotel.router"));
const subAgentFlight_router_1 = __importDefault(require("./routers/subAgentFlight.router"));
const subAgentDash_router_1 = __importDefault(require("./routers/subAgentDash.router"));
const subAgentTra_router_1 = __importDefault(require("./routers/subAgentTra.router"));
class SubAgentRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        this.subAgentConfigRouter = new subAgentConfig_router_1.default();
        this.subAgentMainRouter = new subAgentMain_router_1.default();
        this.subAgentProfileRouter = new subAgentProfile_router_1.default();
        this.subAgentSupportTicketRouter = new subAgentSupportTic_router_1.default();
        this.subAgentPaymentsRouter = new subAgentPayments_router_1.default();
        this.subAgentHotelRouter = new subAgentHotel_router_1.default();
        this.subAgentFlightRouter = new subAgentFlight_router_1.default();
        this.subAgentTravelerRouter = new subAgentTra_router_1.default();
        this.subAgentDashboardRouter = new subAgentDash_router_1.default();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.Router.use('/', this.subAgentMainRouter.router);
        this.Router.use('/config', this.subAgentConfigRouter.router);
        //with auth
        this.Router.use('/profile', this.authChecker.agencyUserAuthChecker, this.subAgentProfileRouter.router);
        this.Router.use('/flight', this.authChecker.agencyUserAuthChecker, this.subAgentFlightRouter.router);
        this.Router.use('/hotel', this.authChecker.agencyUserAuthChecker, this.subAgentHotelRouter.router);
        this.Router.use('/payments', this.authChecker.agencyUserAuthChecker, this.subAgentPaymentsRouter.router);
        this.Router.use('/traveler', this.authChecker.agencyUserAuthChecker, this.subAgentTravelerRouter.router);
        this.Router.use('/support-ticket', this.authChecker.agencyUserAuthChecker, this.subAgentSupportTicketRouter.router);
        this.Router.use('/dashboard', this.authChecker.agencyUserAuthChecker, this.subAgentDashboardRouter.router);
    }
}
exports.default = SubAgentRootRouter;
