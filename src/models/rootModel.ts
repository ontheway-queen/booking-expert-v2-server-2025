import { Knex } from 'knex';
import CommonModel from './commonModel/commonModel';
import { db } from '../app/database';
import AdminModel from './adminModel/adminModel';
import AgencyB2CUserModel from './agencyB2CModel/agencyB2CUserModel';
import AgencyModel from './agentModel/agencyModel';
import AgencyUserModel from './agentModel/agencyUserModel';
import B2CUserModel from './b2cModel/b2cUserModel';
import FlightApiModel from './dynamicFareRuleModel/flightApiModel';
import MarkupSetFlightApiModel from './dynamicFareRuleModel/markupSetFlightApiModel';
import FlightMarkupsModel from './dynamicFareRuleModel/flightMarkupsModel';
import B2CMarkupConfigModel from './dynamicFareRuleModel/b2cMarkupConfigModel';
import FlightBookingModel from './flightModel/flightBookingModel';
import FlightBookingPriceBreakdownModel from './flightModel/flightBookingPriceBreakdownModel';
import FlightBookingSegmentModel from './flightModel/flightBookingSegmentModel';
import FlightBookingTrackingModel from './flightModel/flightBookingTrackingModel';
import FlightBookingTravelerModel from './flightModel/flightBookingTravelerModel';
import AgencyPaymentModel from './agentModel/agencyPaymentModel';
import ErrorLogsModel from './errorLogsModel/errorLogsModel';
import HolidayPackageModel from './holidayPackageModel/holidayPackageModel';
import HolidayPackagePricingModel from './holidayPackageModel/holidayPackagePricingModel';
import HolidayPackageItineraryModel from './holidayPackageModel/holidayPackageItineraryModel';
import HolidayPackageServiceModel from './holidayPackageModel/holidayPackageServiceModel';
import HolidayPackageImagesModel from './holidayPackageModel/holidayPackageImagesModel';
import HotelMarkupsModel from './dynamicFareRuleModel/hotelMarkupsModel';
import HolidayPackageCityModel from './holidayPackageModel/holidayPackageCityModel';
import HolidayPackageBookingModel from './holidayPackageModel/holidayPackageBookingModel';
import SubAgentMarkupModel from './agentModel/subAgentMarkupModel';
import ADMManagementModel from './paymentModel/admManagementModel';
import InvoiceModel from './paymentModel/invoiceModel';
import MoneyReceiptModel from './paymentModel/moneyReceiptModel';
import TravelerModel from './travelerModel/travelerModel';
import OthersModel from './othersModel/othersModel';
import HotelBookingModel from './hotelModel/hotelBookingModel';
import SupportTicketModel from './othersModel/supportTicketModel';
import VisaModel from './visaModel/visaModel';
import VisaApplicationModel from './visaModel/visaApplicationModel';
import AirlinesPreferenceModel from './dynamicFareRuleModel/airlinesPreferenceModel';
import DynamicFareModel from './dynamicFareRuleModel/dynamicFareModel';
import DynamicFareSetModel from './dynamicFareRuleModel/dynamicFareSetModel';

export default class Models {
  //Common model
  public CommonModel(trx?: Knex.Transaction) {
    return new CommonModel(trx || db);
  }

  //Admin Model
  public AdminModel(trx?: Knex.Transaction) {
    return new AdminModel(trx || db);
  }

  //Agency B2C Users Model
  public AgencyB2CUserModel(trx?: Knex.Transaction) {
    return new AgencyB2CUserModel(trx || db);
  }

  //Agency Model
  public AgencyModel(trx?: Knex.Transaction) {
    return new AgencyModel(trx || db);
  }

  //Agency User Model
  public AgencyUserModel(trx?: Knex.Transaction) {
    return new AgencyUserModel(trx || db);
  }

  //booking request models
  public B2CUserModel(trx?: Knex.Transaction) {
    return new B2CUserModel(trx || db);
  }

  //Flight API Model
  public FlightApiModel(trx?: Knex.Transaction) {
    return new FlightApiModel(trx || db);
  }

  //Markup Set Flight Api Model
  public MarkupSetFlightApiModel(trx?: Knex.Transaction) {
    return new MarkupSetFlightApiModel(trx || db);
  }

  //Flight Markups Model
  public FlightMarkupsModel(trx?: Knex.Transaction) {
    return new FlightMarkupsModel(trx || db);
  }

