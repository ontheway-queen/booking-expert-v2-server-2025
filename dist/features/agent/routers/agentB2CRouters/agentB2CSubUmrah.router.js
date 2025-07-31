"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentB2CSubUmrah_controller_1 = require("../../controllers/agentB2CControllers/agentB2CSubUmrah.controller");
class AgentB2CSubUmrahRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubUmrah_controller_1.AgentB2CSubUmrahController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_UMRAH_PACKAGE), this.controller.createUmrahPackage);
    }
}
exports.default = AgentB2CSubUmrahRouter;
