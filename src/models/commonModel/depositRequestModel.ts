import { TDB } from '../../features/public/utils/types/publicCommon.types';
import {
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_SUB_AGENT,
} from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateDepositRequestPayload,
  IGetAgentB2CDepositRequestListFilterQuery,
  IGetAgentDepositRequestData,
  IGetAgentDepositRequestListFilterQuery,
  IGetSingleAgentB2CDepositRequestData,
  IGetSingleAgentDepositRequestData,
  IUpdateDepositRequestPayload,
} from '../../utils/modelTypes/commonModelTypes/depositRequestModel.types';

export default class DepositRequestModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createDepositRequest(
    payload: ICreateDepositRequestPayload
  ): Promise<{ id: number }[]> {
    return await this.db('deposit_request')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateDepositRequest(
    payload: IUpdateDepositRequestPayload,
    id: number
  ) {
    return await this.db('deposit_request')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async getAgentDepositRequestList(
    query: IGetAgentDepositRequestListFilterQuery,
    is_total: boolean = false
  ): Promise<{ data: IGetAgentDepositRequestData[]; total?: number }> {
    const data = await this.db('deposit_request as dr')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'dr.id',
        'dr.agency_id',
        'ad.bank_name',
        'ad.bank_logo',
        'dr.amount',
        'dr.request_no',
        'dr.status',
        'dr.payment_date',
        'dr.created_at',
        'a.agency_name',
        'a.agency_logo'
      )
      .joinRaw('LEFT JOIN agent.agency as a ON a.id = dr.agency_id')
      .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
      .where((qb) => {
        qb.andWhere('dr.source', SOURCE_AGENT);
        if (query.agency_id) {
          qb.andWhere('dr.agency_id', query.agency_id);
        }
        if (query.from_date && query.to_date) {
          qb.andWhereBetween('dr.payment_date', [
            query.from_date,
            query.to_date,
          ]);
        }
        if (query.status) {
          qb.andWhere('dr.status', query.status);
        }
        if (query.filter) {
          qb.andWhere((qbc) => {
            qbc.whereILike('dr.request_no', `${query.filter}%`);
            qbc.orWhereILike('a.agency_name', `%${query.filter}%`);
          });
        }
      })
      .limit(query.limit || 100)
      .offset(query.skip || 0)
      .orderBy('dr.id', 'desc');

    let total: any[] = [];

    if (is_total) {
      total = await this.db('deposit_request as dr')
        .withSchema(this.DBO_SCHEMA)
        .count('dr.id as total')
        .joinRaw('LEFT JOIN agent.agency as a ON a.id = dr.agency_id')
        .where((qb) => {
          qb.andWhere('dr.source', SOURCE_AGENT);
          if (query.agency_id) {
            qb.andWhere('dr.agency_id', query.agency_id);
          }
          if (query.from_date && query.to_date) {
            qb.andWhereBetween('dr.payment_date', [
              query.from_date,
              query.to_date,
            ]);
          }
          if (query.status) {
            qb.andWhere('dr.status', query.status);
          }
          if (query.filter) {
            qb.andWhere((qbc) => {
              qbc.whereILike('dr.request_no', `${query.filter}%`);
              qbc.orWhereILike('a.agency_name', `%${query.filter}%`);
            });
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingleAgentDepositRequest(
    id: number,
    agency_id?: number
  ): Promise<IGetSingleAgentDepositRequestData | null> {
    return await this.db('deposit_request as dr')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'dr.id',
        'dr.agency_id',
        'ad.bank_name',
        'ad.bank_logo',
        'dr.amount',
        'dr.remarks',
        'dr.request_no',
        'dr.status',
        'dr.payment_date',
        'dr.created_at',
        'dr.docs',
        'dr.created_by',
        'dr.updated_by',
        'ua.name AS updated_by_name',
        'dr.updated_at',
        'dr.update_note',
        'au.name AS created_by_name',
        'a.agency_name',
        'a.agency_logo'
      )
      .joinRaw('LEFT JOIN agent.agency as a ON dr.agency_id = a.id')
      .joinRaw('LEFT JOIN agent.agency_user AS au ON dr.created_by = au.id')
      .joinRaw('LEFT JOIN admin.user_admin AS ua ON dr.updated_by = ua.id')
      .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
      .where((qb) => {
        qb.andWhere('dr.id', id);
        qb.andWhere('dr.source', SOURCE_AGENT);
        if (agency_id) {
          qb.andWhere('dr.agency_id', agency_id);
        }
      })
      .first();
  }

  public async getSubAgentDepositRequestList(
    query: IGetAgentB2CDepositRequestListFilterQuery,
    is_total: boolean = false
  ): Promise<{ data: IGetAgentDepositRequestData[]; total?: number }> {
    const data = await this.db('deposit_request as dr')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'dr.id',
        'dr.agency_id',
        'ad.bank_name',
        'ad.bank_logo',
        'dr.amount',
        'dr.request_no',
        'dr.status',
        'dr.payment_date',
        'dr.created_at',
        'a.agency_name',
        'a.agency_logo'
      )
      .joinRaw('LEFT JOIN agent.agency as a ON a.id = dr.agency_id')
      .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
      .where((qb) => {
        qb.andWhere('dr.source', SOURCE_SUB_AGENT);
        if (query.agency_id) {
          qb.andWhere('dr.agency_id', query.agency_id);
        }
        if (query.from_date && query.to_date) {
          qb.andWhereBetween('dr.payment_date', [
            query.from_date,
            query.to_date,
          ]);
        }
        if (query.status) {
          qb.andWhere('dr.status', query.status);
        }
        if (query.filter) {
          qb.andWhere((qbc) => {
            qbc.whereILike('dr.request_no', `${query.filter}%`);
            qbc.orWhereILike('a.agency_name', `%${query.filter}%`);
          });
        }
      })
      .limit(query.limit || 100)
      .offset(query.skip || 0)
      .orderBy('dr.id', 'desc');

    let total: any[] = [];

    if (is_total) {
      total = await this.db('deposit_request as dr')
        .withSchema(this.DBO_SCHEMA)
        .count('dr.id as total')
        .joinRaw('LEFT JOIN agent.agency as a ON a.id = dr.agency_id')
        .where((qb) => {
          qb.andWhere('dr.source', SOURCE_SUB_AGENT);
          if (query.agency_id) {
            qb.andWhere('dr.agency_id', query.agency_id);
          }
          if (query.from_date && query.to_date) {
            qb.andWhereBetween('dr.payment_date', [
              query.from_date,
              query.to_date,
            ]);
          }
          if (query.status) {
            qb.andWhere('dr.status', query.status);
          }
          if (query.filter) {
            qb.andWhere((qbc) => {
              qbc.whereILike('dr.request_no', `${query.filter}%`);
              qbc.orWhereILike('a.agency_name', `%${query.filter}%`);
            });
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingleSubAgentDepositRequest(
    id: number,
    agency_id?: number
  ): Promise<IGetSingleAgentDepositRequestData | null> {
    return await this.db('deposit_request as dr')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'dr.id',
        'dr.agency_id',
        'dr.bank_name',
        'dr.amount',
        'dr.remarks',
        'dr.request_no',
        'dr.status',
        'dr.payment_date',
        'dr.created_at',
        'dr.docs',
        'dr.created_by',
        'dr.updated_by',
        'dr.updated_by_name',
        'dr.updated_at',
        'dr.update_note',
        'au.name AS created_by_name',
        'a.agency_name',
        'a.agency_logo'
      )
      .joinRaw('agent.agency as a ON dr.agency_id = a.id')
      .joinRaw('agent.agency_user AS au ON dr.created_by = au.id')
      .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
      .where((qb) => {
        qb.andWhere('dr.id', id);
        qb.andWhere('dr.source', SOURCE_SUB_AGENT);
        if (agency_id) {
          qb.andWhere('dr.agency_id', agency_id);
        }
      })
      .first();
  }

  public async getAgentB2CDepositRequestList(
    query: IGetAgentB2CDepositRequestListFilterQuery,
    is_total: boolean = false
  ): Promise<{ data: IGetAgentDepositRequestData[]; total?: number }> {
    const data = await this.db('deposit_request as dr')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'dr.id',
        'ad.bank_name',
        'ad.bank_logo',
        'dr.amount',
        'dr.request_no',
        'dr.status',
        'dr.payment_date',
        'dr.created_at'
      )
      .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
      .where((qb) => {
        qb.andWhere('dr.source', SOURCE_AGENT_B2C);
        if (query.agency_id) {
          qb.andWhere('dr.agency_id', query.agency_id);
        }
        if (query.created_by) {
          qb.andWhere('dr.created_by', query.created_by);
        }

        if (query.from_date && query.to_date) {
          qb.andWhereBetween('dr.payment_date', [
            query.from_date,
            query.to_date,
          ]);
        }
        if (query.status) {
          qb.andWhere('dr.status', query.status);
        }
        if (query.filter) {
          qb.whereILike('dr.request_no', `${query.filter}%`);
        }
      })
      .limit(query.limit || 100)
      .offset(query.skip || 0)
      .orderBy('dr.id', 'desc');

    let total: any[] = [];

    if (is_total) {
      total = await this.db('deposit_request as dr')
        .withSchema(this.DBO_SCHEMA)
        .count('dr.id as total')
        .where((qb) => {
          qb.andWhere('dr.source', SOURCE_AGENT);
          if (query.agency_id) {
            qb.andWhere('dr.agency_id', query.agency_id);
          }
          if (query.from_date && query.to_date) {
            qb.andWhereBetween('dr.payment_date', [
              query.from_date,
              query.to_date,
            ]);
          }
          if (query.status) {
            qb.andWhere('dr.status', query.status);
          }
          if (query.filter) {
            qb.whereILike('dr.request_no', `${query.filter}%`);
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingleAgentB2CDepositRequest(
    id: number,
    agency_id?: number,
    created_by?: number
  ): Promise<IGetSingleAgentB2CDepositRequestData | null> {
    return await this.db('deposit_request as dr')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'dr.id',
        'dr.request_no',
        'ad.bank_name',
        'ad.bank_logo',
        'ad.account_name',
        'ad.account_number',
        'ad.branch',
        'dr.amount',
        'dr.remarks',
        'dr.status',
        'dr.payment_date',
        'dr.created_at',
        'dr.docs',
        'dr.created_by',
        'dr.updated_at',
        'dr.update_note',
        'au.name AS created_by_name'
      )
      .joinRaw('LEFT JOIN agent_b2c.users AS au ON dr.created_by = au.id')
      .leftJoin('view_account_details AS ad', 'dr.account_id', 'ad.id')
      .where((qb) => {
        qb.andWhere('dr.id', id);
        qb.andWhere('dr.source', SOURCE_AGENT_B2C);
        if (agency_id) {
          qb.andWhere('dr.agency_id', agency_id);
        }
        if (created_by) {
          qb.andWhere('dr.created_by', created_by);
        }
      })
      .first();
  }
}
