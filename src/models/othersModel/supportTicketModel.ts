import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { DATA_LIMIT, SOURCE_AGENT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetAgencySupportTicketListData,
  IGetAgencySupportTicketListQuery,
  IGetSingleAgentSupportTicketData,
  IGetSupportTicketMessagesData,
  IInsertSupportTicketMessagePayload,
  IInsertSupportTicketPayload,
} from '../../utils/modelTypes/othersModelTypes/supportTicketModelTypes';

export default class SupportTicketModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createSupportTicket(
    payload: IInsertSupportTicketPayload
  ): Promise<{ id: number }[]> {
    return await this.db('support_tickets')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateSupportTicket(
    payload: {
      last_message_id?: number;
      status?: 'Open' | 'Closed' | 'ReOpen';
    },
    id: number,
    source_type: 'AGENT' | 'AGENT B2C' | 'B2C'
  ) {
    return await this.db('support_tickets')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .andWhere('id', id)
      .andWhere('source_type', source_type);
  }

  public async insertSupportTicketMessage(
    payload: IInsertSupportTicketMessagePayload
  ): Promise<{ id: number }[]> {
    return await this.db('support_ticket_messages')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async getAgentSupportTicketMessages({
    support_ticket_id,
    limit,
    skip,
  }: {
    support_ticket_id: number;
    limit?: number;
    skip?: number;
  }): Promise<IGetSupportTicketMessagesData[]> {
    return this.db('support_ticket_messages AS stm')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'stm.id',
        'stm.support_ticket_id',
        'stm.sender_id',
        this.db.raw('COALESCE(ua.name, au.name) as sender_name'),
        this.db.raw('COALESCE(ua.photo, au.photo) as sender_photo'),
        'stm.message',
        'stm.attachments',
        'stm.reply_by',
        'stm.created_at'
      )
      .joinRaw(
        `LEFT JOIN agent.agency_user AS au ON stm.reply_by = 'Customer' AND au.id = stm.sender_id`
      )
      .joinRaw(
        `LEFT JOIN admin.user_admin AS ua ON stm.reply_by = 'Admin' AND ua.id = stm.sender_id`
      )
      .where('stm.support_ticket_id', support_ticket_id)
      .orderBy('stm.created_at', 'desc')
      .limit(limit || DATA_LIMIT)
      .offset(skip || 0);
  }

  public async getAgentSupportTicket(
    {
      agent_id,
      limit,
      priority,
      reply_by,
      skip,
      status,
      user_id,
      from_date,
      to_date,
      ref_type,
    }: IGetAgencySupportTicketListQuery,
    need_total: boolean = false
  ): Promise<{ data: IGetAgencySupportTicketListData[]; total: number }> {
    const data = await this.db('support_tickets AS st')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'st.id',
        'st.support_no',
        'st.subject',
        'st.status',
        'st.ref_type',
        'a.agency_name',
        'a.agency_logo',
        'stm.message AS last_message',
        'stm.reply_by',
        'stm.created_at AS last_message_created_at',
        'st.created_at'
      )
      .joinRaw(`LEFT JOIN agent.agency AS a ON a.id = st.source_id`)
      .leftJoin(
        'support_ticket_messages AS stm',
        'st.id',
        'stm.support_ticket_id'
      )
      .where((qb) => {
        qb.where('st.source_type', SOURCE_AGENT);
        if (agent_id) {
          qb.where('st.source_id', agent_id);
        }
        if (user_id) {
          qb.where('st.user_id', user_id);
        }
        if (status) {
          qb.where('st.status', status);
        }
        if (reply_by) {
          qb.where('stm.reply_by', reply_by);
        }
        if (priority) {
          qb.where('st.priority', priority);
        }
        if (ref_type) {
          qb.where('st.ref_type', ref_type);
        }
        if (from_date && to_date) {
          qb.whereBetween('st.created_at', [from_date, to_date]);
        }
      })
      .orderBy('stm.created_at', 'desc')
      .limit(limit || DATA_LIMIT)
      .offset(skip || 0);

    let total: any[] = [];

    if (need_total) {
      total = await this.db('support_tickets AS st')
        .withSchema(this.DBO_SCHEMA)
        .count('st.id AS total')
        .where((qb) => {
          qb.where('st.source_type', SOURCE_AGENT);
          if (agent_id) {
            qb.where('st.source_id', agent_id);
          }
          if (user_id) {
            qb.where('st.user_id', user_id);
          }
          if (status) {
            qb.where('st.status', status);
          }
          if (reply_by) {
            qb.where('stm.reply_by', reply_by);
          }
          if (ref_type) {
            qb.where('st.ref_type', ref_type);
          }
          if (priority) {
            qb.where('st.priority', priority);
          }
          if (from_date && to_date) {
            qb.whereBetween('st.created_at', [from_date, to_date]);
          }
        });
    }

    return { data, total: total[0]?.total || 0 };
  }

  public async getSingleAgentSupportTicket(
    id: number
  ): Promise<IGetSingleAgentSupportTicketData | null> {
    return await this.db('support_tickets AS st')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'st.id',
        'st.support_no',
        'st.source_id',
        'st.ref_type',
        'st.ref_id',
        'st.subject',
        'st.status',
        'a.agency_name',
        'a.agency_logo',
        'au.name AS created_by_name',
        'au.photo AS created_by_photo',
        'st.created_at'
      )
      .joinRaw(`LEFT JOIN agent.agency AS a ON a.id = st.source_id`)
      .joinRaw(`LEFT JOIN agent.agency_user AS au ON au.id = st.user_id`)
      .andWhere('st.id', id)
      .andWhere('st.source_type', SOURCE_AGENT)
      .first();
  }
}
