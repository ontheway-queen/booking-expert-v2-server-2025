import AbstractRouter from '../../../abstract/abstract.router';
import AuthChecker from '../../../middleware/authChecker/authChecker';
import { AgentB2CHolidayController } from '../controllers/agentB2CHoliday.controller';

export default class AgentB2CHolidayRouter extends AbstractRouter {
  private authChecker = new AuthChecker();
  private controller = new AgentB2CHolidayController();

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
      .post(
        this.authChecker.agencyB2CUserAuthChecker,
        this.controller.bookHolidayPackage
      )
      .get(
        this.authChecker.agencyB2CUserAuthChecker,
        this.controller.getHolidayPackageBookingList
      );

    this.router
      .route('/booking/:id')
      .get(
        this.authChecker.agencyB2CUserAuthChecker,
        this.controller.getSingleHolidayPackageBooking
      );

    this.router
      .route('/booking/:id/cancel')
      .post(
        this.authChecker.agencyB2CUserAuthChecker,
        this.controller.cancelHolidayPackageBooking
      );
  }
}
