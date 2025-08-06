import AbstractRouter from '../../../../abstract/abstract.router';
import { AgentB2CSubUmrahController } from '../../controllers/agentB2CControllers/agentB2CSubUmrah.controller';

export default class AgentB2CSubUmrahRouter extends AbstractRouter {
  private controller = new AgentB2CSubUmrahController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_UMRAH_PACKAGE),
        this.controller.createUmrahPackage
      )
      .get(this.controller.getUmrahPackageList);

    this.router.route('/booking').get(this.controller.getUmrahBooking);

    this.router
      .route('/booking/:id')
      .get(this.controller.getSingleUmrahBooking)
      .patch(this.controller.updateUmrahBookingStatus);

    this.router
      .route('/:id')
      .get(this.controller.getSingleUmrahPackage)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_UMRAH_PACKAGE),
        this.controller.updateUmrahPackage
      )
      .delete(this.controller.deleteUmrahPackage);
  }
}
