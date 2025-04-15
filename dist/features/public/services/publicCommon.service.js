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
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const config_1 = __importDefault(require("../../../config/config"));
const sabreApiEndpoints_1 = __importDefault(require("../../../utils/miscellaneous/sabreApiEndpoints"));
const flightConstent_1 = require("../../../utils/miscellaneous/flightConstent");
class PublicCommonService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Get Sebre token
    getSabreToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = qs_1.default.stringify({
                    grant_type: 'password',
                    username: config_1.default.SABRE_USERNAME,
                    password: config_1.default.SABRE_PASSWORD,
                });
                let axiosConfig = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${config_1.default.SABRE_URL}/${sabreApiEndpoints_1.default.GET_TOKEN_ENDPOINT}`,
                    headers: {
                        Authorization: `Basic ${config_1.default.SABRE_AUTH_TOKEN}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    data: data,
                };
                axios_1.default
                    .request(axiosConfig)
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    const data = response.data;
                    const authModel = this.Model.CommonModel();
                    yield authModel.updateEnv(flightConstent_1.SABRE_TOKEN_ENV, data.access_token);
                }))
                    .catch((error) => {
                    console.log(error);
                });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
exports.default = PublicCommonService;
