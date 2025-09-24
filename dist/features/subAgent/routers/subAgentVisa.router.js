"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const subAgentVisa_controller_1 = require("../controllers/subAgentVisa.controller");
class SubAgentVisaRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new subAgentVisa_controller_1.SubAgentCVisaController();
        this.callRouter();
    }
    callRouter() {
        //get all visa list
        this.router.route('/').get(this.controller.getAllVisaList);
        //create visa application
        this.router
            .route('/:id/application')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_B2C_VISA_FILES), this.controller.createVisaApplication);
        //Get visa Type
        this.router.route('/visa-type').get(this.controller.getAllVisaType);
        //Get all visa created country
        this.router.route('/country').get(this.controller.getAllVisaCreatedCountry);
        //get all visa application
        this.router
            .route('/applications')
            .get(this.controller.getVisaApplicationList);
        //get single visa application
        this.router
            .route('/application/:id')
            .get(this.controller.getSingleVisaApplication);
        //get single visa
        this.router.route('/:slug').get(this.controller.getSingleVisa);
    }
}
exports.default = SubAgentVisaRouter;
