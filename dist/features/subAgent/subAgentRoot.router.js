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
const subAgentAdministration_router_1 = __importDefault(require("./routers/subAgentAdministration.router"));
const agentB2CUmrah_router_1 = __importDefault(require("./routers/agentB2CUmrah.router"));
const agentB2CHoliday_router_1 = __importDefault(require("./routers/agentB2CHoliday.router"));
const subAgentVisa_router_1 = __importDefault(require("./routers/subAgentVisa.router"));
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
        this.subAgentAdministrationRouter = new subAgentAdministration_router_1.default();
        this.subAgentUmrahRouter = new agentB2CUmrah_router_1.default();
        this.subAgentHolidayRouter = new agentB2CHoliday_router_1.default();
        this.subAgentVisaRouter = new subAgentVisa_router_1.default();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.Router.use('/', this.subAgentMainRouter.router);
        this.Router.use('/config', this.subAgentConfigRouter.router);
        //with auth
        this.Router.use('/profile', this.authChecker.subAgentUserAuthChecker, this.subAgentProfileRouter.router);
        this.Router.use('/flight', this.authChecker.subAgentUserAuthChecker, this.subAgentFlightRouter.router);
        this.Router.use('/hotel', this.authChecker.subAgentUserAuthChecker, this.subAgentHotelRouter.router);
        this.Router.use('/payments', this.authChecker.subAgentUserAuthChecker, this.subAgentPaymentsRouter.router);
        this.Router.use('/traveler', this.authChecker.subAgentUserAuthChecker, this.subAgentTravelerRouter.router);
        this.Router.use('/support-ticket', this.authChecker.subAgentUserAuthChecker, this.subAgentSupportTicketRouter.router);
        this.Router.use('/dashboard', this.authChecker.subAgentUserAuthChecker, this.subAgentDashboardRouter.router);
        this.Router.use('/administration', this.authChecker.subAgentUserAuthChecker, this.subAgentAdministrationRouter.router);
        this.Router.use('/umrah', this.authChecker.subAgentUserAuthChecker, this.subAgentUmrahRouter.router);
        this.Router.use('/visa', this.authChecker.subAgentUserAuthChecker, this.subAgentVisaRouter.router);
        this.Router.use('/holiday', this.authChecker.subAgentUserAuthChecker, this.subAgentHolidayRouter.router);
    }
}
exports.default = SubAgentRootRouter;
