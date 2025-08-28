"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentB2CSubVisa_controller_1 = require("../../controllers/agentB2CControllers/agentB2CSubVisa.controller");
class AgentB2CSubVisaRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubVisa_controller_1.AgentB2CSubVisaController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_VISA_FILES), this.controller.createVisa)
            .get(this.controller.getVisaList);
        this.router.route('/applications').get(this.controller.getAgentB2CApplicationList);
        this.router
            .route('/application/:id')
            .get(this.controller.getAgentB2CSingleApplication)
            .patch(this.controller.updateAgentB2CVisaApplication);
        this.router
            .route('/:id')
            .get(this.controller.getSingleVisa)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_VISA_FILES), this.controller.updateVisa)
            .delete(this.controller.deleteVisa);
    }
}
exports.default = AgentB2CSubVisaRouter;
