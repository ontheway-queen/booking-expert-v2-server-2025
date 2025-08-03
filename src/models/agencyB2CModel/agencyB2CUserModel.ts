import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { DATA_LIMIT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICheckAgentB2CUserData,
  ICreateAgentB2CUserPayload,
  IGetAgencyB2CUserList,
  IGetAgencyB2CUserListQuery,
  IGetAgentB2CSingleUser,
  IUpdateAgencyB2CUserPayload,
} from '../../utils/modelTypes/agencyB2CModelTypes/agencyB2CUserModelTypes';

export default class AgencyB2CUserModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //create user
  public async createUser(
    payload: ICreateAgentB2CUserPayload
  ): Promise<{ id: number }[]> {
    return await this.db('users')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .insert(payload, 'id');
  }

  // update user
  public async updateUser(
    payload: IUpdateAgencyB2CUserPayload,
    id: number,
    agency_id: number
  ) {
    return await this.db('users')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .update(payload)
      .andWhere('agency_id', agency_id)
      .andWhere('id', id);
  }

  // get user list
  public async getUserList(
    query: IGetAgencyB2CUserListQuery,
    need_total: boolean = false
  ): Promise<{ data: IGetAgencyB2CUserList[]; total?: number }> {
    const data = await this.db('users')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('id', 'username', 'name', 'email', 'photo', 'status')
      .andWhere('agency_id', query.agency_id)
      .where((qb) => {
        if (query.filter) {
          qb.where('username', 'ilike', `%${query.filter}%`)
            .orWhere('email', 'ilike', `%${query.filter}%`)
            .orWhere('name', 'ilike', `%${query.filter}%`);
        }
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
      })
      .limit(Number(query.limit) || DATA_LIMIT)
      .offset(Number(query.skip) || 0)
      .orderBy('name', 'asc');

    let total: any[] = [];
    if (need_total) {
      total = await this.db('users')
        .withSchema(this.AGENT_B2C_SCHEMA)
        .count('id AS total')
        .andWhere('agency_id', query.agency_id)
        .where((qb) => {
          if (query.filter) {
            qb.where('username', 'ilike', `%${query.filter}%`)
              .orWhere('email', 'ilike', `%${query.filter}%`)
              .orWhere('name', 'ilike', `%${query.filter}%`);
          }
          if (query.status !== undefined) {
            qb.andWhere('status', query.status);
          }
        });
    }

    return { data: data, total: total[0]?.total };
  }

  // get single user
  public async getSingleUser(
    id: number,
    agency_id: number
  ): Promise<IGetAgentB2CSingleUser | null> {
    return await this.db('users')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select(
        'id',
        'username',
        'name',
        'email',
        'photo',
        'status',
        'gender',
        'phone_number',
        'created_at'
      )
      .andWhere('id', id)
      .andWhere('agency_id', agency_id)
      .first();
  }

  // Check User with email or username or id
  public async checkUser({
    email,
    username,
    id,
    agency_id,
  }: {
    username?: string;
    email?: string;
    id?: number;
    agency_id: number;
  }): Promise<ICheckAgentB2CUserData | null> {
    return await this.db('users')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select(
        'id',
        'password_hash',
        'phone_number',
        'gender',
        'photo',
        'username',
        'name',
        'email',
        'status'
      )
      .andWhere('agency_id', agency_id)
      .andWhere((qb) => {
        if (username) {
          qb.orWhere('username', username);
        }

        if (email) {
          qb.orWhere('email', email);
        }

        if (id) {
          qb.andWhere('id', id);
        }
      })
      .first();
  }

  public async updateUserByEmail(
    payload: IUpdateAgencyB2CUserPayload,
    email: string,
    agency_id: number
  ) {
    return await this.db('users')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .update(payload)
      .andWhere('email', email)
      .andWhere('agency_id', agency_id);
  }
}
