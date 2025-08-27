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
class OthersModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertHotelSearchHistory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_search_history')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    getHotelSearchHistory(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, limit, skip, user_id, from_date, to_date, user_type, }) {
            let query = this.db('hotel_search_history AS hsh')
                .withSchema(this.DBO_SCHEMA)
                .select('hsh.id', 'hsh.name', 'hsh.code', 'hsh.nationality', 'hsh.check_in_date', 'hsh.check_out_date', 'hsh.guest_n_rooms', 'hsh.destination_type', 'hsh.created_at')
                .where((qb) => {
                if (user_type && user_type !== 'All') {
                    qb.andWhere('hsh.user_type', user_type);
                }
                if (agency_id) {
                    qb.andWhere('hsh.agency_id', agency_id);
                }
                if (user_id) {
                    qb.andWhere('hsh.user_id', user_id);
                }
                if (from_date && to_date) {
                    qb.andWhereBetween('hsh.created_at', [from_date, to_date]);
                }
            })
                .limit(limit ? Number(limit) : constants_1.DATA_LIMIT)
                .offset(skip ? Number(skip) : 0)
                .orderBy('hsh.created_at', 'desc');
            return yield query;
        });
    }
    createAccount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('account_details')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getAccount(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, with_total = false) {
            var _a;
            const data = yield this.db('account_details AS ad')
                .withSchema(this.DBO_SCHEMA)
                .select('ad.id', 'ad.account_name', 'ad.account_number', 'ad.branch', 'ad.routing_no', 'ad.status', 'ad.swift_code', 'ad.bank_id', 'b.name AS bank_name', 'b.type AS bank_type', 'b.logo AS bank_logo')
                .joinRaw(`LEFT JOIN public.banks AS b ON ad.bank_id = b.id`)
                .andWhere('ad.source_type', query.source_type)
                .where((qb) => {
                if (query.filter) {
                    qb.orWhereILike('ad.account_name', `%${query.filter}%`).orWhereILike('b.name', `%${query.filter}%`);
                }
                if (query.source_id) {
                    qb.andWhere('ad.source_id', query.source_id);
                }
                if (query.status !== undefined) {
                    qb.andWhere('ad.status', query.status);
                }
            })
                .limit(query.limit ? parseInt(query.limit) : constants_1.DATA_LIMIT)
                .offset(query.skip ? parseInt(query.skip) : 0);
            let total = [];
            if (with_total) {
                total = yield this.db('account_details AS ad')
                    .withSchema(this.DBO_SCHEMA)
                    .count('ad.id AS total')
                    .joinRaw(`LEFT JOIN public.banks AS b ON ad.bank_id = b.id`)
                    .andWhere('ad.source_type', query.source_type)
                    .where((qb) => {
                    if (query.filter) {
                        qb.orWhereILike('ad.account_name', `%${query.filter}%`).orWhereILike('b.name', `%${query.filter}%`);
                    }
                    if (query.source_id) {
                        qb.andWhere('ad.source_id', query.source_id);
                    }
                    if (query.status !== undefined) {
                        qb.andWhere('ad.status', query.status);
                    }
                });
            }
            return {
                data,
                total: Number((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
            };
        });
    }
    checkAccount(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('account_details AS ad')
                .withSchema(this.DBO_SCHEMA)
                .select('ad.id', 'ad.account_name', 'ad.account_number', 'ad.branch', 'ad.routing_no', 'ad.status', 'ad.swift_code', 'b.name AS bank_name', 'b.type AS bank_type', 'b.logo AS bank_logo')
                .joinRaw(`LEFT JOIN public.banks AS b ON ad.bank_id = b.id`)
                .where('ad.source_type', query.source_type)
                .andWhere('ad.id', query.id)
                .where((qb) => {
                if (query.source_id) {
                    qb.andWhere('ad.source_id', query.source_id);
                }
            })
                .first();
        });
    }
    deleteAccount(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, source_type, source_id, }) {
            return yield this.db('account_details')
                .withSchema(this.DBO_SCHEMA)
                .where('source_type', source_type)
                .andWhere('id', id)
                .where((qb) => {
                if (source_id) {
                    qb.andWhere('source_id', source_id);
                }
            })
                .del();
        });
    }
    updateAccount(_a, payload_1) {
        return __awaiter(this, arguments, void 0, function* ({ id, source_type, source_id, }, payload) {
            return yield this.db('account_details')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where('source_type', source_type)
                .andWhere('id', id)
                .where((qb) => {
                if (source_id) {
                    qb.andWhere('source_id', source_id);
                }
            });
        });
    }
    insertEmailCreds(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('email_creds')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload);
        });
    }
    updateEmailCreds(payload, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('email_creds')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where('agency_id', agency_id);
        });
    }
    getEmailCreds(agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('email_creds')
                .withSchema(this.AGENT_SCHEMA)
                .select('*')
                .where('agency_id', agency_id)
                .first();
        });
    }
}
exports.default = OthersModel;
