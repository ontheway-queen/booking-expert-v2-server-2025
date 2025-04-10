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
class AdminModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //create admin
    createAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('user_admin')
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get all admin
    getAllAdmin(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db('user_admin as ua')
                .withSchema(this.ADMIN_SCHEMA)
                .select('ua.id', 'ua.username', 'ua.name', 'ua.email', 'ua.phone_number', 'ua.photo', 'ua.role_id', 'ua.is_main_user', 'rl.name as role_name', 'ua.status', 'ua.socket_id')
                .leftJoin('roles as rl', 'rl.id', 'ua.role_id')
                .where((qb) => {
                if (query.filter) {
                    qb.where((qbc) => {
                        qbc.where('ua.username', 'ilike', `%${query.filter}%`);
                        qbc.orWhere('ua.email', 'ilike', `%${query.filter}%`);
                        qbc.orWhere('ua.phone_number', 'ilike', `%${query.filter}%`);
                    });
                }
                if (query.role) {
                    qb.andWhere('rl.id', query.role);
                }
                if (query.status === 'true' || query.status === 'false') {
                    qb.andWhere('ua.status', query.status);
                }
            })
                .orderBy('ua.id', 'desc')
                .limit(query.limit ? query.limit : 100)
                .offset(query.skip ? query.skip : 0);
            let total = [];
            if (is_total) {
                total = yield this.db('user_admin as ua')
                    .withSchema(this.ADMIN_SCHEMA)
                    .count('ua.id as total')
                    .join('roles as rl', 'rl.id', 'ua.role_id')
                    .where((qb) => {
                    if (query.filter) {
                        qb.where((qbc) => {
                            qbc.where('ua.username', 'ilike', `%${query.filter}%`);
                            qbc.orWhere('ua.email', 'ilike', `%${query.filter}%`);
                            qbc.orWhere('ua.phone_number', 'ilike', `%${query.filter}%`);
                        });
                    }
                    if (query.role) {
                        qb.andWhere('rl.id', query.role);
                    }
                    if (query.status === 'true' || query.status === 'false') {
                        qb.andWhere('ua.status', query.status);
                    }
                });
            }
            return {
                data: data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    //get single admin
    getSingleAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('user_admin as ua')
                .select('ua.*', 'rl.name as role', 'rl.id as role_id', 'ua2.name as created_by_name')
                .withSchema(this.ADMIN_SCHEMA)
                .leftJoin('roles as rl', 'rl.id', 'ua.role_id')
                .leftJoin('user_admin as ua2', 'ua2.id', 'ua.created_by')
                .where((qb) => {
                if (payload.id) {
                    qb.where('ua.id', payload.id);
                }
                if (payload.status !== undefined) {
                    qb.where('ua.status', payload.status);
                }
            })
                .first();
        });
    }
    // Check user admin with email or username or id
    checkUserAdmin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, id, username, }) {
            return yield this.db('user_admin as ua')
                .select('ua.id', 'ua.username', 'ua.name', 'ua.phone_number', 'ua.role_id', 'ua.password_hash', 'ua.gender', 'ua.photo', 'ua.email', 'ua.status', 'ua.is_main_user', 'ua.two_fa')
                .withSchema(this.ADMIN_SCHEMA)
                .where((qb) => {
                if (email) {
                    qb.orWhere('ua.email', email);
                }
                if (username) {
                    qb.orWhere('ua.username', username);
                }
                if (id) {
                    qb.andWhere('ua.id', id);
                }
            })
                .first();
        });
    }
    //update user admin
    updateUserAdmin(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('user_admin')
                .withSchema(this.ADMIN_SCHEMA)
                .update(payload)
                .where('id', where.id);
        });
    }
    //update user admin by email
    updateUserAdminByEmail(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('user_admin')
                .withSchema(this.ADMIN_SCHEMA)
                .update(payload)
                .where('email', where.email);
        });
    }
    // Get all permissions
    getAllPermissions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('permissions')
                .withSchema(this.ADMIN_SCHEMA)
                .select('per.id', 'per.name', 'ua.name as created_by', 'per.created_at')
                .leftJoin('user_admin as ua', 'ua.id', 'per.created_by')
                .orderBy('per.name', 'asc');
        });
    }
    // Create role
    createRole(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('roles')
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // Get all roles
    getAllRoles(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('roles')
                .withSchema(this.ADMIN_SCHEMA)
                .select('id', 'name', 'status', 'is_main_role')
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
    // update role
    updateRole(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('roles')
                .withSchema(this.ADMIN_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // Get single role with permissions
    getSingleRoleWithPermissions(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('roles as rol')
                .withSchema(this.ADMIN_SCHEMA)
                .select('rol.id as role_id', 'rol.name as role_name', 'rol.status', 'rol.is_main_role', this.db.raw(`
      case when exists (
        select 1
        from ${this.ADMIN_SCHEMA}.role_permissions rp
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
        from ${this.ADMIN_SCHEMA}.role_permissions rp
        left join ${this.ADMIN_SCHEMA}.permissions per
        on rp.permission_id = per.id
        where rp.role_id = rol.id
        group by rp.role_id
      ) else '[]' end as permissions
    `))
                .where('rol.id', id)
                .first();
        });
    }
    // insert roles permissions
    insertRolePermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('role_permissions')
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload);
        });
    }
    // Delete Role permissions
    deleteRolePermissions(role_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('role_permissions')
                .withSchema(this.ADMIN_SCHEMA)
                .delete()
                .where('role_id', role_id);
        });
    }
    // update role permission
    updateRolePermission(payload, permission_id, role_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('role_permissions')
                .withSchema(this.ADMIN_SCHEMA)
                .update(payload)
                .andWhere('role_id', role_id)
                .andWhere('permission_id', permission_id);
        });
    }
}
exports.default = AdminModel;
