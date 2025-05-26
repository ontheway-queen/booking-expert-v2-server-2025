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

export default class AgentB2CRootRouter {
  public Router = Router();

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

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.Router.use('/', this.mainRouter.router);
    this.Router.use('/flight', this.flightRouter.router);
    this.Router.use('/holiday', this.holidayRouter.router);
    this.Router.use('/hotel', this.hotelRouter.router);
    this.Router.use('/profile', new AuthChecker().agencyB2CUserAuthChecker, this.profileRouter.router);
    this.Router.use('/support-ticket', this.supportTicketRouter.router);
    this.Router.use('/traveler', this.travelerRouter.router);
    this.Router.use('/umrah', this.umrahRouter.router);
    this.Router.use('/visa', this.visaRouter.router);
  }
}
