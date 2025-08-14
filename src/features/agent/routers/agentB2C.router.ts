import AgentB2CSubRouter from './agentB2CRouters/agentB2CSub.router';
import AgentB2CSubConfigRouter from './agentB2CRouters/agentB2CSubConfig.router';
import AgentB2CSubFlightRouter from './agentB2CRouters/agentB2CSubFlight.router';
import AgentB2CSubGroupFareRouter from './agentB2CRouters/agentB2CSubGroupFare.router';
import AgentB2CSubHolidayRouter from './agentB2CRouters/agentB2CSubHoliday.router';
import AgentB2CSubHotelRouter from './agentB2CRouters/agentB2CSubHotel.router';
import AgentB2CSubUmrahRouter from './agentB2CRouters/agentB2CSubUmrah.router';
import AgentB2CSubUsersRouter from './agentB2CRouters/agentB2CSubUsers.router';
import AgentB2CSubVisaRouter from './agentB2CRouters/agentB2CSubVisa.router';
import AbstractRouter from '../../../abstract/abstract.router';
import AgentB2CSubBlogRouter from './agentB2CRouters/agentB2CSubBlog.router';
import AgentB2CSubSiteConfigRouter from './agentB2CRouters/agentB2CSubSiteConfig.router';

export default class AgentB2CRouter extends AbstractRouter {
  // Agent B2C Sub Classes
  private agentB2CSubRouter = new AgentB2CSubRouter();
  private agentB2CSubConfigRouter = new AgentB2CSubConfigRouter();
  private agentB2CSubFlightRouter = new AgentB2CSubFlightRouter();
  private agentB2CSubGroupFareRouter = new AgentB2CSubGroupFareRouter();
  private agentB2CSubHolidayRouter = new AgentB2CSubHolidayRouter();
  private agentB2CSubHotelRouter = new AgentB2CSubHotelRouter();
  private agentB2CSubUmrahRouter = new AgentB2CSubUmrahRouter();
  private agentB2CSubUsersRouter = new AgentB2CSubUsersRouter();
  private agentB2CSubVisaRouter = new AgentB2CSubVisaRouter();
  private agentB2CSubBlogRouter = new AgentB2CSubBlogRouter();
  private agentB2CSubSiteConfigRouter = new AgentB2CSubSiteConfigRouter();


  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.use('/', this.agentB2CSubRouter.router);
    this.router.use('/config', this.agentB2CSubConfigRouter.router);
    this.router.use('/flight', this.agentB2CSubFlightRouter.router);
    this.router.use('/users', this.agentB2CSubUsersRouter.router);
    this.router.use('/visa', this.agentB2CSubVisaRouter.router);
    this.router.use('/holiday', this.agentB2CSubHolidayRouter.router);
    this.router.use('/hotel', this.agentB2CSubHotelRouter.router);
    this.router.use('/umrah', this.agentB2CSubUmrahRouter.router);
    this.router.use('/group-fare', this.agentB2CSubGroupFareRouter.router);
    this.router.use('/blog', this.agentB2CSubBlogRouter.router);
    this.router.use('/site-config', this.agentB2CSubSiteConfigRouter.router);
  }
}
