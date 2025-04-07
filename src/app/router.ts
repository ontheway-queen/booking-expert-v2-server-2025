import { Router } from 'express';
import PublicRootRouter from '../features/public/publicRoot.router';
import AuthRootRouter from '../features/auth/authRoot.router';
import AgentRootRouter from '../features/agent/agentRoot.router';
import B2CRootRouter from '../features/B2C/b2cRoot.router';
import AdminRootRouter from '../features/admin/adminRoot.router';
import AgentB2CRootRouter from '../features/agentB2C/agentB2CRoot.router';
import ExternalRootRouter from '../features/external/externalRoot.router';
import AuthChecker from '../middleware/authChecker/authChecker';

export default class RootRouter {
  public v2Router = Router();
  private publicRootRouter = new PublicRootRouter();
  private authRootRouter = new AuthRootRouter();
  private agentRootRouter = new AgentRootRouter();
  private b2cRootRouter = new B2CRootRouter();
  private adminRootRouter = new AdminRootRouter();
  private agentB2CRootRouter = new AgentB2CRootRouter();
  private externalRootRouter = new ExternalRootRouter();

  // Auth checker
  private authChecker = new AuthChecker();
  constructor() {
    this.callV2Router();
  }

  private callV2Router() {
    // Public Routes
    this.v2Router.use('/public', this.publicRootRouter.Router);

    // Auth Routes
    this.v2Router.use('/auth', this.authRootRouter.Router);

    // Agent Routes
    this.v2Router.use('/agent', this.agentRootRouter.Router);

    // B2C Routes
    this.v2Router.use('/b2c', this.b2cRootRouter.Router);

    // Admin Routes
    this.v2Router.use(
      '/admin',
      this.authChecker.adminAuthChecker,
      this.adminRootRouter.Router
    );

    // Agent B2C Routes
    this.v2Router.use('/agent-b2c', this.agentB2CRootRouter.Router);

    // External Routes
    this.v2Router.use('/external', this.externalRootRouter.Router);
  }
}
