import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  ICreateAdminReqBody,
  ICreateAdminRoleReqBody,
  IGetAdminListReqQuery,
  IGetAdminRoleListReqQuery,
  IUpdateAdminReqBody,
  IUpdateAdminRolePermissionsReqBody,
} from '../utils/types/adminAdministration.types';
import {
  IAdminCreatePayload,
  IInsertAdminRolePermissionPayload,
  IUpdateAdminPayload,
  IUpdateAdminRolePayload,
} from '../../../utils/modelTypes/adminModelTypes/adminModel.types';
import Lib from '../../../utils/lib/lib';

export class AdminAdministrationService extends AbstractServices {
  constructor() {
    super();
  }

  // create role
  public async createRole(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.admin;

      const model = this.Model.AdminModel(trx);

      const { role_name, permissions } = req.body as ICreateAdminRoleReqBody;
      const check_name = await model.checkRole({
        name: role_name,
      });

      if (check_name) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: `Role already exists with this name`,
        };
      }

      const role_res = await model.createRole({
        name: role_name,
        created_by: user_id,
      });

      const uniquePermission = [
        ...new Map(permissions.map((obj) => [obj.id, obj])).values(),
      ];

      if (uniquePermission.length) {
        const permission_body = uniquePermission.map((element: any) => {
          return {
            role_id: role_res[0].id,
            permission_id: element.id,
            read: element.read,
            write: element.write,
            update: element.update,
            delete: element.delete,
          };
        });

        await model.insertRolePermission(permission_body);
      }

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        type: 'CREATE',
        details: `Role created with name ${role_name}`,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: { id: role_res[0].id },
      };
    });
  }

  //role list
  public async getRoleList(req: Request) {
    const { name, status } = req.query as IGetAdminRoleListReqQuery;
    const model = this.Model.AdminModel();
    const role_list = await model.getAllRoles({ name, status });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: role_list,
    };
  }

  //permissions
  public async getPermissionsList(req: Request) {
    const model = this.Model.AdminModel();
    const permissions = await model.getAllPermissions();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: permissions,
    };
  }

  //permissions
  public async addPermissionsList(req: Request) {
    const model = this.Model.AdminModel();
    const permissions = await model.createPermission(req.body.name);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: permissions[0].id,
    };
  }

  //permissions
  public async updatePermission(req: Request) {
    const model = this.Model.AdminModel();
    const { id } = req.params;
    await model.updatePermission(Number(id), req.body.name);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
    };
  }

  //get single role permission
  public async getSingleRolePermission(req: Request) {
    const role_id = Number(req.params.id);
    const model = this.Model.AdminModel();

    const role = await model.checkRole({ id: role_id });

    if (!role) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const role_permission = await model.getAllPermissionsOfSingleRole(role_id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: { ...role, permissions: role_permission },
    };
  }

  //update role permission
  public async updateRolePermissions(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.admin;

      const model = this.Model.AdminModel(trx);
      const { id } = req.params;

      const role_id = Number(id);
      const check_role = await model.checkRole({ id: role_id });

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

      const {
        permissions: perReqData,
        role_name,
        status,
      } = req.body as IUpdateAdminRolePermissionsReqBody;

      if (role_name || status) {
        const updateRolePayload: IUpdateAdminRolePayload = {};

        if (role_name) {
          const check_name = await model.checkRole({ name: role_name });
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

        await model.updateRole(updateRolePayload, role_id);
      }

      if (perReqData && perReqData.length) {
        const rolePermissionPayload: IInsertAdminRolePermissionPayload[] = [];

        const promiseData = perReqData.map(async (per) => {
          const { id, ...restPer } = per;
          const check = await model.checkRolePermission({
            permission_id: id,
            role_id,
          });

          if (check) {
            await model.updateRolePermission(restPer, id, role_id);
          } else {
            rolePermissionPayload.push({
              permission_id: id,
              role_id,
              ...restPer,
            });
          }
        });

        await Promise.all(promiseData);

        if (rolePermissionPayload.length) {
          await model.insertRolePermission(rolePermissionPayload);
        }
      }

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        type: 'UPDATE',
        details: `Role updated with name ${check_role.name}`,
        payload: JSON.stringify(req.body),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async createAdmin(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id } = req.admin;

      const { password, email, name, role_id, phone_number, gender } =
        req.body as ICreateAdminReqBody;

      const model = this.Model.AdminModel(trx);

      //check admins email and phone number
      const check_admin = await model.checkUserAdmin({
        email,
      });

      if (check_admin) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Email already exist.',
        };
      }

      let username = Lib.generateUsername(name);

      let suffix = 1;

      while (await model.checkUserAdmin({ username })) {
        username = `${username}${suffix}`;
        suffix += 1;
      }

      const checkRole = await model.checkRole({ id: role_id, status: true });

      if (!checkRole) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Role id not found.',
        };
      }

      //password hashing
      const hashedPass = await Lib.hashValue(password);

      const payload: IAdminCreatePayload = {
        password_hash: hashedPass,
        created_by: user_id,
        email,
        name,
        role_id,
        username,
        phone_number,
        gender,
      };

      const files = (req.files as Express.Multer.File[]) || [];

      if (files?.length) {
        payload.photo = files[0].filename;
      }

      await model.createAdmin(payload);

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        details: `New admin user created. Name: ${name}(${username}) with role ${checkRole.name}`,
        type: 'CREATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  //get all admin
  public async getAllAdmin(req: Request) {
    const model = this.Model.AdminModel();

    const query = req.query as IGetAdminListReqQuery;
    const data = await model.getAllAdmin(query, true);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single admin
  public async getSingleAdmin(req: Request) {
    const id = req.params.id;
    const model = this.Model.AdminModel();
    let data = await model.getSingleAdmin({ id: Number(id) });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { password_hash, ...newData } = data;

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: newData,
    };
  }

  //update admin
  public async updateAdmin(req: Request) {
    const id = req.params.id;
    const model = this.Model.AdminModel();

    const admin = await model.getSingleAdmin({
      id: Number(id),
    });

    if (!admin) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    if (admin.is_main_user) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
        message: "You can't update main admin",
      };
    }

    const { role_id, ...restBody } = req.body as IUpdateAdminReqBody;

    const payload: IUpdateAdminPayload = { ...restBody };

    if (role_id) {
      const checkRole = await model.checkRole({ id: role_id });

      if (!checkRole) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Invalid Role id.',
        };
      }

      payload.role_id = role_id;
    }

    const files = (req.files as Express.Multer.File[]) || [];

    if (files?.length) {
      payload.photo = files[0].filename;
    }

    if (Object.keys(payload).length) {
      await model.updateUserAdmin(payload, { id: Number(id) });
    }

    if (admin.photo && payload.photo) {
      await this.manageFile.deleteFromCloud([admin.photo]);
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: { photo: payload.photo },
    };
  }
}
