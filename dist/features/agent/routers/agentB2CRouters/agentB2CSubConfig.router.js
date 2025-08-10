"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentB2CSubConfig_controller_1 = __importDefault(require("../../controllers/agentB2CControllers/agentB2CSubConfig.controller"));
class AgentB2CSubConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubConfig_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/markup')
            .get(this.controller.getB2CMarkup)
            .post(this.controller.upsertB2CMarkup);
        this.router
            .route('/accounts')
            .get(this.controller.getAccounts)
            .post(this.controller.createAccounts);
        this.router
            .route('/accounts/:id')
            .patch(this.controller.updateAccounts)
            .delete(this.controller.deleteAccounts);
        this.router
            .route('/hero-bg')
            .get(this.controller.getHeroBGContent)
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG_HERO_BG, ['content']), this.controller.createHeroBGContent);
        this.router
            .route('/hero-bg/:id')
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG_HERO_BG, ['content']), this.controller.updateHeroBGContent)
            .delete(this.controller.deleteHeroBGContent);
        this.router
            .route('/popular-dest')
            .get(this.controller.getPopularDestination)
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG_OTHERS, ['thumbnail']), this.controller.createPopularDestination);
        this.router
            .route('/popular-dest/:id')
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG_OTHERS, ['thumbnail']), this.controller.updatePopularDestination)
            .delete(this.controller.deletePopularDestination);
        this.router
            .route('/popular-place')
            .get(this.controller.getPopularPlace)
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG_OTHERS, ['thumbnail']), this.controller.createPopularPlace);
        this.router
            .route('/popular-place/:id')
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG_OTHERS, ['thumbnail']), this.controller.updatePopularPlace)
            .delete(this.controller.deletePopularPlace);
        this.router
            .route('/hot-deals')
            .get(this.controller.getHotDeals)
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG_OTHERS, ['thumbnail']), this.controller.createHotDeals);
        this.router
            .route('/hot-deals/:id')
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG_OTHERS, ['thumbnail']), this.controller.updateHotDeals)
            .delete(this.controller.deleteHotDeals);
    }
}
exports.default = AgentB2CSubConfigRouter;
