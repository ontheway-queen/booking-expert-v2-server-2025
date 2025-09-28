"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAgentSupportTicketService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../../utils/lib/lib"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AdminAgentSupportTicketService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createSupportTicket(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const data = req.body;
                const { user_id } = req.admin;
                const supportTicketModel = this.Model.SupportTicketModel(trx);
                const agencyModel = this.Model.AgencyModel(trx);
                const checkAgent = yield agencyModel.checkAgency({
                    agency_id: data.agent_id,
                });
                if (!checkAgent) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: 'Invalid agent id.',
                    };
                }
                const support_no = yield lib_1.default.generateNo({
                    trx,
                    type: 'Agent_SupportTicket',
                });
                const files = req.files || [];
                const ticket = yield supportTicketModel.createSupportTicket({
                    ref_type: data.ref_type,
                    ref_id: data.ref_id,
                    subject: data.subject,
                    priority: data.priority,
                    created_by_user_id: user_id,
                    created_by: 'Admin',
                    source_id: data.agent_id,
                    source_type: constants_1.SOURCE_AGENT,
                    support_no,
                });
                const msg = yield supportTicketModel.insertSupportTicketMessage({
                    support_ticket_id: ticket[0].id,
                    message: data.details,
                    reply_by: 'Admin',
                    sender_id: user_id,
                    attachments: JSON.stringify(files.map((file) => file.filename)),
                });
                yield supportTicketModel.updateSupportTicket({
                    last_message_id: msg[0].id,
                }, ticket[0].id, constants_1.SOURCE_AGENT);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: ticket[0].id,
                        support_no,
                        message: [
                            {
                                id: msg[0].id,
                                attachments: JSON.stringify(files.map((file) => file.filename)),
                            },
                        ],
                    },
                };
            }));
        });
    }
    getSupportTicket(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const supportTicketModel = this.Model.SupportTicketModel();
            const query = req.query;
            const data = yield supportTicketModel.getAgentSupportTicket(Object.assign(Object.assign({}, query), { source_type: constants_1.SOURCE_AGENT }), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    getSingleSupportTicketWithMsg(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ticket_id = Number(id);
            const supportTicketModel = this.Model.SupportTicketModel();
            const ticket = yield supportTicketModel.getSingleAgentSupportTicket({
                id: ticket_id,
                source_type: constants_1.SOURCE_AGENT,
            });
            if (!ticket) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const msgs = yield supportTicketModel.getAgentSupportTicketMessages({
                support_ticket_id: ticket_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, ticket), { conversations: msgs }),
            };
        });
    }
    getSupportTicketMsg(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const query = req.query;
            const ticket_id = Number(id);
            const supportTicketModel = this.Model.SupportTicketModel();
            const ticket = yield supportTicketModel.getSingleAgentSupportTicket({
                id: ticket_id,
                source_type: constants_1.SOURCE_AGENT,
            });
            if (!ticket) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const msgs = yield supportTicketModel.getAgentSupportTicketMessages({
                support_ticket_id: ticket_id,
                limit: query.limit,
                skip: query.skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: msgs,
            };
        });
    }
    sendSupportTicketReplay(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const support_ticket_id = Number(req.params.id);
                const { message } = req.body;
                const supportTicketModel = this.Model.SupportTicketModel(trx);
                const ticket = yield supportTicketModel.getSingleAgentSupportTicket({
                    id: support_ticket_id,
                    source_type: constants_1.SOURCE_AGENT,
                });
                if (!ticket) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const files = req.files || [];
                const newMsg = yield supportTicketModel.insertSupportTicketMessage({
                    message,
                    reply_by: 'Admin',
                    sender_id: user_id,
                    support_ticket_id,
                    attachments: JSON.stringify(files.map((file) => file.filename)),
                });
                const payload = {
                    last_message_id: newMsg[0].id,
                };
                if (ticket.status === 'Closed') {
                    payload.status = 'ReOpen';
                    payload.reopen_by = 'Admin';
                    payload.reopen_date = new Date();
                }
                yield supportTicketModel.updateSupportTicket(payload, support_ticket_id, constants_1.SOURCE_AGENT);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: newMsg[0].id,
                    },
                };
            }));
        });
    }
    closeSupportTicket(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const support_ticket_id = Number(req.params.id);
                const { user_id } = req.admin;
                const supportTicketModel = this.Model.SupportTicketModel(trx);
                const ticket = yield supportTicketModel.getSingleAgentSupportTicket({
                    id: support_ticket_id,
                    source_type: constants_1.SOURCE_AGENT,
                });
                if (!ticket) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (ticket.status === 'Closed') {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'This ticket is already closed.',
                    };
                }
                yield supportTicketModel.updateSupportTicket({
                    close_date: new Date(),
                    closed_by: 'Admin',
                    closed_by_user_id: user_id,
                    status: 'Closed',
                }, support_ticket_id, constants_1.SOURCE_AGENT);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
}
exports.AdminAgentSupportTicketService = AdminAgentSupportTicketService;
