"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentB2CMain_controller_1 = require("../controllers/agentB2CMain.controller");
class AgentB2CMainRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CMain_controller_1.AgentB2CMainController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/email-otp/send').post(this.controller.sendEmailOTP);
        this.router.route('/email-otp/match').post(this.controller.matchEmailOTP);
        this.router
            .route('/email-subscriber')
            .post(this.controller.createEmailSubscriber);
    }
}
exports.default = AgentB2CMainRouter;
