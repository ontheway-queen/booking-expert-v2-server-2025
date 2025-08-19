import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateVisaApplicationPayload,
  ICreateVisaApplicationTracking,
  ICreateVisaApplicationTraveler,
  IGetAgentB2CSingleVisaApplicationForAgentQuery,
  IGetAgentB2CSingleVisaApplicationQuery,
  IGetAgentB2CVisaApplicationData,
  IGetAgentB2CVisaApplicationQuery,
  IGetAllAgentB2CVisaApplicationData,
  IGetAllAgentB2CVisaApplicationQuery,
} from '../../utils/modelTypes/visa/visaApplicationModel.types';

export default class VisaApplicationModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createVisaApplication(payload: ICreateVisaApplicationPayload) {
    return await this.db('visa_application').withSchema(this.SERVICE_SCHEMA).insert(payload, 'id');
  }

  public async createVisaApplicationTracking(
    payload: ICreateVisaApplicationTracking | ICreateVisaApplicationTracking[]
  ) {
    return await this.db('visa_application_tracking')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  public async createVisaApplicationTraveler(
    payload: ICreateVisaApplicationTraveler | ICreateVisaApplicationTraveler[]
  ) {
    return await this.db('visa_application_traveller')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  //get agent b2c all application list
  public async getAgentB2CVisaApplicationList(
    query: IGetAgentB2CVisaApplicationQuery
  ): Promise<{ data: IGetAgentB2CVisaApplicationData[]; total: number }> {
    const result = await this.db('visa_application as va')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'va.id',
        'va.application_ref',
        'v.title',
        'vt.name as visa_type',
        'vm.name as visa_mode',
        'c.nice_name as country_name',
        'va.status',
        'va.traveler',
        'va.application_date'
      )
      .leftJoin('visa as v', 'va.visa_id', 'v.id')
      .leftJoin('visa_type as vt', 'v.visa_type_id', 'vt.id')
      .leftJoin('visa_mode as vm', 'v.visa_mode_id', 'vm.id')
      .joinRaw(`LEFT JOIN public.country AS c ON v.country_id = c.id`)
      .where((qb) => {
        qb.andWhere('va.source_id', query.source_id);
        qb.andWhere('va.source_type', query.source_type);
        qb.andWhere('va.user_id', query.user_id);

        if (query.from_date && query.to_date) {
          qb.andWhereBetween('va.application_date', [query.from_date, query.to_date]);
        }

        if (query.status) {
          qb.andWhere('va.status', query.status);
        }

        if (query.filter) {
          qb.andWhere((subQb) => {
            subQb
              .andWhere('va.contact_email', 'Ilike', `%${query.filter}%`)
              .orWhere('va.nationality', 'Ilike', `%${query.filter}%`)
              .orWhere('va.residence', 'Ilike', `%${query.filter}%`)
              .orWhere('va.contact_number', 'Ilike', `%${query.filter}%`)
              .orWhere('va.application_ref', 'Ilike', `%${query.filter}%`);
          });
        }
      })
      .limit(query.limit || 100)
      .offset(query.skip || 0)
      .orderBy('va.application_date', 'desc');

    const total = await this.db('visa_application as va')
      .withSchema(this.SERVICE_SCHEMA)
      .count('va.id as total')
      .where((qb) => {
        qb.andWhere('va.source_id', query.source_id);
        qb.andWhere('va.source_type', query.source_type);
        qb.andWhere('va.user_id', query.user_id);

        if (query.from_date && query.to_date) {
          qb.andWhereBetween('va.application_date', [query.from_date, query.to_date]);
        }

        if (query.status) {
          qb.andWhere('va.status', query.status);
        }

        if (query.filter) {
          qb.andWhere((subQb) => {
            subQb
              .andWhere('va.contact_email', 'Ilike', `%${query.filter}%`)
              .orWhere('va.nationality', 'Ilike', `%${query.filter}%`)
              .orWhere('va.residence', 'Ilike', `%${query.filter}%`)
              .orWhere('va.contact_number', 'Ilike', `%${query.filter}%`)
              .orWhere('va.application_ref', 'Ilike', `%${query.filter}%`);
          });
        }
      });

    return { data: result, total: Number(total[0].total) };
  }

  // get agent b2c single application
  public async getAgentB2CSingleVisaApplication(query: IGetAgentB2CSingleVisaApplicationQuery) {
    return await this.db('visa_application as va')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'va.id',
        'v.title',
        'vt.name as visa_type',
        'vm.name as visa_mode',
        'c.nice_name as country_name',
        'va.application_ref',
        'va.from_date',
        'va.to_date',
        'va.visa_fee',
        'va.processing_fee',
        'va.traveler',
        'va.payable',
        'va.status',
        'va.application_date'
      )
      .leftJoin('visa as v', 'va.visa_id', 'v.id')
      .leftJoin('visa_type as vt', 'v.visa_type_id', 'vt.id')
      .leftJoin('visa_mode as vm', 'v.visa_mode_id', 'vm.id')
      .joinRaw(`LEFT JOIN public.country AS c ON v.country_id = c.id`)
      .where((qb) => {
        qb.andWhere('va.source_id', query.source_id);
        qb.andWhere('va.source_type', query.source_type);
        qb.andWhere('va.id', query.id);
        qb.andWhere('va.user_id', query.user_id);
      })
      .first();
  }

  //get agent b2c single application traveler
  public async getAgentB2CSingleVisaApplicationTraveler(query: { application_id: number }) {
    console.log('application_id', query.application_id);
    return await this.db('visa_application_traveller as vat')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'vat.id',
        'vat.title',
        'vat.type',
        'vat.first_name',
        'vat.last_name',
        'vat.date_of_birth',
        'vat.passport_number',
        'vat.passport_expiry_date',
        'vat.passport_type',
        'vat.city',
        'c.nice_name as country',
        'vat.address',
        'vat.required_fields'
      )
      .joinRaw(`LEFT JOIN public.country AS c ON vat.country_id = c.id`)
      .where((qb) => {
        qb.andWhere('vat.application_id', query.application_id);
      });
  }

  //get all agent b2c visa application
  public async getAllAgentB2CVisaApplication(
    query: IGetAllAgentB2CVisaApplicationQuery
  ): Promise<{ data: IGetAllAgentB2CVisaApplicationData[]; total: number }> {
    const result = await this.db('visa_application as va')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'va.id',
        'va.application_ref',
        'v.title',
        'vt.name as visa_type',
        'vm.name as visa_mode',
        'c.nice_name as country_name',
        'u.name as applicant_name',
        'va.status',
        'va.traveler',
        'va.application_date'
      )
      .leftJoin('visa as v', 'va.visa_id', 'v.id')
      .leftJoin('visa_type as vt', 'v.visa_type_id', 'vt.id')
      .leftJoin('visa_mode as vm', 'v.visa_mode_id', 'vm.id')
      .joinRaw(`LEFT JOIN public.country AS c ON v.country_id = c.id`)
      .joinRaw(`LEFT JOIN agent_b2c.users as u ON va.user_id = u.id`)
      .where((qb) => {
        qb.andWhere('va.source_id', query.source_id);
        qb.andWhere('va.source_type', query.source_type);

        if (query.from_date && query.to_date) {
          qb.andWhereBetween('va.application_date', [query.from_date, query.to_date]);
        }

        if (query.status) {
          qb.andWhere('va.status', query.status);
        }

        if (query.filter) {
          qb.andWhere((subQb) => {
            subQb
              .andWhere('va.contact_email', 'Ilike', `%${query.filter}%`)
              .orWhere('va.nationality', 'Ilike', `%${query.filter}%`)
              .orWhere('va.residence', 'Ilike', `%${query.filter}%`)
              .orWhere('va.contact_number', 'Ilike', `%${query.filter}%`)
              .orWhere('va.application_ref', 'Ilike', `%${query.filter}%`);
          });
        }
      })
      .limit(query.limit || 100)
      .offset(query.skip || 0)
      .orderBy('va.application_date', 'desc');

    const total = await this.db('visa_application as va')
      .withSchema(this.SERVICE_SCHEMA)
      .count('va.id as total')
      .where((qb) => {
        qb.andWhere('va.source_id', query.source_id);
        qb.andWhere('va.source_type', query.source_type);

        if (query.from_date && query.to_date) {
          qb.andWhereBetween('va.application_date', [query.from_date, query.to_date]);
        }

        if (query.status) {
          qb.andWhere('va.status', query.status);
        }

        if (query.filter) {
          qb.andWhere((subQb) => {
            subQb
              .andWhere('va.contact_email', 'Ilike', `%${query.filter}%`)
              .orWhere('va.nationality', 'Ilike', `%${query.filter}%`)
              .orWhere('va.residence', 'Ilike', `%${query.filter}%`)
              .orWhere('va.contact_number', 'Ilike', `%${query.filter}%`)
              .orWhere('va.application_ref', 'Ilike', `%${query.filter}%`);
          });
        }
      });

    return { data: result, total: Number(total[0].total) };
  }


    // get agent b2c single application
  public async getAgentB2CSingleVisaApplicationForAgent(query: IGetAgentB2CSingleVisaApplicationForAgentQuery) {
    return await this.db('visa_application as va')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'va.id',
        'v.title',
        'vt.name as visa_type',
        'vm.name as visa_mode',
        'c.nice_name as country_name',
        'va.application_ref',
        'va.from_date',
        'va.to_date',
        'va.visa_fee',
        'va.processing_fee',
        'va.traveler',
        'va.payable',
        'va.status',
        'va.application_date',
        'va.contact_email',
        'va.contact_number',
        'va.whatsapp_number',
        'va.nationality',
        'va.residence',
      )
      .leftJoin('visa as v', 'va.visa_id', 'v.id')
      .leftJoin('visa_type as vt', 'v.visa_type_id', 'vt.id')
      .leftJoin('visa_mode as vm', 'v.visa_mode_id', 'vm.id')
      .joinRaw(`LEFT JOIN public.country AS c ON v.country_id = c.id`)
      .where((qb) => {
        qb.andWhere('va.source_id', query.source_id);
        qb.andWhere('va.source_type', query.source_type);
        qb.andWhere('va.id', query.id);
      })
      .first();
  }
}
