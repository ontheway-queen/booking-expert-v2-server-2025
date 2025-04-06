"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authAgent_router_1 = __importDefault(require("./routers/authAgent.router"));
const authB2C_router_1 = __importDefault(require("./routers/authB2C.router"));
const authAdmin_router_1 = __importDefault(require("./routers/authAdmin.router"));
const authAgentB2C_router_1 = __importDefault(require("./routers/authAgentB2C.router"));
class AuthRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        // Router classes
        this.authAgentRouter = new authAgent_router_1.default();
        this.authB2CRouter = new authB2C_router_1.default();
        this.authAdminRouter = new authAdmin_router_1.default();
        this.authAgentB2CRouter = new authAgentB2C_router_1.default();
        this.callRouter();
    }
    callRouter() {
        // Agent auth routes
        this.Router.use('/agent', this.authAgentRouter.router);
        // B2C auth routes
        this.Router.use('/b2c', this.authB2CRouter.router);
        // Admin auth routes
        this.Router.use('/admin', this.authAdminRouter.router);
        // Agent B2C auth routes
        this.Router.use('/agent-b2c', this.authAgentB2CRouter.router);
    }
}
exports.default = AuthRootRouter;
