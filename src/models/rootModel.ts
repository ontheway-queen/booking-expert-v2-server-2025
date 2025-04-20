import { Knex } from 'knex';
import CommonModel from './commonModel/commonModel';
import { db } from '../app/database';
import AdminModel from './adminModel/adminModel';
import AgencyB2CUserModel from './agencyB2CModel/agencyB2CUserModel';
import AgencyModel from './agentModel/agencyModel';
import AgencyUserModel from './agentModel/agencyUserModel';
import B2CUserModel from './b2cModel/b2cUserModel';
import MarkupSetModel from './markupSetModel/markupSetModel';
import FlightApiModel from './markupSetModel/flightApiModel';
import MarkupSetFlightApiModel from './markupSetModel/markupSetFlightApiModel';
import FlightMarkupsModel from './markupSetModel/flightMarkupsModel';
import B2CMarkupConfigModel from './markupSetModel/b2cMarkupConfigModel';
import FlightBookingModel from './flightModel/flightBookingModel';
import FlightBookingPriceBreakdownModel from './flightModel/flightBookingPriceBreakdownModel';
import FlightBookingSegmentModel from './flightModel/flightBookingSegmentModel';
import FlightBookingTrackingModel from './flightModel/flightBookingTrackingModel';
import FlightBookingTravelerModel from './flightModel/flightBookingTravelerModel';
import ErrorLogsModel from './errorLogsModel/errorLogsModel';

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

  //Markup Set Model
  public MarkupSetModel(trx?: Knex.Transaction) {
    return new MarkupSetModel(trx || db);
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

  //Error logs Model
  public ErrorLogsModel(trx?: Knex.Transaction) {
    return new ErrorLogsModel(trx || db);
  }
}
