"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentB2CBlog_controller_1 = require("../controllers/agentB2CBlog.controller");
class AgentB2CBlogRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CBlog_controller_1.AgentB2CBlogController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/').get(this.controller.getBlogList);
        this.router.route('/:slug').get(this.controller.getSingleBlog);
    }
}
exports.default = AgentB2CBlogRouter;
