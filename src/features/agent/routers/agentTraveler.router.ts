import AbstractRouter from '../../../abstract/abstract.router';
import AgentTravelerController from '../controllers/agentTraveler.controller';

export default class AgentTravelerRouter extends AbstractRouter {
  private controller = new AgentTravelerController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENCY_B2C_TRAVELER_FILES,
          ['visa_file', 'passport_file']
        ),
        this.controller.createTraveler
      )
      .get(this.controller.getAllTraveler);

    this.router
      .route('/:id')
      .get(this.controller.getSingleTraveler)
      .patch(
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENCY_B2C_TRAVELER_FILES,
          ['visa_file', 'passport_file']
        ),
        this.controller.updateTraveler
      )
      .delete(this.controller.deleteTraveler);
  }
}
