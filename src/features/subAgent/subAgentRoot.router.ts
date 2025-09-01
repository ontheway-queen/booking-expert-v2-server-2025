import { Router } from 'express';
import SubAgentConfigRouter from './routers/subAgentConfig.router';
import SubAgentMainRouter from './routers/subAgentMain.router';
import SubAgentProfileRouter from './routers/subAgentProfile.router';
import AuthChecker from '../../middleware/authChecker/authChecker';
import SubAgentSupportTicketRouter from './routers/subentSupportTicket.router';
import SubAgentPaymentsRouter from './routers/subAgentPayments.router';
import SubAgentHotelRouter from './routers/subAgentHotel.router';
import SubAgentFlightRouter from './routers/subAgentFlight.router';
import SubAgentDashboardRouter from './routers/subAgentDashboard.router';
import SubAgentTravelerRouter from './routers/subAgentTraveler.router';

export default class SubAgentRootRouter {
  public Router = Router();
  private subAgentConfigRouter = new SubAgentConfigRouter();
  private subAgentMainRouter = new SubAgentMainRouter();
  private subAgentProfileRouter = new SubAgentProfileRouter();
  private subAgentSupportTicketRouter = new SubAgentSupportTicketRouter();
  private subAgentPaymentsRouter = new SubAgentPaymentsRouter();
  private subAgentHotelRouter = new SubAgentHotelRouter();
  private subAgentFlightRouter = new SubAgentFlightRouter();
  private subAgentTravelerRouter = new SubAgentTravelerRouter();
  private subAgentDashboardRouter = new SubAgentDashboardRouter();

  private authChecker = new AuthChecker();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.Router.use('/', this.subAgentMainRouter.router);
    this.Router.use('/config', this.subAgentConfigRouter.router);

    //with auth
    this.Router.use(
      '/profile',
      this.authChecker.agencyUserAuthChecker,
      this.subAgentProfileRouter.router
    );
    this.Router.use(
      '/flight',
      this.authChecker.agencyUserAuthChecker,
      this.subAgentFlightRouter.router
    );
    this.Router.use(
      '/hotel',
      this.authChecker.agencyUserAuthChecker,
      this.subAgentHotelRouter.router
    );
    this.Router.use(
      '/payments',
      this.authChecker.agencyUserAuthChecker,
      this.subAgentPaymentsRouter.router
    );
    this.Router.use(
      '/traveler',
      this.authChecker.agencyUserAuthChecker,
      this.subAgentTravelerRouter.router
    );
    this.Router.use(
      '/support-ticket',
      this.authChecker.agencyUserAuthChecker,
      this.subAgentSupportTicketRouter.router
    );
    this.Router.use(
      '/dashboard',
      this.authChecker.agencyUserAuthChecker,
      this.subAgentDashboardRouter.router
    );
  }
}
