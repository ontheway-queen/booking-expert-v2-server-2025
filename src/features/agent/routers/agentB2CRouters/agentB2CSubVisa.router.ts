import AbstractRouter from '../../../../abstract/abstract.router';
import { AgentB2CSubVisaController } from '../../controllers/agentB2CControllers/agentB2CSubVisa.controller';

export default class AgentB2CSubVisaRouter extends AbstractRouter {
  private controller = new AgentB2CSubVisaController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_VISA_FILES),
        this.controller.createVisa
      );
  }
}
