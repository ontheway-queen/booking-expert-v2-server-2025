"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const agentB2CSub_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSub.router"));
const agentB2CSubConfig_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSubConfig.router"));
const agentB2CSubFlight_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSubFlight.router"));
const agentB2CSubGroupFare_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSubGroupFare.router"));
const agentB2CSubHoliday_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSubHoliday.router"));
const agentB2CSubHotel_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSubHotel.router"));
const agentB2CSubUmrah_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSubUmrah.router"));
const agentB2CSubUsers_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSubUsers.router"));
const agentB2CSubVisa_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSubVisa.router"));
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentB2CSubBlog_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSubBlog.router"));
const agentB2CSubSiteConfig_router_1 = __importDefault(require("./agentB2CRouters/agentB2CSubSiteConfig.router"));
class AgentB2CRouter extends abstract_router_1.default {
    constructor() {
        super();
        // Agent B2C Sub Classes
        this.agentB2CSubRouter = new agentB2CSub_router_1.default();
        this.agentB2CSubConfigRouter = new agentB2CSubConfig_router_1.default();
        this.agentB2CSubFlightRouter = new agentB2CSubFlight_router_1.default();
        this.agentB2CSubGroupFareRouter = new agentB2CSubGroupFare_router_1.default();
        this.agentB2CSubHolidayRouter = new agentB2CSubHoliday_router_1.default();
        this.agentB2CSubHotelRouter = new agentB2CSubHotel_router_1.default();
        this.agentB2CSubUmrahRouter = new agentB2CSubUmrah_router_1.default();
        this.agentB2CSubUsersRouter = new agentB2CSubUsers_router_1.default();
        this.agentB2CSubVisaRouter = new agentB2CSubVisa_router_1.default();
        this.agentB2CSubBlogRouter = new agentB2CSubBlog_router_1.default();
        this.agentB2CSubSiteConfigRouter = new agentB2CSubSiteConfig_router_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.use('/', this.agentB2CSubRouter.router);
        this.router.use('/config', this.agentB2CSubConfigRouter.router);
        this.router.use('/flight', this.agentB2CSubFlightRouter.router);
        this.router.use('/users', this.agentB2CSubUsersRouter.router);
        this.router.use('/visa', this.agentB2CSubVisaRouter.router);
        this.router.use('/holiday', this.agentB2CSubHolidayRouter.router);
        this.router.use('/hotel', this.agentB2CSubHotelRouter.router);
        this.router.use('/umrah', this.agentB2CSubUmrahRouter.router);
        this.router.use('/group-fare', this.agentB2CSubGroupFareRouter.router);
        this.router.use('/blog', this.agentB2CSubBlogRouter.router);
        this.router.use('/site-config', this.agentB2CSubSiteConfigRouter.router);
    }
}
exports.default = AgentB2CRouter;
