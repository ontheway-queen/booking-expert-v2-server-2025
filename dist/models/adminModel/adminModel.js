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
                        qbc.where('ua.name', 'ilike', `%${query.filter}%`);
                        qbc.where('ua.username', query.filter);
                        qbc.orWhere('ua.email', query.filter);
                        qbc.orWhere('ua.phone_number', query.filter);
                    });
                }
                if (query.role_id) {
                    qb.andWhere('ua.role_id', query.role_id);
                }
                if (query.status !== undefined) {
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
                            qbc.where('ua.name', 'ilike', `%${query.filter}%`);
                            qbc.where('ua.username', query.filter);
                            qbc.orWhere('ua.email', query.filter);
                            qbc.orWhere('ua.phone_number', query.filter);
                        });
                    }
                    if (query.role_id) {
                        qb.andWhere('ua.role_id', query.role_id);
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
                .andWhere((qb) => {
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
            return yield this.db('permissions AS per')
                .withSchema(this.ADMIN_SCHEMA)
                .select('per.id', 'per.name')
                .orderBy('per.name', 'asc');
        });
    }
    // Get all permissions
    checkPermission(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('permissions AS per')
                .withSchema(this.ADMIN_SCHEMA)
                .select('per.id', 'per.name')
                .where('per.id', id)
                .first();
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
    // Create role
    createPermission(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('permissions')
                .withSchema(this.ADMIN_SCHEMA)
                .insert({ name }, 'id');
        });
    }
    updatePermission(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db('permissions')
                .withSchema(this.ADMIN_SCHEMA)
                .update({ name })
                .where({ id });
        });
    }
    // Get all roles
    getAllRoles(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('roles AS r')
                .withSchema(this.ADMIN_SCHEMA)
                .select('r.id', 'r.name', 'r.status', 'r.is_main_role', 'r.create_date', 'r.created_by', 'ua.name as created_by_name')
                .leftJoin('user_admin AS ua', 'ua.id', 'r.created_by')
                .where((qb) => {
                if (payload.name) {
                    qb.andWhere('r.name', 'ilike', `%${payload.name}%`);
                }
                if (payload.status !== undefined) {
                    qb.andWhere('r.status', payload.status);
                }
            })
                .orderBy('r.name', 'asc');
        });
    }
    // Check Role
    checkRole(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('roles AS r')
                .withSchema(this.ADMIN_SCHEMA)
                .select('r.id', 'r.name AS role_name', 'r.status', 'r.is_main_role', 'r.create_date', 'r.created_by', 'ua.name as created_by_name')
                .leftJoin('user_admin AS ua', 'ua.id', 'r.created_by')
                .where((qb) => {
                if (payload.name) {
                    qb.andWhere('r.name', payload.name);
                }
                if (payload.id) {
                    qb.andWhere('r.id', payload.id);
                }
            })
                .first();
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
    getAllPermissionsOfSingleRole(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('role_permissions AS rp')
                .withSchema(this.ADMIN_SCHEMA)
                .select('rp.permission_id AS id', 'p.name', 'rp.read', 'rp.write', 'rp.update', 'rp.delete')
                .leftJoin('permissions AS p', 'rp.permission_id', 'p.id')
                .where('rp.role_id', id);
        });
    }
    checkRolePermission(_a) {
        return __awaiter(this, arguments, void 0, function* ({ permission_id, role_id, }) {
            return yield this.db('role_permissions AS rp')
                .withSchema(this.ADMIN_SCHEMA)
                .select('rp.permission_id AS id', 'rp.read', 'rp.write', 'rp.update', 'rp.delete')
                .andWhere('rp.role_id', role_id)
                .andWhere('rp.permission_id', permission_id)
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
    //create audit
    createAudit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('audit_trail')
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload);
        });
    }
    //get audit
    getAudit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('admin_audit_trail as at')
                .select('at.id', 'ad.name as created_by', 'at.type', 'at.details', 'at.created_at')
                .leftJoin('admin as ad', 'ad.id', 'at.created_by')
                .andWhere((qb) => {
                if (payload.created_by) {
                    qb.andWhere('at.created_by', payload.created_by);
                }
                if (payload.type) {
                    qb.andWhere('at.type', payload.type);
                }
                if (payload.from_date && payload.to_date) {
                    qb.andWhereBetween('at.created_at', [
                        payload.from_date,
                        payload.to_date,
                    ]);
                }
            })
                .limit(payload.limit || 100)
                .offset(payload.skip || 0)
                .orderBy('at.id', 'desc');
            const total = yield this.db('admin_audit_trail as at')
                .count('at.id as total')
                .andWhere((qb) => {
                if (payload.created_by) {
                    qb.andWhere('at.created_by', payload.created_by);
                }
                if (payload.type) {
                    qb.andWhere('at.type', payload.type);
                }
                if (payload.from_date && payload.to_date) {
                    qb.andWhereBetween('at.created_at', [
                        payload.from_date,
                        payload.to_date,
                    ]);
                }
            });
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
}
exports.default = AdminModel;
