import AbstractRouter from '../../../abstract/abstract.router';
import AuthChecker from '../../../middleware/authChecker/authChecker';
import { SubAgentHolidayController } from '../controllers/subAgentHoliday.controller';

export default class SubAgentHolidayRouter extends AbstractRouter {
  private controller = new SubAgentHolidayController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/search').post(this.controller.searchHolidayPackage);

    this.router
      .route('/search/:slug')
      .get(this.controller.getSingleHolidayPackage);

    this.router
      .route('/booking')
      .post(this.controller.bookHolidayPackage)
      .get(this.controller.getHolidayPackageBookingList);

    this.router
      .route('/booking/:id')
      .get(this.controller.getSingleHolidayPackageBooking);

    this.router
      .route('/booking/:id/cancel')
      .post(this.controller.cancelHolidayPackageBooking);
  }
}
