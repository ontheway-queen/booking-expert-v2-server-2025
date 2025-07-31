import AbstractRouter from '../../../abstract/abstract.router';
import AuthChecker from '../../../middleware/authChecker/authChecker';
import { AgentB2CUmrahController } from '../controllers/agentB2CUmrah.controller';

export default class AgentB2CUmrahRouter extends AbstractRouter {
  private controller = new AgentB2CUmrahController();
  private authChecker = new AuthChecker();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/').get(this.controller.getUmrahPackages);

    this.router
      .route('/booking')
      .get(
        this.authChecker.agencyB2CUserAuthChecker,
        this.controller.getUmrahBookingList
      );

    this.router
      .route('/:id/book')
      .post(
        this.authChecker.agencyB2CUserAuthChecker,
        this.controller.bookUmrahPackage
      );

    this.router
      .route('/booking/:id')
      .get(
        this.authChecker.agencyB2CUserAuthChecker,
        this.controller.getSingleUmrahBooking
      );

    this.router
      .route('/booking/:id/cancel')
      .post(
        this.authChecker.agencyB2CUserAuthChecker,
        this.controller.cancelUmrahBooking
      );

    this.router.route('/:slug').get(this.controller.getSingleUmrahPackages);
  }
}
