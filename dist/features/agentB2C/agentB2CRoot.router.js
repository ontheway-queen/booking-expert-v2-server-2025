"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agentB2CMain_router_1 = __importDefault(require("./routers/agentB2CMain.router"));
const agentB2CFlight_router_1 = __importDefault(require("./routers/agentB2CFlight.router"));
const agentB2CHoliday_router_1 = __importDefault(require("./routers/agentB2CHoliday.router"));
const agentB2CHotel_router_1 = __importDefault(require("./routers/agentB2CHotel.router"));
const agentB2CProfile_router_1 = __importDefault(require("./routers/agentB2CProfile.router"));
const agentB2CSupportTicket_router_1 = __importDefault(require("./routers/agentB2CSupportTicket.router"));
const agentB2CTraveler_router_1 = __importDefault(require("./routers/agentB2CTraveler.router"));
const agentB2CUmrah_router_1 = __importDefault(require("./routers/agentB2CUmrah.router"));
const agentB2CVisa_router_1 = __importDefault(require("./routers/agentB2CVisa.router"));
class AgentB2CRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        // Router classes
        this.mainRouter = new agentB2CMain_router_1.default();
        this.flightRouter = new agentB2CFlight_router_1.default();
        this.holidayRouter = new agentB2CHoliday_router_1.default();
        this.hotelRouter = new agentB2CHotel_router_1.default();
        this.profileRouter = new agentB2CProfile_router_1.default();
        this.supportTicketRouter = new agentB2CSupportTicket_router_1.default();
        this.travelerRouter = new agentB2CTraveler_router_1.default();
        this.umrahRouter = new agentB2CUmrah_router_1.default();
        this.visaRouter = new agentB2CVisa_router_1.default();
        this.callRouter();
    }
    callRouter() {
        this.Router.use('/', this.mainRouter.router);
        this.Router.use('/flight', this.flightRouter.router);
        this.Router.use('/holiday', this.holidayRouter.router);
        this.Router.use('/hotel', this.hotelRouter.router);
        this.Router.use('/profile', this.profileRouter.router);
        this.Router.use('/support-ticket', this.supportTicketRouter.router);
        this.Router.use('/traveler', this.travelerRouter.router);
        this.Router.use('/umrah', this.umrahRouter.router);
        this.Router.use('/visa', this.visaRouter.router);
    }
}
exports.default = AgentB2CRootRouter;
