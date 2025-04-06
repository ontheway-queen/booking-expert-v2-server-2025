"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const externalFlight_router_1 = __importDefault(require("./routers/externalFlight.router"));
const externalHotel_router_1 = __importDefault(require("./routers/externalHotel.router"));
class ExternalRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        // Router classes
        this.flightRouter = new externalFlight_router_1.default();
        this.hotelRouter = new externalHotel_router_1.default();
        this.callRouter();
    }
    callRouter() {
        this.Router.use('/flight', this.flightRouter.router);
        this.Router.use('/hotel', this.hotelRouter.router);
    }
}
exports.default = ExternalRootRouter;
