import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateAgencyB2CHeroBgContentPayload,
  ICreateAgencyB2CPopularPlace,
  ICreateAgencyB2CSiteConfig,
  IGetAgencyB2CHeroBgContentData,
  IGetAgencyB2CHeroBgContentQuery,
  IGetAgencyB2CPopularDestinationData,
  IGetAgencyB2CPopularDestinationLastNoData,
  IGetAgencyB2CPopularDestinationQuery,
  ICreateAgencyB2CPopularDestinationPayload,
  IUpdateAgencyB2CHeroBgContentPayload,
  ICreateAgencyB2CHotDeals,
  ICreateAgencyB2CPopUpBanner,
  IGetAgencyB2CPopularPlaceQuery,
  IGetAgencyB2CPopularPlaceData,
  IUpdateAgencyB2CPopularPlace,
  IGetAgencyB2CSiteConfigData,
  IUpdateAgencyB2CSiteConfigPayload,
  IGetAgencyB2CSocialLinkQuery,
  IGetAgencyB2CSocialLinkData,
  ICreateAgencyB2CSocialLinkPayload,
  IUpdateAgencyB2CSocialLinkPayload,
  IGetAgencyB2CHotDealsQuery,
  IGetAgencyB2CHotDealsData,
  IUpdateAgencyB2CHotDealsPayload,
  IGetAgencyB2CPopUpBannerQuery,
  IGetAgencyB2CPopUpBannerData,
  IUpdateAgencyB2CPopUpBannerPayload,
  IUpdateAgencyB2CPopularDestinationPayload,
} from '../../utils/modelTypes/agencyB2CModelTypes/agencyB2CConfigModel.types';

