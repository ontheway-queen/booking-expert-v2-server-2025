"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const authChecker_1 = __importDefault(require("../../../middleware/authChecker/authChecker"));
const agentB2CVisa_controller_1 = require("../controllers/agentB2CVisa.controller");
class AgentB2CVisaRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CVisa_controller_1.AgentB2CVisaController();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        //get all visa list
        this.router.route('/').get(this.controller.getAllVisaList);
        //create visa application
        this.router
            .route('/:id/application')
            .post(this.authChecker.agencyB2CUserAuthChecker, this.uploader.cloudUploadRaw(this.fileFolders.AGENT_B2C_VISA_FILES), this.controller.createVisaApplication);
        //get all visa application
        this.router
            .route('/applications')
            .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.getVisaApplicationList);
        //get single visa application
        this.router
            .route('/application/:id')
            .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.getSingleVisaApplication);
        //get single visa
        this.router.route('/:slug').get(this.controller.getSingleVisa);
    }
}
exports.default = AgentB2CVisaRouter;
