"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonModel_1 = __importDefault(require("./commonModel/commonModel"));
const database_1 = require("../app/database");
const adminModel_1 = __importDefault(require("./adminModel/adminModel"));
const agencyB2CUserModel_1 = __importDefault(require("./agencyB2CModel/agencyB2CUserModel"));
const agencyModel_1 = __importDefault(require("./agentModel/agencyModel"));
const agencyUserModel_1 = __importDefault(require("./agentModel/agencyUserModel"));
const b2cUserModel_1 = __importDefault(require("./b2cModel/b2cUserModel"));
const markupSetModel_1 = __importDefault(require("./markupSetModel/markupSetModel"));
const flightApiModel_1 = __importDefault(require("./markupSetModel/flightApiModel"));
const markupSetFlightApiModel_1 = __importDefault(require("./markupSetModel/markupSetFlightApiModel"));
const flightMarkupsModel_1 = __importDefault(require("./markupSetModel/flightMarkupsModel"));
const b2cMarkupConfigModel_1 = __importDefault(require("./markupSetModel/b2cMarkupConfigModel"));
class Models {
    //Common model
    CommonModel(trx) {
        return new commonModel_1.default(trx || database_1.db);
    }
    //Admin Model
    AdminModel(trx) {
        return new adminModel_1.default(trx || database_1.db);
    }
    //Agency B2C Users Model
    AgencyB2CUserModel(trx) {
        return new agencyB2CUserModel_1.default(trx || database_1.db);
    }
    //Agency Model
    AgencyModel(trx) {
        return new agencyModel_1.default(trx || database_1.db);
    }
    //Agency User Model
    AgencyUserModel(trx) {
        return new agencyUserModel_1.default(trx || database_1.db);
    }
    //booking request models
    B2CUserModel(trx) {
        return new b2cUserModel_1.default(trx || database_1.db);
    }
    //Markup Set Model
    MarkupSetModel(trx) {
        return new markupSetModel_1.default(trx || database_1.db);
    }
    //Flight API Model
    FlightApiModel(trx) {
        return new flightApiModel_1.default(trx || database_1.db);
    }
    //Markup Set Flight Api Model
    MarkupSetFlightApiModel(trx) {
        return new markupSetFlightApiModel_1.default(trx || database_1.db);
    }
    //Flight Markups Model
    FlightMarkupsModel(trx) {
        return new flightMarkupsModel_1.default(trx || database_1.db);
    }
    //B2C Markup Config Model
    B2CMarkupConfigModel(trx) {
        return new b2cMarkupConfigModel_1.default(trx || database_1.db);
    }
}
exports.default = Models;
