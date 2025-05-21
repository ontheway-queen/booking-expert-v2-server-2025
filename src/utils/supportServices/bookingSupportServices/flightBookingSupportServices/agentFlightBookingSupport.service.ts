import { Knex } from "knex";
import AbstractServices from "../../../../abstract/abstract.service";
import { ICheckAgentDirectTicketIssuePermissionPayload } from "../../../supportTypes/bookingSupportTypes/flightBookingSupportTypes/agentFlightBookingTypes";
import { CUSTOM_API, FLIGHT_TICKET_IN_PROCESS, FLIGHT_TICKET_ISSUE } from "../../../miscellaneous/flightConstent";
import Lib from "../../../lib/lib";
import { GENERATE_AUTO_UNIQUE_ID, SOURCE_ADMIN, SOURCE_AGENT, SOURCE_AGENT_B2C, SOURCE_B2C } from "../../../miscellaneous/constants";
import EmailSendLib from "../../../lib/emailSendLib";
import { flightTicketIssueBodyTemplate } from "../../../templates/flightTicketIssueTemplate";
import { IInsertFlightBookingTrackingPayload } from "../../../modelTypes/flightModelTypes/flightBookingTrackingModelTypes";

export class AgentFlightBookingSupportService extends AbstractServices {
    private trx: Knex.Transaction;
    constructor(trx: Knex.Transaction) {
        super();
        this.trx = trx;
    }

    public async checkAgentDirectTicketIssuePermission(payload: ICheckAgentDirectTicketIssuePermissionPayload) {
        //get flight markup set id
        const agencyModel = this.Model.AgencyModel(this.trx);
        const agency_details = await agencyModel.checkAgency({ agency_id: payload.agency_id });
        if (!agency_details?.flight_markup_set) {
            return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'No commission set has been found for the agency',
            };
        }

        const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(this.trx);
        const set_flight_api = await markupSetFlightApiModel.getMarkupSetFlightApi({
            markup_set_id: agency_details.flight_markup_set,
            api_name: payload.api_name
        });

        //custom API
        if (!set_flight_api.length) {
            return {
                issue_block: false
            }
        }

        const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
        const flightMarkupData = await flightMarkupsModel.getAllFlightMarkups({
            markup_set_flight_api_id: set_flight_api[0].id,
            airline: payload.airline
        });

        if (!flightMarkupData.data.length) {
            return {
                success: false,
                code: this.StatusCode.HTTP_NOT_FOUND,
                message: this.ResMsg.AIRLINE_DATA_NOT_PRESENT_FOR_MARKUP
            }
        }

        if (flightMarkupData.data[0].issue_block) {
            return {
                issue_block: true
            }
        } else {
            return {
                issue_block: false
            }
        }
    }

    public async updateDataAfterTicketIssue(payload: {
        booking_id: number;
        status: typeof FLIGHT_TICKET_IN_PROCESS | typeof FLIGHT_TICKET_ISSUE;
        due: number;
        agency_id: number;
        booking_ref: string;
        paid_amount: number;
        loan_amount: number;
        invoice_id: number;
        user_id: number;
        email: string;
        issued_by_type: typeof SOURCE_ADMIN | typeof SOURCE_AGENT | typeof SOURCE_AGENT_B2C | typeof SOURCE_B2C;
        issued_by_user_id: number;
        issue_block?: boolean;
    }) {
        //update booking
        const flightBookingModel = this.Model.FlightBookingModel(this.trx);
        await flightBookingModel.updateFlightBooking({
            status: payload.status,
            api: payload.status === FLIGHT_TICKET_IN_PROCESS ? CUSTOM_API : undefined,
            issued_at: new Date(),
            issued_by_type: payload.issued_by_type,
            issued_by_user_id: payload.issued_by_user_id,
        }, payload.booking_id);

        //add tracking
        const flightBookingTrackingModel = this.Model.FlightBookingTrackingModel(this.trx);
        const tracking_data: IInsertFlightBookingTrackingPayload[] = [];
        tracking_data.push({
            flight_booking_id: payload.booking_id,
            description: `Ticket ${payload.status === FLIGHT_TICKET_IN_PROCESS ? 'has been issued' : 'is in process'}`,
        });
        if (payload.issue_block) {
            tracking_data.push({
                flight_booking_id: payload.booking_id,
                description: `Issue block was enabled for this booking`,
            });
        }
        if(payload.due > 0){
            tracking_data.push({
                flight_booking_id: payload.booking_id,
                description: `${payload.paid_amount} amount has been paid for the booking (loan amount - ${payload.loan_amount}, balance amount - ${payload.paid_amount - payload.loan_amount}). Due amount is ${payload.due}`,
            });
        }
        await flightBookingTrackingModel.insertFlightBookingTracking(tracking_data);


        //if there is due amount then create DEBIT transaction and money receipt
        if (payload.due > 0) {
            //update invoice
            const invoiceModel = this.Model.InvoiceModel(this.trx);
            await invoiceModel.updateInvoice({
                due: payload.due,
            }, payload.invoice_id);

            const transaction_amount = payload.paid_amount - payload.loan_amount;

            //create transaction
            const transactionModel = this.Model.AgencyPaymentModel(this.trx);
            await transactionModel.insertAgencyLedger({
                agency_id: payload.agency_id,
                type: 'Debit',
                amount: transaction_amount,
                details: `Transaction has been debited for flight booking ref - ${payload.booking_ref}. Due: ${payload.due}`,
                voucher_no: `FLIGHT_BOOKING_${payload.booking_ref}`
            });

            //create money receipt
            const moneyReceiptModel = this.Model.MoneyReceiptModel(this.trx);
            await moneyReceiptModel.createMoneyReceipt({
                mr_number: await Lib.generateNo({ trx: this.trx, type: GENERATE_AUTO_UNIQUE_ID.money_receipt }),
                amount: payload.paid_amount,
                details: `Auto Money Receipt has been generated for flight booking ref - ${payload.booking_ref}`,
                invoice_id: payload.invoice_id,
                user_id: payload.user_id,
                payment_time: new Date(),
            });

            //update usable loan amount
            if (payload.loan_amount > 0) {
                const agencyModel = this.Model.AgencyModel(this.trx);
                const agency_details = await agencyModel.getSingleAgency(payload.agency_id);
                const usable_loan_balance = Number(agency_details?.usable_loan);
                await agencyModel.updateAgency({
                    usable_loan: Number(usable_loan_balance) - Number(payload.loan_amount)
                }, payload.agency_id);
            }
        }


    }


}