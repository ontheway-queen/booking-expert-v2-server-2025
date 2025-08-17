"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentB2CSupportTicket_controller_1 = require("../controllers/agentB2CSupportTicket.controller");
class AgentB2CSupportTicketRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSupportTicket_controller_1.AgentB2CSupportTicketController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_B2C_SUPPORT_TICKET_FILES, ['attachment']), this.controller.createSupportTicker)
            .get(this.controller.getSupportTicket);
        this.router
            .route('/:id')
            .get(this.controller.getSingleSupportTicket)
            .post(this.controller.closeSupportTicket);
        this.router
            .route('/:id/conversations')
            .get(this.controller.getSupportTicketMsg)
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_B2C_SUPPORT_TICKET_FILES, ['attachment']), this.controller.sendSupportTicketReplay);
    }
}
exports.default = AgentB2CSupportTicketRouter;
