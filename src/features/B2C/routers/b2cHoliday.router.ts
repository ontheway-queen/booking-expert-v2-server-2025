import AbstractRouter from '../../../abstract/abstract.router';
import AuthChecker from '../../../middleware/authChecker/authChecker';
import { B2CHolidayController } from '../controllers/b2cHoliday.controller';

export default class B2CHolidayRouter extends AbstractRouter {
  private controller = new B2CHolidayController();
  private authChecker = new AuthChecker();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    this.router.route('/search')
      .post(this.controller.searchHolidayPackage);

    this.router.route('/search/:slug')
      .get(this.controller.getSingleHolidayPackage);

    this.router.route('/booking')
      .post(this.authChecker.b2cUserAuthChecker,
        this.controller.bookHolidayPackage)
      .get(this.authChecker.b2cUserAuthChecker,
        this.controller.getHolidayPackageBookingList);

    this.router.route('/booking/:id')
      .get(this.authChecker.b2cUserAuthChecker,
        this.controller.getSingleHolidayPackageBooking);

    this.router.route('/booking/:id/cancel')
      .post(this.authChecker.b2cUserAuthChecker,
        this.controller.cancelHolidayPackageBooking);
  }
}
