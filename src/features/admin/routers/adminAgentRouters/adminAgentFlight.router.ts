import AbstractRouter from '../../../../abstract/abstract.router';
import { AdminAgentFlightController } from '../../controllers/adminAgentControllers/adminAgentFlight.controller';

export default class AdminAgentFlightRouter extends AbstractRouter {
  private controller = new AdminAgentFlightController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/booking').get(this.controller.getAllFlightBooking);

    this.router
      .route('/booking/:id')
      .get(this.controller.getSingleBooking)
      .patch(this.controller.updateBooking);

    this.router
      .route('/booking/:id/cancel')
      .post(this.controller.cancelBooking);

    this.router.route('/booking/:id/issue').post(this.controller.issueTicket);

    this.router.route('/booking/:id/split').post(this.controller.issueTicket);

    this.router
      .route('/booking/:id/tracking')
      .get(this.controller.getBookingTrackingData);
  }
}
