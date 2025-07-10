import { Knex } from 'knex';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  IAgentUpdateDataAfterTicketIssue,
  ICheckAgentDirectTicketIssuePermissionPayload,
  IGetPaymentInformationReqBody,
} from '../../../supportTypes/bookingSupportTypes/flightBookingSupportTypes/agentFlightBookingTypes';
import {
  CUSTOM_API,
  FLIGHT_TICKET_IN_PROCESS,
  FLIGHT_TICKET_ISSUE,
  PARTIAL_PAYMENT_DEPARTURE_DATE,
  PARTIAL_PAYMENT_PERCENTAGE,
  PAYMENT_TYPE_PARTIAL,
} from '../../../miscellaneous/flightConstent';
import Lib from '../../../lib/lib';
import {
  GENERATE_AUTO_UNIQUE_ID,
  SOURCE_AGENT,
  TYPE_FLIGHT,
} from '../../../miscellaneous/constants';
import { IInsertFlightBookingTrackingPayload } from '../../../modelTypes/flightModelTypes/flightBookingTrackingModelTypes';
import BalanceLib from '../../../lib/balanceLib';

export class AgentFlightBookingSupportService extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  public async checkAgentDirectTicketIssuePermission(
    payload: ICheckAgentDirectTicketIssuePermissionPayload
  ) {
    //get flight markup set id
    const agencyModel = this.Model.AgencyModel(this.trx);
    const agency_details = await agencyModel.checkAgency({
      agency_id: payload.agency_id,
    });

    if (!agency_details?.flight_markup_set) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'No commission set has been found for the agency',
      };
    }

    const markupSetFlightApiModel = this.Model.DynamicFareModel(this.trx);
    const set_flight_api =
      await markupSetFlightApiModel.getDynamicFareSuppliers({
        set_id: agency_details.flight_markup_set,
        api_name: payload.api_name,
      });

    //custom API
    if (!set_flight_api.length) {
      return {
        issue_block: false,
      };
    }

    const flightMarkupsModel = this.Model.DynamicFareModel(this.trx);
    const flightMarkupData = await flightMarkupsModel.getSupplierAirlinesFares({
      dynamic_fare_supplier_id: set_flight_api[0].id,
      airline: payload.airline,
    });

    if (!flightMarkupData.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.AIRLINE_DATA_NOT_PRESENT_FOR_MARKUP,
      };
    }

    return {
      issue_block: false,
    };
  }

  public async updateDataAfterTicketIssue(
    payload: IAgentUpdateDataAfterTicketIssue
  ) {
    //update booking
    const flightBookingModel = this.Model.FlightBookingModel(this.trx);
    await flightBookingModel.updateFlightBooking(
      {
        status: payload.status,
        api:
          payload.status === FLIGHT_TICKET_IN_PROCESS ? CUSTOM_API : undefined,
        issued_at: new Date(),
        issued_by_type: payload.issued_by_type,
        issued_by_user_id: payload.issued_by_user_id,
      },
      { id: payload.booking_id, source_type: SOURCE_AGENT }
    );

    //add tracking
    const flightBookingTrackingModel = this.Model.FlightBookingTrackingModel(
      this.trx
    );
    const tracking_data: IInsertFlightBookingTrackingPayload[] = [];
    tracking_data.push({
      flight_booking_id: payload.booking_id,
      description: `Ticket ${
        payload.status === FLIGHT_TICKET_IN_PROCESS
          ? 'has been issued'
          : 'is in process'
      }. Issued by ${payload.issued_by_type}`,
    });
    if (payload.issue_block) {
      tracking_data.push({
        flight_booking_id: payload.booking_id,
        description: `Issue block was enabled for this booking`,
      });
    }
    if (payload.due > 0) {
      tracking_data.push({
        flight_booking_id: payload.booking_id,
        description: `${
          payload.paid_amount
        } amount has been paid for the booking (loan amount - ${
          payload.loan_amount
        }, balance amount - ${
          payload.paid_amount - payload.loan_amount
        }). Due amount is ${payload.due}`,
      });
    }
    if (payload.api === CUSTOM_API) {
      tracking_data.push({
        flight_booking_id: payload.booking_id,
        description: `This was a custom API`,
      });
    }
    await flightBookingTrackingModel.insertFlightBookingTracking(tracking_data);

    //if there is due amount then create DEBIT transaction and money receipt
    if (payload.due > 0) {
      //update invoice
      const invoiceModel = this.Model.InvoiceModel(this.trx);
      await invoiceModel.updateInvoice(
        {
          due: payload.due,
        },
        payload.invoice_id
      );

      //create money receipt
      const moneyReceiptModel = this.Model.MoneyReceiptModel(this.trx);
      const money_receipt_number = await Lib.generateNo({
        trx: this.trx,
        type: GENERATE_AUTO_UNIQUE_ID.money_receipt,
      });
      await moneyReceiptModel.createMoneyReceipt({
        mr_no: money_receipt_number,
        amount: payload.paid_amount,
        details: `Auto Money Receipt has been generated for flight booking ref - ${payload.booking_ref}`,
        invoice_id: payload.invoice_id,
        user_id: payload.user_id,
        payment_time: new Date(),
      });

      const balanceLib = new BalanceLib(this.trx);
      await balanceLib.AgencyDeductBalance({
        agency_id: payload.agency_id,
        balance: payload.paid_amount,
        loan: payload.loan_amount,
        voucher_no: money_receipt_number,
        remark: `Transaction has been debited for flight booking ref - ${payload.booking_ref}. Due: ${payload.due}`,
        deduct: payload.deduct_amount_from,
      });
    }
  }

  public async getPaymentInformation(payload: IGetPaymentInformationReqBody) {
    //check if the payment is already done or not
    const invoiceModel = this.Model.InvoiceModel(this.trx);
    const getInvoice = await invoiceModel.getInvoiceList({
      ref_id: payload.booking_id,
      ref_type: TYPE_FLIGHT,
    });
    if (!getInvoice.data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message:
          'No invoice has been found for this booking. Ticket Issue cannot be proceed!',
      };
    }

    let price_deduction = false;
    if (getInvoice.data[0].due > 0) {
      price_deduction = true;
    }

    if (price_deduction) {
      //check if the payment is eligible for partial payment
      if (payload.payment_type === PAYMENT_TYPE_PARTIAL) {
        //case 1: refundable
        if (!payload.refundable) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Partial payment is not allowed for this flight',
          };
        }
        //case 2: departure date min 10 days from current date
        const departureDate = new Date(payload.departure_date);
        const currentDate = new Date();
        const timeDiff = departureDate.getTime() - currentDate.getTime();
        const minDiffInMilliSeconds =
          PARTIAL_PAYMENT_DEPARTURE_DATE * 24 * 60 * 60 * 1000;
        if (timeDiff < minDiffInMilliSeconds) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Partial payment is not allowed for this flight',
          };
        }
      }

      //check balance
      let payable_amount =
        payload.payment_type === PAYMENT_TYPE_PARTIAL
          ? (payload.ticket_price * PARTIAL_PAYMENT_PERCENTAGE) / 100
          : payload.ticket_price;
      const balanceLib = new BalanceLib(this.trx);
      const check_balance = await balanceLib.AgencyBalanceAvailabilityCheck({
        agency_id: payload.agency_id,
        price: payable_amount,
      });
      if (check_balance.availability === false) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'There is insufficient balance in your account',
        };
      } else {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          deduct_amount_from: check_balance.deduct,
          paid_amount: check_balance.balance,
          loan_amount: check_balance.loan,
          due: Number(getInvoice.data[0].due) - Number(payable_amount),
          invoice_id: getInvoice.data[0].id,
        };
      }
    } else {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        paid_amount: 0,
        load_amount: 0,
        due: 0,
        invoice_id: getInvoice.data[0].id,
      };
    }
  }
}
