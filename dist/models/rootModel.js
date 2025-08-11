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
const b2cMarkupConfigModel_1 = __importDefault(require("./dynamicFareRuleModel/b2cMarkupConfigModel"));
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
const hotelMarkupsModel_1 = __importDefault(require("./dynamicFareRuleModel/hotelMarkupsModel"));
const holidayPackageCityModel_1 = __importDefault(require("./holidayPackageModel/holidayPackageCityModel"));
const holidayPackageBookingModel_1 = __importDefault(require("./holidayPackageModel/holidayPackageBookingModel"));
const subAgentMarkupModel_1 = __importDefault(require("./agentModel/subAgentMarkupModel"));
const admManagementModel_1 = __importDefault(require("./paymentModel/admManagementModel"));
const invoiceModel_1 = __importDefault(require("./paymentModel/invoiceModel"));
const moneyReceiptModel_1 = __importDefault(require("./paymentModel/moneyReceiptModel"));
const travelerModel_1 = __importDefault(require("./travelerModel/travelerModel"));
const othersModel_1 = __importDefault(require("./othersModel/othersModel"));
const hotelBookingModel_1 = __importDefault(require("./hotelModel/hotelBookingModel"));
const supportTicketModel_1 = __importDefault(require("./othersModel/supportTicketModel"));
const visaModel_1 = __importDefault(require("./visaModel/visaModel"));
const visaApplicationModel_1 = __importDefault(require("./visaModel/visaApplicationModel"));
const airlinesPreferenceModel_1 = __importDefault(require("./dynamicFareRuleModel/airlinesPreferenceModel"));
const dynamicFareModel_1 = __importDefault(require("./dynamicFareRuleModel/dynamicFareModel"));
const dynamicFareSetModel_1 = __importDefault(require("./dynamicFareRuleModel/dynamicFareSetModel"));
const partialPaymentRulesModel_1 = __importDefault(require("./dynamicFareRuleModel/partialPaymentRulesModel"));
const umrahPackageModel_1 = __importDefault(require("./umrahPackageModel/umrahPackageModel"));
const umrahBookingModel_1 = __importDefault(require("./umrahPackageModel/umrahBookingModel"));
const blogModel_1 = __importDefault(require("./blogModel/blogModel"));
const agencyB2CConfigModel_1 = __importDefault(require("./agencyB2CModel/agencyB2CConfigModel"));
const agencyB2CPaymentModel_1 = __importDefault(require("./agencyB2CModel/agencyB2CPaymentModel"));
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
    //Support Ticket model
    SupportTicketModel(trx) {
        return new supportTicketModel_1.default(trx || database_1.db);
    }
    //Visa model
    VisaModel(trx) {
        return new visaModel_1.default(trx || database_1.db);
    }
    //Visa Application model
    VisaApplicationModel(trx) {
        return new visaApplicationModel_1.default(trx || database_1.db);
    }
    //Airlines Preference model
    AirlinesPreferenceModel(trx) {
        return new airlinesPreferenceModel_1.default(trx || database_1.db);
    }
    //Dynamic Fare Model
    DynamicFareModel(trx) {
        return new dynamicFareModel_1.default(trx || database_1.db);
    }
    //Dynamic Fare Set Model
    DynamicFareSetModel(trx) {
        return new dynamicFareSetModel_1.default(trx || database_1.db);
    }
    //Dynamic Fare Set Model
    PartialPaymentRuleModel(trx) {
        return new partialPaymentRulesModel_1.default(trx || database_1.db);
    }
    //Umrah Package Model
    UmrahPackageModel(trx) {
        return new umrahPackageModel_1.default(trx || database_1.db);
    }
    //Umrah booking Model
    UmrahBookingModel(trx) {
        return new umrahBookingModel_1.default(trx || database_1.db);
    }
    //Blog Model
    BlogModel(trx) {
        return new blogModel_1.default(trx || database_1.db);
    }
    //Agent B2C Config Model
    AgencyB2CConfigModel(trx) {
        return new agencyB2CConfigModel_1.default(trx || database_1.db);
    }
    //Agent B2C Payment Model
    AgencyB2CPaymentModel(trx) {
        return new agencyB2CPaymentModel_1.default(trx || database_1.db);
    }
}
exports.default = Models;
