import AbstractRouter from '../../../abstract/abstract.router';
import AgentSubAgentRouter from './agentSubAgentRouters/agentSubAgent.router';
import AgentSubAgentFlightRouter from './agentSubAgentRouters/agentSubAgentFlight.router';
import AgentSubAgentPaymentRouter from './agentSubAgentRouters/agentSubAgentPayment.router';

export default class AgentSubAgentMainRouter extends AbstractRouter {
  private agentSubAgentRouter = new AgentSubAgentRouter();
  private agentSubAgentFlightRouter = new AgentSubAgentFlightRouter();
  private agentSubAgentPaymentRouter = new AgentSubAgentPaymentRouter();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.use('/', this.agentSubAgentRouter.router);
    this.router.use('/flight', this.agentSubAgentFlightRouter.router);
    this.router.use('/payments', this.agentSubAgentPaymentRouter.router);
  }
}
