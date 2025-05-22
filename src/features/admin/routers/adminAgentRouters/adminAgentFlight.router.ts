import AbstractRouter from '../../../../abstract/abstract.router';
import { AdminAgentFlightController } from '../../controllers/adminAgentControllers/adminAgentFlight.controller';

export default class AdminAgentFlightRouter extends AbstractRouter {
  private controller = new AdminAgentFlightController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    this.router.route('/booking')
      .get(this.controller.getAllFlightBooking);

    this.router.route('/booking/:id')
      .get(this.controller.getSingleBooking)
      .delete(this.controller.cancelBooking) //cancel booking using API
      .post(this.controller.issueTicket) //issue ticket using API
      .patch(this.controller.updateBooking); //Expire a booking

    this.router.route('/booking/:id/booked')
    .post(this.controller.updatePendingBookingManually); //update pending booking to booked or issued manually

    this.router.route('/booking/:id/confirm')
    .post(this.controller.updateProcessingTicketManually); //update processing ticket to issued manually

    this.router.route('/booking/:id/tracking')
      .get(this.controller.getBookingTrackingData);
  }
}
