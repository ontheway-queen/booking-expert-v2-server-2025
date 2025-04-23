"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const adminAgentAgency_controller_1 = __importDefault(require("../../controllers/adminAgentControllers/adminAgentAgency.controller"));
class AdminAgentAgencyRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAgentAgency_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.get('/', this.controller.getAgency);
        this.router.get('/:id', this.controller.getSingleAgency);
    }
}
exports.default = AdminAgentAgencyRouter;
