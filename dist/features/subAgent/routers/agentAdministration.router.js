"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentAdministration_controller_1 = __importDefault(require("../controllers/agentAdministration.controller"));
class AgentAdministrationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentAdministration_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/users')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER, ['photo']), this.controller.createUser)
            .get(this.controller.getAllAgencyUsers);
        this.router
            .route('/users/:id')
            .get(this.controller.getSingleAgencyUser)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER, ['photo']), this.controller.updateAgencyUser);
        this.router
            .route('/role')
            .post(this.controller.createRole)
            .get(this.controller.getRoleList);
        this.router.route('/permissions').get(this.controller.getPermissionsList);
        this.router
            .route('/role/:id/permissions')
            .get(this.controller.getSingleRoleWithPermissions)
            .patch(this.controller.updateRolePermissions);
    }
}
exports.default = AgentAdministrationRouter;
