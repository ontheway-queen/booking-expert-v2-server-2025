"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminAgentAgency_router_1 = __importDefault(require("./adminAgentRouters/adminAgentAgency.router"));
const adminAgentFlight_router_1 = __importDefault(require("./adminAgentRouters/adminAgentFlight.router"));
const adminAgentGroupFare_router_1 = __importDefault(require("./adminAgentRouters/adminAgentGroupFare.router"));
const adminAgentHoliday_router_1 = __importDefault(require("./adminAgentRouters/adminAgentHoliday.router"));
const adminAgentHotel_router_1 = __importDefault(require("./adminAgentRouters/adminAgentHotel.router"));
const adminAgentPayment_router_1 = __importDefault(require("./adminAgentRouters/adminAgentPayment.router"));
const adminAgentPromotions_router_1 = __importDefault(require("./adminAgentRouters/adminAgentPromotions.router"));
const adminAgentSupportTicket_router_1 = __importDefault(require("./adminAgentRouters/adminAgentSupportTicket.router"));
const adminAgentUmrah_router_1 = __importDefault(require("./adminAgentRouters/adminAgentUmrah.router"));
const adminAgentVisa_router_1 = __importDefault(require("./adminAgentRouters/adminAgentVisa.router"));
class AdminAgentRouter extends abstract_router_1.default {
    constructor() {
        super();
        // Router classes
        this.agencyRouter = new adminAgentAgency_router_1.default();
        this.flightRouter = new adminAgentFlight_router_1.default();
        this.groupFareRouter = new adminAgentGroupFare_router_1.default();
        this.holidayRouter = new adminAgentHoliday_router_1.default();
        this.hotelRouter = new adminAgentHotel_router_1.default();
        this.paymentRouter = new adminAgentPayment_router_1.default();
        this.promotionsRouter = new adminAgentPromotions_router_1.default();
        this.supportTicketRouter = new adminAgentSupportTicket_router_1.default();
        this.umrahRouter = new adminAgentUmrah_router_1.default();
        this.visaRouter = new adminAgentVisa_router_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.use('/agency', this.agencyRouter.router);
        this.router.use('/flight', this.flightRouter.router);
        this.router.use('/group-fare', this.groupFareRouter.router);
        this.router.use('/holiday', this.holidayRouter.router);
        this.router.use('/hotel', this.hotelRouter.router);
        this.router.use('/payment', this.paymentRouter.router);
        this.router.use('/promotions', this.promotionsRouter.router);
        this.router.use('/support-ticket', this.supportTicketRouter.router);
        this.router.use('/umrah', this.umrahRouter.router);
        this.router.use('/visa', this.visaRouter.router);
    }
}
exports.default = AdminAgentRouter;
