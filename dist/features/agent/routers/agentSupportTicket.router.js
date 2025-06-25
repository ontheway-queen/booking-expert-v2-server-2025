"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentSupportTicket_controller_1 = require("../controllers/agentSupportTicket.controller");
class AgentSupportTicketRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentSupportTicket_controller_1.AgentSupportTicketController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_SUPPORT_TICKET_FILES, ['attachment']), this.controller.createSupportTicker)
            .get(this.controller.getSupportTicket);
        this.router.route('/:id').get(this.controller.getSingleSupportTicket);
        this.router
            .route('/:id/conversations')
            .get(this.controller.getSupportTicketMsg);
    }
}
exports.default = AgentSupportTicketRouter;
