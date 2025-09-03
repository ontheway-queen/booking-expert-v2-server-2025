import AbstractRouter from '../../../../abstract/abstract.router';
import AgentB2CSubFlightController from '../../controllers/agentB2CControllers/agentB2CSubFlight.controller';

export default class AgentB2CSubFlightRouter extends AbstractRouter {
  private controller = new AgentB2CSubFlightController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/booking').get(this.controller.getAllBooking);

    this.router
      .route('/booking/:id')
      .get(this.controller.getSingleBooking)
      .patch(this.controller.updateBooking);
  }
}
