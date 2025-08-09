import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import {
  ICreateSubAgentReqBody,
  ICreateSubAgentRoleReqBody,
  IGetSubAgentListReqQuery,
  IGetSubAgentRoleListReqQuery,
  IUpdateSubAgentRolePermissionsReqBody,
} from "../utils/types/subAgentAdministration.types";
import { IUpdateSubAgentReqBody } from "../utils/types/subAgentAdministration.types";
import {
  ICreateAgencyUserPayload,
  IUpdateAgencyRolePayload,
  IUpdateAgencyUserPayload,
} from "../../../utils/modelTypes/agentModel/agencyUserModelTypes";
import Lib from "../../../utils/lib/lib";

export class SubAgentAdministrationService extends AbstractServices {
  constructor() {
    super();
  }

  // create role
  public async createRole(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id, agency_id } = req.agencyUser;

      const model = this.Model.AgencyUserModel(trx);

      const { role_name, permissions } = req.body as ICreateSubAgentRoleReqBody;
      const check_name = await model.checkRole({
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

      const role_res = await model.createRole({
        name: role_name,
        created_by: user_id,
        agency_id,
      });

      const uniquePermission = [
        ...new Map(permissions.map((obj) => [obj.permission_id, obj])).values(),
      ];

      if (uniquePermission.length) {
        const permission_body = uniquePermission.map((element: any) => {
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

        await model.insertRolePermission(permission_body);
      }

      await this.insertAgentAudit(trx, {
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
    });
  }

  //role list
  public async getRoleList(req: Request) {
    const { name, status } = req.query as IGetSubAgentRoleListReqQuery;
    const model = this.Model.AgencyUserModel();

    const agency_id = req.agencyUser.agency_id;
    const role_list = await model.getAllRoles({ name, status, agency_id });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: role_list,
    };
  }

  //permissions
  public async getPermissionsList(req: Request) {
    const model = this.Model.AgencyUserModel();
    const permissions = await model.getAllPermissions();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: permissions,
    };
  }

  //get single role permission
  public async getSingleRolePermission(req: Request) {
    const role_id = req.params.id;
    const agency_id = req.agencyUser.agency_id;

    const model = this.Model.AgencyUserModel();

    const role_permission = await model.getSingleRoleWithPermissions(
      parseInt(role_id),
      agency_id
    );

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
  }

  //update role permission
  public async updateRolePermissions(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id, agency_id } = req.agencyUser;

      const model = this.Model.AgencyUserModel(trx);
      const { id } = req.params;

      const role_id = Number(id);
      const check_role = await model.getSingleRoleWithPermissions(
        role_id,
        agency_id
      );

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
      } = req.body as IUpdateSubAgentRolePermissionsReqBody;

      if (role_name || status) {
        const updateRolePayload: IUpdateAgencyRolePayload = {};

        if (role_name) {
          const check_name = await model.checkRole({
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

        await model.updateRole(updateRolePayload, role_id);
      }

      if (perReqData && perReqData.length) {
        const getPermissions = await model.getAllPermissions();

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

        const insertPermissionVal: any = [];
        const haveToUpdateVal: any = [];

        for (let i = 0; i < addPermissions.length; i++) {
          let found = false;
          for (let j = 0; j < permissions.length; j++) {
            if (
              addPermissions[i].permission_id == permissions[j].permission_id
            ) {
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
        const add_permission_body = insertPermissionVal.map((element: any) => {
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
          await model.insertRolePermission(add_permission_body);
        }

        // update section
        if (haveToUpdateVal.length) {
          const update_permission_res = haveToUpdateVal.map(
            async (element: {
              read: boolean;
              write: boolean;
              update: boolean;
              delete: boolean;
              permission_id: number;
            }) => {
              await model.updateRolePermission(
                {
                  read: element.read,
                  update: element.update,
                  write: element.write,
                  delete: element.delete,
                },
                element.permission_id,
                role_id,
                agency_id
              );
            }
          );
          await Promise.all(update_permission_res);
        }
      }

      await this.insertAgentAudit(trx, {
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
    });
  }

  public async createAgencyUser(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id, agency_id } = req.agencyUser;

      const { password, email, name, role_id, phone_number } =
        req.body as ICreateSubAgentReqBody;

      const model = this.Model.AgencyUserModel(trx);

      //check admins email and phone number
      const check_user = await model.checkUser({
        email,
      });

      if (check_user) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Email already exist.",
        };
      }

      let username = Lib.generateUsername(name);

      let suffix = 1;

      while (await model.checkUser({ username })) {
        username = `${username}${suffix}`;
        suffix += 1;
      }

      const checkRole = await model.checkRole({
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
      const hashedPass = await Lib.hashValue(password);

      const payload: ICreateAgencyUserPayload = {
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

      const files = (req.files as Express.Multer.File[]) || [];

      if (files?.length) {
        payload.photo = files[0].filename;
      }

      await model.createUser(payload);

      await this.insertAgentAudit(trx, {
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
    });
  }

  //get all admin
  public async getAllAgentUserList(req: Request) {
    const model = this.Model.AgencyUserModel();
    const { agency_id } = req.agencyUser;
    const query = req.query as IGetSubAgentListReqQuery;
    const data = await model.getUserList({ ...query, agency_id }, true);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single admin
  public async getSingleAgencyUser(req: Request) {
    const id = req.params.id;
    const { agency_id } = req.agencyUser;
    const model = this.Model.AgencyUserModel();
    let data = await model.getSingleAgencyUser({ id: Number(id), agency_id });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { hashed_password, ...newData } = data;

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: newData,
    };
  }

  //update admin
  public async updateAgencyUser(req: Request) {
    const id = req.params.id;
    const { agency_id } = req.agencyUser;
    const model = this.Model.AgencyUserModel();

    const user = await model.getSingleAgencyUser({
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

    const { role_id, ...restBody } = req.body as IUpdateSubAgentReqBody;

    const payload: IUpdateAgencyUserPayload = { ...restBody };

    if (role_id) {
      const checkRole = await model.checkRole({ id: role_id, agency_id });

      if (!checkRole) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid Role id.",
        };
      }

      payload.role_id = role_id;
    }

    const files = (req.files as Express.Multer.File[]) || [];

    if (files?.length) {
      payload.photo = files[0].filename;
    }

    if (Object.keys(payload).length) {
      await model.updateUser(payload, { id: Number(id), agency_id });
    }

    if (user.photo && payload.photo) {
      await this.manageFile.deleteFromCloud([user.photo]);
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: { photo: payload.photo },
    };
  }
}
