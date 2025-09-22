"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const agentSubAgent_controller_1 = require("../controllers/agentSubAgent.controller");
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
class AgentSubAgentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentSubAgent_controller_1.AgentSubAgentController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_FILES, [
            'agency_logo',
            'civil_aviation',
            'trade_license',
            'national_id',
        ]), this.controller.createSubAgency)
            .get(this.controller.getAllSubAgency);
        this.router
            .route('/:id')
            .get(this.controller.getSingleSubAgency)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_FILES, [
            'agency_logo',
            'civil_aviation',
            'trade_license',
            'national_id',
        ]), this.controller.updateAgency);
        this.router.route('/:id/users').get(this.controller.getAllUsersOfAgency);
        this.router
            .route('/:agency_id/users/:user_id')
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER, ['photo']), this.controller.updateAgencyUser);
    }
}
exports.default = AgentSubAgentRouter;
