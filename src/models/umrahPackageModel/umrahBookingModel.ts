import { TDB } from '../../features/public/utils/types/publicCommon.types';
import {
  DATA_LIMIT,
  SOURCE_AGENT_B2C,
} from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetAgentB2CSingleUmrahBookingQuery,
  IGetAgentB2CUmrahBookingListData,
  IGetUmrahBookingContactData,
  IGetUmrahBookingListQuery,
  IInsertUmrahBookingContact,
  IInsertUmrahBookingPayload,
} from '../../utils/modelTypes/umrahPackageModelTypes/umrahBookingModelTypes';

export default class UmrahBookingModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertUmrahBooking(payload: IInsertUmrahBookingPayload) {
    return await this.db('umrah_booking')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  public async getAgentB2CUmarhBookingList(
    query: IGetUmrahBookingListQuery,
    need_total: boolean = false
  ): Promise<{ data: IGetAgentB2CUmrahBookingListData[]; total?: number }> {
    const data = await this.db('umrah_booking AS ub')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'ub.id',
        'ub.booking_ref',
        'ub.umrah_id',
        'up.title AS umrah_title',
        'up.short_description AS umrah_short_description',
        'ub.status',
        'ub.user_id',
        'abu.name AS user_name',
        'ub.traveler_adult',
        'ub.traveler_child',
        'ub.total_price',
        'ub.created_at'
      )
      .joinRaw('agent_b2c.users AS abu ON abu.id = ub.user_id')
      .leftJoin('umrah_package AS up', 'up.id', 'ub.umrah_id')
      .where((qb) => {
        qb.where('ub.source_type', SOURCE_AGENT_B2C).andWhere(
          'ub.source_id',
          query.agency_id
        );
        if (query.user_id) {
          qb.andWhere('ub.user_id', query.user_id);
        }
        if (query.status) {
          qb.andWhere('ub.status', query.status);
        }
        if (query.from_date && query.to_date) {
          qb.andWhereBetween('ub.created_at', [query.from_date, query.to_date]);
        }
      })
      .limit(query.limit ? parseInt(query.limit) : DATA_LIMIT)
      .offset(query.skip ? parseInt(query.skip) : 0);

    let total: any[] = [];

    if (need_total) {
      total = await this.db('umrah_booking AS ub')
        .count('* AS total')
        .withSchema(this.SERVICE_SCHEMA)
        .where((qb) => {
          qb.where('ub.source_type', SOURCE_AGENT_B2C).andWhere(
            'ub.source_id',
            query.agency_id
          );
          if (query.user_id) {
            qb.andWhere('ub.user_id', query.user_id);
          }
          if (query.status) {
            qb.andWhere('ub.status', query.status);
          }
          if (query.from_date && query.to_date) {
            qb.andWhereBetween('ub.created_at', [
              query.from_date,
              query.to_date,
            ]);
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingleAgentB2CUmrahBookingDetails(
    query: IGetAgentB2CSingleUmrahBookingQuery
  ) {
    return await this.db('umrah_booking AS ub')
      .select(
        'ub.*',
        'up.title AS umrah_title',
        'up.short_description AS umrah_short_description',
        'abu.name AS user_name'
      )
      .joinRaw('agent_b2c.users AS abu ON abu.id = ub.user_id')
      .leftJoin('umrah_package AS up', 'up.id', 'ub.umrah_id')
      .andWhere('ub.id', query.id)
      .andWhere('ub.source_id', query.source_id)
      .andWhere('ub.source_type', SOURCE_AGENT_B2C)
      .first();
  }

  public async insertUmrahBookingContact(payload: IInsertUmrahBookingContact) {
    return await this.db('umrah_booking_contacts')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  public async getUmrahBookingContacts(
    bookingId: number
  ): Promise<IGetUmrahBookingContactData[]> {
    return await this.db('umrah_booking_contacts')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'name', 'email', 'phone', 'address')
      .where('booking_id', bookingId)
      .first();
  }
}
