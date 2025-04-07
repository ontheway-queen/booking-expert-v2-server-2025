import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IAdminCreatePayload,
  IGetAdminData,
  IGetAdminListFilterQuery,
  IGetSingleAdminData,
  IGetSingleAdminQuery,
  IUpdateProfilePayload,
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
            qbc.where('ua.username', 'ilike', `%${query.filter}%`);
            qbc.orWhere('ua.email', 'ilike', `%${query.filter}%`);
            qbc.orWhere('ua.phone_number', 'ilike', `%${query.filter}%`);
          });
        }
        if (query.role) {
          qb.andWhere('rl.id', query.role);
        }
        if (query.status === 'true' || query.status === 'false') {
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
              qbc.where('ua.username', 'ilike', `%${query.filter}%`);
              qbc.orWhere('ua.email', 'ilike', `%${query.filter}%`);
              qbc.orWhere('ua.phone_number', 'ilike', `%${query.filter}%`);
            });
          }
          if (query.role) {
            qb.andWhere('rl.id', query.role);
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
  ): Promise<IGetSingleAdminData> {
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

  //update user admin
  public async updateUserAdmin(
    payload: IUpdateProfilePayload,
    where: { id: number }
  ) {
    return await this.db('user_admin')
      .withSchema(this.ADMIN_SCHEMA)
      .update(payload)
      .where((qb) => {
        if (where.id) {
          qb.where('id', where.id);
        }
      });
  }
}
