import AbstractRouter from '../../../abstract/abstract.router';
import AdminHolidayController from '../controllers/adminHoliday.controller';

export default class AdminHolidayRouter extends AbstractRouter {
  private controller = new AdminHolidayController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/')
      .post(this.uploader.cloudUploadRaw(this.fileFolders.HOLIDAY_PACKAGE,
        ['images']), this.controller.createHoliday)
      .get(this.controller.getHolidayPackageList);

    this.router.route('/:id')
      .get(this.controller.getSingleHolidayPackage)
      .patch(this.uploader.cloudUploadRaw(this.fileFolders.HOLIDAY_PACKAGE,
        ['images']), this.controller.updateHolidayPackage)
      .delete(this.controller.deleteHolidayPackage);
  }
}
