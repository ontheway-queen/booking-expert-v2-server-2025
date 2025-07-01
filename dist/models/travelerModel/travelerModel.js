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
class TravelerModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertTraveler(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('travelers')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getTravelerList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db('travelers')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (query.source_type) {
                    qb.andWhere('source_type', query.source_type);
                }
                if (query.source_id) {
                    qb.andWhere('source_id', query.source_id);
                }
                if (query.created_by) {
                    qb.andWhere('created_by', query.created_by);
                }
                if (query.type) {
                    qb.andWhere('type', query.type);
                }
            })
                .orderBy('id', 'desc')
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db('travelers')
                    .withSchema(this.DBO_SCHEMA)
                    .count('id as total')
                    .where((qb) => {
                    if (query.source_type) {
                        qb.andWhere('source_type', query.source_type);
                    }
                    if (query.source_id) {
                        qb.andWhere('source_id', query.source_id);
                    }
                    if (query.created_by) {
                        qb.andWhere('created_by', query.created_by);
                    }
                    if (query.type) {
                        qb.andWhere('type', query.type);
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getSingleTraveler(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('travelers')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (where.source_type) {
                    qb.andWhere('source_type', where.source_type);
                }
                if (where.source_id) {
                    qb.andWhere('source_id', where.source_id);
                }
                if (where.created_by) {
                    qb.andWhere('created_by', where.created_by);
                }
                if (where.id) {
                    qb.andWhere('id', where.id);
                }
            })
                .first();
        });
    }
    updateTraveler(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('travelers')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteTraveler(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('travelers')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
}
exports.default = TravelerModel;
