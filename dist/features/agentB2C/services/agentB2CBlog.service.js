"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CBlogService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AgentB2CBlogService extends abstract_service_1.default {
    //get blog list
    getBlogList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const blogModel = this.Model.BlogModel();
            const blogPosts = yield blogModel.getAgentB2CBlogList({
                is_deleted: false,
                source_id: agency_id,
                status: true,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: blogPosts,
            };
        });
    }
    //get single blog
    getSingleBlog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.params;
            const { agency_id } = req.agencyB2CWhiteLabel;
            const blogModel = this.Model.BlogModel();
            const blogPost = yield blogModel.getSingleAgentB2CBlog({
                slug,
                is_deleted: false,
                status: true,
                source_id: agency_id,
            });
            if (!blogPost) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: blogPost,
            };
        });
    }
}
exports.AgentB2CBlogService = AgentB2CBlogService;
