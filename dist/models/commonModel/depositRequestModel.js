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
class DepositRequestModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createDepositRequest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('deposit_request')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateDepositRequest(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('deposit_request')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    getAgentDepositRequestList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db('deposit_request as dr')
                .withSchema(this.DBO_SCHEMA)
                .select('dr.id', 'dr.agency_id', 'ad.bank_name', 'ad.bank_logo', 'dr.amount', 'dr.request_no', 'dr.status', 'dr.payment_date', 'dr.created_at', 'a.agency_name', 'a.agency_logo')
                .joinRaw('LEFT JOIN agent.agency as a ON a.id = dr.agency_id')
                .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
                .where((qb) => {
                qb.andWhere('dr.source', constants_1.SOURCE_AGENT);
                if (query.agency_id) {
                    qb.andWhere('dr.agency_id', query.agency_id);
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('dr.payment_date', [
                        query.from_date,
                        query.to_date,
                    ]);
                }
                if (query.status) {
                    qb.andWhere('dr.status', query.status);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike('dr.request_no', `${query.filter}%`);
                        qbc.orWhereILike('a.agency_name', `%${query.filter}%`);
                    });
                }
            })
                .limit(query.limit || 100)
                .offset(query.skip || 0)
                .orderBy('dr.id', 'desc');
            let total = [];
            if (is_total) {
                total = yield this.db('deposit_request as dr')
                    .withSchema(this.DBO_SCHEMA)
                    .count('dr.id as total')
                    .joinRaw('LEFT JOIN agent.agency as a ON a.id = dr.agency_id')
                    .where((qb) => {
                    qb.andWhere('dr.source', constants_1.SOURCE_AGENT);
                    if (query.agency_id) {
                        qb.andWhere('dr.agency_id', query.agency_id);
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween('dr.payment_date', [
                            query.from_date,
                            query.to_date,
                        ]);
                    }
                    if (query.status) {
                        qb.andWhere('dr.status', query.status);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike('dr.request_no', `${query.filter}%`);
                            qbc.orWhereILike('a.agency_name', `%${query.filter}%`);
                        });
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getSingleAgentDepositRequest(id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('deposit_request as dr')
                .withSchema(this.DBO_SCHEMA)
                .select('dr.id', 'dr.agency_id', 'ad.bank_name', 'ad.bank_logo', 'dr.amount', 'dr.remarks', 'dr.request_no', 'dr.status', 'dr.payment_date', 'dr.created_at', 'dr.docs', 'dr.created_by', 'dr.updated_by', 'ua.name AS updated_by_name', 'dr.updated_at', 'dr.update_note', 'au.name AS created_by_name', 'a.agency_name', 'a.agency_logo')
                .joinRaw('LEFT JOIN agent.agency as a ON dr.agency_id = a.id')
                .joinRaw('LEFT JOIN agent.agency_user AS au ON dr.created_by = au.id')
                .joinRaw('LEFT JOIN admin.user_admin AS ua ON dr.updated_by = ua.id')
                .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
                .where((qb) => {
                qb.andWhere('dr.id', id);
                qb.andWhere('dr.source', constants_1.SOURCE_AGENT);
                if (agency_id) {
                    qb.andWhere('dr.agency_id', agency_id);
                }
            })
                .first();
        });
    }
    getSubAgentDepositRequestList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db('deposit_request as dr')
                .withSchema(this.DBO_SCHEMA)
                .select('dr.id', 'dr.agency_id', 'ad.bank_name', 'ad.bank_logo', 'dr.amount', 'dr.request_no', 'dr.status', 'dr.payment_date', 'dr.created_at', 'a.agency_name', 'a.agency_logo')
                .joinRaw('agent.agency as a ON a.id = dr.agency_id')
                .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
                .where((qb) => {
                qb.andWhere('dr.source', constants_1.SOURCE_SUB_AGENT);
                if (query.agency_id) {
                    qb.andWhere('dr.agency_id', query.agency_id);
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('dr.payment_date', [
                        query.from_date,
                        query.to_date,
                    ]);
                }
                if (query.status) {
                    qb.andWhere('dr.status', query.status);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike('dr.request_no', `${query.filter}%`);
                        qbc.orWhereILike('a.agency_name', `%${query.filter}%`);
                    });
                }
            })
                .limit(query.limit || 100)
                .offset(query.skip || 0)
                .orderBy('dr.id', 'desc');
            let total = [];
            if (is_total) {
                total = yield this.db('deposit_request as dr')
                    .withSchema(this.AGENT_SCHEMA)
                    .count('dr.id as total')
                    .join('agency as a', 'a.id', 'dr.agency_id')
                    .where((qb) => {
                    qb.andWhere('dr.source', constants_1.SOURCE_AGENT);
                    if (query.agency_id) {
                        qb.andWhere('dr.agency_id', query.agency_id);
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween('dr.payment_date', [
                            query.from_date,
                            query.to_date,
                        ]);
                    }
                    if (query.status) {
                        qb.andWhere('dr.status', query.status);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike('dr.request_no', `${query.filter}%`);
                            qbc.orWhereILike('a.agency_name', `%${query.filter}%`);
                        });
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getSingleSubAgentDepositRequest(id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('deposit_request as dr')
                .withSchema(this.AGENT_SCHEMA)
                .select('dr.id', 'dr.agency_id', 'dr.bank_name', 'dr.amount', 'dr.remarks', 'dr.request_no', 'dr.status', 'dr.payment_date', 'dr.created_at', 'dr.docs', 'dr.created_by', 'dr.updated_by', 'dr.updated_by_name', 'dr.updated_at', 'dr.update_note', 'au.name AS created_by_name', 'a.agency_name', 'a.agency_logo')
                .joinRaw('agent.agency as a ON dr.agency_id = a.id')
                .joinRaw('agent.agency_user AS au ON dr.created_by = au.id')
                .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
                .where((qb) => {
                qb.andWhere('dr.id', id);
                qb.andWhere('dr.source', constants_1.SOURCE_SUB_AGENT);
                if (agency_id) {
                    qb.andWhere('dr.agency_id', agency_id);
                }
            })
                .first();
        });
    }
    getAgentB2CDepositRequestList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db('deposit_request as dr')
                .withSchema(this.DBO_SCHEMA)
                .select('dr.id', 'ad.bank_name', 'ad.bank_logo', 'dr.amount', 'dr.request_no', 'dr.status', 'dr.payment_date', 'dr.created_at')
                .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
                .where((qb) => {
                qb.andWhere('dr.source', constants_1.SOURCE_AGENT_B2C);
                if (query.agency_id) {
                    qb.andWhere('dr.agency_id', query.agency_id);
                }
                if (query.created_by) {
                    qb.andWhere('dr.created_by', query.created_by);
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('dr.payment_date', [
                        query.from_date,
                        query.to_date,
                    ]);
                }
                if (query.status) {
                    qb.andWhere('dr.status', query.status);
                }
                if (query.filter) {
                    qb.whereILike('dr.request_no', `${query.filter}%`);
                }
            })
                .limit(query.limit || 100)
                .offset(query.skip || 0)
                .orderBy('dr.id', 'desc');
            let total = [];
            if (is_total) {
                total = yield this.db('deposit_request as dr')
                    .withSchema(this.DBO_SCHEMA)
                    .count('dr.id as total')
                    .where((qb) => {
                    qb.andWhere('dr.source', constants_1.SOURCE_AGENT);
                    if (query.agency_id) {
                        qb.andWhere('dr.agency_id', query.agency_id);
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween('dr.payment_date', [
                            query.from_date,
                            query.to_date,
                        ]);
                    }
                    if (query.status) {
                        qb.andWhere('dr.status', query.status);
                    }
                    if (query.filter) {
                        qb.whereILike('dr.request_no', `${query.filter}%`);
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getSingleAgentB2CDepositRequest(id, agency_id, created_by) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('deposit_request as dr')
                .withSchema(this.DBO_SCHEMA)
                .select('dr.id', 'dr.request_no', 'ad.bank_name', 'ad.bank_logo', 'ad.account_name', 'ad.account_number', 'ad.branch', 'dr.amount', 'dr.remarks', 'dr.status', 'dr.payment_date', 'dr.created_at', 'dr.docs', 'dr.created_by', 'dr.updated_at', 'dr.update_note', 'au.name AS created_by_name')
                .joinRaw('LEFT JOIN agent_b2c.users AS au ON dr.created_by = au.id')
                .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
                .where((qb) => {
                qb.andWhere('dr.id', id);
                qb.andWhere('dr.source', constants_1.SOURCE_AGENT_B2C);
                if (agency_id) {
                    qb.andWhere('dr.agency_id', agency_id);
                }
                if (created_by) {
                    qb.andWhere('dr.created_by', created_by);
                }
            })
                .first();
        });
    }
}
exports.default = DepositRequestModel;
