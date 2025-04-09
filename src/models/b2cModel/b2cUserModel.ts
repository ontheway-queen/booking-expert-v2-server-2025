import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { DATA_LIMIT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICheckB2CUserData,
  ICreateB2CUserPayload,
  IGetB2CSingleUser,
  IGetB2CUserList,
  IGetB2CUserListQuery,
  IUpdateB2CUserPayload,
} from '../../utils/modelTypes/b2cModelTypes/b2cModelTypes';

export default class B2CUserModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //create user
  public async createUser(payload: ICreateB2CUserPayload): Promise<number[]> {
    return await this.db('users')
      .withSchema(this.B2C_SCHEMA)
      .insert(payload, 'id');
  }

  // update user
  public async updateUser(payload: IUpdateB2CUserPayload, id: number) {
    return await this.db('users')
      .withSchema(this.B2C_SCHEMA)
      .update(payload)
      .where('id', id);
  }

  // get user list
  public async getUserList(
    query: IGetB2CUserListQuery,
    need_total: boolean = false
  ): Promise<{ data: IGetB2CUserList[]; total?: number }> {
    const data = await this.db('users')
      .withSchema(this.B2C_SCHEMA)
      .select('id', 'username', 'name', 'email', 'photo', 'status')
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
        .withSchema(this.B2C_SCHEMA)
        .count('id AS total')
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
  public async getSingleUser(id: number): Promise<IGetB2CSingleUser | null> {
    return await this.db('users')
      .withSchema(this.B2C_SCHEMA)
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
      .where('id', id)
      .first();
  }

  // Check User with email or username or id
  public async checkUser({
    email,
    username,
    id,
  }: {
    username?: string;
    email?: string;
    id?: number;
  }): Promise<ICheckB2CUserData | null> {
    return await this.db('users')
      .withSchema(this.B2C_SCHEMA)
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
      .where((qb) => {
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
}
