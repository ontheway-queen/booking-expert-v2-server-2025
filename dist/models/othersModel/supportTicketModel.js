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
const constants_1 = require("../../utils/miscellaneous/constants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class SupportTicketModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createSupportTicket(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('support_tickets')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateSupportTicket(payload, id, source_type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('support_tickets')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .andWhere('id', id)
                .andWhere('source_type', source_type);
        });
    }
    insertSupportTicketMessage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('support_ticket_messages')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getAgentSupportTicketMessages(_a) {
        return __awaiter(this, arguments, void 0, function* ({ support_ticket_id, limit, skip, }) {
            return this.db('support_ticket_messages AS stm')
                .withSchema(this.DBO_SCHEMA)
                .select('stm.id', 'stm.support_ticket_id', 'stm.sender_id', this.db.raw('COALESCE(ua.name, au.name) as sender_name'), this.db.raw('COALESCE(ua.photo, au.photo) as sender_photo'), 'stm.message', 'stm.attachments', 'stm.reply_by', 'stm.created_at')
                .joinRaw(`LEFT JOIN agent.agency_user AS au ON stm.reply_by = 'Customer' AND au.id = stm.sender_id`)
                .joinRaw(`LEFT JOIN admin.user_admin AS ua ON stm.reply_by = 'Admin' AND ua.id = stm.sender_id`)
                .where('stm.support_ticket_id', support_ticket_id)
                .orderBy('stm.created_at', 'desc')
                .limit(limit || constants_1.DATA_LIMIT)
                .offset(skip || 0);
        });
    }
    getAgentB2CSupportTicketMessages(_a) {
        return __awaiter(this, arguments, void 0, function* ({ support_ticket_id, limit, skip, }) {
            return this.db('support_ticket_messages AS stm')
                .withSchema(this.DBO_SCHEMA)
                .select('stm.id', 'stm.support_ticket_id', 'stm.sender_id', this.db.raw('COALESCE(u.name, ua.name) as sender_name'), this.db.raw('COALESCE(u.photo, au.photo) as sender_photo'), 'stm.message', 'stm.attachments', 'stm.reply_by', 'stm.created_at')
                .joinRaw(`LEFT JOIN agent_b2c.users AS u ON stm.reply_by = 'Customer' AND u.id = stm.sender_id`)
                .joinRaw(`LEFT JOIN agent.agency_user AS au ON stm.reply_by = 'Admin' AND au.id = stm.sender_id`)
                .where('stm.support_ticket_id', support_ticket_id)
                .orderBy('stm.created_at', 'desc')
                .limit(limit || constants_1.DATA_LIMIT)
                .offset(skip || 0);
        });
    }
    getAgentSupportTicket(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agent_id, limit, priority, reply_by, skip, status, created_by_user_id, from_date, to_date, ref_type, ref_agent_id, source_type, }, need_total = false) {
            var _b;
            const data = yield this.db('support_tickets AS st')
                .withSchema(this.DBO_SCHEMA)
                .select('st.id', 'st.support_no', 'st.subject', 'st.priority', 'st.status', 'st.ref_type', 'a.agency_name', 'a.agency_logo', 'stm.message AS last_message', 'stm.reply_by', 'stm.created_at AS last_message_created_at', 'st.created_at')
                .joinRaw(`LEFT JOIN agent.agency AS a ON a.id = st.source_id`)
                .leftJoin('support_ticket_messages AS stm', 'st.last_message_id', 'stm.id')
                .where((qb) => {
                qb.where('st.source_type', source_type);
                if (ref_agent_id) {
                    qb.where('a.ref_agent_id', ref_agent_id);
                }
                if (agent_id) {
                    qb.where('st.source_id', agent_id);
                }
                if (created_by_user_id) {
                    qb.where('st.created_by_user_id', created_by_user_id);
                }
                if (status) {
                    qb.where('st.status', status);
                }
                if (reply_by) {
                    qb.where('stm.reply_by', reply_by);
                }
                if (priority) {
                    qb.where('st.priority', priority);
                }
                if (ref_type) {
                    qb.where('st.ref_type', ref_type);
                }
                if (from_date && to_date) {
                    qb.whereBetween('st.created_at', [from_date, to_date]);
                }
            })
                .orderBy('stm.created_at', 'desc')
                .limit(limit || constants_1.DATA_LIMIT)
                .offset(skip || 0);
            let total = [];
            if (need_total) {
                total = yield this.db('support_tickets AS st')
                    .withSchema(this.DBO_SCHEMA)
                    .joinRaw(`LEFT JOIN agent.agency AS a ON a.id = st.source_id`)
                    .count('st.id AS total')
                    .where((qb) => {
                    qb.where('st.source_type', constants_1.SOURCE_AGENT);
                    if (ref_agent_id) {
                        qb.where('a.ref_agent_id', ref_agent_id);
                    }
                    if (agent_id) {
                        qb.where('st.source_id', agent_id);
                    }
                    if (created_by_user_id) {
                        qb.where('st.created_by_user_id', created_by_user_id);
                    }
                    if (status) {
                        qb.where('st.status', status);
                    }
                    if (reply_by) {
                        qb.where('stm.reply_by', reply_by);
                    }
                    if (ref_type) {
                        qb.where('st.ref_type', ref_type);
                    }
                    if (priority) {
                        qb.where('st.priority', priority);
                    }
                    if (from_date && to_date) {
                        qb.whereBetween('st.created_at', [from_date, to_date]);
                    }
                });
            }
            return { data, total: ((_b = total[0]) === null || _b === void 0 ? void 0 : _b.total) || 0 };
        });
    }
    getAgentB2CSupportTicket(_a) {
        return __awaiter(this, arguments, void 0, function* ({ source_id, limit, priority, reply_by, skip, status, created_by_user_id, from_date, to_date, ref_type, }, need_total = false) {
            var _b;
            const data = yield this.db('support_tickets AS st')
                .withSchema(this.DBO_SCHEMA)
                .select('st.id', 'st.support_no', 'st.subject', 'st.priority', 'st.status', 'st.ref_type', 'u.username', 'u.name', 'u.email', 'u.photo', 'stm.message AS last_message', 'stm.reply_by', 'stm.created_at AS last_message_created_at', 'st.created_at')
                .joinRaw(`LEFT JOIN agent_b2c.users AS u ON st.created_by_user_id = u.id`)
                .leftJoin('support_ticket_messages AS stm', 'st.last_message_id', 'stm.id')
                .where((qb) => {
                qb.where('st.source_type', constants_1.SOURCE_AGENT_B2C);
                qb.where('st.source_id', source_id);
                if (created_by_user_id) {
                    qb.where('st.created_by_user_id', created_by_user_id);
                }
                if (status) {
                    qb.where('st.status', status);
                }
                if (reply_by) {
                    qb.where('stm.reply_by', reply_by);
                }
                if (priority) {
                    qb.where('st.priority', priority);
                }
                if (ref_type) {
                    qb.where('st.ref_type', ref_type);
                }
                if (from_date && to_date) {
                    qb.whereBetween('st.created_at', [from_date, to_date]);
                }
            })
                .orderBy('stm.created_at', 'desc')
                .limit(limit || constants_1.DATA_LIMIT)
                .offset(skip || 0);
            let total = [];
            if (need_total) {
                total = yield this.db('support_tickets AS st')
                    .withSchema(this.DBO_SCHEMA)
                    .count('st.id AS total')
                    .where((qb) => {
                    qb.where('st.source_type', constants_1.SOURCE_AGENT_B2C);
                    qb.where('st.source_id', source_id);
                    if (created_by_user_id) {
                        qb.where('st.created_by_user_id', created_by_user_id);
                    }
                    if (status) {
                        qb.where('st.status', status);
                    }
                    if (reply_by) {
                        qb.where('stm.reply_by', reply_by);
                    }
                    if (ref_type) {
                        qb.where('st.ref_type', ref_type);
                    }
                    if (priority) {
                        qb.where('st.priority', priority);
                    }
                    if (from_date && to_date) {
                        qb.whereBetween('st.created_at', [from_date, to_date]);
                    }
                });
            }
            return { data, total: ((_b = total[0]) === null || _b === void 0 ? void 0 : _b.total) || 0 };
        });
    }
    getSingleAgentSupportTicket(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, agent_id, source_type, ref_agent_id, }) {
            return yield this.db('support_tickets AS st')
                .withSchema(this.DBO_SCHEMA)
                .select('st.id', 'st.support_no', 'st.source_id', 'st.ref_type', 'st.close_date', 'st.closed_by', 'st.reopen_date', 'st.reopen_by', 'st.created_by_user_id', 'st.created_by', 'st.ref_id', 'st.subject', 'st.status', 'a.agency_name', 'a.agency_logo', 'st.created_at')
                .joinRaw(`LEFT JOIN agent.agency AS a ON a.id = st.source_id`)
                .where((qb) => {
                qb.andWhere('st.id', id);
                qb.andWhere('st.source_type', source_type);
                if (agent_id) {
                    qb.andWhere('st.source_id', agent_id);
                }
                if (ref_agent_id) {
                    qb.andWhere('a.ref_agent_id', ref_agent_id);
                }
            })
                .first();
        });
    }
    getSingleAgentB2CSupportTicket(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, source_id, created_by_user_id, }) {
            return yield this.db('support_tickets AS st')
                .withSchema(this.DBO_SCHEMA)
                .select('st.id', 'st.support_no', 'st.ref_type', 'st.close_date', 'st.closed_by', 'st.reopen_date', 'st.reopen_by', 'st.created_by_user_id', 'st.created_by', 'st.ref_id', 'st.subject', 'st.status', 'u.username', 'u.name', 'u.email', 'u.photo', 'st.created_at')
                .joinRaw(`LEFT JOIN agent_b2c.users AS u ON st.created_by_user_id = u.id`)
                .where((qb) => {
                qb.andWhere('st.id', id);
                qb.andWhere('st.source_type', constants_1.SOURCE_AGENT_B2C);
                qb.andWhere('st.source_id', source_id);
                if (created_by_user_id) {
                    qb.andWhere('st.created_by_user_id', created_by_user_id);
                }
            })
                .first();
        });
    }
}
exports.default = SupportTicketModel;
