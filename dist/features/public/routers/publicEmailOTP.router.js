"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const publicEmailOTP_controller_1 = __importDefault(require("../controllers/publicEmailOTP.controller"));
class PublicEmailOTPRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new publicEmailOTP_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/send').post(this.controller.sendEmailOTP);
        this.router.route('/match').post(this.controller.matchEmailOTP);
    }
}
exports.default = PublicEmailOTPRouter;