export default class AgencyB2CConfigModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertHeroBGContent(
    payload: ICreateAgencyB2CHeroBgContentPayload | ICreateAgencyB2CHeroBgContentPayload[]
  ) {
    return await this.db('hero_bg_content').withSchema(this.AGENT_B2C_SCHEMA).insert(payload, 'id');
  }

  public async getHeroBGContent(
    query: IGetAgencyB2CHeroBgContentQuery
  ): Promise<IGetAgencyB2CHeroBgContentData[]> {
    return await this.db('hero_bg_content')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .orderBy('order_number', 'asc')
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
      .orderBy('order_number', 'asc')
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
      .orderBy('order_number', 'desc')
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
    payload: ICreateAgencyB2CPopularDestinationPayload | ICreateAgencyB2CPopularDestinationPayload[]
  ) {
    return await this.db('popular_destination').withSchema(this.AGENT_B2C_SCHEMA).insert(payload);
  }

  public async getPopularDestination(
    query: IGetAgencyB2CPopularDestinationQuery
  ): Promise<IGetAgencyB2CPopularDestinationData[]> {
    return await this.db('popular_destination AS pd')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select(
        'pd.*',
        'dc.name AS from_airport_country',
        'dci.name AS from_airport_city',
        'da.name AS from_airport_name',
        'da.iata_code AS from_airport_code',
        'aa.name AS to_airport_name',
        'aa.iata_code AS to_airport_code',
        'ac.name AS to_airport_country',
        'aci.name AS to_airport_city'
      )
      .joinRaw(`LEFT JOIN public.airport AS da ON pd.from_airport = da.id`)
      .joinRaw(`LEFT JOIN public.airport AS aa ON pd.to_airport = aa.id`)
      .joinRaw(`LEFT JOIN public.country AS dc ON da.country_id = dc.id`)
      .joinRaw(`LEFT JOIN public.country AS ac ON aa.country_id = ac.id`)
      .joinRaw(`LEFT JOIN public.city AS dci ON da.city = dci.id`)
      .joinRaw(`LEFT JOIN public.city AS aci ON aa.city = aci.id`)
      .orderBy('pd.order_number', 'asc')
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
      .orderBy('order_number', 'asc')
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
      .orderBy('order_number', 'desc')
      .first();
  }

  public async updatePopularDestination(
    payload: IUpdateAgencyB2CPopularDestinationPayload,
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

  public async deletePopularDestination(where: { agency_id: number; id: number }) {
    return await this.db('popular_destination')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .del()
      .where('agency_id', where.agency_id)
      .where('id', where.id);
  }

  public async insertPopularPlaces(
    payload: ICreateAgencyB2CPopularPlace | ICreateAgencyB2CPopularPlace[]
  ) {
    return await this.db('popular_places').withSchema(this.AGENT_B2C_SCHEMA).insert(payload);
  }

  public async getPopularPlaces(
    query: IGetAgencyB2CPopularPlaceQuery
  ): Promise<IGetAgencyB2CPopularPlaceData[]> {
    return await this.db('popular_places AS pp')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('pp.*', 'c.name AS country_name')
      .joinRaw(`LEFT JOIN public.country AS c ON pp.country_id = c.id`)
      .orderBy('pp.order_number', 'asc')
      .andWhere('pp.agency_id', query.agency_id)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere('pp.status', query.status);
        }
      });
  }

  public async checkPopularPlace(query: {
    agency_id: number;
    id: number;
  }): Promise<IGetAgencyB2CPopularPlaceData | null> {
    return await this.db('popular_places')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .andWhere('agency_id', query.agency_id)
      .andWhere('id', query.id)
      .first();
  }

  public async getPopularPlaceLastNo(query: {
    agency_id: number;
  }): Promise<IGetAgencyB2CPopularPlaceData | null> {
    return await this.db('popular_places')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .where('agency_id', query.agency_id)
      .orderBy('order_number', 'desc')
      .first();
  }

  public async updatePopularPlace(
    payload: IUpdateAgencyB2CPopularPlace,
    where: {
      agency_id: number;
      id: number;
    }
  ) {
    return await this.db('popular_places')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .update(payload)
      .where('agency_id', where.agency_id)
      .andWhere('id', where.id);
  }

  public async deletePopularPlace(where: { agency_id: number; id: number }) {
    return await this.db('popular_places')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .del()
      .where('agency_id', where.agency_id)
      .where('id', where.id);
  }

  public async insertSiteConfig(payload: ICreateAgencyB2CSiteConfig) {
    return await this.db('site_config').withSchema(this.AGENT_B2C_SCHEMA).insert(payload);
  }

  public async getSiteConfig(query: {
    agency_id: number;
  }): Promise<IGetAgencyB2CSiteConfigData | null> {
    return await this.db('site_config')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .where('agency_id', query.agency_id)
      .first();
  }

  public async updateConfig(
    payload: IUpdateAgencyB2CSiteConfigPayload,
    where: {
      agency_id: number;
    }
  ) {
    return await this.db('site_config')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .update(payload)
      .where('agency_id', where.agency_id);
  }

  public async insertSocialLink(
    payload: ICreateAgencyB2CSocialLinkPayload | ICreateAgencyB2CSocialLinkPayload[]
  ) {
    return await this.db('social_links').withSchema(this.AGENT_B2C_SCHEMA).insert(payload);
  }

  public async getSocialLink(
    query: IGetAgencyB2CSocialLinkQuery
  ): Promise<IGetAgencyB2CSocialLinkData[]> {
    return await this.db('social_links')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .orderBy('order_number', 'asc')
      .andWhere('agency_id', query.agency_id)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
      });
  }

  public async checkSocialLink(query: {
    agency_id: number;
    id: number;
  }): Promise<IGetAgencyB2CSocialLinkData | null> {
    return await this.db('social_links')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .andWhere('agency_id', query.agency_id)
      .andWhere('id', query.id)
      .first();
  }

  public async getSocialLinkLastNo(query: {
    agency_id: number;
  }): Promise<IGetAgencyB2CSocialLinkData | null> {
    return await this.db('social_links')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .where('agency_id', query.agency_id)
      .orderBy('order_number', 'desc')
      .first();
  }

  public async updateSocialLink(
    payload: IUpdateAgencyB2CSocialLinkPayload,
    where: {
      agency_id: number;
      id: number;
    }
  ) {
    return await this.db('social_links')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .update(payload)
      .where('agency_id', where.agency_id)
      .andWhere('id', where.id);
  }

  public async deleteSocialLink(where: { agency_id: number; id: number }) {
    return await this.db('social_links')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .del()
      .where('agency_id', where.agency_id)
      .where('id', where.id);
  }

  public async insertHotDeals(payload: ICreateAgencyB2CHotDeals | ICreateAgencyB2CHotDeals[]) {
    return await this.db('hot_deals').withSchema(this.AGENT_B2C_SCHEMA).insert(payload);
  }

  public async getHotDeals(
    query: IGetAgencyB2CHotDealsQuery
  ): Promise<IGetAgencyB2CHotDealsData[]> {
    return await this.db('hot_deals')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .orderBy('order_number', 'asc')
      .andWhere('agency_id', query.agency_id)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
      });
  }

  public async checkHotDeals(query: {
    agency_id: number;
    id: number;
  }): Promise<IGetAgencyB2CHotDealsData | null> {
    return await this.db('hot_deals')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .andWhere('agency_id', query.agency_id)
      .andWhere('id', query.id)
      .first();
  }

  public async getHotDealsLastNo(query: {
    agency_id: number;
  }): Promise<IGetAgencyB2CHotDealsData | null> {
    return await this.db('hot_deals')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .where('agency_id', query.agency_id)
      .orderBy('order_number', 'desc')
      .first();
  }

  public async updateHotDeals(
    payload: IUpdateAgencyB2CHotDealsPayload,
    where: {
      agency_id: number;
      id: number;
    }
  ) {
    return await this.db('hot_deals')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .update(payload)
      .where('agency_id', where.agency_id)
      .andWhere('id', where.id);
  }

  public async deleteHotDeals(where: { agency_id: number; id: number }) {
    return await this.db('hot_deals')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .del()
      .where('agency_id', where.agency_id)
      .where('id', where.id);
  }

  public async insertPopUpBanner(
    payload: ICreateAgencyB2CPopUpBanner | ICreateAgencyB2CPopUpBanner[]
  ) {
    return await this.db('pop_up_banner').withSchema(this.AGENT_B2C_SCHEMA).insert(payload);
  }

  public async getPopUpBanner(
    query: IGetAgencyB2CPopUpBannerQuery
  ): Promise<IGetAgencyB2CPopUpBannerData[]> {
    return await this.db('pop_up_banner')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .andWhere('agency_id', query.agency_id)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
        if (query.pop_up_for) {
          qb.andWhere('pop_up_for', query.pop_up_for);
        }
      });
  }

  public async getSinglePopUpBanner(query: {
    agency_id: number;
    status: boolean;
    pop_up_for: 'AGENT' | 'B2C';
  }): Promise<IGetAgencyB2CPopUpBannerData | null> {
    return await this.db('pop_up_banner')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .select('*')
      .andWhere('agency_id', query.agency_id)
      .andWhere('status', query.status)
      .andWhere('pop_up_for', query.pop_up_for)
      .first();
  }

  public async updatePopUpBanner(
    payload: IUpdateAgencyB2CPopUpBannerPayload,
    where: {
      agency_id: number;
      pop_up_for: 'AGENT' | 'B2C';
    }
  ) {
    return await this.db('pop_up_banner')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .update(payload)
      .where('agency_id', where.agency_id)
      .andWhere('pop_up_for', where.pop_up_for);
  }

  public async deletePopUpBanner(where: { agency_id: number; id: number }) {
    return await this.db('pop_up_banner')
      .withSchema(this.AGENT_B2C_SCHEMA)
      .del()
      .where('agency_id', where.agency_id)
      .where('id', where.id);
  }

  public async createVisaType(payload: { name: string; source_id: number; source_type: string }) {
    return await this.db('visa_type').withSchema(this.SERVICE_SCHEMA).insert(payload);
  }

  public async getAllVisaType(query: { source_id: number; source_type: string }) {
    return await this.db('visa_type')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'name')
      .where('source_id', query.source_id)
      .andWhere('source_type', query.source_type);
  }

  public async getSingleVisaType(query: { id: number }) {
    return await this.db('visa_type')
      .withSchema(this.SERVICE_SCHEMA)
      .select('*')
      .where('id', query.id)
      .first();
  }

  public async getSingleVisaTypeByName(
    query: { name: string; source_id: number; source_type: string }
  ) {
    return await this.db('visa_type')
      .withSchema(this.SERVICE_SCHEMA)
      .select('*')
      .whereILike('name', query.name)
      .andWhere('source_id', query.source_id)
      .andWhere('source_type', query.source_type)
      .first();
  }

  public async deleteVisaType(where: { id: number; source_id: number; source_type: string }) {
    return await this.db('visa_type')
      .withSchema(this.SERVICE_SCHEMA)
      .del()
      .where('id', where.id)
      .andWhere('source_id', where.source_id)
      .andWhere('source_type', where.source_type);
  }

  public async createVisaMode(payload: { name: string; source_id: number; source_type: string }) {
    return await this.db('visa_mode').withSchema(this.SERVICE_SCHEMA).insert(payload);
  }

  public async getAllVisaMode(query: { source_id: number; source_type: string }) {
    return await this.db('visa_mode')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'name')
      .where('source_id', query.source_id)
      .andWhere('source_type', query.source_type);
  }

  public async getSingleVisaMode(query: { id: number }) {
    return await this.db('visa_mode')
      .withSchema(this.SERVICE_SCHEMA)
      .select('*')
      .where('id', query.id)
      .first();
  }

  public async getSingleVisaModeByName(
    query: { name: string; source_id: number; source_type: string }
  ) {
    return await this.db('visa_mode')
      .withSchema(this.SERVICE_SCHEMA)
      .select('*')
      .whereILike('name', query.name)
      .andWhere('source_id', query.source_id)
      .andWhere('source_type', query.source_type)
      .first();
  }

  public async deleteVisaMode(where: { id: number; source_id: number; source_type: string }) {
    return await this.db('visa_mode')
      .withSchema(this.SERVICE_SCHEMA)
      .del()
      .where('id', where.id)
      .andWhere('source_id', where.source_id)
      .andWhere('source_type', where.source_type);
  }
}
