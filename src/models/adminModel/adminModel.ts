import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IAdminCreatePayload,
  ICheckAdminRolePayload,
  ICheckUserAdmin,
  ICreateAdminAuditTrailPayload,
  ICreateAdminRolePayload,
  IGetAdminAllPermissionsData,
  IGetAdminAuditTrailQuery,
  IGetAdminData,
  IGetAdminListFilterQuery,
  IGetAdminRoleListData,
  IGetAdminRoleListQuery,
  IGetSingleAdminData,
  IGetSingleAdminQuery,
  IGetSingleAdminRoleWithPermissionsData,
  IInsertAdminRolePermissionPayload,
  IUpdateAdminPayload,
  IUpdateAdminRolePayload,
} from '../../utils/modelTypes/adminModelTypes/adminModel.types';

export default class AdminModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //create admin
  public async createAdmin(payload: IAdminCreatePayload): Promise<number[]> {
    return await this.db('user_admin')
      .withSchema(this.ADMIN_SCHEMA)
      .insert(payload, 'id');
  }

  //get all admin
  public async getAllAdmin(
    query: IGetAdminListFilterQuery,
    is_total: boolean = false
  ): Promise<{ data: IGetAdminData[]; total?: number }> {
    const data = await this.db('user_admin as ua')
      .withSchema(this.ADMIN_SCHEMA)
      .select(
        'ua.id',
        'ua.username',
        'ua.name',
        'ua.email',
        'ua.phone_number',
        'ua.photo',
        'ua.role_id',
        'ua.is_main_user',
        'rl.name as role_name',
        'ua.status',
        'ua.socket_id'
      )
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

    let total: any[] = [];

    if (is_total) {
      total = await this.db('user_admin as ua')
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
      total: total[0]?.total,
    };
  }

  //get single admin
  public async getSingleAdmin(
    payload: IGetSingleAdminQuery
  ): Promise<IGetSingleAdminData | null> {
    return await this.db('user_admin as ua')
      .select(
        'ua.*',
        'rl.name as role',
        'rl.id as role_id',
        'ua2.name as created_by_name'
      )
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
  }

  // Check user admin with email or username or id
  public async checkUserAdmin({
    email,
    id,
    username,
  }: {
    id?: number;
    email?: string;
    username?: string;
  }): Promise<ICheckUserAdmin | null> {
    return await this.db('user_admin as ua')
      .select(
        'ua.id',
        'ua.username',
        'ua.name',
        'ua.phone_number',
        'ua.role_id',
        'ua.password_hash',
        'ua.gender',
        'ua.photo',
        'ua.email',
        'ua.status',
        'ua.is_main_user',
        'ua.two_fa'
      )
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
  }

  //update user admin
  public async updateUserAdmin(
    payload: IUpdateAdminPayload,
    where: { id: number }
  ) {
    return await this.db('user_admin')
      .withSchema(this.ADMIN_SCHEMA)
      .update(payload)
      .where('id', where.id);
  }

  //update user admin by email
  public async updateUserAdminByEmail(
    payload: IUpdateAdminPayload,
    where: { email: string }
  ) {
    return await this.db('user_admin')
      .withSchema(this.ADMIN_SCHEMA)
      .update(payload)
      .where('email', where.email);
  }

  // Get all permissions
  public async getAllPermissions(): Promise<IGetAdminAllPermissionsData[]> {
    return await this.db('permissions AS per')
      .withSchema(this.ADMIN_SCHEMA)
      .select('per.id', 'per.name')
      .orderBy('per.name', 'asc');
  }

  // Create role
  public async createRole(
    payload: ICreateAdminRolePayload
  ): Promise<{ id: number }[]> {
    return await this.db('roles')
      .withSchema(this.ADMIN_SCHEMA)
      .insert(payload, 'id');
  }

  // Get all roles
  public async getAllRoles(
    payload: IGetAdminRoleListQuery
  ): Promise<IGetAdminRoleListData[]> {
    return await this.db('roles AS r')
      .withSchema(this.ADMIN_SCHEMA)
      .select(
        'r.id',
        'r.name',
        'r.status',
        'r.is_main_role',
        'r.create_date',
        'r.created_by',
        'ua.name as created_by_name'
      )
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
  }

  // Check Role
  public async checkRole(
    payload: ICheckAdminRolePayload
  ): Promise<IGetAdminRoleListData | null> {
    return await this.db('roles')
      .withSchema(this.ADMIN_SCHEMA)
      .select('id', 'name', 'status', 'is_main_role')
      .where((qb) => {
        if (payload.name) {
          qb.andWhere('name', payload.name);
        }
        if (payload.id) {
          qb.andWhere('id', payload.id);
        }
      })
      .first();
  }

  // update role
  public async updateRole(payload: IUpdateAdminRolePayload, id: number) {
    return await this.db('roles')
      .withSchema(this.ADMIN_SCHEMA)
      .update(payload)
      .where({ id });
  }

  // Get single role with permissions
  public async getSingleRoleWithPermissions(
    id: number
  ): Promise<IGetSingleAdminRoleWithPermissionsData | null> {
    return await this.db('roles as rol')
      .withSchema(this.ADMIN_SCHEMA)
      .select(
        'rol.id as role_id',
        'rol.name as role_name',
        'rol.status',
        'rol.is_main_role',
        this.db.raw(`
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
    `)
      )
      .where('rol.id', id)
      .first();
  }

  // insert roles permissions
  public async insertRolePermission(
    payload: IInsertAdminRolePermissionPayload[]
  ) {
    return await this.db('role_permissions')
      .withSchema(this.ADMIN_SCHEMA)
      .insert(payload);
  }

  // Delete Role permissions
  public async deleteRolePermissions(role_id: number) {
    return await this.db('role_permissions')
      .withSchema(this.ADMIN_SCHEMA)
      .delete()
      .where('role_id', role_id);
  }

  // update role permission
  public async updateRolePermission(
    payload: {
      write: boolean;
      update: boolean;
      delete: boolean;
      read: boolean;
    },
    permission_id: number,
    role_id: number
  ) {
    return await this.db('role_permissions')
      .withSchema(this.ADMIN_SCHEMA)
      .update(payload)
      .andWhere('role_id', role_id)
      .andWhere('permission_id', permission_id);
  }

  //create audit
  public async createAudit(payload: ICreateAdminAuditTrailPayload) {
    return await this.db('audit_trail')
      .withSchema(this.ADMIN_SCHEMA)
      .insert(payload);
  }

  //get audit
  public async getAudit(payload: IGetAdminAuditTrailQuery) {
    const data = await this.db('admin_audit_trail as at')
      .select(
        'at.id',
        'ad.name as created_by',
        'at.type',
        'at.details',
        'at.created_at'
      )
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

    const total = await this.db('admin_audit_trail as at')
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
      total: total[0]?.total,
    };
  }
}
