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
class AgencyUserModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //create user
    createUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agency_user')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // update user
    updateUser(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agency_user')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where('id', id);
        });
    }
    // get user list
    getUserList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, need_total = false) {
            var _a;
            const data = yield this.db('agency_user as au')
                .withSchema(this.AGENT_SCHEMA)
                .select('au.id', 'au.username', 'au.name', 'au.email', 'au.photo', 'au.role_id', 'rl.name as role_name', 'au.is_main_user', 'au.status', 'au.socket_id')
                .leftJoin('roles as rl', 'rl.id', 'au.role_id')
                .where((qb) => {
                qb.andWhere('au.agency_id', query.agency_id);
                if (query.filter) {
                    qb.where('au.username', 'ilike', `%${query.filter}%`)
                        .orWhere('au.email', 'ilike', `%${query.filter}%`)
                        .orWhere('au.name', 'ilike', `%${query.filter}%`);
                }
                if (query.status !== undefined) {
                    qb.andWhere('au.status', query.status);
                }
            })
                .limit(Number(query.limit) || constants_1.DATA_LIMIT)
                .offset(Number(query.skip) || 0)
                .orderBy('au.name', 'asc');
            let total = [];
            if (need_total) {
                total = yield this.db('agency_user as au')
                    .withSchema(this.AGENT_SCHEMA)
                    .count('au.id AS total')
                    .where((qb) => {
                    qb.andWhere('au.agency_id', query.agency_id);
                    if (query.filter) {
                        qb.where('au.username', 'ilike', `%${query.filter}%`)
                            .orWhere('au.email', 'ilike', `%${query.filter}%`)
                            .orWhere('au.name', 'ilike', `%${query.filter}%`);
                    }
                    if (query.status !== undefined) {
                        qb.andWhere('au.status', query.status);
                    }
                });
            }
            return { data: data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    // check agency user
    checkUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, username, id, }) {
            return yield this.db('agency_user AS au')
                .withSchema(this.AGENT_SCHEMA)
                .select('au.id', 'au.agency_id', 'au.email', 'au.mobile_number', 'au.photo', 'au.name', 'au.username', 'au.hashed_password', 'au.two_fa', 'au.role_id', 'au.status', 'au.socket_id', 'au.is_main_user', 'a.status AS agency_status', 'a.agency_no', 'a.allow_api', 'a.white_label')
                .leftJoin('agency AS a', 'au.agency_id', 'a.id')
                .where((qb) => {
                if (email) {
                    qb.orWhere('au.email', email);
                }
                if (username) {
                    qb.orWhere('au.username', username);
                }
                if (id) {
                    qb.andWhere('au.id', id);
                }
            })
                .first();
        });
    }
}
exports.default = AgencyUserModel;
