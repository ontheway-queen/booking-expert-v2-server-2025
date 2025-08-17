import { TDB } from '../../features/public/utils/types/publicCommon.types';
import {
  DATA_LIMIT,
  SOURCE_AGENT,
  SOURCE_SUB_AGENT,
} from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICheckAgencyData,
  ICheckAgencyQuery,
  ICreateAgencyPayload,
  ICreateAgentAuditTrailPayload,
  ICreateAgentB2CMarkupPayload,
  ICreateAPICredsPayload,
  ICreateWhiteLabelPermissionPayload,
  IGetAgencyListData,
  IGetAgencyListQuery,
  IGetAgencyListWithBalanceData,
  IGetAgencyListWithBalanceQuery,
  IGetAgentAuditTrailQuery,
  IGetAgentB2CMarkupData,
  IGetAgentDashboardData,
  IGetAPICredsData,
  IGetSingleAgencyData,
  IGetWhiteLabelPermissionData,
  ISearchAgentData,
  IUpdateAgencyPayload,
  IUpdateAgentB2CMarkupPayload,
  IUpdateAPICredsPayload,
  IUpdateWhiteLabelPermissionPayload,
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
        'ag.status',
        'ag.white_label',
        'ag.allow_api'
      )
      .where((qb) => {
        if (query.filter) {
          qb.where('ag.agency_name', 'ILIKE', `%${query.filter}%`)
            .orWhere('ag.agent_no', query.filter)
            .orWhere('ag.email', 'like', `%${query.filter}%`);
        }
        if (query.status) {
          qb.andWhere('ag.status', query.status);
        }
        if (query.ref_id) {
          qb.andWhere('ag.ref_id', query.ref_id);
        }
        if (query.ref_agent_id) {
          qb.andWhere('ag.ref_agent_id', query.ref_agent_id);
        }
        if (query.agency_type) {
          qb.andWhere('ag.agency_type', query.agency_type);
        }
      })
      .limit(Number(query.limit) || DATA_LIMIT)
      .offset(Number(query.skip) || 0)
      .orderBy('ag.agency_name', query.order || 'asc');

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
          if (query.ref_id) {
            qb.andWhere('ag.ref_id', query.ref_id);
          }
          if (query.ref_agent_id) {
            qb.andWhere('ag.ref_agent_id', query.ref_agent_id);
          }
          if (query.agency_type) {
            qb.andWhere('ag.agency_type', query.agency_type);
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
    agency_type,
    ref_agent_id,
    status,
    ref_id,
  }: ICheckAgencyQuery): Promise<ICheckAgencyData | null> {
    return await this.db('agency')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'id',
        'email',
        'phone',
        'agency_logo',
        'agency_name',
        'agent_no',
        'status',
        'kam_id',
        'ref_agent_id',
        'agency_type',
        'white_label',
        'allow_api',
        'civil_aviation',
        'trade_license',
        'national_id',
        'usable_loan',
        'flight_markup_set',
        'hotel_markup_set',
        'address',
        'book_permission'
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
        if (ref_id) {
          qb.andWhere('ref_id', ref_id);
        }
        if (agency_type) {
          qb.andWhere('agency_type', agency_type);
        }
        if (ref_agent_id) {
          qb.andWhere('ref_agent_id', ref_agent_id);
        }
        if (status) {
          qb.andWhere('status', status);
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
        'ag.ref_agent_id',
        'ag.agency_type',
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
        if (query.ref_agent_id) {
          qb.andWhere('ag.ref_agent_id', query.ref_agent_id);
        }
        if (query.agency_type) {
          qb.andWhere('ag.agency_type', query.agency_type);
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
          if (query.ref_agent_id) {
            qb.andWhere('ag.ref_agent_id', query.ref_agent_id);
          }
          if (query.agency_type) {
            qb.andWhere('ag.agency_type', query.agency_type);
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

    return Number(data?.balance) || 0;
  }

  // get dashboard data
  public async getDashboardData(
    agency_id: number
  ): Promise<IGetAgentDashboardData> {
    const currentYear = new Date().getFullYear();

    const total_flight_booking = await this.db('flight_booking')
      .withSchema(this.DBO_SCHEMA)
      .select(
        this.db.raw(`
                  COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE status = 'EXPIRED') AS total_expired,
                  COUNT(*) FILTER (WHERE status = 'REFUNDED') AS total_refunded,
                  COUNT(*) FILTER (WHERE status = 'PENDING') AS total_pending,
                  COUNT(*) FILTER (WHERE status = 'CANCELLED') AS total_cancelled,
                  COUNT(*) FILTER (WHERE status = 'VOIDED') AS total_voided,
                  COUNT(*) FILTER (WHERE status = 'ISSUED') AS total_issued,
                  COUNT(*) FILTER (WHERE status = 'BOOKING IN PROCESS') AS total_booking_in_process,
                  COUNT(*) FILTER (WHERE status = 'TICKET IN PROCESS') AS total_ticket_in_process,
                  COUNT(*) FILTER (WHERE status = 'BOOKED') AS total_booked
                  `)
      )
      .andWhere('source_id', agency_id)
      .andWhere('source_type', SOURCE_AGENT)
      .first();

    const total_hotel_booking = await this.db('hotel_booking')
      .withSchema(this.DBO_SCHEMA)
      .select(
        this.db.raw(`
                  COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE status = 'CANCELLED') AS total_cancelled,
                  COUNT(*) FILTER (WHERE status = 'ISSUED') AS total_issued
                  `)
      )
      .andWhere('source_id', agency_id)
      .andWhere('source_type', SOURCE_AGENT)
      .first();

    const flight_booking_graph = await this.db('flight_booking')
      .withSchema(this.DBO_SCHEMA)
      .select(
        this.db.raw(`
              TRIM(TO_CHAR(created_at, 'Month')) AS month_name,
              COUNT(*) FILTER (WHERE status = 'CANCELLED') AS total_cancelled,
              COUNT(*) FILTER (WHERE status = 'ISSUED') AS total_issued
          `)
      )
      .whereRaw(`EXTRACT(YEAR FROM created_at) = ${currentYear}`)
      .andWhere('source_id', agency_id)
      .andWhere('source_type', SOURCE_AGENT)
      .groupByRaw("TRIM(TO_CHAR(created_at, 'Month'))")
      .orderByRaw('MIN(created_at)');

    const hotel_booking_graph = await this.db('hotel_booking')
      .withSchema(this.DBO_SCHEMA)
      .select(
        this.db.raw(`
              TRIM(TO_CHAR(created_at, 'Month')) AS month_name,
              COUNT(*) FILTER (WHERE status = 'CANCELLED') AS total_cancelled,
              COUNT(*) FILTER (WHERE status = 'ISSUED') AS total_issued
          `)
      )
      .whereRaw(`EXTRACT(YEAR FROM created_at) = ${currentYear}`)
      .andWhere('source_id', agency_id)
      .andWhere('source_type', SOURCE_AGENT)
      .groupByRaw("TRIM(TO_CHAR(created_at, 'Month'))")
      .orderByRaw('MIN(created_at)');

    return {
      total_flight_booking,
      total_hotel_booking,
      flight_booking_graph,
      hotel_booking_graph,
    };
  }

  // search model
  public async searchModel(
    query: string,
    agency_id: number
  ): Promise<ISearchAgentData[]> {
    console.log({ query, agency_id });
    return await this.db
      .select(
        this.db.raw(
          `'flight_booking' AS source,
       id,
       booking_ref AS title,
       status::text AS status,
       CONCAT(journey_type,' ',route, ' GDS PNR ',gds_pnr,' AIRLINE PNR ', airline_pnr,  ', ', payable_amount,'-/') AS description`
        )
      )
      .from('flight_booking')
      .withSchema(this.DBO_SCHEMA)
      .where((builder) => {
        builder
          .andWhere('source_id', agency_id)
          .andWhere('source_type', SOURCE_AGENT)
          .andWhere((qb) => {
            qb.orWhereILike('gds_pnr', query)
              .orWhereILike('airline_pnr', query)
              .orWhereILike('booking_ref', query);
          });
      })
      .unionAll([
        this.db
          .select(
            this.db.raw(
              `'hotel_booking' AS source, 
      id, 
      booking_ref AS title, 
      status::text AS status, 
      CONCAT(hotel_name, ' ', hotel_code, ', Checkin: ', checkin_date,', Checkout: ', checkout_date, ', Confirmation No: ',confirmation_no) AS description`
            )
          )
          .from('hotel_booking')
          .withSchema(this.DBO_SCHEMA)
          .where((builder) => {
            builder
              .andWhere('source_id', agency_id)
              .andWhere('source_type', SOURCE_AGENT)
              .andWhere((qb) => {
                if (typeof query === 'number') {
                  qb.orWhere('hotel_code', query);
                }
                qb.orWhereILike('confirmation_no', query)
                  .orWhereILike('hotel_name', query)
                  .orWhereILike('booking_ref', query);
              });
          }),
        this.db
          .select(
            this.db.raw(
              `'support_ticket' AS source, 
      st.id, 
      st.support_no AS title, 
      st.status::text AS status, 
      CONCAT(stm.reply_by,' reply: ',stm.message) AS description`
            )
          )
          .from('support_tickets AS st')
          .withSchema(this.DBO_SCHEMA)
          .leftJoin(
            'support_ticket_messages AS stm',
            'st.last_message_id',
            'stm.id'
          )
          .withSchema(this.DBO_SCHEMA)
          .where((builder) => {
            builder
              .andWhere('st.source_id', agency_id)
              .andWhere('st.source_type', SOURCE_AGENT)
              .andWhere((qb) => {
                qb.orWhereILike('st.support_no', query);
              });
          }),

        this.db
          .select(
            this.db.raw(
              `'flight_booking' AS source,
       fb.id,
       fb.booking_ref AS title,
       fb.status::text AS status,
       CONCAT(fb.journey_type,' ',fb.route, ' GDS PNR ',fb.gds_pnr,' AIRLINE PNR ', fb.airline_pnr, ', Ticket no: ',fbt.ticket_number, ', ', fb.payable_amount,'-/') AS description`
            )
          )
          .from('flight_booking_traveler AS fbt')
          .withSchema(this.DBO_SCHEMA)
          .leftJoin('flight_booking AS fb', 'fbt.flight_booking_id', 'fb.id')
          .where((builder) => {
            builder
              .andWhere('fb.source_id', agency_id)
              .andWhere('fb.source_type', SOURCE_AGENT)
              .andWhere('fbt.ticket_number', query);
          }),
      ]);
  }

  // get single agency
  public async getSingleAgency({
    id,
    type,
    ref_agent_id,
  }: {
    id: number;
    type: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT;
    ref_agent_id?: number;
  }): Promise<IGetSingleAgencyData | null> {
    return await this.db('agency AS ag')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'ag.id',
        'ag.agent_no',
        'ag.agency_logo',
        'ag.agency_name',
        'ag.email',
        'ag.kam_id',
        'ag.phone',
        'ag.book_permission',
        'ag.address',
        'ag.status',
        'ag.flight_markup_set',
        'ag.hotel_markup_set',
        this.db.raw(`(
  SELECT 
    COALESCE(SUM(CASE WHEN al.type = 'Credit' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN al.type = 'Debit' THEN amount ELSE 0 END), 0) 
  AS balance 
  FROM agent.agency_ledger as al
  WHERE ag.id = al.agency_id
) AS balance
`),
        'fm.name AS flight_markup_set_name',
        'hm.name AS hotel_markup_set_name',
        'ag.usable_loan',
        'ag.white_label',
        'ag.allow_api',
        'ag.civil_aviation',
        'ag.trade_license',
        'ag.national_id',
        'ua.name AS created_by',
        'ag.ref_id',
        'ag.agency_type',
        'ag.ref_agent_id',
        'ar.agency_name AS referred_by'
      )
      .joinRaw(
        'LEFT JOIN dbo.dynamic_fare_set AS fm ON ag.flight_markup_set = fm.id'
      )
      .joinRaw(
        'LEFT JOIN dbo.dynamic_fare_set AS hm ON ag.hotel_markup_set = hm.id'
      )
      .joinRaw('LEFT JOIN admin.user_admin AS ua ON ag.created_by = ua.id')
      .joinRaw('LEFT JOIN agent.agency AS ar ON ag.ref_agent_id = ar.id')
      .where('ag.id', id)
      .andWhere('ag.agency_type', type)
      .andWhere((qb) => {
        if (ref_agent_id) {
          qb.andWhere('ag.ref_agent_id', ref_agent_id);
        }
      })
      .first();
  }

  // create white label permission
  public async createWhiteLabelPermission(
    payload: ICreateWhiteLabelPermissionPayload
  ) {
    return await this.db('white_label_permissions')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload);
  }

  public async updateWhiteLabelPermission(
    payload: IUpdateWhiteLabelPermissionPayload,
    agency_id: number
  ) {
    return await this.db('white_label_permissions')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where('agency_id', agency_id);
  }

  // get white label permission
  public async getWhiteLabelPermission(query: {
    agency_id?: number;
    token?: string;
  }): Promise<IGetWhiteLabelPermissionData | null> {
    return await this.db('white_label_permissions')
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
      .where((qb) => {
        if (query.agency_id) {
          qb.where('agency_id', query.agency_id);
        }
        if (query.token) {
          qb.where('token', query.token);
        }
      })
      .first();
  }

  public async createAgentB2CMarkup(payload: ICreateAgentB2CMarkupPayload) {
    return await this.db('agent_b2c_markup')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload);
  }

  public async updateAgentB2CMarkup(
    payload: IUpdateAgentB2CMarkupPayload,
    agency_id: number
  ) {
    return await this.db('agent_b2c_markup')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where('agency_id', agency_id);
  }

  public async getAgentB2CMarkup(
    agency_id: number
  ): Promise<IGetAgentB2CMarkupData | null> {
    return await this.db('agent_b2c_markup')
      .withSchema(this.AGENT_SCHEMA)
      .select('*')
      .where({ agency_id })
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

  //create audit
  public async createAudit(payload: ICreateAgentAuditTrailPayload) {
    return await this.db('audit_trail')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload);
  }

  //get audit
  public async getAudit(payload: IGetAgentAuditTrailQuery) {
    const data = await this.db('audit_trail as at')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'at.id',
        'ad.name as created_by',
        'at.type',
        'at.details',
        'at.created_at'
      )
      .leftJoin('agent as ad', 'ad.id', 'at.created_by')
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

    const total = await this.db('audit_trail as at')
      .count('at.id as total')
      .withSchema(this.AGENT_SCHEMA)
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
