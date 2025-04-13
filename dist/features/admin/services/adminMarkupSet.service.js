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
                const { api, name, type } = req.body;
                const markupSetModel = this.Model.MarkupSetModel(trx);
                const flightApiModel = this.Model.FlightApiModel(trx);
                const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
                const flightMarkupsModel = this.Model.FlightMarkupsModel(trx);
                //check if markup set name already exists
                const checkName = yield markupSetModel.getAllMarkupSet({
                    check_name: name,
                    type
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
                    type
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
    getMarkupSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const query = req.query;
                const markupSetModel = this.Model.MarkupSetModel(trx);
                const data = yield markupSetModel.getAllMarkupSet(Object.assign(Object.assign({}, query), { type: constants_1.MARKUP_SET_TYPE_FLIGHT }));
                return {
                    success: true,
                    data,
                    code: this.StatusCode.HTTP_OK
                };
            }));
        });
    }
    getSingleMarkupSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const markupSetModel = this.Model.MarkupSetModel(trx);
                const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
                const markupSetData = yield markupSetModel.getSingleMarkupSet(Number(id));
                if (!markupSetData) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const setFlightAPIData = yield markupSetFlightApiModel.getMarkupSetFlightApi({
                    markup_set_id: Number(id)
                });
                return {
                    success: true,
                    data: {
                        id: markupSetData.id,
                        name: markupSetData.name,
                        status: markupSetData.status,
                        api: setFlightAPIData,
                    },
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    updateMarkupSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { name, add, update } = req.body;
                const { id } = req.params;
                const markupSetModel = this.Model.MarkupSetModel(trx);
                const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
                const flightApiModel = this.Model.FlightApiModel(trx);
                const checkComSet = yield markupSetModel.getSingleMarkupSet(Number(id));
                if (!checkComSet) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (name) {
                    yield markupSetModel.updateMarkupSet({ name }, Number(id));
                }
                if (add) {
                    for (const item of add) {
                        const checkSetFlightApi = yield markupSetFlightApiModel.getMarkupSetFlightApi({
                            markup_set_id: Number(id),
                            flight_api_id: item,
                        });
                        if (checkSetFlightApi.length) {
                            throw new customError_1.default(`Api id ${item} already exist with this set`, this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                        }
                        const checkFlightApi = yield flightApiModel.getFlightApi({
                            id: item,
                        });
                        if (!checkFlightApi.length) {
                            throw new customError_1.default(`Invalid api id: ${item}`, this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                        }
                        yield markupSetFlightApiModel.createMarkupSetFlightApi({
                            flight_api_id: item,
                            markup_set_id: Number(id),
                        });
                    }
                }
                if (update) {
                    for (const item of update) {
                        const { id, status } = item;
                        yield markupSetFlightApiModel.updateMarkupSetFlightApi({ status }, id);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    deleteMarkupSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const markupSetModel = this.Model.MarkupSetModel(trx);
                const getMarkupSet = yield markupSetModel.getSingleMarkupSet(Number(id));
                if (!getMarkupSet) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const update = yield markupSetModel.updateMarkupSet({ is_deleted: true }, Number(id));
                if (update) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Markup Set has been deleted",
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR
                    };
                }
            }));
        });
    }
    getMarkupSetFlightApiDetails(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { set_id, set_api_id } = req.params;
                const flightMarkupsModel = this.Model.FlightMarkupsModel(trx);
                const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
                const setFlightApiData = yield markupSetFlightApiModel.getMarkupSetFlightApi({
                    markup_set_id: Number(set_id),
                    flight_api_id: Number(set_api_id)
                });
                if (!setFlightApiData.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                const { airline, status } = req.query;
                const { data, total } = yield flightMarkupsModel.getAllFlightMarkups({
                    markup_set_flight_api_id: setFlightApiData[0].id,
                    airline,
                    status
                });
                return {
                    success: true,
                    data,
                    total,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    updateMarkupSetFlightApi(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const { set_id, set_api_id } = req.params;
                const flightMarkupsModel = this.Model.FlightMarkupsModel(trx);
                const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
                const setFlightApiData = yield markupSetFlightApiModel.getMarkupSetFlightApi({
                    markup_set_id: Number(set_id),
                    flight_api_id: Number(set_api_id)
                });
                if (!setFlightApiData.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                const { api_status, add, remove, update } = req.body;
                //update status
                if (api_status !== undefined) {
                    yield markupSetFlightApiModel.updateMarkupSetFlightApi({ status: api_status }, setFlightApiData[0].id);
                }
                //add new markup of airlines
                if (add) {
                    const addPayload = [];
                    for (const addItem of add) {
                        const { airlines, markup_domestic, markup_from_dac, markup_to_dac, markup_soto, markup_mode, markup_type } = addItem;
                        for (const airline of airlines) {
                            //check if airline already exists
                            const existingRecord = yield flightMarkupsModel.getAllFlightMarkups({
                                airline,
                                markup_set_flight_api_id: setFlightApiData[0].id
                            });
                            if (existingRecord.data.length) {
                                yield flightMarkupsModel.updateFlightMarkups({
                                    markup_domestic,
                                    markup_from_dac,
                                    markup_mode,
                                    markup_soto,
                                    markup_to_dac,
                                    markup_type,
                                    updated_by: user_id,
                                    updated_at: new Date()
                                }, existingRecord.data[0].key);
                            }
                            else {
                                addPayload.push({
                                    airline,
                                    markup_domestic,
                                    markup_from_dac,
                                    markup_mode,
                                    markup_soto,
                                    markup_to_dac,
                                    markup_type,
                                    created_by: user_id,
                                    markup_set_flight_api_id: setFlightApiData[0].id
                                });
                            }
                        }
                        //insert the remaining payload
                        if (addPayload.length) {
                            yield flightMarkupsModel.createFlightMarkups(addPayload);
                        }
                    }
                }
                //update existing markup of airlines
                if (update) {
                    for (const updateItem of update) {
                        const { id } = updateItem, rest = __rest(updateItem, ["id"]);
                        yield flightMarkupsModel.updateFlightMarkups(Object.assign(Object.assign({}, rest), { updated_by: user_id, updated_at: new Date() }), id);
                    }
                }
                //remove existing markup of airlines
                if (remove) {
                    console.log({ remove });
                    yield flightMarkupsModel.deleteFlightMarkups(remove);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Markup set has been updated",
                };
            }));
        });
    }
}
exports.AdminMarkupSetService = AdminMarkupSetService;
