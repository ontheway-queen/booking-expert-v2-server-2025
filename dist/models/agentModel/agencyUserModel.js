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
    updateUser(payload_1, _a) {
        return __awaiter(this, arguments, void 0, function* (payload, { agency_id, id }) {
            return yield this.db('agency_user')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .andWhere('id', id)
                .andWhere('agency_id', agency_id);
        });
    }
    updateUserByEmail(payload, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agency_user')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where('email', email);
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
        return __awaiter(this, arguments, void 0, function* ({ email, username, id, agency_id, is_main_user, }) {
            return yield this.db('agency_user AS au')
                .withSchema(this.AGENT_SCHEMA)
                .select('au.id', 'au.agency_id', 'au.email', 'au.phone_number', 'au.photo', 'au.name', 'au.username', 'au.hashed_password', 'au.two_fa', 'au.role_id', 'au.status', 'au.socket_id', 'au.is_main_user', 'a.status AS agency_status', 'a.agent_no', 'a.email AS agency_email', 'a.phone AS agency_phone_number', 'a.agency_name', 'a.agency_logo', 'a.allow_api', 'a.white_label', 'a.ref_id')
                .leftJoin('agency AS a', 'au.agency_id', 'a.id')
                .where((qb) => {
                if (email) {
                    qb.orWhere('au.email', email);
                }
                if (username) {
                    qb.orWhere('au.username', username);
                }
                if (is_main_user !== undefined) {
                    qb.andWhere('is_main_user', is_main_user);
                }
                if (id) {
                    qb.andWhere('au.id', id);
                }
                if (agency_id) {
                    qb.andWhere('au.agency_id', agency_id);
                }
            })
                .first();
        });
    }
    // Create role
    createRole(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('roles')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // Get all roles
    getAllRoles(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('roles')
                .withSchema(this.AGENT_SCHEMA)
                .select('id', 'name', 'status', 'is_main_role')
                .andWhere('agency_id', payload.agency_id)
                .where((qb) => {
                if (payload.name) {
                    qb.andWhere('name', 'ilike', `%${payload.name}%`);
                }
                if (payload.status !== undefined) {
                    qb.andWhere('status', payload.status);
                }
            })
                .orderBy('name', 'asc');
        });
    }
    getAllPermissions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('permissions AS per')
                .withSchema(this.AGENT_SCHEMA)
                .select('per.id', 'per.name')
                .orderBy('per.name', 'asc');
        });
    }
    // update role
    updateRole(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('roles')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // Get single role with permissions
    getSingleRoleWithPermissions(id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('roles as rol')
                .withSchema(this.AGENT_SCHEMA)
                .select('rol.id as role_id', 'rol.name as role_name', 'rol.status', 'rol.is_main_role', this.db.raw(`
        case when exists (
          select 1
          from ${this.AGENT_SCHEMA}.role_permissions rp
          where rp.role_id = rol.id
        ) then (
          select json_agg(
            json_build_object(
              'permission_id', per.id,
              'permission_name', per.name,
              'read', rp.read,
              'write', rp.write,
              'update', rp.update,
              'delete', rp.delete
            )
                  order by per.name asc
          )
          from ${this.AGENT_SCHEMA}.role_permissions rp
          left join ${this.AGENT_SCHEMA}.permissions per
          on rp.permission_id = per.id
          where rp.role_id = rol.id
          group by rp.role_id
        ) else '[]' end as permissions
      `))
                .andWhere('rol.id', id)
                .andWhere('rol.agency_id', agency_id)
                .first();
        });
    }
    // insert roles permissions
    insertRolePermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('role_permissions')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload);
        });
    }
    // Delete Role permissions
    deleteRolePermissions(role_id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('role_permissions')
                .withSchema(this.AGENT_SCHEMA)
                .delete()
                .andWhere('role_id', role_id)
                .andWhere('agency_id', agency_id);
        });
    }
    // update role permission
    updateRolePermission(payload, permission_id, role_id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('role_permissions')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .andWhere('agency_id', agency_id)
                .andWhere('role_id', role_id)
                .andWhere('permission_id', permission_id);
        });
    }
}
exports.default = AgencyUserModel;
