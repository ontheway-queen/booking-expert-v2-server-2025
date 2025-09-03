import Joi from 'joi';

export default class SubAgentAdministrationValidator {
  public createRole = Joi.object({
    role_name: Joi.string().required().max(100),
    permissions: Joi.array()
      .items(
        Joi.object({
          permission_id: Joi.number().required(),
          read: Joi.boolean().required(),
          write: Joi.boolean().required(),
          update: Joi.boolean().required(),
          delete: Joi.boolean().required(),
        })
      )
      .required(),
  });

  public getRoleList = Joi.object({
    name: Joi.string().optional(),
    status: Joi.boolean().optional(),
  });

  public updateRolePermissions = Joi.object({
    role_name: Joi.string().max(100),
    permissions: Joi.array()
      .items(
        Joi.object({
          permission_id: Joi.number().required(),
          read: Joi.boolean().required(),
          write: Joi.boolean().required(),
          update: Joi.boolean().required(),
          delete: Joi.boolean().required(),
        })
      )
      .optional(),
  });

  public createAgencyUser = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().lowercase().trim().required(),
    phone_number: Joi.string().required().trim(),
    role_id: Joi.number().required(),
    password: Joi.string().trim().required(),
  });

  public getAllAgencyUsers = Joi.object({
    filter: Joi.string().optional().trim(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    role_id: Joi.number().optional(),
    status: Joi.boolean().optional(),
  });

  public updateAgencyUser = Joi.object({
    name: Joi.string().trim().optional(),
    email: Joi.string().lowercase().trim().optional(),
    phone_number: Joi.string().optional().trim(),
    role_id: Joi.number().optional(),
    status: Joi.boolean().optional(),
  });
}
