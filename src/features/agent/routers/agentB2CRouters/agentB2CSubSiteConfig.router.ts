import AbstractRouter from "../../../../abstract/abstract.router";
import { AgentB2CSubSiteConfigController } from "../../controllers/agentB2CControllers/agentB2CSubSiteConfig.controller";

export default class AgentB2CSubSiteConfigRouter extends AbstractRouter {
  private controller = new AgentB2CSubSiteConfigController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route("/");
  }
}
