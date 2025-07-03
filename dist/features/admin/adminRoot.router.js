"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminB2C_router_1 = __importDefault(require("./routers/adminB2C.router"));
const adminAgent_router_1 = __importDefault(require("./routers/adminAgent.router"));
const adminAdministration_router_1 = __importDefault(require("./routers/adminAdministration.router"));
const adminConfig_router_1 = __importDefault(require("./routers/adminConfig.router"));
const adminGroupFare_router_1 = __importDefault(require("./routers/adminGroupFare.router"));
const adminHoliday_router_1 = __importDefault(require("./routers/adminHoliday.router"));
const adminMain_router_1 = __importDefault(require("./routers/adminMain.router"));
const adminHotelMarkupSet_router_1 = __importDefault(require("./routers/adminHotelMarkupSet.router"));
const adminProfile_router_1 = __importDefault(require("./routers/adminProfile.router"));
const adminReport_router_1 = __importDefault(require("./routers/adminReport.router"));
const adminUmrah_router_1 = __importDefault(require("./routers/adminUmrah.router"));
const adminVisa_router_1 = __importDefault(require("./routers/adminVisa.router"));
const adminAirlinesPreference_router_1 = require("./routers/adminAirlinesPreference.router");
const adminDynamicFare_router_1 = require("./routers/adminDynamicFare.router");
const adminDynamicFareSet_router_1 = require("./routers/adminDynamicFareSet.router");
class AdminRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        // Router classes
        this.adminAdministrationRouter = new adminAdministration_router_1.default();
        this.adminConfigRouter = new adminConfig_router_1.default();
        this.adminGroupFareRouter = new adminGroupFare_router_1.default();
        this.adminHolidayRouter = new adminHoliday_router_1.default();
        this.adminMainRouter = new adminMain_router_1.default();
        this.adminHotelMarkupSetRouter = new adminHotelMarkupSet_router_1.default();
        this.adminProfileRouter = new adminProfile_router_1.default();
        this.adminReportRouter = new adminReport_router_1.default();
        this.adminUmrahRouter = new adminUmrah_router_1.default();
        this.adminVisaRouter = new adminVisa_router_1.default();
        this.adminAirlinesPreferenceRouter = new adminAirlinesPreference_router_1.AdminAirlinesPreferenceRouter();
        this.adminDynamicFareRouter = new adminDynamicFare_router_1.AdminDynamicFareRouter();
        this.adminDynamicFareSetRouter = new adminDynamicFareSet_router_1.AdminDynamicFareSetRouter();
        //Admin Agent ,Admin B2C Sub Root Router Class
        this.adminB2CRouter = new adminB2C_router_1.default();
        this.adminAgentRouter = new adminAgent_router_1.default();
        this.callRouter();
    }
    callRouter() {
        this.Router.use('/', this.adminMainRouter.router);
        this.Router.use('/profile', this.adminProfileRouter.router);
        this.Router.use('/report', this.adminReportRouter.router);
        this.Router.use('/administration', this.adminAdministrationRouter.router);
        this.Router.use('/config', this.adminConfigRouter.router);
        this.Router.use('/group-fare', this.adminGroupFareRouter.router);
        this.Router.use('/holiday', this.adminHolidayRouter.router);
        this.Router.use('/umrah', this.adminUmrahRouter.router);
        this.Router.use('/visa', this.adminVisaRouter.router);
        this.Router.use('/airlines-preference', this.adminAirlinesPreferenceRouter.router);
        this.Router.use('/hotel-markup-set', this.adminHotelMarkupSetRouter.router);
        this.Router.use('/dynamic-fare-set', this.adminDynamicFareSetRouter.router);
        this.Router.use('/dynamic-fare', this.adminDynamicFareRouter.router);
        //Admin Agent, Admin B2C Root Routes
        this.Router.use('/agent', this.adminAgentRouter.router);
        this.Router.use('/b2c', this.adminB2CRouter.router);
    }
}
exports.default = AdminRootRouter;
