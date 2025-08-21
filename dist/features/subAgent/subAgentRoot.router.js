"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subAgentConfig_router_1 = __importDefault(require("./routers/subAgentConfig.router"));
const subAgentMain_router_1 = __importDefault(require("./routers/subAgentMain.router"));
class SubAgentRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        this.subAgentConfigRouter = new subAgentConfig_router_1.default();
        this.subAgentMainRouter = new subAgentMain_router_1.default();
        this.callRouter();
    }
    callRouter() {
        this.Router.use('/', this.subAgentMainRouter.router);
        this.Router.use('/config', this.subAgentConfigRouter.router);
    }
}
exports.default = SubAgentRootRouter;
