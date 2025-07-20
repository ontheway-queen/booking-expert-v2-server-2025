"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentB2CTraveler_controller_1 = require("../controllers/agentB2CTraveler.controller");
class AgentB2CTravelerRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CTraveler_controller_1.AgentB2CTravelerController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_TRAVELER_FILES, ['visa_file', 'passport_file']), this.controller.createTraveler)
            .get(this.controller.getAllTraveler);
        this.router
            .route('/:id')
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_TRAVELER_FILES, ['visa_file', 'passport_file']), this.controller.updateTraveler)
            .get(this.controller.getSingleTraveler)
            .delete(this.controller.deleteTraveler);
    }
}
exports.default = AgentB2CTravelerRouter;
