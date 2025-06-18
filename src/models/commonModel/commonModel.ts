import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { OTP_DEFAULT_EXPIRY } from '../../utils/miscellaneous/constants';
import { PRIORITY_AIRPORTS } from '../../utils/miscellaneous/flightConstent';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateAirlinesPayload,
  ICreateAirportPayload,
  IGetLastIdData,
  IGetLastIdParams,
  IGetOTPPayload,
  IInsertLastNoPayload,
  IInsertOTPPayload,
  IUpdateAirlinesPayload,
  IUpdateAirportPayload,
  IUpdateLastNoPayload,
} from '../../utils/modelTypes/commonModelTypes/commonModelTypes';

class CommonModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // get otp
  public async getOTP(payload: IGetOTPPayload) {
    const check = await this.db('email_otp')
      .withSchema(this.DBO_SCHEMA)
      .select('id', 'hashed_otp as otp', 'tried')
      .andWhere('email', payload.email)
      .andWhere('type', payload.type)
      .andWhere('matched', 0)
      .andWhereRaw(
        `"create_date" + interval '${OTP_DEFAULT_EXPIRY} minutes' > NOW()`
      )
      .andWhere((qb) => {
        if (payload.agency_id) {
          qb.andWhere('agency_id', payload.agency_id);
        }
      });

    return check;
  }

  // insert OTP
  public async insertOTP(payload: IInsertOTPPayload) {
    return await this.db('email_otp')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  // update otp
  public async updateOTP(
    payload: { tried: number; matched?: number },
    where: { id: number; agency_id?: number }
  ) {
    return await this.db('email_otp')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where('id', where.id)
      .andWhere((qb) => {
        if (where.agency_id) {
          qb.andWhere('agency_id', where.agency_id);
        }
      });
  }

  // Get Env Variable
  public async getEnv(key: string) {
    const data = await this.db('variable_env')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where({ key });
    if (data.length) {
      return data[0].value;
    } else {
      throw new Error(`Env variable ${key} not found!`);
    }
  }

  // update env variable
  public async updateEnv(key: string, value: string) {
    return await this.db('variable_env')
      .withSchema(this.DBO_SCHEMA)
      .update({ value })
      .where({ key });
  }

  public async insertLastNo(payload: IInsertLastNoPayload) {
    return await this.db('last_no')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateLastNo(payload: IUpdateLastNoPayload, id: number) {
    return await this.db('last_no')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where('id', id);
  }

  public async getLastId({
    type,
  }: IGetLastIdParams): Promise<IGetLastIdData | null> {
    return await this.db('last_no')
      .withSchema(this.DBO_SCHEMA)
      .select('id', 'last_id')
      .where('type', type)
      .first();
  }

  // Get airlines
  public async getAirlineByCode(
    airlineCode: string
  ): Promise<{ name: string; logo: string }> {
    const airline = await this.db('airlines')
      .withSchema(this.PUBLIC_SCHEMA)
      .select('name', 'logo')
      .where((qb) => {
        if (airlineCode) {
          qb.andWhere('code', airlineCode);
        }
      })
      .first();
    if (airline) {
      return airline;
    } else {
      return {
        name: 'Not available',
        logo: 'Not available',
      };
    }
  }

  // Get airlines
  public async getAirlineById(
    id: number
  ): Promise<{ id: number; name: string; logo: string } | null> {
    return await this.db('airlines')
      .withSchema(this.PUBLIC_SCHEMA)
      .select('id', 'name', 'logo')
      .where('id', id)
      .first();
  }

  // Aircraft details by code
  public async getAircraft(code: string) {
    const aircraft = await this.db
      .select('*')
      .from('aircraft')
      .withSchema(this.PUBLIC_SCHEMA)
      .where('code', code);

    if (aircraft.length) {
      return aircraft[0];
    } else {
      return { code: code, name: 'Not available' };
    }
  }

  //get all country
  public async getCountry(payload: { id?: number; name?: string }) {
    return await this.db('country')
      .withSchema(this.PUBLIC_SCHEMA)
      .select('id', 'name', 'iso', 'iso3', 'phone_code')
      .where((qb) => {
        if (payload.id) {
          qb.where('id', payload.id);
        }
        if (payload.name) {
          qb.andWhereILike('name', `%${payload.name}%`);
        }
      })
      .orderBy('name', 'asc');
  }

  //get all city
  public async getCity({
    country_id,
    limit,
    skip,
    filter,
    code,
  }: {
    country_id?: number;
    limit?: number;
    skip?: number;
    filter?: string;
    code?: string;
  }) {
    return await this.db('city AS c')
      .withSchema(this.PUBLIC_SCHEMA)
      .select('c.id', 'c.name', 'co.name AS country_name')
      .leftJoin('country AS co', 'c.country_id', 'co.id')
      .where((qb) => {
        if (country_id) {
          qb.andWhere('c.country_id', country_id);
        }

        if (code) {
          qb.orWhere('c.code', code);
        }

        if (filter) {
          qb.andWhere((qqb) => {
            qqb.orWhere('c.name', 'ilike', `%${filter}%`);
            qqb.orWhere('c.code', filter);
          });
        }
      })
      .orderBy('c.name', 'asc')
      .limit(limit || 100)
      .offset(skip || 0);
  }

  //insert city
  public async insertCity(payload: {
    country_id: number;
    name: string;
    code?: string;
    lat?: string;
    lng?: string;
  }) {
    return await this.db('city')
      .withSchema(this.PUBLIC_SCHEMA)
      .insert(payload, 'id');
  }

  // update city
  public async updateCity(
    payload: {
      country_id?: number;
      name?: string;
      code?: string;
      lat?: string;
      lng?: string;
    },
    id: number
  ) {
    return await this.db('city')
      .withSchema(this.PUBLIC_SCHEMA)
      .update(payload)
      .where('id', id);
  }

  // delete city
  public async deleteCity(id: number) {
    return await this.db('city')
      .withSchema(this.PUBLIC_SCHEMA)
      .delete()
      .where('id', id);
  }

  //insert airport
  public async insertAirport(payload: ICreateAirportPayload) {
    return await this.db('airport')
      .withSchema(this.PUBLIC_SCHEMA)
      .insert(payload, 'id');
  }

  //get all airport
  public async getAirport(
    params: {
      country_id?: number;
      name?: string;
      code?: string;
      limit?: number;
      skip?: number;
    },
    total: boolean = false
  ) {
    const data = await this.db('airport as air')
      .withSchema(this.PUBLIC_SCHEMA)
      .select(
        'air.id',
        'air.country_id',
        'cou.name as country',
        'air.name',
        'air.iata_code',
        'ct.id as city_id',
        'ct.name as city_name'
      )
      .join('country as cou', 'cou.id', 'air.country_id')
      .leftJoin('city as ct', 'ct.id', 'air.city')
      .where((qb) => {
        if (params.country_id) {
          qb.where('air.country_id', params.country_id);
        }
        if (params.code) {
          qb.orWhere('air.iata_code', params.code);
        }
        qb.andWhere((qqb) => {
          if (params.name) {
            qqb.orWhere('air.iata_code', params.name.toUpperCase());

            qqb.orWhereILike('air.name', `${params.name}%`);

            qqb.orWhereILike('cou.name', `${params.name}%`);

            qqb.orWhereILike('ct.name', `${params.name}%`);
          }
        });
      })
      .orderByRaw(
        `ARRAY_POSITION(ARRAY[${PRIORITY_AIRPORTS.map(() => '?').join(
          ', '
        )}]::TEXT[], air.iata_code) ASC NULLS LAST, air.id ASC`,
        PRIORITY_AIRPORTS
      )
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0)
      .orderBy('air.id', 'asc');

    let count: any[] = [];

    if (total) {
      count = await this.db('airport as air')
        .withSchema(this.PUBLIC_SCHEMA)
        .count('air.id as total')
        .join('country as cou', 'cou.id', 'air.country_id')
        .where((qb) => {
          if (params.country_id) {
            qb.where('air.country_id', params.country_id);
          }

          if (params.code) {
            qb.orWhere('air.iata_code', params.code);
          }

          qb.andWhere((qqb) => {
            if (params.name) {
              qqb.orWhere('air.iata_code', params.name.toUpperCase());

              qqb.orWhereILike('air.name', `${params.name}%`);

              qqb.orWhereILike('cou.name', `${params.name}%`);

              qqb.orWhereILike('ct.name', `${params.name}%`);
            }
          });
        });
    }
    return { data, total: count[0]?.total };
  }

  //update airport
  public async updateAirport(payload: IUpdateAirportPayload, id: number) {
    return await this.db('airport')
      .withSchema(this.PUBLIC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //delete airport
  public async deleteAirport(id: number) {
    return await this.db('airport')
      .withSchema(this.PUBLIC_SCHEMA)
      .delete()
      .where({ id });
  }

  //insert airline
  public async insertAirline(payload: ICreateAirlinesPayload) {
    return await this.db('airlines')
      .withSchema(this.PUBLIC_SCHEMA)
      .insert(payload, 'id');
  }

  //get all airlines
  public async getAirlines(
    params: { code?: string; name?: string; limit?: number; skip?: number },
    total: boolean
  ) {
    const data = await this.db('airlines as air')
      .withSchema(this.PUBLIC_SCHEMA)
      .select('air.id', 'air.code', 'air.name', 'air.logo')
      .where((qb) => {
        if (params.code) {
          qb.where('air.code', params.code);
        }
        qb.andWhere((qqb) => {
          if (params.name) {
            if (params.name.length === 2) {
              qqb.andWhere('air.code', params.name);
            } else {
              qqb.andWhere('air.name', 'ilike', `%${params.name}%`);
            }
          }
        });
      })
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0)
      .orderBy('air.id', 'asc');

    let count: any[] = [];
    if (total) {
      count = await this.db('airlines as air')
        .withSchema(this.PUBLIC_SCHEMA)
        .count('air.id as total')
        .where((qb) => {
          if (params.code) {
            qb.where('air.code', params.code);
          }

          qb.andWhere((qqb) => {
            if (params.name) {
              if (params.name.length === 2) {
                qqb.andWhere('air.code', params.name);
              } else {
                qqb.andWhere('air.name', 'ilike', `%${params.name}%`);
              }
            }
          });
        });
    }
    return { data, total: count[0]?.total };
  }

  //update airlines
  public async updateAirlines(payload: IUpdateAirlinesPayload, id: number) {
    return await this.db('airlines')
      .withSchema(this.PUBLIC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //delete airlines
  public async deleteAirlines(id: number) {
    return await this.db('airlines')
      .withSchema(this.PUBLIC_SCHEMA)
      .delete()
      .where({ id });
  }
}
export default CommonModel;
