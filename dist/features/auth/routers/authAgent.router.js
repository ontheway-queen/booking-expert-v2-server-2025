"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const authAgent_controller_1 = __importDefault(require("../controllers/authAgent.controller"));
class AuthAgentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new authAgent_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/login').post(this.controller.login);
        this.router
            .route('/register')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER), this.controller.register);
        this.router
            .route('/register/complete')
            .post(this.controller.registerComplete);
        this.router.route('/login/2fa').post(this.controller.login2FA);
        this.router.route('/reset-password').post(this.controller.resetPassword);
    }
}
exports.default = AuthAgentRouter;
