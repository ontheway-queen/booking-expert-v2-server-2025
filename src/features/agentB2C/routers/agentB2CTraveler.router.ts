import AbstractRouter from '../../../abstract/abstract.router';
import { AgentB2CTravelerController } from '../controllers/agentB2CTraveler.controller';

export default class AgentB2CTravelerRouter extends AbstractRouter {
  private controller = new AgentB2CTravelerController();
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
      .patch(
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENCY_B2C_TRAVELER_FILES,
          ['visa_file', 'passport_file']
        ),
        this.controller.updateTraveler
      )
      .get(this.controller.getSingleTraveler)
      .delete(this.controller.deleteTraveler);
  }
}
