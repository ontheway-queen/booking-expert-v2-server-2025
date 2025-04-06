"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agentDashboard_router_1 = __importDefault(require("./routers/agentDashboard.router"));
const agentReport_router_1 = __importDefault(require("./routers/agentReport.router"));
const agentAdministration_router_1 = __importDefault(require("./routers/agentAdministration.router"));
const agentSupportTicket_router_1 = __importDefault(require("./routers/agentSupportTicket.router"));
const agentPayments_router_1 = __importDefault(require("./routers/agentPayments.router"));
const agentB2C_router_1 = __importDefault(require("./routers/agentB2C.router"));
const agentTraveler_router_1 = __importDefault(require("./routers/agentTraveler.router"));
const agentSubAgent_router_1 = __importDefault(require("./routers/agentSubAgent.router"));
const agentUmrah_router_1 = __importDefault(require("./routers/agentUmrah.router"));
const agentGroupFare_router_1 = __importDefault(require("./routers/agentGroupFare.router"));
const agentHoliday_router_1 = __importDefault(require("./routers/agentHoliday.router"));
const agentVisa_router_1 = __importDefault(require("./routers/agentVisa.router"));
const agentHotel_router_1 = __importDefault(require("./routers/agentHotel.router"));
const agentFlight_router_1 = __importDefault(require("./routers/agentFlight.router"));
const agentProfile_router_1 = __importDefault(require("./routers/agentProfile.router"));
class AgentRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        // Router classes
        this.agentDashboardRouter = new agentDashboard_router_1.default();
        this.agentReportRouter = new agentReport_router_1.default();
        this.agentAdministrationRouter = new agentAdministration_router_1.default();
        this.agentSupportTicketRouter = new agentSupportTicket_router_1.default();
        this.agentPaymentsRouter = new agentPayments_router_1.default();
        this.agentFlightRouter = new agentFlight_router_1.default();
        this.agentHotelRouter = new agentHotel_router_1.default();
        this.agentVisaRouter = new agentVisa_router_1.default();
        this.agentHolidayRouter = new agentHoliday_router_1.default();
        this.agentGroupFareRouter = new agentGroupFare_router_1.default();
        this.agentUmrahRouter = new agentUmrah_router_1.default();
        this.agentSubAgentRouter = new agentSubAgent_router_1.default();
        this.agentTravelerRouter = new agentTraveler_router_1.default();
        this.agentProfileRouter = new agentProfile_router_1.default();
        // Agent B2C Sub Root Router Class
        this.agentB2CRouter = new agentB2C_router_1.default();
        this.callRouter();
    }
    callRouter() {
        this.Router.use('/', this.agentDashboardRouter.router);
        this.Router.use('/profile', this.agentProfileRouter.router);
        this.Router.use('/flight', this.agentFlightRouter.router);
        this.Router.use('/hotel', this.agentHotelRouter.router);
        this.Router.use('/visa', this.agentVisaRouter.router);
        this.Router.use('/holiday', this.agentHolidayRouter.router);
        this.Router.use('/group-fare', this.agentGroupFareRouter.router);
        this.Router.use('/umrah', this.agentUmrahRouter.router);
        this.Router.use('/sub-agent', this.agentSubAgentRouter.router);
        this.Router.use('/traveler', this.agentTravelerRouter.router);
        this.Router.use('/payments', this.agentPaymentsRouter.router);
        this.Router.use('/support-ticket', this.agentSupportTicketRouter.router);
        this.Router.use('/report', this.agentReportRouter.router);
        this.Router.use('/administration', this.agentAdministrationRouter.router);
        // Agent B2C Root Routes
        this.Router.use('/b2c', this.agentB2CRouter.Router);
    }
}
exports.default = AgentRootRouter;
