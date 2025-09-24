import AbstractRouter from '../../../abstract/abstract.router';
import AuthChecker from '../../../middleware/authChecker/authChecker';
import { SubAgentUmrahController } from '../controllers/subAgentUmrah.controller';

export default class SubAgentUmrahRouter extends AbstractRouter {
  private controller = new SubAgentUmrahController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/').get(this.controller.getUmrahPackages);

    this.router.route('/booking').get(this.controller.getUmrahBookingList);

    this.router.route('/:id/book').post(this.controller.bookUmrahPackage);

    this.router
      .route('/booking/:id')
      .get(this.controller.getSingleUmrahBooking);

    this.router
      .route('/booking/:id/cancel')
      .post(this.controller.cancelUmrahBooking);

    this.router.route('/:slug').get(this.controller.getSingleUmrahPackages);
  }
}
