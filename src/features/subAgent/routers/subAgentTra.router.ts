import AbstractRouter from '../../../abstract/abstract.router';
import SubAgentTravelerController from '../controllers/subAgentTraveler.controller';

export default class SubAgentTravelerRouter extends AbstractRouter {
  private controller = new SubAgentTravelerController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_Traveler_FILES, [
          'visa_file',
          'passport_file',
        ]),
        this.controller.createTraveler
      )
      .get(this.controller.getAllTraveler);

    this.router
      .route('/:id')
      .get(this.controller.getSingleTraveler)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_Traveler_FILES, [
          'visa_file',
          'passport_file',
        ]),
        this.controller.updateTraveler
      )
      .delete(this.controller.deleteTraveler);
  }
}
