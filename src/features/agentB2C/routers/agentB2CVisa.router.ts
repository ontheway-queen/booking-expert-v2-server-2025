import AbstractRouter from '../../../abstract/abstract.router';
import AuthChecker from '../../../middleware/authChecker/authChecker';
import { AgentB2CVisaController } from '../controllers/agentB2CVisa.controller';

export default class AgentB2CVisaRouter extends AbstractRouter {
  private controller = new AgentB2CVisaController();
  private authChecker = new AuthChecker();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/').get(this.controller.getAllVisaList);

    this.router
      .route('/:id/application')
      .post(
        // this.authChecker.agencyB2CUserAuthChecker,
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_B2C_VISA_FILES),
        this.controller.createVisaApplication
      );

    this.router.route('/:slug').get(this.controller.getSingleVisa);
  }
}
