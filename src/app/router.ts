import { Router } from 'express';
import PublicRootRouter from '../features/public/publicRoot.router';
import AuthRootRouter from '../features/auth/authRoot.router';
import AgentRootRouter from '../features/agent/agentRoot.router';
import B2CRootRouter from '../features/B2C/b2cRoot.router';
import AdminRootRouter from '../features/admin/adminRoot.router';

export default class RootRouter {
  public v2Router = Router();
  private publicRootRouter = new PublicRootRouter();
  private authRootRouter = new AuthRootRouter();
  private agentRootRouter = new AgentRootRouter();
  private b2cRootRouter = new B2CRootRouter();
  private adminRootRouter = new AdminRootRouter();

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
    this.v2Router.use('/admin', this.adminRootRouter.Router);

    // Agent B2C Routes
    this.v2Router.use('/agent-b2c');

    // External Routes
    this.v2Router.use('/external');
  }
}
