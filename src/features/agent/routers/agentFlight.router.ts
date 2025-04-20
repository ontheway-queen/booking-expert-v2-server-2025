import AbstractRouter from '../../../abstract/abstract.router';
import AgentFlightController from '../controllers/agentFlight.controller';

export default class AgentFlightRouter extends AbstractRouter {
  private controller = new AgentFlightController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/search')
      .post(this.controller.flightSearch);

    this.router.route('/search/sse')
      .get(this.controller.FlightSearchSSE);

    this.router.route('/search/fare-rules')
      .get(this.controller.getFlightFareRule);

    this.router.route('/revalidate')
      .get(this.controller.flightRevalidate);

    this.router.route('/booking')
      .post(this.uploader.cloudUploadRaw(this.fileFolders.FLIGHT_BOOKING_FILES), this.controller.flightBooking);

  }
}
