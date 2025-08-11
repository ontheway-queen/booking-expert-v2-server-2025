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
class AgencyB2CPaymentModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertLedger(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('user_ledger')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getLedger(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, type, voucher_no, from_date, to_date, limit, user_id, skip, }, need_total = false) {
            var _b;
            const data = yield this.db('user_ledger as ul')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('ul.id', 'ul.agency_id', 'ul.type', 'ul.amount', 'ul.details', 'ul.created_at', 'ul.voucher_no', 'ul.ledger_date', 'a.agency_name', 'a.agency_logo')
                .joinRaw('agent.agency as a ON ul.agency_id = a.id')
                .leftJoin('users AS u', 'ul.user_id', 'u.id')
                .andWhere('ul.agency_id', agency_id)
                .where((qb) => {
                if (user_id) {
                    qb.andWhere('ul.user_id', user_id);
                }
                if (type) {
                    qb.andWhere('ul.type', type);
                }
                if (voucher_no) {
                    qb.andWhere('ul.voucher_no', voucher_no);
                }
                if (from_date && to_date) {
                    qb.andWhereBetween('ul.ledger_date', [from_date, to_date]);
                }
            })
                .orderBy('ul.ledger_date', 'asc')
                .orderBy('ul.id', 'asc')
                .limit(Number(limit) || constants_1.DATA_LIMIT)
                .offset(Number(skip) || 0);
            let total = [];
            if (need_total) {
                total = yield this.db('user_ledger as ul')
                    .withSchema(this.AGENT_B2C_SCHEMA)
                    .count('ul.id AS total')
                    .andWhere('ul.agency_id', agency_id)
                    .where((qb) => {
                    if (user_id) {
                        qb.andWhere('ul.user_id', user_id);
                    }
                    if (type) {
                        qb.andWhere('ul.type', type);
                    }
                    if (voucher_no) {
                        qb.andWhere('ul.voucher_no', voucher_no);
                    }
                    if (from_date && to_date) {
                        qb.andWhereBetween('ul.ledger_date', [from_date, to_date]);
                    }
                });
            }
            return {
                data,
                total: (_b = total[0]) === null || _b === void 0 ? void 0 : _b.total,
            };
        });
    }
    deleteLedgerByVoucherNo(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, voucher_no, }) {
            yield this.db('user_ledger')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .delete()
                .where('voucher_no', voucher_no)
                .andWhere('agency_id', agency_id);
        });
    }
    updateLedgerByVoucherNo(payload_1, _a) {
        return __awaiter(this, arguments, void 0, function* (payload, { agency_id, voucher_no, }) {
            yield this.db('user_ledger')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .update(payload)
                .where('voucher_no', voucher_no)
                .andWhere('agency_id', agency_id);
        });
    }
    getUserBalance(agency_id, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('users AS u')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select(this.db.raw(`(
  SELECT 
    COALESCE(SUM(CASE WHEN al.type = 'Credit' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN al.type = 'Debit' THEN amount ELSE 0 END), 0) 
  AS balance 
  FROM agent_b2c.user_ledger as ul
  WHERE u.id = ul.user_id
) AS balance
`))
                .where('u.agency_id', agency_id)
                .andWhere('u.id', id)
                .first();
            return Number(data === null || data === void 0 ? void 0 : data.balance) || 0;
        });
    }
}
exports.default = AgencyB2CPaymentModel;
