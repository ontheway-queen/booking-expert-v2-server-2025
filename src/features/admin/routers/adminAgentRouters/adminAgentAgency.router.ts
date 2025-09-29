import AbstractRouter from '../../../../abstract/abstract.router';
import AdminAgentAgencyController from '../../controllers/adminAgentControllers/adminAgentAgency.controller';

export default class AdminAgentAgencyRouter extends AbstractRouter {
  private controller = new AdminAgentAgencyController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .get(this.controller.getAgency)
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_FILES, [
          'agency_logo',
          'civil_aviation',
          'trade_license',
          'national_id',
        ]),
        this.controller.createAgency
      );

    this.router
      .route('/:id')
      .get(this.controller.getSingleAgency)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_FILES, [
          'agency_logo',
          'civil_aviation',
          'trade_license',
          'national_id',
        ]),
        this.controller.updateAgency
      );

    this.router
      .route('/:agency_id/user/:user_id')
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER, ['photo']),
        this.controller.updateAgencyUser
      );

    this.router
      .route('/:id/application')
      .patch(this.controller.updateAgencyApplication);

    this.router.route('/:id/login').get(this.controller.agencyLogin);

    this.router.route('/:agency_id/email-config').post(this.controller.upsertAgencyEmailCredential);

    this.router.route('/:agency_id/payment-gateway-config').post(this.controller.upsertAgencyPaymentGatewayCredential);
  }
}
