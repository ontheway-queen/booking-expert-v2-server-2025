import { Router } from 'express';
import AgentB2CMainRouter from './routers/agentB2CMain.router';
import AgentB2CFlightRouter from './routers/agentB2CFlight.router';
import AgentB2CHolidayRouter from './routers/agentB2CHoliday.router';
import AgentB2CHotelRouter from './routers/agentB2CHotel.router';
import AgentB2CProfileRouter from './routers/agentB2CProfile.router';
import AgentB2CSupportTicketRouter from './routers/agentB2CSupportTicket.router';
import AgentB2CTravelerRouter from './routers/agentB2CTraveler.router';
import AgentB2CUmrahRouter from './routers/agentB2CUmrah.router';
import AgentB2CVisaRouter from './routers/agentB2CVisa.router';
import AuthChecker from '../../middleware/authChecker/authChecker';
import BlogRouter from './routers/agentB2CBlog.router';
import AgentB2CConfigRouter from './routers/agentB2CConfig.router';
import AgentB2CPaymentRouter from './routers/agentB2CPayment.router';

export default class AgentB2CRootRouter {
  public Router = Router();

  private authChecker = new AuthChecker();

  // Router classes
  private mainRouter = new AgentB2CMainRouter();
  private flightRouter = new AgentB2CFlightRouter();
  private holidayRouter = new AgentB2CHolidayRouter();
  private hotelRouter = new AgentB2CHotelRouter();
  private profileRouter = new AgentB2CProfileRouter();
  private supportTicketRouter = new AgentB2CSupportTicketRouter();
  private travelerRouter = new AgentB2CTravelerRouter();
  private umrahRouter = new AgentB2CUmrahRouter();
  private visaRouter = new AgentB2CVisaRouter();
  private blogRouter = new BlogRouter();
  private agentB2CConfigRouter = new AgentB2CConfigRouter();
  private agentB2CPaymentRouter = new AgentB2CPaymentRouter();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.Router.use('/', this.mainRouter.router);
    this.Router.use('/config', this.agentB2CConfigRouter.router);
    this.Router.use('/flight', this.flightRouter.router);
    this.Router.use('/holiday', this.holidayRouter.router);
    this.Router.use('/hotel', this.hotelRouter.router);
    this.Router.use(
      '/profile',
      this.authChecker.agencyB2CUserAuthChecker,
      this.profileRouter.router
    );
    this.Router.use(
      '/support-ticket',
      this.authChecker.agencyB2CUserAuthChecker,
      this.supportTicketRouter.router
    );
    this.Router.use(
      '/traveler',
      this.authChecker.agencyB2CUserAuthChecker,
      this.travelerRouter.router
    );
    this.Router.use('/umrah', this.umrahRouter.router);
    this.Router.use('/visa', this.visaRouter.router);

    this.Router.use('/blog', this.blogRouter.router);

    this.Router.use(
      '/payments',
      this.authChecker.agencyB2CUserAuthChecker,
      this.agentB2CPaymentRouter.router
    );
  }
}
