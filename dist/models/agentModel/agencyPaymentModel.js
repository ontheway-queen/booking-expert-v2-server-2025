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
class AgencyPaymentModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertAgencyLedger(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agency_ledger')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getAgencyLedger(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, type, voucher_no, from_date, to_date, limit, skip, }, need_total = false) {
            var _b;
            const data = yield this.db('agency_ledger as al')
                .withSchema(this.AGENT_SCHEMA)
                .select('al.id', 'al.agency_id', 'al.type', 'al.amount', 'al.details', 'al.created_at', 'al.voucher_no', 'al.ledger_date', 'a.agency_name', 'a.agency_logo')
                .leftJoin("agency as a", "a.id", "al.agency_id")
                .where((qb) => {
                if (agency_id) {
                    qb.andWhere('al.agency_id', agency_id);
                }
                if (type) {
                    qb.andWhere('al.type', type);
                }
                if (voucher_no) {
                    qb.andWhere('al.voucher_no', voucher_no);
                }
                if (from_date && to_date) {
                    qb.andWhereBetween('al.ledger_date', [from_date, to_date]);
                }
            })
                .orderBy('al.ledger_date', 'asc')
                .orderBy('al.id', 'asc')
                .limit(Number(limit) || constants_1.DATA_LIMIT)
                .offset(Number(skip) || 0);
            let total = [];
            if (need_total) {
                total = yield this.db('agency_ledger')
                    .withSchema(this.AGENT_SCHEMA)
                    .count('id AS total')
                    .where((qb) => {
                    if (agency_id) {
                        qb.andWhere('agency_id', agency_id);
                    }
                    if (type) {
                        qb.andWhere('type', type);
                    }
                    if (voucher_no) {
                        qb.andWhere('voucher_no', voucher_no);
                    }
                    if (from_date && to_date) {
                        qb.andWhereBetween('ledger_date', [from_date, to_date]);
                    }
                });
            }
            return {
                data,
                total: (_b = total[0]) === null || _b === void 0 ? void 0 : _b.total,
            };
        });
    }
    deleteAgencyLedgerByVoucherNo(voucher_no) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db('agency_ledger')
                .withSchema(this.AGENT_SCHEMA)
                .delete()
                .where('voucher_no', voucher_no);
        });
    }
    updateAgencyLedgerByVoucherNo(payload, voucher_no) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db('agency_ledger')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ voucher_no });
        });
    }
    insertLoanHistory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('loan_history')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload);
        });
    }
    getLoanHistory(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, type, from_date, to_date, limit, skip, }, need_total = false) {
            var _b;
            const data = yield this.db('loan_history')
                .withSchema(this.AGENT_SCHEMA)
                .select('*')
                .where((qb) => {
                if (agency_id) {
                    qb.andWhere('agency_id', agency_id);
                }
                if (type) {
                    qb.andWhere('type', type);
                }
                if (from_date && to_date) {
                    qb.andWhereBetween('created_at', [from_date, to_date]);
                }
            })
                .orderBy('created_at', 'asc')
                .orderBy('id', 'asc')
                .limit(Number(limit) || constants_1.DATA_LIMIT)
                .offset(Number(skip) || 0);
            let total = [];
            if (need_total) {
                total = yield this.db('loan_history')
                    .withSchema(this.AGENT_SCHEMA)
                    .count('id AS total')
                    .where((qb) => {
                    if (agency_id) {
                        qb.andWhere('agency_id', agency_id);
                    }
                    if (type) {
                        qb.andWhere('type', type);
                    }
                    if (from_date && to_date) {
                        qb.andWhereBetween('created_at', [from_date, to_date]);
                    }
                });
            }
            return {
                data,
                total: (_b = total[0]) === null || _b === void 0 ? void 0 : _b.total,
            };
        });
    }
    deleteLoanHistory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db('loan_history')
                .withSchema(this.AGENT_SCHEMA)
                .delete()
                .where('id', id);
        });
    }
    createDepositRequest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deposit_request")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateDepositRequest(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deposit_request")
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    getDepositRequestList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db("deposit_request as dr")
                .withSchema(this.AGENT_SCHEMA)
                .select("dr.id", "dr.agency_id", "dr.bank_name", "dr.amount", "dr.remarks", "dr.request_no", "dr.status", "dr.payment_date", "dr.created_at", "dr.docs", "a.agency_name", "a.agency_logo")
                .join("agency as a", "a.id", "dr.agency_id")
                .where((qb) => {
                if (query.agency_id) {
                    qb.andWhere("dr.agency_id", query.agency_id);
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween("dr.payment_date", [query.from_date, query.to_date]);
                }
                if (query.status) {
                    qb.andWhere("dr.status", query.status);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike("dr.request_no", `${query.filter}%`);
                        qbc.orWhereILike("a.agency_name", `%${query.filter}%`);
                    });
                }
            })
                .limit(query.limit || 100)
                .offset(query.skip || 0)
                .orderBy("dr.id", "desc");
            let total = [];
            if (is_total) {
                total = yield this.db("deposit_request as dr")
                    .withSchema(this.AGENT_SCHEMA)
                    .count("dr.id as total")
                    .join("agency as a", "a.id", "dr.agency_id")
                    .where((qb) => {
                    if (query.agency_id) {
                        qb.andWhere("dr.agency_id", query.agency_id);
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween("dr.payment_date", [query.from_date, query.to_date]);
                    }
                    if (query.status) {
                        qb.andWhere("dr.status", query.status);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike("dr.request_no", `${query.filter}%`);
                            qbc.orWhereILike("a.agency_name", `%${query.filter}%`);
                        });
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total
            };
        });
    }
    getSingleDepositRequest(id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deposit_request as dr")
                .withSchema(this.AGENT_SCHEMA)
                .select("dr.id", "dr.agency_id", "dr.bank_name", "dr.amount", "dr.remarks", "dr.request_no", "dr.status", "dr.payment_date", "dr.created_at", "dr.docs", "a.agency_name", "a.agency_logo")
                .join("agency as a", "a.id", "dr.agency_id")
                .where((qb) => {
                qb.andWhere("dr.id", id);
                if (agency_id) {
                    qb.andWhere("dr.agency_id", agency_id);
                }
            })
                .first();
        });
    }
}
exports.default = AgencyPaymentModel;
