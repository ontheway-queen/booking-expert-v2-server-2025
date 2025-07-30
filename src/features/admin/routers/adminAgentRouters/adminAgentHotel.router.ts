import AbstractRouter from '../../../../abstract/abstract.router';
import { AdminAgentHotelController } from '../../controllers/adminAgentControllers/adminAgentHotel.controller';

export default class AdminAgentHotelRouter extends AbstractRouter {
  private controller = new AdminAgentHotelController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/booking').get(this.controller.getBooking);
    this.router
      .route('/booking/:id')
      .get(this.controller.getSingleBooking)
      .put(this.controller.updateBooking);

    this.router.route('/booking/:id/tracking');
    this.router.route('/booking/:id/cancel');
    this.router.route('/booking/:id/refund');
  }
}
