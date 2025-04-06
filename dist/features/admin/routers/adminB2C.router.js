"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminB2CBlog_router_1 = __importDefault(require("./adminB2CRouters/adminB2CBlog.router"));
const adminB2CConfig_router_1 = __importDefault(require("./adminB2CRouters/adminB2CConfig.router"));
const adminB2CFlight_router_1 = __importDefault(require("./adminB2CRouters/adminB2CFlight.router"));
const adminB2CHoliday_router_1 = __importDefault(require("./adminB2CRouters/adminB2CHoliday.router"));
const adminB2CHotel_router_1 = __importDefault(require("./adminB2CRouters/adminB2CHotel.router"));
const adminB2CMain_router_1 = __importDefault(require("./adminB2CRouters/adminB2CMain.router"));
const adminB2CSupportTicket_router_1 = __importDefault(require("./adminB2CRouters/adminB2CSupportTicket.router"));
const adminB2CUmrah_router_1 = __importDefault(require("./adminB2CRouters/adminB2CUmrah.router"));
const adminB2CUsers_router_1 = __importDefault(require("./adminB2CRouters/adminB2CUsers.router"));
const adminB2CVisa_router_1 = __importDefault(require("./adminB2CRouters/adminB2CVisa.router"));
class AdminB2CRouter extends abstract_router_1.default {
    constructor() {
        super();
        // Router classes
        this.mainRouter = new adminB2CMain_router_1.default();
        this.blogRouter = new adminB2CBlog_router_1.default();
        this.configRouter = new adminB2CConfig_router_1.default();
        this.flightRouter = new adminB2CFlight_router_1.default();
        this.holidayRouter = new adminB2CHoliday_router_1.default();
        this.hotelRouter = new adminB2CHotel_router_1.default();
        this.supportTicketRouter = new adminB2CSupportTicket_router_1.default();
        this.umrahRouter = new adminB2CUmrah_router_1.default();
        this.usersRouter = new adminB2CUsers_router_1.default();
        this.visaRouter = new adminB2CVisa_router_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.use('/', this.mainRouter.router);
        this.router.use('/blog', this.blogRouter.router);
        this.router.use('/config', this.configRouter.router);
        this.router.use('/flight', this.flightRouter.router);
        this.router.use('/holiday', this.holidayRouter.router);
        this.router.use('/hotel', this.hotelRouter.router);
        this.router.use('/support-ticket', this.supportTicketRouter.router);
        this.router.use('/umrah', this.umrahRouter.router);
        this.router.use('/users', this.usersRouter.router);
        this.router.use('/visa', this.visaRouter.router);
    }
}
exports.default = AdminB2CRouter;
