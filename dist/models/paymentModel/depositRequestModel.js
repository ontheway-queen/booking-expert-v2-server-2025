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
class DepositRequestModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
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
exports.default = DepositRequestModel;
