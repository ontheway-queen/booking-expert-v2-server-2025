import { Knex } from 'knex';
import { db } from '../app/database';
import Models from '../models/rootModel';
import ManageFile from '../utils/lib/manageFile';
import ResMsg from '../utils/miscellaneous/responseMessage';
import StatusCode from '../utils/miscellaneous/statusCode';
import { ICreateAdminAuditTrailPayload } from '../utils/modelTypes/adminModelTypes/adminModel.types';
import { ICreateAgentAuditTrailPayload } from '../utils/modelTypes/agentModel/agencyModelTypes';

abstract class AbstractServices {
  protected db = db;
  protected manageFile = new ManageFile();
  protected ResMsg = ResMsg;
  protected StatusCode = StatusCode;
  protected Model = new Models();

  protected async insertAdminAudit(
    trx: Knex.Transaction,
    payload: ICreateAdminAuditTrailPayload
  ) {
    const adminModel = this.Model.AdminModel(trx);

    await adminModel.createAudit(payload);
  }

  protected async insertAgentAudit(
    trx: Knex.Transaction,
    payload: ICreateAgentAuditTrailPayload
  ) {
    const agentModel = this.Model.AgencyModel(trx);

    await agentModel.createAudit(payload);
  }
}

export default AbstractServices;
