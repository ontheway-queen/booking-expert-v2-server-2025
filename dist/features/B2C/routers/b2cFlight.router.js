"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
class B2CFlightRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/search');
        this.router.route('/search/sse');
        this.router.route('/search/fare-rules');
        this.router.route('/revalidate');
        this.router.route('/booking');
        this.router.route('/booking/:id');
        this.router.route('/booking/:id/cancel');
        this.router.route('/booking/:id/payment');
    }
}
exports.default = B2CFlightRouter;
