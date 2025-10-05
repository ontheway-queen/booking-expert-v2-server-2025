import AbstractRouter from '../../../abstract/abstract.router';
import AgentSubAgentRouter from './agentSubAgentRouters/agentSubAgent.router';
import AgentSubAgentFlightRouter from './agentSubAgentRouters/agentSubAgentFlight.router';

export default class AgentSubAgentMainRouter extends AbstractRouter {
  private agentSubAgentRouter = new AgentSubAgentRouter();
  private agentSubAgentFlightRouter = new AgentSubAgentFlightRouter();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.use('/', this.agentSubAgentRouter.router);
    this.router.use('/flight', this.agentSubAgentFlightRouter.router);
  }
}
