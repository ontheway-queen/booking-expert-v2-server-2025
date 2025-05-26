"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const authAgentB2C_controller_1 = __importDefault(require("../controllers/authAgentB2C.controller"));
class AuthAgentB2CRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new authAgentB2C_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/login').post(this.controller.login);
        this.router
            .route('/register')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_FILES, [
            'photo'
        ]), this.controller.register);
        this.router.route('/reset-password').post(this.controller.resetPassword);
    }
}
exports.default = AuthAgentB2CRouter;