  //Hotel Markups Model
  public HotelMarkupsModel(trx?: Knex.Transaction) {
    return new HotelMarkupsModel(trx || db);
  }

  //B2C Markup Config Model
  public B2CMarkupConfigModel(trx?: Knex.Transaction) {
    return new B2CMarkupConfigModel(trx || db);
  }

  //Flight booking Model
  public FlightBookingModel(trx?: Knex.Transaction) {
    return new FlightBookingModel(trx || db);
  }

  //Flight Booking Price Breakdown Model
  public FlightBookingPriceBreakdownModel(trx?: Knex.Transaction) {
    return new FlightBookingPriceBreakdownModel(trx || db);
  }

  //Flight booking segment Model
  public FlightBookingSegmentModel(trx?: Knex.Transaction) {
    return new FlightBookingSegmentModel(trx || db);
  }

  //Flight Booking Tracking Model
  public FlightBookingTrackingModel(trx?: Knex.Transaction) {
    return new FlightBookingTrackingModel(trx || db);
  }

  //Flight booking traveler Model
  public FlightBookingTravelerModel(trx?: Knex.Transaction) {
    return new FlightBookingTravelerModel(trx || db);
  }

  //Agency Payment Model
  public AgencyPaymentModel(trx?: Knex.Transaction) {
    return new AgencyPaymentModel(trx || db);
  }

  //Error logs Model
  public ErrorLogsModel(trx?: Knex.Transaction) {
    return new ErrorLogsModel(trx || db);
  }

  //Holiday Package Model
  public HolidayPackageModel(trx?: Knex.Transaction) {
    return new HolidayPackageModel(trx || db);
  }

  //Holiday package pricing model
  public HolidayPackagePricingModel(trx?: Knex.Transaction) {
    return new HolidayPackagePricingModel(trx || db);
  }

  //Holiday package itinerary model
  public HolidayPackageItineraryModel(trx?: Knex.Transaction) {
    return new HolidayPackageItineraryModel(trx || db);
  }

  //Holiday package services model
  public HolidayPackageServiceModel(trx?: Knex.Transaction) {
    return new HolidayPackageServiceModel(trx || db);
  }

  //Holiday package images model
  public HolidayPackageImagesModel(trx?: Knex.Transaction) {
    return new HolidayPackageImagesModel(trx || db);
  }

  //Holiday package city model
  public HolidayPackageCityModel(trx?: Knex.Transaction) {
    return new HolidayPackageCityModel(trx || db);
  }

  //Holiday package booking model
  public HolidayPackageBookingModel(trx?: Knex.Transaction) {
    return new HolidayPackageBookingModel(trx || db);
  }

  //Sub agent markup model
  public SubAgentMarkupModel(trx?: Knex.Transaction) {
    return new SubAgentMarkupModel(trx || db);
  }

  //ADM management model
  public ADMManagementModel(trx?: Knex.Transaction) {
    return new ADMManagementModel(trx || db);
  }

  //Invoice model
  public InvoiceModel(trx?: Knex.Transaction) {
    return new InvoiceModel(trx || db);
  }

  //Money receipt model
  public MoneyReceiptModel(trx?: Knex.Transaction) {
    return new MoneyReceiptModel(trx || db);
  }

  //Traveler model
  public TravelerModel(trx?: Knex.Transaction) {
    return new TravelerModel(trx || db);
  }

  //Others management model
  public OthersModel(trx?: Knex.Transaction) {
    return new OthersModel(trx || db);
  }
  //Hotel Booking model
  public HotelBookingModel(trx?: Knex.Transaction) {
    return new HotelBookingModel(trx || db);
  }
  //Support Ticket model
  public SupportTicketModel(trx?: Knex.Transaction) {
    return new SupportTicketModel(trx || db);
  }
  //Visa model
  public VisaModel(trx?: Knex.Transaction) {
    return new VisaModel(trx || db);
  }

  //Visa Application model
  public VisaApplicationModel(trx?: Knex.Transaction) {
    return new VisaApplicationModel(trx || db);
  }

  //Airlines Preference model
  public AirlinesPreferenceModel(trx?: Knex.Transaction) {
    return new AirlinesPreferenceModel(trx || db);
  }
  //Dynamic Fare Model
  public DynamicFareModel(trx?: Knex.Transaction) {
    return new DynamicFareModel(trx || db);
  }

  //Dynamic Fare Set Model
  public DynamicFareSetModel(trx?: Knex.Transaction) {
    return new DynamicFareSetModel(trx || db);
  }
}
