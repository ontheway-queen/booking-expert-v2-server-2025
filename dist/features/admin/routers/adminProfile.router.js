"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminProfile_controller_1 = __importDefault(require("../controllers/adminProfile.controller"));
class AdminProfileRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminProfile_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .get(this.controller.getProfile)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES), this.controller.updateProfile);
        this.router.route('/change-password').post(this.controller.changePassword);
    }
}
exports.default = AdminProfileRouter;
