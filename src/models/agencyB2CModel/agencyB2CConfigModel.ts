import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateAgencyB2CHeroBgContentPayload,
  ICreateAgencyB2CPopularPlace,
  ICreateAgencyB2CSiteConfig,
  ICreateAgencyB2CSocialLink,
  IGetAgencyB2CHeroBgContentData,
  IGetAgencyB2CHeroBgContentQuery,
  IGetAgencyB2CPopularDestinationData,
  IGetAgencyB2CPopularDestinationLastNoData,
  IGetAgencyB2CPopularDestinationQuery,
  ICreateAgencyB2CPopularDestinationPayload,
  IUpdateAgencyB2CHeroBgContentPayload,
} from '../../utils/modelTypes/agencyB2CModelTypes/agencyB2CconfigModel.types';

export default class AgencyB2CConfigModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertHeroBGContent(
    payload:
      | ICreateAgencyB2CHeroBgContentPayload
      | ICreateAgencyB2CHeroBgContentPayload[]
  ) {
    return await this.db('hero_bg_content')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .insert(payload);
  }

  public async getHeroBGContent(
    query: IGetAgencyB2CHeroBgContentQuery
  ): Promise<IGetAgencyB2CHeroBgContentData[]> {
    return await this.db('hero_bg_content')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .orderBy('order_no', 'asc')
      .andWhere('agency_id', query.agency_id)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
        if (query.type) {
          qb.andWhere('type', query.type);
        }
      });
  }

  public async checkHeroBGContent(query: {
    agency_id: number;
    id: number;
  }): Promise<IGetAgencyB2CHeroBgContentData[]> {
    return await this.db('hero_bg_content')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .orderBy('order_no', 'asc')
      .andWhere('agency_id', query.agency_id)
      .andWhere('id', query.id);
  }

  public async getHeroBGContentLastNo(query: {
    agency_id: number;
  }): Promise<IGetAgencyB2CHeroBgContentData | null> {
    return await this.db('hero_bg_content')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .where('agency_id', query.agency_id)
      .orderBy('order_no', 'desc')
      .first();
  }

  public async updateHeroBGContent(
    payload: IUpdateAgencyB2CHeroBgContentPayload,
    where: {
      agency_id: number;
      id: number;
    }
  ) {
    return await this.db('hero_bg_content')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .update(payload)
      .where('agency_id', where.agency_id)
      .where('id', where.id);
  }

  public async deleteHeroBGContent(where: { agency_id: number; id: number }) {
    return await this.db('hero_bg_content')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .del()
      .where('agency_id', where.agency_id)
      .where('id', where.id);
  }

  public async insertPopularDestination(
    payload:
      | ICreateAgencyB2CPopularDestinationPayload
      | ICreateAgencyB2CPopularDestinationPayload[]
  ) {
    return await this.db('popular_destination')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .insert(payload);
  }

  public async getPopularDestination(
    query: IGetAgencyB2CPopularDestinationQuery
  ): Promise<IGetAgencyB2CPopularDestinationData[]> {
    return await this.db('popular_destination AS pd')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select(
        'pd.*',
        'c.name AS country_name',
        'da.name AS from_airport_name',
        'da.iata_code AS from_airport_code',
        'aa.name AS to_airport_name',
        'aa.iata_code AS to_airport_code'
      )
      .joinRaw(`LEFT JOIN dbo.country AS c ON pd.country_id = c.id`)
      .joinRaw(`LEFT JOIN public.airport AS da ON pd.from_airport = da.id`)
      .joinRaw(`LEFT JOIN public.airport AS aa ON pd.to_airport = aa.id`)
      .orderBy('pd.order_no', 'asc')
      .andWhere('pd.agency_id', query.agency_id)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere('pd.status', query.status);
        }
      });
  }

  public async checkPopularDestination(query: {
    agency_id: number;
    id: number;
  }): Promise<IGetAgencyB2CPopularDestinationLastNoData | null> {
    return await this.db('popular_destination')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .orderBy('order_no', 'asc')
      .andWhere('agency_id', query.agency_id)
      .andWhere('id', query.id)
      .first();
  }

  public async getPopularDestinationLastNo(query: {
    agency_id: number;
  }): Promise<IGetAgencyB2CPopularDestinationLastNoData | null> {
    return await this.db('popular_destination')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .where('agency_id', query.agency_id)
      .orderBy('order_no', 'desc')
      .first();
  }

  public async updatePopularDestination(
    payload: IUpdateAgencyB2CHeroBgContentPayload,
    where: {
      agency_id: number;
      id: number;
    }
  ) {
    return await this.db('popular_destination')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .update(payload)
      .where('agency_id', where.agency_id)
      .where('id', where.id);
  }

  public async deletePopularDestination(where: {
    agency_id: number;
    id: number;
  }) {
    return await this.db('hero_bg_content')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .del()
      .where('agency_id', where.agency_id)
      .where('id', where.id);
  }

  public async insertPopularPlaces(
    payload: ICreateAgencyB2CPopularPlace | ICreateAgencyB2CPopularPlace[]
  ) {
    return await this.db('popular_places')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .insert(payload);
  }

  public async insertSiteConfig(payload: ICreateAgencyB2CSiteConfig) {
    return await this.db('site_config')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .insert(payload);
  }

  public async insertSocialLink(
    payload: ICreateAgencyB2CSocialLink | ICreateAgencyB2CSocialLink[]
  ) {
    return await this.db('social_links')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .insert(payload);
  }
}
