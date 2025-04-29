import AbstractRouter from '../../../../abstract/abstract.router';
import { AdminAgentHolidayController } from '../../controllers/adminAgentControllers/adminAgentHoliday.controller';

export default class AdminAgentHolidayRouter extends AbstractRouter {
  private controller = new AdminAgentHolidayController();
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
