"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentB2CSubUsers_controller_1 = __importDefault(require("../../controllers/agentB2CControllers/agentB2CSubUsers.controller"));
class AgentB2CSubUsersRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubUsers_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/')
            .get(this.controller.getAllUsers);
        this.router.route('/:id')
            .get(this.controller.getSingleUser)
            .patch(this.controller.updateUser);
    }
}
exports.default = AgentB2CSubUsersRouter;
