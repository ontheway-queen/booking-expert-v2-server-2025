"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
class B2CMainRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/banners');
        this.router.route('/offers');
        this.router.route('/offers/:id');
        this.router.route('/blog');
        this.router.route('/blog/:slug');
        this.router.route('/announcement');
        this.router.route('/pop-up');
        this.router.route('/popular-routes');
        this.router.route('/popular-airlines');
    }
}
exports.default = B2CMainRouter;
