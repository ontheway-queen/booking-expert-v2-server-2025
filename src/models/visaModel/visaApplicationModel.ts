import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateVisaApplicationPayload,
  ICreateVisaApplicationTracking,
  ICreateVisaApplicationTraveler,
} from '../../utils/modelTypes/visa/visaApplicationModel.types';

export default class VisaApplicationModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createVisaApplication(payload: ICreateVisaApplicationPayload) {
    return await this.db('visa_application')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
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
    return await this.db('visa_application_traveler')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }
}
