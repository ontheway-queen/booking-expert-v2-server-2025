"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const adminAgentAgency_controller_1 = __importDefault(require("../../controllers/adminAgentControllers/adminAgentAgency.controller"));
class AdminAgentAgencyRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAgentAgency_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/').get(this.controller.getAgency)
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_FILES, [
            'agency_logo',
            'civil_aviation',
            'trade_license',
            'national_id',
        ]), this.controller.createAgency);
        this.router
            .route('/:id')
            .get(this.controller.getSingleAgency)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_FILES, [
            'agency_logo',
            'civil_aviation',
            'trade_license',
            'national_id',
        ]), this.controller.updateAgency);
        this.router
            .route('/:id/application')
            .patch(this.controller.updateAgencyApplication);
        this.router.route('/:id/login').get(this.controller.agencyLogin);
    }
}
exports.default = AdminAgentAgencyRouter;
