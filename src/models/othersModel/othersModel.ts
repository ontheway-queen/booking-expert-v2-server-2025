import { TDB } from '../../features/public/utils/types/publicCommon.types';
import {
  DATA_LIMIT,
  SOURCE_ADMIN,
  SOURCE_AGENT,
} from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateBankAccountPayload,
  ICreateEmailCredPayload,
  ICreatePaymentGatewayPayload,
  IGetBankAccountData,
  IGetBankAccountQuery,
  IGetEmailCredData,
  IGetHotelSearchHistoryData,
  IGetHotelSearchHistoryQuery,
  IGetPaymentGatewayData,
  IInsertHotelSearchHistoryPayload,
  IUpdateBankAccountPayload,
  IUpdateEmailCredPayload,
  IUpdatePaymentGatewayPayload,
} from '../../utils/modelTypes/othersModelTypes/othersModelTypes';

export default class OthersModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertHotelSearchHistory(
    payload: IInsertHotelSearchHistoryPayload
  ) {
    return await this.db('hotel_search_history')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async getHotelSearchHistory({
    agency_id,
    limit,
    skip,
    user_id,
    from_date,
    to_date,
    user_type,
  }: IGetHotelSearchHistoryQuery): Promise<IGetHotelSearchHistoryData[]> {
    let query = this.db('hotel_search_history AS hsh')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'hsh.id',
        'hsh.name',
        'hsh.code',
        'hsh.nationality',
        'hsh.check_in_date',
        'hsh.check_out_date',
        'hsh.guest_n_rooms',
        'hsh.destination_type',
        'hsh.created_at'
      )
      .where((qb) => {
        if (user_type && user_type !== 'All') {
          qb.andWhere('hsh.user_type', user_type);
        }
        if (agency_id) {
          qb.andWhere('hsh.agency_id', agency_id);
        }
        if (user_id) {
          qb.andWhere('hsh.user_id', user_id);
        }
        if (from_date && to_date) {
          qb.andWhereBetween('hsh.created_at', [from_date, to_date]);
        }
      })
      .limit(limit ? Number(limit) : DATA_LIMIT)
      .offset(skip ? Number(skip) : 0)
      .orderBy('hsh.created_at', 'desc');

    return await query;
  }

  public async createAccount(payload: ICreateBankAccountPayload) {
    return await this.db('account_details')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async getAccount(
    query: IGetBankAccountQuery,
    with_total: boolean = false
  ): Promise<{ data: IGetBankAccountData[]; total?: number }> {
    const data = await this.db('account_details AS ad')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'ad.id',
        'ad.account_name',
        'ad.account_number',
        'ad.branch',
        'ad.routing_no',
        'ad.status',
        'ad.swift_code',
        'ad.bank_id',
        'b.name AS bank_name',
        'b.type AS bank_type',
        'b.logo AS bank_logo'
      )
      .joinRaw(`LEFT JOIN public.banks AS b ON ad.bank_id = b.id`)
      .andWhere('ad.source_type', query.source_type)
      .where((qb) => {
        if (query.filter) {
          qb.orWhereILike('ad.account_name', `%${query.filter}%`).orWhereILike(
            'b.name',
            `%${query.filter}%`
          );
        }

        if (query.source_id) {
          qb.andWhere('ad.source_id', query.source_id);
        }
        if (query.status !== undefined) {
          qb.andWhere('ad.status', query.status);
        }
      })
      .limit(query.limit ? parseInt(query.limit) : DATA_LIMIT)
      .offset(query.skip ? parseInt(query.skip) : 0)
      .orderBy('b.name', 'asc');

    let total: any[] = [];

    if (with_total) {
      total = await this.db('account_details AS ad')
        .withSchema(this.DBO_SCHEMA)
        .count('ad.id AS total')
        .joinRaw(`LEFT JOIN public.banks AS b ON ad.bank_id = b.id`)
        .andWhere('ad.source_type', query.source_type)
        .where((qb) => {
          if (query.filter) {
            qb.orWhereILike(
              'ad.account_name',
              `%${query.filter}%`
            ).orWhereILike('b.name', `%${query.filter}%`);
          }

          if (query.source_id) {
            qb.andWhere('ad.source_id', query.source_id);
          }
          if (query.status !== undefined) {
            qb.andWhere('ad.status', query.status);
          }
        });
    }

    return {
      data,
      total: Number(total[0]?.total) || 0,
    };
  }

  public async checkAccount(query: {
    id: number;
    source_type: typeof SOURCE_ADMIN | typeof SOURCE_AGENT;
    source_id?: number;
  }): Promise<IGetBankAccountData | null> {
    return await this.db('account_details AS ad')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'ad.id',
        'ad.account_name',
        'ad.account_number',
        'ad.branch',
        'ad.routing_no',
        'ad.status',
        'ad.swift_code',
        'b.name AS bank_name',
        'b.type AS bank_type',
        'b.logo AS bank_logo'
      )
      .joinRaw(`LEFT JOIN public.banks AS b ON ad.bank_id = b.id`)
      .where('ad.source_type', query.source_type)
      .andWhere('ad.id', query.id)
      .where((qb) => {
        if (query.source_id) {
          qb.andWhere('ad.source_id', query.source_id);
        }
      })
      .first();
  }

  public async deleteAccount({
    id,
    source_type,
    source_id,
  }: {
    id: number;
    source_type: typeof SOURCE_ADMIN | typeof SOURCE_AGENT;
    source_id?: number;
  }) {
    return await this.db('account_details')
      .withSchema(this.DBO_SCHEMA)
      .where('source_type', source_type)
      .andWhere('id', id)
      .where((qb) => {
        if (source_id) {
          qb.andWhere('source_id', source_id);
        }
      })
      .del();
  }

  public async updateAccount(
    {
      id,
      source_type,
      source_id,
    }: {
      id: number;
      source_type: typeof SOURCE_ADMIN | typeof SOURCE_AGENT;
      source_id?: number;
    },
    payload: IUpdateBankAccountPayload
  ) {
    return await this.db('account_details')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where('source_type', source_type)
      .andWhere('id', id)
      .where((qb) => {
        if (source_id) {
          qb.andWhere('source_id', source_id);
        }
      });
  }

  public async insertEmailCreds(payload: ICreateEmailCredPayload) {
    return await this.db('email_creds')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload);
  }

  public async updateEmailCreds(
    payload: IUpdateEmailCredPayload,
    agency_id: number
  ) {
    return await this.db('email_creds')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where('agency_id', agency_id);
  }

  public async getEmailCreds(
    agency_id: number
  ): Promise<IGetEmailCredData | null> {
    return await this.db('email_creds')
      .withSchema(this.AGENT_SCHEMA)
      .select('*')
      .where('agency_id', agency_id)
      .first();
  }

  public async insertPaymentGatewayCreds(payload: ICreatePaymentGatewayPayload) {
    return await this.db('payment_gateway_creds')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload);
  }

  public async updatePaymentGatewayCreds(
    payload: IUpdatePaymentGatewayPayload,
    id: number
  ) {
    return await this.db('payment_gateway_creds')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where('id', id);
  }

  public async getPaymentGatewayCreds(
    query: { agency_id: number, gateway_name?: string, key?: string }
  ): Promise<IGetPaymentGatewayData[] | null> {
    return await this.db('payment_gateway_creds')
      .withSchema(this.AGENT_SCHEMA)
      .select('*')
      .where('agency_id', query.agency_id)
      .andWhere((qb) => {
        if (query.gateway_name) {
          qb.andWhere('gateway_name', query.gateway_name)
        }
        if (query.key) {
          qb.andWhere('key', query.key)
        }
      })
  }

  public async getUniquePaymentGatewayList(agency_id: number): Promise<string[]> {
    const result = await this.db('payment_gateway_creds')
      .withSchema(this.AGENT_SCHEMA)
      .distinct('gateway_name')
      .where('agency_id', agency_id);
    return result.map(r => r.gateway_name);
  }
}
