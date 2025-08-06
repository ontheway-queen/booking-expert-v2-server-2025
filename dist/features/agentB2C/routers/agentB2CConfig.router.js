"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentB2CConfig_controller_1 = __importDefault(require("../controllers/agentB2CConfig.controller"));
class AgentB2CConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CConfig_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/home').get(this.controller.GetHomePageData);
        this.router.route('/about-us').get(this.controller.GetAboutUsPageData);
        this.router.route('/contact-us').get(this.controller.GetContactUsPageData);
        this.router
            .route('/privacy-policy')
            .get(this.controller.GetPrivacyPolicyPageData);
    }
}
exports.default = AgentB2CConfigRouter;
