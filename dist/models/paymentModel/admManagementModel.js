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
class ADMManagementModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createADMManagement(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("adm_management")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateADMmanagement(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("adm_management")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    getADMManagementList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const view = query.adm_for === constants_1.SOURCE_AGENT ? "adm_management_agent" : "adm_management_b2c";
            const data = yield this.db(`${view}`)
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where((qb) => {
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween("created_by", [query.from_date, query.to_date]);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike("ref_no", `${query.filter}%`);
                        qbc.orWhereILike("booking_ref", `${query.filter}%`);
                        qbc.orWhereILike("source_name", `%${query.filter}%`);
                    });
                }
                if (query.agency_id) {
                    qb.andWhere("source_id", query.agency_id);
                }
            })
                .orderBy("id", "desc")
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db(`${view}`)
                    .withSchema(this.DBO_SCHEMA)
                    .count("id as total")
                    .where((qb) => {
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween("created_by", [query.from_date, query.to_date]);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike("ref_no", `${query.filter}%`);
                            qbc.orWhereILike("booking_ref", `${query.filter}%`);
                            qbc.orWhereILike("source_name", `%${query.filter}%`);
                        });
                    }
                    if (query.agency_id) {
                        qb.andWhere("source_id", query.agency_id);
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total
            };
        });
    }
    getSingleADMManagementData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const view = params.adm_for === constants_1.SOURCE_AGENT ? "adm_management_agent" : "adm_management_b2c";
            return yield this.db(`${view}`)
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where((qb) => {
                if (params.id) {
                    qb.andWhere("id", params.id);
                }
            })
                .first();
        });
    }
    deleteADMmanagement(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("adm_management")
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
}
exports.default = ADMManagementModel;
