"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentB2CSubBlog_controller_1 = require("../../controllers/agentB2CControllers/agentB2CSubBlog.controller");
class AgentB2CSubBlogRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubBlog_controller_1.AgentB2CSubBlogController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_BLOG_FILES), this.controller.createBlog)
            .get(this.controller.getBlogList);
        this.router
            .route('/:id')
            .get(this.controller.getSingleBlog)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_BLOG_FILES), this.controller.updateBlog)
            .delete(this.controller.deleteBlog);
    }
}
exports.default = AgentB2CSubBlogRouter;
