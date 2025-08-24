"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const subAgentMain_controller_1 = require("../controllers/subAgentMain.controller");
class SubAgentMainRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new subAgentMain_controller_1.SubAgentMainController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/email-otp/send').post(this.controller.sendEmailOTP);
        this.router.route('/email-otp/match').post(this.controller.matchEmailOTP);
    }
}
exports.default = SubAgentMainRouter;
