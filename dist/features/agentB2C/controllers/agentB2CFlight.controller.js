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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const agentB2CFlight_service_1 = require("../services/agentB2CFlight.service");
const agentB2CFlight_validator_1 = __importDefault(require("../utils/validators/agentB2CFlight.validator"));
class AgentB2CFlightController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new agentB2CFlight_service_1.AgentB2CFlightService();
        this.validator = new agentB2CFlight_validator_1.default();
        this.flightSearch = this.asyncWrapper.wrap({ bodySchema: this.validator.flightSearchSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.flightSearch(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.FlightSearchSSE = this.asyncWrapper.wrap({ querySchema: this.validator.flightSearchSSESchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            // Function to send SSE events
            const sendEvent = (event, data) => {
                res.write(`event: ${event}\n`);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };
            try {
                sendEvent('start', { message: 'Flight search has been started.' });
                // Pass `sendEvent` to the service
                yield this.service.flightSearchSSE(req, res);
                //SSE connection closed
                sendEvent('end', { message: 'Flight search completed successfully.' });
                res.end();
            }
            catch (error) {
                sendEvent('error', {
                    message: 'An error occurred during flight search.',
                    error,
                });
                res.end();
            }
        }));
        this.getFlightFareRule = this.asyncWrapper.wrap({ querySchema: this.validator.flightRevalidateSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getFlightFareRule(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.flightRevalidate = this.asyncWrapper.wrap({ querySchema: this.validator.flightRevalidateSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.flightRevalidate(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.flightBooking = this.asyncWrapper.wrap({ bodySchema: this.validator.flightBookingSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.flightBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        this.getAllBookingList = this.asyncWrapper.wrap({ bodySchema: this.validator.getFlightListSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllBookingList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getSingleBooking = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.default = AgentB2CFlightController;
