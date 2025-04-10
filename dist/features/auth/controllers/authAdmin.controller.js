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
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const authAdmin_service_1 = __importDefault(require("../services/authAdmin.service"));
const authValidator_1 = __importDefault(require("../utils/validators/authValidator"));
class AuthAdminController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new authAdmin_service_1.default();
        this.validator = new authValidator_1.default();
        this.login = this.asyncWrapper.wrap({ bodySchema: this.validator.loginValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            // const { code, ...data } = await this.service.createRole(req);
            // res.status(code).json(data);
        }));
    }
}
exports.default = AuthAdminController;
