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
class AgencyB2CUserModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //create user
    createUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('users')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // update user
    updateUser(payload, id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('users')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .update(payload)
                .andWhere('agency_id', agency_id)
                .andWhere('id', id);
        });
    }
    // get user list
    getUserList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, need_total = false) {
            var _a;
            const data = yield this.db('users')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('id', 'username', 'name', 'email', 'photo', 'status')
                .andWhere('agency_id', query.agency_id)
                .where((qb) => {
                if (query.filter) {
                    qb.where('username', 'ilike', `%${query.filter}%`)
                        .orWhere('email', 'ilike', `%${query.filter}%`)
                        .orWhere('name', 'ilike', `%${query.filter}%`);
                }
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
            })
                .limit(Number(query.limit) || constants_1.DATA_LIMIT)
                .offset(Number(query.skip) || 0)
                .orderBy('name', 'asc');
            let total = [];
            if (need_total) {
                total = yield this.db('users')
                    .withSchema(this.AGENT_B2C_SCHEMA)
                    .count('id AS total')
                    .andWhere('agency_id', query.agency_id)
                    .where((qb) => {
                    if (query.filter) {
                        qb.where('username', 'ilike', `%${query.filter}%`)
                            .orWhere('email', 'ilike', `%${query.filter}%`)
                            .orWhere('name', 'ilike', `%${query.filter}%`);
                    }
                    if (query.status !== undefined) {
                        qb.andWhere('status', query.status);
                    }
                });
            }
            return { data: data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    // get single user
    getSingleUser(id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('users')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('id', 'username', 'name', 'email', 'photo', 'status', 'gender', 'phone_number', 'created_at')
                .andWhere('id', id)
                .andWhere('agency_id', agency_id)
                .first();
        });
    }
    // Check User with email or username or id
    checkUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, username, id, agency_id, }) {
            return yield this.db('users')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('id', 'password_hash', 'phone_number', 'gender', 'photo', 'username', 'name', 'email', 'status')
                .andWhere('agency_id', agency_id)
                .where((qb) => {
                if (username) {
                    qb.orWhere('username', username);
                }
                if (email) {
                    qb.orWhere('email', email);
                }
                if (id) {
                    qb.andWhere('id', id);
                }
            })
                .first();
        });
    }
}
exports.default = AgencyB2CUserModel;
