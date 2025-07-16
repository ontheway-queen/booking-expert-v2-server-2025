"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentB2CProfile_controller_1 = __importDefault(require("../controllers/agentB2CProfile.controller"));
class AgentB2CProfileRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CProfile_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .get(this.controller.getProfile)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_FILES, [
            'photo',
        ]), this.controller.updateProfile);
        this.router.route('/change-password').post(this.controller.changePassword);
    }
}
exports.default = AgentB2CProfileRouter;
