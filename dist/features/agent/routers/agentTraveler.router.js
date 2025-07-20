"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentTraveler_controller_1 = __importDefault(require("../controllers/agentTraveler.controller"));
class AgentTravelerRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentTraveler_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_Traveler_FILES, [
            'visa_file',
            'passport_file',
        ]), this.controller.createTraveler)
            .get(this.controller.getAllTraveler);
        this.router
            .route('/:id')
            .get(this.controller.getSingleTraveler)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_Traveler_FILES, [
            'visa_file',
            'passport_file',
        ]), this.controller.updateTraveler)
            .delete(this.controller.deleteTraveler);
    }
}
exports.default = AgentTravelerRouter;
