import Joi from 'joi';

export default class AdminAdministrationValidator {
  public createRole = Joi.object({
    role_name: Joi.string().required().max(100),
    permissions: Joi.array()
      .items(
        Joi.object({
          id: Joi.number().required(),
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
          id: Joi.number().required(),
          read: Joi.boolean().required(),
          write: Joi.boolean().required(),
          update: Joi.boolean().required(),
          delete: Joi.boolean().required(),
        })
      )
      .optional(),
  });

  public createAdmin = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().lowercase().trim().required(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    phone_number: Joi.string().required().trim(),
    role_id: Joi.number().required(),
    password: Joi.string().trim().required(),
  });

  public getAllAdmin = Joi.object({
    filter: Joi.string().optional().trim(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    role_id: Joi.number().optional(),
    status: Joi.boolean().optional(),
  });

  public updateAdmin = Joi.object({
    name: Joi.string().trim().optional(),
    email: Joi.string().lowercase().trim().optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    phone_number: Joi.string().optional().trim(),
    role_id: Joi.number().optional(),
    status: Joi.boolean().optional(),
  });

  public getErrorLog = Joi.object({
    search: Joi.string().trim().optional(),
    source: Joi.string().valid('AGENT', 'ADMIN', 'B2C').optional(),
    level: Joi.string().valid('ERROR', 'WARNING', 'INFO').optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    from_date: Joi.date().raw().optional(),
    to_date: Joi.date().raw().optional(),
  });

  public getAuditTrail = Joi.object({
    admin_id: Joi.number().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    from_date: Joi.date().raw().optional(),
    to_date: Joi.date().raw().optional(),
  });
}
