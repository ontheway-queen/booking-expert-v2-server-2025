import AbstractRouter from '../../../abstract/abstract.router';
import { AgentSubAgentController } from '../controllers/agentSubAgent.controller';

export default class AgentSubAgentRouter extends AbstractRouter {
  private controller = new AgentSubAgentController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_FILES, [
          'agency_logo',
          'civil_aviation',
          'trade_license',
          'national_id',
        ]),
        this.controller.createSubAgency
      )
      .get(this.controller.getAllSubAgency);

    this.router
      .route('/:id')
      .get(this.controller.getSingleSubAgency)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_FILES, [
          'agency_logo',
          'civil_aviation',
          'trade_license',
          'national_id',
        ]),
        this.controller.updateAgency
      );

    this.router.route('/:id/users').get(this.controller.getAllUsersOfAgency);
  }
}
