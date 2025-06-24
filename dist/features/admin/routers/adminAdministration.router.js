"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminAdministration_controller_1 = __importDefault(require("../controllers/adminAdministration.controller"));
class AdminAdministrationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAdministration_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/admin')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES, ['photo']), this.controller.createAdmin)
            .get(this.controller.getAllAdmin);
        this.router
            .route('/admin/:id')
            .get(this.controller.getSingleAdmin)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES, ['photo']), this.controller.updateAdmin);
        this.router.route('/permissions').get(this.controller.getPermissionsList);
        this.router
            .route('/role')
            .post(this.controller.createRole)
            .get(this.controller.getRoleList);
        this.router
            .route('/role/:id/permissions')
            .get(this.controller.getSingleRoleWithPermissions)
            .patch(this.controller.updateRolePermissions);
    }
}
exports.default = AdminAdministrationRouter;
