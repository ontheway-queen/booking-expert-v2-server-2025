import AbstractRouter from '../../../abstract/abstract.router';
import AuthChecker from '../../../middleware/authChecker/authChecker';
import AgentB2CFlightController from '../controllers/agentB2CFlight.controller';

export default class AgentB2CFlightRouter extends AbstractRouter {
  private controller = new AgentB2CFlightController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/search').post(this.controller.flightSearch);

    this.router.route('/search/sse').get(this.controller.FlightSearchSSE);

    this.router
      .route('/search/fare-rules')
      .get(this.controller.getFlightFareRule);

    this.router.route('/revalidate').post(this.controller.flightRevalidate);

    this.router
      .route('/booking')
      .post(
        new AuthChecker().agencyB2CUserAuthChecker,
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENT_B2C_FLIGHT_BOOKING_FILES
        ),
        this.controller.flightBooking
      )
      .get(
        new AuthChecker().agencyB2CUserAuthChecker,
        this.controller.getAllBookingList
      );

    this.router
      .route('/booking/:id')
      .get(
        new AuthChecker().agencyB2CUserAuthChecker,
        this.controller.getSingleBooking
      );
  }
}
