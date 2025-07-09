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
exports.AdminHotelMarkupSetService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class AdminHotelMarkupSetService extends abstract_service_1.default {
    getMarkupSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const query = req.query;
                const markupSetModel = this.Model.DynamicFareSetModel(trx);
                const data = yield markupSetModel.getAllDynamicFareSet(Object.assign(Object.assign({}, query), { type: 'Hotel' }));
                return {
                    success: true,
                    data,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
    deleteMarkupSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { user_id } = req.admin;
                const markupSetModel = this.Model.DynamicFareSetModel(trx);
                const getMarkupSet = yield markupSetModel.checkDynamicFareSet({
                    id: Number(id),
                    type: constants_1.TYPE_HOTEL,
                });
                if (!getMarkupSet) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield markupSetModel.updateDynamicFareSet({ is_deleted: true }, { id: Number(id), type: constants_1.TYPE_HOTEL });
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    type: 'DELETE',
                    details: `${getMarkupSet.type} markup set ${getMarkupSet.name} is deleted.`,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Markup Set has been deleted',
                };
            }));
        });
    }
    createHotelMarkupSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const { name, book, cancel } = req.body;
                const MarkupSetModel = this.Model.DynamicFareSetModel(trx);
                const HotelMarkupsModel = this.Model.HotelMarkupsModel(trx);
                //check if markup set name already exists
                const checkName = yield MarkupSetModel.checkDynamicFareSet({
                    name,
                    type: constants_1.TYPE_HOTEL,
                });
                if (checkName) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Markup Set name already exists',
                    };
                }
                const markupSet = yield MarkupSetModel.createDynamicFareSet({
                    created_by: user_id,
                    name,
                    type: constants_1.TYPE_HOTEL,
                });
                const hotelMarkupPayload = [
                    {
                        markup: book.markup,
                        mode: book.mode,
                        markup_for: 'Book',
                        type: book.type,
                        set_id: markupSet[0].id,
                    },
                    {
                        markup: cancel.markup,
                        mode: cancel.mode,
                        markup_for: 'Cancel',
                        type: cancel.type,
                        set_id: markupSet[0].id,
                    },
                ];
                yield HotelMarkupsModel.insertHotelMarkup(hotelMarkupPayload);
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    type: 'CREATE',
                    details: `Create hotel markup set ${name}.`,
                    payload: JSON.stringify(req.body),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: markupSet[0].id,
                    },
                };
            }));
        });
    }
    getSingleHotelMarkupSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const set_id = Number(id);
                const markupSetModel = this.Model.DynamicFareSetModel(trx);
                const HotelMarkupsModel = this.Model.HotelMarkupsModel(trx);
                const getMarkupSet = yield markupSetModel.checkDynamicFareSet({
                    id: set_id,
                    type: constants_1.TYPE_HOTEL,
                });
                if (!getMarkupSet) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const markups = yield HotelMarkupsModel.getHotelMarkup({
                    markup_for: 'Both',
                    set_id,
                });
                let book = {};
                let cancel = {};
                markups.forEach((markup) => {
                    if (markup.markup_for === 'Book') {
                        book = {
                            id: markup.id,
                            markup: markup.markup,
                            mode: markup.mode,
                            status: markup.status,
                            type: markup.type,
                        };
                    }
                    if (markup.markup_for === 'Cancel') {
                        cancel = {
                            id: markup.id,
                            markup: markup.markup,
                            mode: markup.mode,
                            status: markup.status,
                            type: markup.type,
                        };
                    }
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        id: set_id,
                        name: getMarkupSet.name,
                        status: getMarkupSet.status,
                        created_by: getMarkupSet.created_by,
                        created_by_name: getMarkupSet.created_by_name,
                        updated_by: getMarkupSet.updated_by,
                        updated_by_name: getMarkupSet.updated_by_name,
                        created_at: getMarkupSet.created_at,
                        last_updated: getMarkupSet.last_updated,
                        book,
                        cancel,
                    },
                };
            }));
        });
    }
    updateHotelMarkupSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { user_id } = req.admin;
                const set_id = Number(id);
                const markupSetModel = this.Model.DynamicFareSetModel(trx);
                const HotelMarkupsModel = this.Model.HotelMarkupsModel(trx);
                const getMarkupSet = yield markupSetModel.checkDynamicFareSet({
                    id: set_id,
                    type: constants_1.TYPE_HOTEL,
                });
                if (!getMarkupSet) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const _a = req.body, { book, cancel } = _a, restBody = __rest(_a, ["book", "cancel"]);
                if (book) {
                    yield HotelMarkupsModel.updateHotelMarkup(book, {
                        set_id,
                        markup_for: 'Book',
                    });
                }
                if (cancel) {
                    yield HotelMarkupsModel.updateHotelMarkup(cancel, {
                        set_id,
                        markup_for: 'Cancel',
                    });
                }
                yield markupSetModel.updateDynamicFareSet(Object.assign(Object.assign({}, restBody), { updated_by: user_id, last_updated: new Date() }), { id: set_id, type: constants_1.TYPE_HOTEL });
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    type: 'UPDATE',
                    details: `Update hotel markup set ${getMarkupSet.name}`,
                    payload: JSON.stringify(req.body),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.AdminHotelMarkupSetService = AdminHotelMarkupSetService;
