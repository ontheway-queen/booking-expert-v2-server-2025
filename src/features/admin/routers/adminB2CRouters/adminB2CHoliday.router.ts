import AbstractRouter from '../../../../abstract/abstract.router';
import { AdminB2CHolidayController } from '../../controllers/adminB2CControllers/adminB2CHoliday.controller';

export default class AdminB2CHolidayRouter extends AbstractRouter {
  private controller = new AdminB2CHolidayController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    this.router.route('/booking')
      .get(this.controller.getHolidayPackageBookingList);

    this.router.route('/booking/:id')
      .get(this.controller.getSingleHolidayPackageBooking)
      .patch(this.controller.updateHolidayPackageBooking);
  }
}
