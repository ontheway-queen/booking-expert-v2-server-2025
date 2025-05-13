import AbstractRouter from '../../../../abstract/abstract.router';
import { AdminAgentFlightController } from '../../controllers/adminAgentControllers/adminAgentFlight.controller';

export default class AdminAgentFlightRouter extends AbstractRouter {
  private controller = new AdminAgentFlightController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    this.router.route('/')
      .get(this.controller.getAllFlightBooking);

    this.router.route('/:id')
      .get(this.controller.getSingleBooking);

    this.router.route('/:id/tracking')
      .get(this.controller.getBookingTrackingData);
  }
}
