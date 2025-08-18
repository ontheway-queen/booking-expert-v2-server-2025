import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { DATA_LIMIT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetAgencyB2CLedgerQuery,
  IInsertAgencyB2CLedgerPayload,
} from '../../utils/modelTypes/agencyB2CModelTypes/agencyB2CPaymentModel.types';

export default class AgencyB2CPaymentModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertLedger(
    payload: IInsertAgencyB2CLedgerPayload | IInsertAgencyB2CLedgerPayload[]
  ) {
    return await this.db('user_ledger')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .insert(payload, 'id');
  }

  public async getLedger(
    {
      agency_id,
      type,
      voucher_no,
      from_date,
      to_date,
      limit,
      user_id,
      skip,
    }: IGetAgencyB2CLedgerQuery,
    need_total: boolean = false
  ): Promise<{ data: IGetAgencyB2CLedgerQuery[]; total?: number }> {
    const data = await this.db('user_ledger as ul')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select(
        'ul.id',
        'ul.agency_id',
        'ul.type',
        'ul.amount',
        'ul.details',
        'ul.created_at',
        'ul.voucher_no',
        'ul.ledger_date',
        'a.agency_name',
        'a.agency_logo'
      )
      .joinRaw('LEFT JOIN agent.agency as a ON ul.agency_id = a.id')
      .leftJoin('users AS u', 'ul.user_id', 'u.id')
      .andWhere('ul.agency_id', agency_id)
      .where((qb) => {
        if (user_id) {
          qb.andWhere('ul.user_id', user_id);
        }
        if (type) {
          qb.andWhere('ul.type', type);
        }
        if (voucher_no) {
          qb.andWhere('ul.voucher_no', voucher_no);
        }
        if (from_date && to_date) {
          qb.andWhereBetween('ul.ledger_date', [from_date, to_date]);
        }
      })
      .orderBy('ul.ledger_date', 'asc')
      .orderBy('ul.id', 'asc')
      .limit(Number(limit) || DATA_LIMIT)
      .offset(Number(skip) || 0);

    let total: any[] = [];

    if (need_total) {
      total = await this.db('user_ledger as ul')
        .withSchema(this.AGENT_B2C_SCHEMA)
        .count('ul.id AS total')
        .andWhere('ul.agency_id', agency_id)
        .where((qb) => {
          if (user_id) {
            qb.andWhere('ul.user_id', user_id);
          }
          if (type) {
            qb.andWhere('ul.type', type);
          }
          if (voucher_no) {
            qb.andWhere('ul.voucher_no', voucher_no);
          }
          if (from_date && to_date) {
            qb.andWhereBetween('ul.ledger_date', [from_date, to_date]);
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async deleteLedgerByVoucherNo({
    agency_id,
    voucher_no,
  }: {
    agency_id: number;
    voucher_no: string;
  }) {
    await this.db('user_ledger')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .delete()
      .where('voucher_no', voucher_no)
      .andWhere('agency_id', agency_id);
  }

  public async updateLedgerByVoucherNo(
    payload: { amount: number; details?: string },
    {
      agency_id,
      voucher_no,
    }: {
      agency_id: number;
      voucher_no: string;
    }
  ) {
    await this.db('user_ledger')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .update(payload)
      .where('voucher_no', voucher_no)
      .andWhere('agency_id', agency_id);
  }

  public async getUserBalance(agency_id: number, id: number): Promise<number> {
    const data = await this.db('users AS u')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select(
        this.db.raw(`(
  SELECT 
    COALESCE(SUM(CASE WHEN ul.type = 'Credit' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN ul.type = 'Debit' THEN amount ELSE 0 END), 0) 
  AS balance 
  FROM agent_b2c.user_ledger as ul
  WHERE u.id = ul.user_id
) AS balance
`)
      )
      .where('u.agency_id', agency_id)
      .andWhere('u.id', id)
      .first();

    return Number(data?.balance) || 0;
  }
}
