"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const b2cMain_router_1 = __importDefault(require("./routers/b2cMain.router"));
const b2cHoliday_router_1 = __importDefault(require("./routers/b2cHoliday.router"));
const b2cHotel_router_1 = __importDefault(require("./routers/b2cHotel.router"));
const b2cFlight_router_1 = __importDefault(require("./routers/b2cFlight.router"));
const b2cProfile_router_1 = __importDefault(require("./routers/b2cProfile.router"));
const b2cSupportTicket_router_1 = __importDefault(require("./routers/b2cSupportTicket.router"));
const b2cTraveler_router_1 = __importDefault(require("./routers/b2cTraveler.router"));
const b2cUmrah_router_1 = __importDefault(require("./routers/b2cUmrah.router"));
const b2cVisa_router_1 = __importDefault(require("./routers/b2cVisa.router"));
class B2CRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        // Router classes
        this.b2cMainRouter = new b2cMain_router_1.default();
        this.b2cHolidayRouter = new b2cHoliday_router_1.default();
        this.b2cHotelRouter = new b2cHotel_router_1.default();
        this.b2cFlightRouter = new b2cFlight_router_1.default();
        this.b2cProfileRouter = new b2cProfile_router_1.default();
        this.b2cSupportTicketRouter = new b2cSupportTicket_router_1.default();
        this.b2cTravelerRouter = new b2cTraveler_router_1.default();
        this.b2cUmrahRouter = new b2cUmrah_router_1.default();
        this.b2cVisaRouter = new b2cVisa_router_1.default();
        this.callRouter();
    }
    callRouter() {
        this.Router.use('/', this.b2cMainRouter.router);
        this.Router.use('/flight', this.b2cFlightRouter.router);
        this.Router.use('/hotel', this.b2cHotelRouter.router);
        this.Router.use('/visa', this.b2cVisaRouter.router);
        this.Router.use('/holiday', this.b2cHolidayRouter.router);
        this.Router.use('/umrah', this.b2cUmrahRouter.router);
        this.Router.use('/profile', this.b2cProfileRouter.router);
        this.Router.use('/traveler', this.b2cTravelerRouter.router);
        this.Router.use('/support-ticket', this.b2cSupportTicketRouter.router);
    }
}
exports.default = B2CRootRouter;
