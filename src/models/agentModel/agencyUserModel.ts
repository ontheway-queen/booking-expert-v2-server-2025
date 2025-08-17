import { TDB } from '../../features/public/utils/types/publicCommon.types';
import {
  DATA_LIMIT,
  SOURCE_AGENT,
  SOURCE_SUB_AGENT,
} from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICheckAgencyRoleData,
  ICheckAgencyRolePayload,
  ICheckAgencyUserData,
  ICreateAgencyRolePayload,
  ICreateAgencyUserPayload,
  IGetAgencyRoleListData,
  IGetAgencyRoleListQuery,
  IGetAgencyUserListData,
  IGetAgencyUserListQuery,
  IGetAllAgencyPermissionsData,
  IGetSingleAgencyRoleWithPermissionsData,
  IInsertAgencyRolePermissionPayload,
  IUpdateAgencyRolePayload,
  IUpdateAgencyUserPayload,
} from '../../utils/modelTypes/agentModel/agencyUserModelTypes';

export default class AgencyUserModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //create user
  public async createUser(payload: ICreateAgencyUserPayload) {
    return await this.db('agency_user')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  // update user
  public async updateUser(
    payload: IUpdateAgencyUserPayload,
    { agency_id, id }: { id: number; agency_id: number }
  ) {
    return await this.db('agency_user')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .andWhere('id', id)
      .andWhere('agency_id', agency_id);
  }

  public async updateUserByEmail(
    payload: IUpdateAgencyUserPayload,
    email: string
  ) {
    return await this.db('agency_user')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where('email', email);
  }

  // get user list
  public async getUserList(
    query: IGetAgencyUserListQuery,
    need_total: boolean = false
  ): Promise<{ data: IGetAgencyUserListData[]; total?: number }> {
    const data = await this.db('agency_user as au')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'au.id',
        'au.username',
        'au.name',
        'au.email',
        'au.photo',
        'au.role_id',
        'rl.name as role_name',
        'au.is_main_user',
        'au.status',
        'au.socket_id'
      )
      .leftJoin('roles as rl', 'rl.id', 'au.role_id')
      .where((qb) => {
        qb.andWhere('au.agency_id', query.agency_id);
        qb.andWhere((qbc) => {
          if (query.filter) {
            qbc
              .orWhere('au.name', 'ilike', `%${query.filter}%`)
              .orWhere('au.username', query.filter)
              .orWhere('au.email', query.filter)
              .orWhere('au.phone_number', query.filter);
          }
        });
        if (query.role_id) {
          qb.andWhere('au.role_id', query.role_id);
        }
        if (query.status !== undefined) {
          qb.andWhere('au.status', query.status);
        }
      })
      .limit(Number(query.limit) || DATA_LIMIT)
      .offset(Number(query.skip) || 0)
      .orderBy('au.name', 'asc');

    let total: any[] = [];
    if (need_total) {
      total = await this.db('agency_user as au')
        .withSchema(this.AGENT_SCHEMA)
        .count('au.id AS total')
        .where((qb) => {
          qb.andWhere('au.agency_id', query.agency_id);
          qb.andWhere((qbc) => {
            if (query.filter) {
              qbc.where('au.name', 'ilike', `%${query.filter}%`);
              qbc.where('au.username', query.filter);
              qbc.orWhere('au.email', query.filter);
              qbc.orWhere('au.phone_number', query.filter);
            }
          });
          if (query.status !== undefined) {
            qb.andWhere('au.status', query.status);
          }
        });
    }

    return { data: data, total: total[0]?.total };
  }

  // check agency user
  public async checkUser({
    email,
    username,
    id,
    agency_id,
    is_main_user,
    agency_type,
  }: {
    agency_id?: number;
    agency_type?: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT;
    email?: string;
    username?: string;
    id?: number;
    is_main_user?: boolean;
  }): Promise<ICheckAgencyUserData | null> {
    return await this.db('agency_user AS au')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'au.id',
        'au.agency_id',
        'au.email',
        'au.phone_number',
        'au.photo',
        'au.name',
        'au.username',
        'au.hashed_password',
        'au.two_fa',
        'au.role_id',
        'au.status',
        'au.socket_id',
        'au.is_main_user',
        'a.status AS agency_status',
        'a.agent_no',
        'a.email AS agency_email',
        'a.phone AS agency_phone_number',
        'a.agency_name',
        'a.agency_logo',
        'a.allow_api',
        'a.white_label',
        'a.ref_id',
        'a.ref_agent_id',
        'a.agency_type',
        'a.civil_aviation',
        'a.trade_license',
        'a.national_id',
        'a.kam_id',
        'a.address'
      )
      .leftJoin('agency AS a', 'au.agency_id', 'a.id')
      .where((qb) => {
        if (email) {
          qb.orWhere('au.email', email);
        }

        if (agency_type) {
          qb.orWhere('a.agency_type', agency_type);
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
  }

  // check agency user
  public async getSingleAgencyUser({
    id,
    agency_id,
  }: {
    agency_id: number;
    id: number;
  }): Promise<ICheckAgencyUserData | null> {
    return await this.db('agency_user AS au')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'au.id',
        'au.email',
        'au.phone_number',
        'au.photo',
        'au.name',
        'au.username',
        'au.two_fa',
        'au.role_id',
        'r.name AS role_name',
        'au.status',
        'au.is_main_user'
      )
      .leftJoin('roles AS r', 'au.role_id', 'r.id')
      .andWhere('au.id', id)
      .andWhere('au.agency_id', agency_id)
      .first();
  }

  // Create role
  public async createRole(payload: ICreateAgencyRolePayload) {
    return await this.db('roles')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  // Get all roles
  public async getAllRoles(
    payload: IGetAgencyRoleListQuery
  ): Promise<IGetAgencyRoleListData[]> {
    return await this.db('roles')
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
  }

  public async checkRole(
    payload: ICheckAgencyRolePayload
  ): Promise<ICheckAgencyRoleData | null> {
    return await this.db('roles')
      .withSchema(this.AGENT_SCHEMA)
      .select('id', 'name', 'status', 'is_main_role')
      .where((qb) => {
        qb.andWhere('agency_id', payload.agency_id);
        if (payload.name) {
          qb.andWhere('name', payload.name);
        }
        if (payload.id) {
          qb.andWhere('id', payload.id);
        }
      })
      .first();
  }

  public async getAllPermissions(): Promise<IGetAllAgencyPermissionsData[]> {
    return await this.db('permissions AS per')
      .withSchema(this.AGENT_SCHEMA)
      .select('per.id', 'per.name')
      .orderBy('per.name', 'asc');
  }

  // update role
  public async updateRole(payload: IUpdateAgencyRolePayload, id: number) {
    return await this.db('roles')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where({ id });
  }

  // Get single role with permissions
  public async getSingleRoleWithPermissions(
    id: number,
    agency_id: number
  ): Promise<IGetSingleAgencyRoleWithPermissionsData> {
    return await this.db('roles as rol')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'rol.id as role_id',
        'rol.name as role_name',
        'rol.status',
        'rol.is_main_role',
        this.db.raw(`
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
      `)
      )
      .andWhere('rol.id', id)
      .andWhere('rol.agency_id', agency_id)
      .first();
  }

  // insert roles permissions
  public async insertRolePermission(
    payload: IInsertAgencyRolePermissionPayload[]
  ) {
    return await this.db('role_permissions')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload);
  }

  // Delete Role permissions
  public async deleteRolePermissions(role_id: number, agency_id: number) {
    return await this.db('role_permissions')
      .withSchema(this.AGENT_SCHEMA)
      .delete()
      .andWhere('role_id', role_id)
      .andWhere('agency_id', agency_id);
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
    role_id: number,
    agency_id: number
  ) {
    return await this.db('role_permissions')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .andWhere('agency_id', agency_id)
      .andWhere('role_id', role_id)
      .andWhere('permission_id', permission_id);
  }
}
