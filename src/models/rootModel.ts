import { Knex } from 'knex';
import CommonModel from './commonModel/commonModel';
import { db } from '../app/database';
import AdminModel from './adminModel/adminModel';
import AgencyB2CUserModel from './agencyB2CModel/agencyB2CUserModel';
import AgencyModel from './agentModel/agencyModel';
import AgencyUserModel from './agentModel/agencyUserModel';
import B2CUserModel from './b2cModel/b2cUserModel';

export default class Models {
  //Common model
  public CommonModel(trx?: Knex.Transaction) {
    return new CommonModel(trx || db);
  }

  //Admin Model
  public AdminModel(trx?: Knex.Transaction) {
    return new AdminModel(trx || db);
  }

  //Agency B2C Users Model
  public AgencyB2CUserModel(trx?: Knex.Transaction) {
    return new AgencyB2CUserModel(trx || db);
  }

  //Agency Model
  public AgencyModel(trx?: Knex.Transaction) {
    return new AgencyModel(trx || db);
  }

  //Agency User Model
  public AgencyUserModel(trx?: Knex.Transaction) {
    return new AgencyUserModel(trx || db);
  }

  //booking request models
  public B2CUserModel(trx?: Knex.Transaction) {
    return new B2CUserModel(trx || db);
  }
}
