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
class ErrorLogsModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertErrorLogs(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('error_logs')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getErrorLogs(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('error_logs')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (query.level) {
                    qb.andWhere('level', 'ilike', query.level);
                }
                if (query.search) {
                    qb.andWhere('message', 'ilike', `%${query.search}%`);
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('created_at', [query.from_date, query.to_date]);
                }
                if (query.source) {
                    qb.andWhere('source', query.source);
                }
            })
                .orderBy('id', 'desc')
                .limit(query.limit || constants_1.DATA_LIMIT)
                .offset(query.skip || 0);
            return data;
        });
    }
    deleteErrorLogs(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('error_logs')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
}
exports.default = ErrorLogsModel;
