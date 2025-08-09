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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubAgentAdministrationService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class SubAgentAdministrationService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create role
    createRole(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, agency_id } = req.agencyUser;
                const model = this.Model.AgencyUserModel(trx);
                const { role_name, permissions } = req.body;
                const check_name = yield model.checkRole({
                    name: role_name,
                    agency_id,
                });
                if (check_name) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: `Role already exists with this name`,
                    };
                }
                const role_res = yield model.createRole({
                    name: role_name,
                    created_by: user_id,
                    agency_id,
                });
                const uniquePermission = [
                    ...new Map(permissions.map((obj) => [obj.permission_id, obj])).values(),
                ];
                if (uniquePermission.length) {
                    const permission_body = uniquePermission.map((element) => {
                        return {
                            role_id: role_res[0].id,
                            agency_id,
                            permission_id: element.permission_id,
                            read: element.read,
                            write: element.write,
                            update: element.update,
                            delete: element.delete,
                        };
                    });
                    yield model.insertRolePermission(permission_body);
                }
                yield this.insertAgentAudit(trx, {
                    created_by: user_id,
                    type: "CREATE",
                    details: `Role created with name ${role_name}`,
                    agency_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: { id: role_res[0].id },
                };
            }));
        });
    }
    //role list
    getRoleList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, status } = req.query;
            const model = this.Model.AgencyUserModel();
            const agency_id = req.agencyUser.agency_id;
            const role_list = yield model.getAllRoles({ name, status, agency_id });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: role_list,
            };
        });
    }
    //permissions
    getPermissionsList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.AgencyUserModel();
            const permissions = yield model.getAllPermissions();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: permissions,
            };
        });
    }
    //get single role permission
    getSingleRolePermission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const role_id = req.params.id;
            const agency_id = req.agencyUser.agency_id;
            const model = this.Model.AgencyUserModel();
            const role_permission = yield model.getSingleRoleWithPermissions(parseInt(role_id), agency_id);
            if (!role_permission) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: role_permission,
            };
        });
    }
    //update role permission
    updateRolePermissions(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, agency_id } = req.agencyUser;
                const model = this.Model.AgencyUserModel(trx);
                const { id } = req.params;
                const role_id = Number(id);
                const check_role = yield model.getSingleRoleWithPermissions(role_id, agency_id);
                if (!check_role) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (check_role.is_main_role) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: "You can't update main role",
                    };
                }
                const { permissions: perReqData, role_name, status, } = req.body;
                if (role_name || status) {
                    const updateRolePayload = {};
                    if (role_name) {
                        const check_name = yield model.checkRole({
                            name: role_name,
                            agency_id,
                        });
                        if (check_name) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_CONFLICT,
                                message: `Role already exists with this name`,
                            };
                        }
                        updateRolePayload.name = role_name;
                    }
                    if (status !== undefined) {
                        updateRolePayload.status = status;
                    }
                    yield model.updateRole(updateRolePayload, role_id);
                }
                if (perReqData && perReqData.length) {
                    const getPermissions = yield model.getAllPermissions();
                    const addPermissions = [];
                    for (let i = 0; i < perReqData.length; i++) {
                        for (let j = 0; j < getPermissions.length; j++) {
                            if (perReqData[i].permission_id == getPermissions[j].id) {
                                addPermissions.push(perReqData[i]);
                            }
                        }
                    }
                    // get single role permission
                    const { permissions } = check_role;
                    const insertPermissionVal = [];
                    const haveToUpdateVal = [];
                    for (let i = 0; i < addPermissions.length; i++) {
                        let found = false;
                        for (let j = 0; j < permissions.length; j++) {
                            if (addPermissions[i].permission_id == permissions[j].permission_id) {
                                found = true;
                                haveToUpdateVal.push(addPermissions[i]);
                                break;
                            }
                        }
                        if (!found) {
                            insertPermissionVal.push(addPermissions[i]);
                        }
                    }
                    // insert permission
                    const add_permission_body = insertPermissionVal.map((element) => {
                        return {
                            role_id,
                            permission_id: element.permission_id,
                            read: element.read,
                            write: element.write,
                            update: element.update,
                            delete: element.delete,
                            created_by: user_id,
                        };
                    });
                    if (add_permission_body.length) {
                        yield model.insertRolePermission(add_permission_body);
                    }
                    // update section
                    if (haveToUpdateVal.length) {
                        const update_permission_res = haveToUpdateVal.map((element) => __awaiter(this, void 0, void 0, function* () {
                            yield model.updateRolePermission({
                                read: element.read,
                                update: element.update,
                                write: element.write,
                                delete: element.delete,
                            }, element.permission_id, role_id, agency_id);
                        }));
                        yield Promise.all(update_permission_res);
                    }
                }
                yield this.insertAgentAudit(trx, {
                    created_by: user_id,
                    agency_id,
                    type: "UPDATE",
                    details: `Role updated with name ${check_role.role_name}`,
                    payload: JSON.stringify(req.body),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    createAgencyUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, agency_id } = req.agencyUser;
                const { password, email, name, role_id, phone_number } = req.body;
                const model = this.Model.AgencyUserModel(trx);
                //check admins email and phone number
                const check_user = yield model.checkUser({
                    email,
                });
                if (check_user) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Email already exist.",
                    };
                }
                let username = lib_1.default.generateUsername(name);
                let suffix = 1;
                while (yield model.checkUser({ username })) {
                    username = `${username}${suffix}`;
                    suffix += 1;
                }
                const checkRole = yield model.checkRole({
                    id: role_id,
                    status: true,
                    agency_id,
                });
                if (!checkRole) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Role id not found.",
                    };
                }
                //password hashing
                const hashedPass = yield lib_1.default.hashValue(password);
                const payload = {
                    hashed_password: hashedPass,
                    created_by: user_id,
                    email,
                    name,
                    role_id,
                    username,
                    phone_number,
                    agency_id,
                    is_main_user: false,
                };
                const files = req.files || [];
                if (files === null || files === void 0 ? void 0 : files.length) {
                    payload.photo = files[0].filename;
                }
                yield model.createUser(payload);
                yield this.insertAgentAudit(trx, {
                    created_by: user_id,
                    details: `New agency user created. Name: ${name}(${username}) with role ${checkRole.name}`,
                    type: "CREATE",
                    agency_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    //get all admin
    getAllAgentUserList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.AgencyUserModel();
            const { agency_id } = req.agencyUser;
            const query = req.query;
            const data = yield model.getUserList(Object.assign(Object.assign({}, query), { agency_id }), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get single admin
    getSingleAgencyUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { agency_id } = req.agencyUser;
            const model = this.Model.AgencyUserModel();
            let data = yield model.getSingleAgencyUser({ id: Number(id), agency_id });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const { hashed_password } = data, newData = __rest(data, ["hashed_password"]);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: newData,
            };
        });
    }
    //update admin
    updateAgencyUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { agency_id } = req.agencyUser;
            const model = this.Model.AgencyUserModel();
            const user = yield model.getSingleAgencyUser({
                id: Number(id),
                agency_id,
            });
            if (!user) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            if (user.is_main_user) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                    message: "You can't update main admin",
                };
            }
            const _a = req.body, { role_id } = _a, restBody = __rest(_a, ["role_id"]);
            const payload = Object.assign({}, restBody);
            if (role_id) {
                const checkRole = yield model.checkRole({ id: role_id, agency_id });
                if (!checkRole) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid Role id.",
                    };
                }
                payload.role_id = role_id;
            }
            const files = req.files || [];
            if (files === null || files === void 0 ? void 0 : files.length) {
                payload.photo = files[0].filename;
            }
            if (Object.keys(payload).length) {
                yield model.updateUser(payload, { id: Number(id), agency_id });
            }
            if (user.photo && payload.photo) {
                yield this.manageFile.deleteFromCloud([user.photo]);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: { photo: payload.photo },
            };
        });
    }
}
exports.SubAgentAdministrationService = SubAgentAdministrationService;
