import AbstractRouter from '../../../../abstract/abstract.router';
import AgentB2CSubHolidayController from '../../controllers/agentB2CControllers/agentB2CSubHoliday.controller';

export default class AgentB2CSubHolidayRouter extends AbstractRouter {
  private controller = new AgentB2CSubHolidayController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_HOLIDAY_PACKAGE, [
          'images',
        ]),
        this.controller.createHoliday
      )
      .get(this.controller.getHolidayPackageList);

    this.router
      .route('/:id')
      .get(this.controller.getSingleHolidayPackage)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_HOLIDAY_PACKAGE, [
          'images',
        ]),
        this.controller.updateHolidayPackage
      )
      .delete(this.controller.deleteHolidayPackage);
  }
}
