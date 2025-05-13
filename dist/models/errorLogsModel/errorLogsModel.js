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
class ErrorLogsModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertErrorLogs(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("error_logs")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getErrorLogs(query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db("error_logs")
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where((qb) => {
                if (query.level) {
                    qb.andWhere("level", "ilike", query.level);
                }
                if (query.search) {
                    qb.andWhere("message", "ilike", `%${query.search}%`);
                }
            })
                .orderBy("id", "desc")
                .limit(query.limit || 50)
                .offset(query.skip || 0);
            const total = yield this.db("error_logs")
                .withSchema(this.DBO_SCHEMA)
                .count("id as total");
            return { data, total: Number((_a = total === null || total === void 0 ? void 0 : total[0]) === null || _a === void 0 ? void 0 : _a.total) };
        });
    }
    deleteErrorLogs(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("error_logs")
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
}
exports.default = ErrorLogsModel;
