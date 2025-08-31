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
                .leftJoin('agency as a', 'a.id', 'al.agency_id')
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
            const data = yield this.db('loan_history AS lh')
                .withSchema(this.AGENT_SCHEMA)
                .select('lh.*', 'a.agency_name', 'a.agency_logo', 'ua.name AS created_by_name')
                .leftJoin('agency as a', 'a.id', 'lh.agency_id')
                .joinRaw('LEFT JOIN admin.user_admin AS ua ON ua.id = lh.created_by')
                .where((qb) => {
                if (agency_id) {
                    qb.andWhere('lh.agency_id', agency_id);
                }
                if (type) {
                    qb.andWhere('lh.type', type);
                }
                if (from_date && to_date) {
                    qb.andWhereBetween('lh.created_at', [from_date, to_date]);
                }
            })
                .orderBy('lh.created_at', 'asc')
                .orderBy('lh.id', 'asc')
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
}
exports.default = AgencyPaymentModel;
