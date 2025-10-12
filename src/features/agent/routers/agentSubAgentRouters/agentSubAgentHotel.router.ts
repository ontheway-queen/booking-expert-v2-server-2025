import AbstractRouter from '../../../../abstract/abstract.router';
import { AgentSubAgentHotelController } from '../../controllers/agentSubAgentControllers/agentSubAgentHotel.controller';

export default class AgentSubAgentHotelRouter extends AbstractRouter {
  private controller = new AgentSubAgentHotelController();
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
  }
}
