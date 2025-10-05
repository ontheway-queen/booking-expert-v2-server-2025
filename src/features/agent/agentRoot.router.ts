import { Router } from 'express';
import AgentDashboardRouter from './routers/agentDashboard.router';
import AgentReportRouter from './routers/agentReport.router';
import AgentAdministrationRouter from './routers/agentAdministration.router';
import AgentSupportTicketRouter from './routers/agentSupportTicket.router';
import AgentPaymentsRouter from './routers/agentPayments.router';
import AgentTravelerRouter from './routers/agentTraveler.router';
import AgentUmrahRouter from './routers/agentUmrah.router';
import AgentGroupFareRouter from './routers/agentGroupFare.router';
import AgentHolidayRouter from './routers/agentHoliday.router';
import AgentVisaRouter from './routers/agentVisa.router';
import AgentHotelRouter from './routers/agentHotel.router';
import AgentFlightRouter from './routers/agentFlight.router';
import AgentProfileRouter from './routers/agentProfile.router';
import AgentSubAgentMainRouter from './routers/agentSubAgentMain.router';
import AgentB2CMainRouter from '../agentB2C/routers/agentB2CMain.router';

export default class AgentRootRouter {
  public Router = Router();

  // Router classes
  private agentDashboardRouter = new AgentDashboardRouter();
  private agentReportRouter = new AgentReportRouter();
  private agentAdministrationRouter = new AgentAdministrationRouter();
  private agentSupportTicketRouter = new AgentSupportTicketRouter();
  private agentPaymentsRouter = new AgentPaymentsRouter();
  private agentFlightRouter = new AgentFlightRouter();
  private agentHotelRouter = new AgentHotelRouter();
  private agentVisaRouter = new AgentVisaRouter();
  private agentHolidayRouter = new AgentHolidayRouter();
  private agentGroupFareRouter = new AgentGroupFareRouter();
  private agentUmrahRouter = new AgentUmrahRouter();
  private agentTravelerRouter = new AgentTravelerRouter();
  private agentProfileRouter = new AgentProfileRouter();

  // Agent B2C Sub Root Router Class
  private agentB2CMainRouter = new AgentB2CMainRouter();
  private agentSubAgentMainRouter = new AgentSubAgentMainRouter();

  constructor() {
    this.callRouter();
  }
  private callRouter() {
    this.Router.use('/', this.agentDashboardRouter.router);
    this.Router.use('/profile', this.agentProfileRouter.router);
    this.Router.use('/flight', this.agentFlightRouter.router);
    this.Router.use('/hotel', this.agentHotelRouter.router);
    this.Router.use('/visa', this.agentVisaRouter.router);
    this.Router.use('/holiday', this.agentHolidayRouter.router);
    this.Router.use('/group-fare', this.agentGroupFareRouter.router);
    this.Router.use('/umrah', this.agentUmrahRouter.router);
    this.Router.use('/traveler', this.agentTravelerRouter.router);
    this.Router.use('/payments', this.agentPaymentsRouter.router);
    this.Router.use('/support-ticket', this.agentSupportTicketRouter.router);
    this.Router.use('/report', this.agentReportRouter.router);
    this.Router.use('/administration', this.agentAdministrationRouter.router);

    // Agent B2C/Sub Agent Root Routes
    this.Router.use('/b2c', this.agentB2CMainRouter.router);
    this.Router.use('/sub-agent', this.agentSubAgentMainRouter.router);
  }
}
