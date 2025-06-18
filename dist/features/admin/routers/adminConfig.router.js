"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminConfig_controller_1 = __importDefault(require("../controllers/adminConfig.controller"));
class AdminConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminConfig_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //check slug
        this.router.route('/check-slug').get(this.controller.checkSlug);
        this.router
            .route('/city')
            .get(this.controller.getAllCity)
            .post(this.controller.createCity);
        this.router
            .route('/city/:id')
            .patch(this.controller.updateCity)
            .delete(this.controller.deleteCity);
        this.router
            .route('/airport')
            .get(this.controller.getAllAirport)
            .post(this.controller.createAirport);
        this.router
            .route('/airport/:id')
            .patch(this.controller.updateAirport)
            .delete(this.controller.deleteAirport);
        this.router
            .route('/airlines')
            .get(this.controller.getAllAirlines)
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AIRLINES_FILES, ['logo']), this.controller.createAirlines);
        this.router
            .route('/airlines/:id')
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AIRLINES_FILES, ['logo']), this.controller.updateAirlines)
            .delete(this.controller.deleteAirlines);
    }
}
exports.default = AdminConfigRouter;
