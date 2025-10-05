import AbstractRouter from '../../../../abstract/abstract.router';
import AgentSubAgentFlightController from '../../controllers/agentSubAgentControllers/agentSubAgentFlight.controller';

export default class AgentSubAgentFlightRouter extends AbstractRouter {
  private controller = new AgentSubAgentFlightController();
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
