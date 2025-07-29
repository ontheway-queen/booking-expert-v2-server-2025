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
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class InvoiceModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('invoice')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateInvoice(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('invoice')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    getInvoiceList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db('invoice')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('created_at', [query.from_date, query.to_date]);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc
                            .whereILike('invoice_no', `${query.filter}%`)
                            .orWhereILike('ref_type', `%${query.filter}%`)
                            .orWhereILike('coupon_code', `%${query.filter}%`);
                    });
                }
                if (query.invoice_type) {
                    qb.andWhere('type', query.invoice_type);
                }
                if (query.source_type) {
                    qb.andWhere('source_type', query.source_type);
                }
                if (query.source_id) {
                    qb.andWhere('source_id', query.source_id);
                }
                if (query.user_id) {
                    qb.andWhere('user_id', query.user_id);
                }
                if (query.partial_payment) {
                    qb.andWhere('due', '>', 0).andWhere('due', '!=', this.db.ref('net_amount'));
                }
            })
                .orderBy('id', 'desc')
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db('invoice')
                    .withSchema(this.DBO_SCHEMA)
                    .count('id as total')
                    .where((qb) => {
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween('created_at', [query.from_date, query.to_date]);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc
                                .whereILike('invoice_no', `${query.filter}%`)
                                .orWhereILike('ref_type', `%${query.filter}%`)
                                .orWhereILike('coupon_code', `%${query.filter}%`);
                        });
                    }
                    if (query.invoice_type) {
                        qb.andWhere('type', query.invoice_type);
                    }
                    if (query.source_type) {
                        qb.andWhere('source_type', query.source_type);
                    }
                    if (query.source_id) {
                        qb.andWhere('source_id', query.source_id);
                    }
                    if (query.user_id) {
                        qb.andWhere('user_id', query.user_id);
                    }
                    if (query.partial_payment) {
                        qb.andWhere('due', '>', 0).andWhere('due', '!=', this.db.ref('net_amount'));
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getSingleInvoice(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('invoice')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .andWhere((qb) => {
                qb.andWhere('source_type', params.source_type);
                if (params.source_id) {
                    qb.andWhere('source_id', params.source_id);
                }
                if (params.id) {
                    qb.andWhere('id', params.id);
                }
                if (params.ref_id) {
                    qb.andWhere('ref_id', params.ref_id);
                }
                if (params.ref_type) {
                    qb.andWhere('ref_type', params.ref_type);
                }
            })
                .first();
        });
    }
    deleteInvoiceInvoice(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('invoice')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (params.source_id) {
                    qb.andWhere('source_id', params.source_id);
                }
                if (params.source_type) {
                    qb.andWhere('source_type', params.source_type);
                }
                if (params.id) {
                    qb.andWhere('id', params.id);
                }
                if (params.ref) {
                    qb.andWhere('ref_id', params.ref.id);
                    qb.andWhere('ref_type', params.ref.type);
                }
            })
                .first();
        });
    }
}
exports.default = InvoiceModel;
