import AbstractController from "../../../../abstract/abstract.controller";
import { AgentB2CSubSiteConfigService } from "../../services/agentB2CServices/agentB2CSubSiteConfig.service";

export class AgentB2CSubSiteConfigController extends AbstractController {
  private controller = new AgentB2CSubSiteConfigService();

  constructor() {
    super();
  }
}
