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
const flightBookingModel_1 = __importDefault(require("./flightModel/flightBookingModel"));
const flightBookingPriceBreakdownModel_1 = __importDefault(require("./flightModel/flightBookingPriceBreakdownModel"));
const flightBookingSegmentModel_1 = __importDefault(require("./flightModel/flightBookingSegmentModel"));
const flightBookingTrackingModel_1 = __importDefault(require("./flightModel/flightBookingTrackingModel"));
const flightBookingTravelerModel_1 = __importDefault(require("./flightModel/flightBookingTravelerModel"));
const agencyPaymentModel_1 = __importDefault(require("./agentModel/agencyPaymentModel"));
const errorLogsModel_1 = __importDefault(require("./errorLogsModel/errorLogsModel"));
const holidayPackageModel_1 = __importDefault(require("./holidayPackageModel/holidayPackageModel"));
const holidayPackagePricingModel_1 = __importDefault(require("./holidayPackageModel/holidayPackagePricingModel"));
const holidayPackageItineraryModel_1 = __importDefault(require("./holidayPackageModel/holidayPackageItineraryModel"));
const holidayPackageServiceModel_1 = __importDefault(require("./holidayPackageModel/holidayPackageServiceModel"));
const holidayPackageImagesModel_1 = __importDefault(require("./holidayPackageModel/holidayPackageImagesModel"));
const hotelMarkupsModel_1 = __importDefault(require("./markupSetModel/hotelMarkupsModel"));
const holidayPackageCityModel_1 = __importDefault(require("./holidayPackageModel/holidayPackageCityModel"));
const holidayPackageBookingModel_1 = __importDefault(require("./holidayPackageModel/holidayPackageBookingModel"));
const subAgentMarkupModel_1 = __importDefault(require("./agentModel/subAgentMarkupModel"));
const admManagementModel_1 = __importDefault(require("./paymentModel/admManagementModel"));
const invoiceModel_1 = __importDefault(require("./paymentModel/invoiceModel"));
const moneyReceiptModel_1 = __importDefault(require("./paymentModel/moneyReceiptModel"));
const travelerModel_1 = __importDefault(require("./travelerModel/travelerModel"));
const othersModel_1 = __importDefault(require("./othersModel/othersModel"));
const hotelBookingModel_1 = __importDefault(require("./hotelModel/hotelBookingModel"));
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
    //Hotel Markups Model
    HotelMarkupsModel(trx) {
        return new hotelMarkupsModel_1.default(trx || database_1.db);
    }
    //B2C Markup Config Model
    B2CMarkupConfigModel(trx) {
        return new b2cMarkupConfigModel_1.default(trx || database_1.db);
    }
    //Flight booking Model
    FlightBookingModel(trx) {
        return new flightBookingModel_1.default(trx || database_1.db);
    }
    //Flight Booking Price Breakdown Model
    FlightBookingPriceBreakdownModel(trx) {
        return new flightBookingPriceBreakdownModel_1.default(trx || database_1.db);
    }
    //Flight booking segment Model
    FlightBookingSegmentModel(trx) {
        return new flightBookingSegmentModel_1.default(trx || database_1.db);
    }
    //Flight Booking Tracking Model
    FlightBookingTrackingModel(trx) {
        return new flightBookingTrackingModel_1.default(trx || database_1.db);
    }
    //Flight booking traveler Model
    FlightBookingTravelerModel(trx) {
        return new flightBookingTravelerModel_1.default(trx || database_1.db);
    }
    //Agency Payment Model
    AgencyPaymentModel(trx) {
        return new agencyPaymentModel_1.default(trx || database_1.db);
    }
    //Error logs Model
    ErrorLogsModel(trx) {
        return new errorLogsModel_1.default(trx || database_1.db);
    }
    //Holiday Package Model
    HolidayPackageModel(trx) {
        return new holidayPackageModel_1.default(trx || database_1.db);
    }
    //Holiday package pricing model
    HolidayPackagePricingModel(trx) {
        return new holidayPackagePricingModel_1.default(trx || database_1.db);
    }
    //Holiday package itinerary model
    HolidayPackageItineraryModel(trx) {
        return new holidayPackageItineraryModel_1.default(trx || database_1.db);
    }
    //Holiday package services model
    HolidayPackageServiceModel(trx) {
        return new holidayPackageServiceModel_1.default(trx || database_1.db);
    }
    //Holiday package images model
    HolidayPackageImagesModel(trx) {
        return new holidayPackageImagesModel_1.default(trx || database_1.db);
    }
    //Holiday package city model
    HolidayPackageCityModel(trx) {
        return new holidayPackageCityModel_1.default(trx || database_1.db);
    }
    //Holiday package booking model
    HolidayPackageBookingModel(trx) {
        return new holidayPackageBookingModel_1.default(trx || database_1.db);
    }
    //Sub agent markup model
    SubAgentMarkupModel(trx) {
        return new subAgentMarkupModel_1.default(trx || database_1.db);
    }
    //ADM management model
    ADMManagementModel(trx) {
        return new admManagementModel_1.default(trx || database_1.db);
    }
    //Invoice model
    InvoiceModel(trx) {
        return new invoiceModel_1.default(trx || database_1.db);
    }
    //Money receipt model
    MoneyReceiptModel(trx) {
        return new moneyReceiptModel_1.default(trx || database_1.db);
    }
    //Traveler model
    TravelerModel(trx) {
        return new travelerModel_1.default(trx || database_1.db);
    }
    //Others management model
    OthersModel(trx) {
        return new othersModel_1.default(trx || database_1.db);
    }
    //Hotel Booking model
    HotelBookingModel(trx) {
        return new hotelBookingModel_1.default(trx || database_1.db);
    }
}
exports.default = Models;
