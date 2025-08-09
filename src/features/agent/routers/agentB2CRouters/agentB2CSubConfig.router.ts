import AbstractRouter from "../../../../abstract/abstract.router";
import AgentB2CSubConfigController from "../../controllers/agentB2CControllers/agentB2CSubConfig.controller";

export default class AgentB2CSubConfigRouter extends AbstractRouter {
  private controller = new AgentB2CSubConfigController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/markup")
      .get(this.controller.getB2CMarkup)
      .post(this.controller.upsertB2CMarkup);

    this.router
      .route("/accounts")
      .get(this.controller.getAccounts)
      .post(this.controller.createAccounts);

    this.router
      .route("/accounts/:id")
      .patch(this.controller.updateAccounts)
      .delete(this.controller.deleteAccounts);

    this.router
      .route("/hero-bg")
      .get(this.controller.getHeroBGContent)
      .post(this.controller.createHeroBGContent);

    this.router
      .route("/hero-bg/:id")
      .patch(this.controller.updateHeroBGContent)
      .delete(this.controller.deleteHeroBGContent);

    this.router
      .route("/popular-dest")
      .get(this.controller.getPopularDestination)
      .post(this.controller.createPopularDestination);

    this.router
      .route("/popular-dest/:id")
      .patch(this.controller.updatePopularDestination)
      .delete(this.controller.deletePopularDestination);

    this.router
      .route("/popular-place")
      .get(this.controller.getPopularPlace)
      .post(this.controller.createPopularPlace);

    this.router
      .route("/popular-place/:id")
      .patch(this.controller.updatePopularPlace)
      .delete(this.controller.deletePopularPlace);

    this.router
      .route("/hot-deals")
      .get(this.controller.getHotDeals)
      .post(this.controller.createHotDeals);

    this.router
      .route("/hot-deals/:id")
      .patch(this.controller.updateHotDeals)
      .delete(this.controller.deleteHotDeals);
  }
}
