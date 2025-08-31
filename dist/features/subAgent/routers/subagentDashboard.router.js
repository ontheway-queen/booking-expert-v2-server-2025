"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
class SubAgentDashboardRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.callRouter();
    }
    callRouter() {
        // Dashboard data API
        this.router.route('/dashboard');
        // Search Api
        this.router.route('/search');
        // Notification API
        this.router.route('/notification');
        // Quick Links
        this.router.route('/quick-links');
    }
}
exports.default = SubAgentDashboardRouter;
