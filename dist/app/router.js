"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicRoot_router_1 = __importDefault(require("../features/public/publicRoot.router"));
const authRoot_router_1 = __importDefault(require("../features/auth/authRoot.router"));
const agentRoot_router_1 = __importDefault(require("../features/agent/agentRoot.router"));
const b2cRoot_router_1 = __importDefault(require("../features/B2C/b2cRoot.router"));
const adminRoot_router_1 = __importDefault(require("../features/admin/adminRoot.router"));
const agentB2CRoot_router_1 = __importDefault(require("../features/agentB2C/agentB2CRoot.router"));
const externalRoot_router_1 = __importDefault(require("../features/external/externalRoot.router"));
const authChecker_1 = __importDefault(require("../middleware/authChecker/authChecker"));
class RootRouter {
    constructor() {
        this.v2Router = (0, express_1.Router)();
        this.publicRootRouter = new publicRoot_router_1.default();
        this.authRootRouter = new authRoot_router_1.default();
        this.agentRootRouter = new agentRoot_router_1.default();
        this.b2cRootRouter = new b2cRoot_router_1.default();
        this.adminRootRouter = new adminRoot_router_1.default();
        this.agentB2CRootRouter = new agentB2CRoot_router_1.default();
        this.externalRootRouter = new externalRoot_router_1.default();
        // Auth checker
        this.authChecker = new authChecker_1.default();
        this.callV2Router();
    }
    callV2Router() {
        // Public Routes
        this.v2Router.use('/public', this.publicRootRouter.Router);
        // Auth Routes
        this.v2Router.use('/auth', this.authRootRouter.Router);
        // Agent Routes
        this.v2Router.use('/agent', this.authChecker.agencyUserAuthChecker, this.agentRootRouter.Router);
        // B2C Routes
        this.v2Router.use('/b2c', this.b2cRootRouter.Router);
        // Admin Routes
        this.v2Router.use('/admin', this.authChecker.adminAuthChecker, this.adminRootRouter.Router);
        // Agent B2C Routes
        this.v2Router.use('/agent-b2c', this.agentB2CRootRouter.Router);
        // External Routes
        this.v2Router.use('/external', this.externalRootRouter.Router);
    }
}
exports.default = RootRouter;
