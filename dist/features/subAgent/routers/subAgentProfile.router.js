"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const subAgentProfile_controller_1 = __importDefault(require("../controllers/subAgentProfile.controller"));
class SubAgentProfileRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new subAgentProfile_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // Profile API
        this.router
            .route('/')
            .get(this.controller.getProfile)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER, ['photo']), this.controller.updateProfile);
        // Change Password
        this.router.route('/change-password').post(this.controller.changePassword);
        this.router.route('/dashboard').get(this.controller.getDashboardData);
        this.router.route('/search').get(this.controller.searchData);
    }
}
exports.default = SubAgentProfileRouter;
