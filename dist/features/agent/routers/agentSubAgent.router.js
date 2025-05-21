"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentSubAgent_controller_1 = require("../controllers/agentSubAgent.controller");
class AgentSubAgentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentSubAgent_controller_1.AgentSubAgentController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_SUB_AGENT_FILES, [
            'agency_logo',
            'civil_aviation',
            'trade_license',
            'national_id'
        ]), this.controller.createSubAgency)
            .get(this.controller.getAllSubAgency);
        this.router.route('/:id')
            .get(this.controller.getSingleSubAgency)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_SUB_AGENT_FILES, [
            'agency_logo',
            'civil_aviation',
            'trade_license',
            'national_id'
        ]), this.controller.updateAgency);
        this.router.route('/:id/users')
            .get(this.controller.getAllUsersOfAgency);
    }
}
exports.default = AgentSubAgentRouter;
