import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { DATA_LIMIT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICheckAgencyData,
  ICheckAgencyQuery,
  ICreateAgencyPayload,
  ICreateAPICredsPayload,
  ICreateWhiteLabelPermissionPayload,
  IGetAgencyListData,
  IGetAgencyListQuery,
  IGetAgencyListWithBalanceData,
  IGetAgencyListWithBalanceQuery,
  IGetAPICredsData,
  IGetWhiteLabelPermissionData,
  IUpdateAgencyPayload,
  IUpdateAPICredsPayload,
} from '../../utils/modelTypes/agentModel/agencyModelTypes';

export default class AgencyModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //create agency
  public async createAgency(payload: ICreateAgencyPayload) {
    return await this.db('agency')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  // update agency
  public async updateAgency(payload: IUpdateAgencyPayload, id: number) {
    return await this.db('agency')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where('id', id);
  }

  // get agency list
  public async getAgencyList(
    query: IGetAgencyListQuery,
    need_total: boolean = false
  ): Promise<{ data: IGetAgencyListData[]; total?: number }> {
    const data = await this.db('agency AS ag')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'ag.id',
        'ag.agent_no',
        'ag.agency_logo',
        'ag.agency_name',
        'ag.email',
        'ag.phone',
        'ag.address',
        'ag.status',
        'ag.white_label',
        'ag.allow_api'
      )
      .where((qb) => {
        if (query.filter) {
          qb.where('ag.agency_name', 'like', `%${query.filter}%`)
            .orWhere('ag.agent_no', query.filter)
            .orWhere('ag.email', 'like', `%${query.filter}%`);
        }
        if (query.status) {
          qb.andWhere('ag.status', query.status);
        }
      })
      .limit(Number(query.limit) || DATA_LIMIT)
      .offset(Number(query.skip) || 0)
      .orderBy('ag.agency_name', 'asc');

    let total: any[] = [];

    if (need_total) {
      total = await this.db('agency AS ag')
        .withSchema(this.AGENT_SCHEMA)
        .count({ total: 'id' })
        .where((qb) => {
          if (query.filter) {
            qb.where('ag.agency_name', 'like', `%${query.filter}%`)
              .orWhere('ag.agent_no', query.filter)
              .orWhere('ag.email', 'like', `%${query.filter}%`);
          }
          if (query.status) {
            qb.andWhere('ag.status', query.status);
          }
        });
    }
    return { data, total: total[0]?.total };
  }

  // check Agency
  public async checkAgency({
    agency_id,
    email,
    name,
    agent_no,
  }: ICheckAgencyQuery): Promise<ICheckAgencyData | undefined> {
    return await this.db('agency')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'id',
        'email',
        'phone',
        'agency_name',
        'agent_no',
        'status',
        'white_label',
        'allow_api',
        'usable_loan',
        'flight_markup_set',
        'hotel_markup_set'
      )
      .where((qb) => {
        if (agency_id) {
          qb.where('id', agency_id);
        }
        if (email) {
          qb.where('email', email);
        }
        if (name) {
          qb.where('agency_name', name);
        }
        if (agent_no) {
          qb.where('agent_no', agent_no);
        }
      })
      .first();
  }

  // get agency list
  public async getAgencyListWithBalance(
    query: IGetAgencyListWithBalanceQuery,
    need_total: boolean = false
  ): Promise<{ data: IGetAgencyListWithBalanceData[]; total?: number }> {
    const data = await this.db('agency AS ag')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'ag.id',
        'ag.agent_no',
        'ag.agency_logo',
        'ag.agency_name',
        'ag.email',
        'ag.phone',
        'ag.address',
        'ag.status',
        this.db.raw(`(
  SELECT 
    COALESCE(SUM(CASE WHEN al.type = 'Credit' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN al.type = 'Debit' THEN amount ELSE 0 END), 0) 
  AS balance 
  FROM agent.agency_ledger as al
  WHERE ag.id = al.agency_id
) AS balance
`),
        'fm.name AS flight_markup_set',
        'hm.name AS hotel_markup_set',
        'ag.usable_loan',
        'ag.white_label',
        'ag.allow_api'
      )
      .joinRaw('LEFT JOIN dbo.markup_set AS fm ON ag.flight_markup_set = fm.id')
      .joinRaw('LEFT JOIN dbo.markup_set AS hm ON ag.hotel_markup_set = hm.id')
      .where((qb) => {
        if (query.search_value) {
          qb.where('ag.agency_name', 'like', `%${query.search_value}%`)
            .orWhere('ag.agent_no', query.search_value)
            .orWhere('ag.email', 'like', `%${query.search_value}%`);
        }
        if (query.status) {
          qb.andWhere('ag.status', query.status);
        }
      })
      .limit(Number(query.limit) || DATA_LIMIT)
      .offset(Number(query.skip) || 0)
      .orderBy('ag.agency_name', 'asc');

    let total: any[] = [];

    if (need_total) {
      total = await this.db('agency AS ag')
        .withSchema(this.AGENT_SCHEMA)
        .count({ total: 'id' })
        .where((qb) => {
          if (query.search_value) {
            qb.where('ag.agency_name', 'like', `%${query.search_value}%`)
              .orWhere('ag.agent_no', query.search_value)
              .orWhere('ag.email', 'like', `%${query.search_value}%`);
          }
          if (query.status) {
            qb.andWhere('ag.status', query.status);
          }
        });
    }
    return { data, total: total[0]?.total };
  }

  // get agency balance
  public async getAgencyBalance(agency_id: number): Promise<number> {
    const data = await this.db('agency AS ag')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        this.db.raw(`(
  SELECT 
    COALESCE(SUM(CASE WHEN al.type = 'Credit' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN al.type = 'Debit' THEN amount ELSE 0 END), 0) 
  AS balance 
  FROM agent.agency_ledger as al
  WHERE ag.id = al.agency_id
) AS balance
`)
      )
      .where('ag.id', agency_id)
      .first();

    return data?.balance || 0;
  }

  // get single agency
  public async getSingleAgency(id: number) {
    return await this.db('agency AS ag')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'ag.id',
        'ag.agent_no',
        'ag.agency_logo',
        'ag.agency_name',
        'ag.email',
        'ag.phone',
        'ag.address',
        'ag.status',
        'ag.flight_markup_set',
        'ag.hotel_markup_set',
        'fm.name AS flight_markup_set_name',
        'hm.name AS hotel_markup_set_name',
        'ag.usable_loan',
        'ag.white_label',
        'ag.allow_api',
        'ua.name AS created_by',
        'uar.name AS referred_by'
      )
      .joinRaw('LEFT JOIN dbo.markup_set AS fm ON ag.flight_markup_set = fm.id')
      .joinRaw('LEFT JOIN dbo.markup_set AS hm ON ag.hotel_markup_set = hm.id')
      .joinRaw('LEFT JOIN admin.user_admin AS ua ON ag.created_by = ua.id')
      .joinRaw('LEFT JOIN admin.user_admin AS uar ON ag.ref_id = uar.id')
      .where('ag.id', id)
      .first();
  }

  // create white label permission
  public async createWhiteLabelPermission(
    payload: ICreateWhiteLabelPermissionPayload
  ) {
    return await this.db('agency_white_label_permission')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  // get white label permission
  public async getWhiteLabelPermission(
    agency_id: number
  ): Promise<IGetWhiteLabelPermissionData> {
    return await this.db('agency_white_label_permission')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'agency_id',
        'token',
        'flight',
        'hotel',
        'visa',
        'holiday',
        'group_fare',
        'umrah',
        'blog'
      )
      .where('agency_id', agency_id)
      .first();
  }

  // create api creds
  public async createAPICreds(payload: ICreateAPICredsPayload) {
    return await this.db('api_creds')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  // get API Credentials
  public async getAPICreds(agency_id: number): Promise<IGetAPICredsData> {
    return await this.db('api_creds')
      .withSchema(this.AGENT_SCHEMA)
      .select('agency_id', 'api_user', 'api_pass', 'last_access')
      .where('agency_id', agency_id)
      .first();
  }

  // update api creds
  public async updateAPICreds(
    payload: IUpdateAPICredsPayload,
    agency_id: number
  ) {
    return await this.db('api_creds')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where('agency_id', agency_id);
  }
}
