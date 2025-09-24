import AbstractRouter from '../../../abstract/abstract.router';
import AuthChecker from '../../../middleware/authChecker/authChecker';
import { SubAgentCVisaController } from '../controllers/subAgentVisa.controller';

export default class SubAgentVisaRouter extends AbstractRouter {
  private controller = new SubAgentCVisaController();
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
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_B2C_VISA_FILES),
        this.controller.createVisaApplication
      );

    //Get visa Type
    this.router.route('/visa-type').get(this.controller.getAllVisaType);
    //Get all visa created country
    this.router.route('/country').get(this.controller.getAllVisaCreatedCountry);

    //get all visa application
    this.router
      .route('/applications')
      .get(this.controller.getVisaApplicationList);

    //get single visa application
    this.router
      .route('/application/:id')
      .get(this.controller.getSingleVisaApplication);

    //get single visa
    this.router.route('/:slug').get(this.controller.getSingleVisa);
  }
}
