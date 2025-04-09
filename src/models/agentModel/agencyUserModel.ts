import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { DATA_LIMIT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICheckAgencyUserData,
  ICreateAgencyUserPayload,
  IGetAgencyUserListData,
  IGetAgencyUserListQuery,
  IUpdateAgencyUserPayload,
} from '../../utils/modelTypes/agentModel/agencyUserModelTypes';

export default class AgencyUserModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //create user
  public async createUser(
    payload: ICreateAgencyUserPayload
  ): Promise<number[]> {
    return await this.db('agency_user')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  // update user
  public async updateUser(payload: IUpdateAgencyUserPayload, id: number) {
    return await this.db('agency_user')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where('id', id);
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
        if (query.filter) {
          qb.where('au.username', 'ilike', `%${query.filter}%`)
            .orWhere('au.email', 'ilike', `%${query.filter}%`)
            .orWhere('au.name', 'ilike', `%${query.filter}%`);
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

    return { data: data, total: total[0]?.total };
  }

  // check agency user
  public async checkUser({
    email,
    username,
    id,
  }: {
    email?: string;
    username?: string;
    id?: number;
  }): Promise<ICheckAgencyUserData | null> {
    return await this.db('agency_user AS au')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'au.id',
        'au.agency_id',
        'au.email',
        'au.mobile_number',
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
        'a.agency_no',
        'a.allow_api',
        'a.white_label'
      )
      .leftJoin('agency AS a', 'au.agency_id', 'a.id')
      .where((qb) => {
        if (email) {
          qb.orWhere('au.email', email);
        }
        if (username) {
          qb.orWhere('au.username', username);
        }

        if (id) {
          qb.andWhere('au.id', id);
        }
      })
      .first();
  }
}
