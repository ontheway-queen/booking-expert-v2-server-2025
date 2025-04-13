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
exports.AdminMarkupSetService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class AdminMarkupSetService extends abstract_service_1.default {
    createMarkupSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const { api, name } = req.body;
                const markupSetModel = this.Model.MarkupSetModel(trx);
                const flightApiModel = this.Model.FlightApiModel(trx);
                const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
                const flightMarkupsModel = this.Model.FlightMarkupsModel(trx);
                //check if markup set name already exists
                const checkName = yield markupSetModel.getAllMarkupSet({
                    check_name: name
                });
                if (checkName.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Markup Set name already exists"
                    };
                }
                //create a markup set
                const newMarkupSet = yield markupSetModel.createMarkupSet({
                    name,
                    created_by: user_id,
                    type: constants_1.MARKUP_SET_TYPE_FLIGHT
                });
                const prePayload = [];
                for (const item of api) {
                    const { api_id, airlines } = item, rest = __rest(item, ["api_id", "airlines"]);
                    const checkExisting = prePayload.find((singlePayload) => singlePayload.api_id === api_id);
                    const markups = [];
                    if (checkExisting) {
                        airlines.forEach((airline) => {
                            markups.push(Object.assign({ airline }, rest));
                        });
                        checkExisting.markups = [
                            ...checkExisting.markups,
                            ...markups
                        ];
                    }
                    else {
                        airlines.forEach((airline) => {
                            markups.push(Object.assign({ airline }, rest));
                        });
                        prePayload.push({
                            api_id,
                            markups,
                            set_id: newMarkupSet[0].id
                        });
                    }
                }
                for (const item of prePayload) {
                    const { api_id, set_id, markups } = item;
                    const checkApi = yield flightApiModel.getFlightApi({
                        id: api_id
                    });
                    if (!checkApi.length) {
                        throw new customError_1.default(`Invalid api id: ${api_id}`, this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                    const newSetFlightApi = yield markupSetFlightApiModel.createMarkupSetFlightApi({
                        markup_set_id: set_id,
                        flight_api_id: api_id
                    });
                    const airlinesMarkupPayload = markups.map((markup) => (Object.assign(Object.assign({}, markup), { markup_set_flight_api_id: newSetFlightApi[0].id, created_by: user_id })));
                    yield flightMarkupsModel.createFlightMarkups(airlinesMarkupPayload);
                }
                ;
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Markup Set has been created successfully",
                };
            }));
        });
    }
}
exports.AdminMarkupSetService = AdminMarkupSetService;
