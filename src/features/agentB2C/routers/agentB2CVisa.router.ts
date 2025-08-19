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
    //get all visa list
    this.router.route('/').get(this.controller.getAllVisaList);

    //create visa application
    this.router
      .route('/:id/application')
      .post(
        this.authChecker.agencyB2CUserAuthChecker,
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_B2C_VISA_FILES),
        this.controller.createVisaApplication
      );

    //Get visa Type
    this.router.route('/visa-type').get(this.controller.getAllVisaType);

    //get all visa application
    this.router
      .route('/applications')
      .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.getVisaApplicationList);

    //get single visa application
    this.router
      .route('/application/:id')
      .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.getSingleVisaApplication);

    //get single visa
    this.router.route('/:slug').get(this.controller.getSingleVisa);
  }
}
