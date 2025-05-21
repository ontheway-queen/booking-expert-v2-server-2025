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
class MoneyReceiptModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createMoneyReceipt(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateMoneyReceipt(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    getMoneyReceiptList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db("money_receipt")
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where((qb) => {
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween("payment_time", [query.from_date, query.to_date]);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike("mr_number", `${query.filter}%`)
                            .orWhereILike("payment_type", `%${query.filter}%`)
                            .orWhereILike("transaction_id", `%${query.filter}%`);
                    });
                }
                if (query.invoice_id) {
                    qb.andWhere("invoice_id", query.invoice_id);
                }
                if (query.user_id) {
                    qb.andWhere("user_id", query.user_id);
                }
            })
                .orderBy("id", "desc")
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db("money_receipt")
                    .withSchema(this.DBO_SCHEMA)
                    .count("id as total")
                    .where((qb) => {
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween("payment_time", [query.from_date, query.to_date]);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike("mr_number", `${query.filter}%`)
                                .orWhereILike("payment_type", `%${query.filter}%`)
                                .orWhereILike("transaction_id", `%${query.filter}%`);
                        });
                    }
                    if (query.invoice_id) {
                        qb.andWhere("invoice_id", query.invoice_id);
                    }
                    if (query.user_id) {
                        qb.andWhere("user_id", query.user_id);
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getSingleMoneyReceipt(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where({ id: params.id })
                .first();
        });
    }
}
exports.default = MoneyReceiptModel;
