import { Router } from "express";
import AuthAgentRouter from "./routers/authAgent.router";
import AuthB2CRouter from "./routers/authB2C.router";
import AuthAdminRouter from "./routers/authAdmin.router";
import AuthAgentB2CRouter from "./routers/authAgentB2C.router";
import AuthChecker from "../../middleware/authChecker/authChecker";

export default class AuthRootRouter {
  public Router = Router();

  // Router classes
  private authAgentRouter = new AuthAgentRouter();
  private authB2CRouter = new AuthB2CRouter();
  private authAdminRouter = new AuthAdminRouter();
  private authAgentB2CRouter = new AuthAgentB2CRouter();
  constructor() {
    this.callRouter();
  }

  private callRouter() {
    // Agent auth routes
    this.Router.use("/agent", this.authAgentRouter.router);

    // B2C auth routes
    this.Router.use("/b2c", this.authB2CRouter.router);

    // Admin auth routes
    this.Router.use("/admin", this.authAdminRouter.router);

    // Sub Agent auth routes
    this.Router.use(
      "/sub-agent",
      new AuthChecker().whiteLabelAuthChecker,
      this.authAgentRouter.router
    );

    // Agent B2C auth routes
    this.Router.use(
      "/agent-b2c",
      new AuthChecker().whiteLabelAuthChecker,
      this.authAgentB2CRouter.router
    );
  }
}
