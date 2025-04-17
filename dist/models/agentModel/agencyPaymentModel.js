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
            return yield this.db('agency_ledger').insert(payload);
        });
    }
    getAgencyLedger(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, type, voucher_no, from_date, to_date, limit, skip, }, need_total = false) {
            var _b;
            const data = yield this.db('agency_ledger')
                .select('*')
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
            })
                .orderBy('ledger_date', 'asc')
                .orderBy('id', 'asc')
                .limit(Number(limit) || constants_1.DATA_LIMIT)
                .offset(Number(skip) || 0);
            let total = [];
            if (need_total) {
                total = yield this.db('agency_ledger')
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
}
exports.default = AgencyPaymentModel;
