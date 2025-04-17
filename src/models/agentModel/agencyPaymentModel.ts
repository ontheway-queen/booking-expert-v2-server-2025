import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { DATA_LIMIT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetAgencyLedgerData,
  IGetAgencyLedgerQuery,
  IInsertAgencyLedgerPayload,
} from '../../utils/modelTypes/agentModel/agencyPaymentModelTypes';

export default class AgencyPaymentModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertAgencyLedger(
    payload: IInsertAgencyLedgerPayload | IInsertAgencyLedgerPayload[]
  ) {
    return await this.db('agency_ledger').insert(payload);
  }

  public async getAgencyLedger(
    {
      agency_id,
      type,
      voucher_no,
      from_date,
      to_date,
      limit,
      skip,
    }: IGetAgencyLedgerQuery,
    need_total: boolean = false
  ): Promise<{ data: IGetAgencyLedgerData[]; total?: number }> {
    const data = await this.db('agency_ledger')
      .select('*')
      .where((qb) => {
        if (agency_id) {
          qb.andWhere('agency_id', agency_id);
        }
        if (type) {
          qb.andWhere('type', type);
        }
        if (voucher_no) {
          qb.andWhere('voucher_no', voucher_no);
        }
        if (from_date && to_date) {
          qb.andWhereBetween('ledger_date', [from_date, to_date]);
        }
      })
      .orderBy('ledger_date', 'asc')
      .orderBy('id', 'asc')
      .limit(Number(limit) || DATA_LIMIT)
      .offset(Number(skip) || 0);

    let total: any[] = [];

    if (need_total) {
      total = await this.db('agency_ledger')
        .count('id AS total')
        .where((qb) => {
          if (agency_id) {
            qb.andWhere('agency_id', agency_id);
          }
          if (type) {
            qb.andWhere('type', type);
          }
          if (voucher_no) {
            qb.andWhere('voucher_no', voucher_no);
          }
          if (from_date && to_date) {
            qb.andWhereBetween('ledger_date', [from_date, to_date]);
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }
}
