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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentFlightBookingSupportService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const flightConstent_1 = require("../../../miscellaneous/flightConstent");
const lib_1 = __importDefault(require("../../../lib/lib"));
const constants_1 = require("../../../miscellaneous/constants");
class AgentFlightBookingSupportService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    checkAgentDirectTicketIssuePermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            //get flight markup set id
            const agencyModel = this.Model.AgencyModel(this.trx);
            const agency_details = yield agencyModel.checkAgency({
                agency_id: payload.agency_id,
            });
            if (!(agency_details === null || agency_details === void 0 ? void 0 : agency_details.flight_markup_set)) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'No commission set has been found for the agency',
                };
            }
            const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(this.trx);
            const set_flight_api = yield markupSetFlightApiModel.getMarkupSetFlightApi({
                markup_set_id: agency_details.flight_markup_set,
                api_name: payload.api_name,
            });
            //custom API
            if (!set_flight_api.length) {
                return {
                    issue_block: false,
                };
            }
            const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
            const flightMarkupData = yield flightMarkupsModel.getAllFlightMarkups({
                markup_set_flight_api_id: set_flight_api[0].id,
                airline: payload.airline,
            });
            if (!flightMarkupData.data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.AIRLINE_DATA_NOT_PRESENT_FOR_MARKUP,
                };
            }
            if (flightMarkupData.data[0].issue_block) {
                return {
                    issue_block: true,
                };
            }
            else {
                return {
                    issue_block: false,
                };
            }
        });
    }
    updateDataAfterTicketIssue(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            //update booking
            const flightBookingModel = this.Model.FlightBookingModel(this.trx);
            yield flightBookingModel.updateFlightBooking({
                status: payload.status,
                api: payload.status === flightConstent_1.FLIGHT_TICKET_IN_PROCESS ? flightConstent_1.CUSTOM_API : undefined,
                issued_at: new Date(),
                issued_by_type: payload.issued_by_type,
                issued_by_user_id: payload.issued_by_user_id,
            }, payload.booking_id);
            //add tracking
            const flightBookingTrackingModel = this.Model.FlightBookingTrackingModel(this.trx);
            const tracking_data = [];
            tracking_data.push({
                flight_booking_id: payload.booking_id,
                description: `Ticket ${payload.status === flightConstent_1.FLIGHT_TICKET_IN_PROCESS
                    ? 'has been issued'
                    : 'is in process'}. Issued by ${payload.issued_by_type}`,
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
                    description: `${payload.paid_amount} amount has been paid for the booking (loan amount - ${payload.loan_amount}, balance amount - ${payload.paid_amount - payload.loan_amount}). Due amount is ${payload.due}`,
                });
            }
            if (payload.api === flightConstent_1.CUSTOM_API) {
                tracking_data.push({
                    flight_booking_id: payload.booking_id,
                    description: `This was a custom API`,
                });
            }
            yield flightBookingTrackingModel.insertFlightBookingTracking(tracking_data);
            //if there is due amount then create DEBIT transaction and money receipt
            if (payload.due > 0) {
                //update invoice
                const invoiceModel = this.Model.InvoiceModel(this.trx);
                yield invoiceModel.updateInvoice({
                    due: payload.due,
                }, payload.invoice_id);
                const transaction_amount = payload.paid_amount - payload.loan_amount;
                //create transaction
                const transactionModel = this.Model.AgencyPaymentModel(this.trx);
                yield transactionModel.insertAgencyLedger({
                    agency_id: payload.agency_id,
                    type: 'Debit',
                    amount: transaction_amount,
                    details: `Transaction has been debited for flight booking ref - ${payload.booking_ref}. Due: ${payload.due}`,
                    voucher_no: `FLIGHT_BOOKING_${payload.booking_ref}`,
                });
                //create money receipt
                const moneyReceiptModel = this.Model.MoneyReceiptModel(this.trx);
                yield moneyReceiptModel.createMoneyReceipt({
                    mr_no: yield lib_1.default.generateNo({
                        trx: this.trx,
                        type: constants_1.GENERATE_AUTO_UNIQUE_ID.money_receipt,
                    }),
                    amount: payload.paid_amount,
                    details: `Auto Money Receipt has been generated for flight booking ref - ${payload.booking_ref}`,
                    invoice_id: payload.invoice_id,
                    user_id: payload.user_id,
                    payment_time: new Date(),
                });
                //update usable loan amount
                if (payload.loan_amount > 0) {
                    const agencyModel = this.Model.AgencyModel(this.trx);
                    const agency_details = yield agencyModel.getSingleAgency(payload.agency_id);
                    const usable_loan_balance = Number(agency_details === null || agency_details === void 0 ? void 0 : agency_details.usable_loan);
                    yield agencyModel.updateAgency({
                        usable_loan: Number(usable_loan_balance) - Number(payload.loan_amount),
                    }, payload.agency_id);
                }
            }
        });
    }
    getPaymentInformation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            //check if the payment is already done or not
            const invoiceModel = this.Model.InvoiceModel(this.trx);
            const getInvoice = yield invoiceModel.getInvoiceList({
                ref_id: payload.booking_id,
                ref_type: constants_1.INVOICE_REF_TYPES.agent_flight_booking,
            });
            if (!getInvoice.data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'No invoice has been found for this booking. Ticket Issue cannot be proceed!',
                };
            }
            let price_deduction = false;
            if (getInvoice.data[0].due > 0) {
                price_deduction = true;
            }
            if (price_deduction) {
                //check if the payment is eligible for partial payment
                if (payload.payment_type === flightConstent_1.PAYMENT_TYPE_PARTIAL) {
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
                    const minDiffInMilliSeconds = flightConstent_1.PARTIAL_PAYMENT_DEPARTURE_DATE * 24 * 60 * 60 * 1000;
                    if (timeDiff < minDiffInMilliSeconds) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Partial payment is not allowed for this flight',
                        };
                    }
                }
                //check balance
                const agencyModel = this.Model.AgencyModel(this.trx);
                const agencyBalance = yield agencyModel.getAgencyBalance(payload.agency_id);
                let payable_amount = payload.payment_type === flightConstent_1.PAYMENT_TYPE_PARTIAL
                    ? (payload.ticket_price * flightConstent_1.PARTIAL_PAYMENT_PERCENTAGE) / 100
                    : payload.ticket_price;
                if (payable_amount > getInvoice.data[0].due) {
                    payable_amount = getInvoice.data[0].due;
                }
                if (payable_amount > agencyBalance) {
                    //check usable loan balance
                    const agency_details = yield agencyModel.getSingleAgency(payload.agency_id);
                    const usable_loan_balance = Number(agency_details === null || agency_details === void 0 ? void 0 : agency_details.usable_loan);
                    if (agencyBalance + usable_loan_balance < payable_amount) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'There is insufficient balance in your account',
                        };
                    }
                }
                //return amount
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    paid_amount: payable_amount,
                    loan_amount: payable_amount - agencyBalance > 0
                        ? payable_amount - agencyBalance
                        : 0,
                    due: Number(getInvoice.data[0].due) - Number(payable_amount),
                    invoice_id: getInvoice.data[0].id,
                };
            }
            else {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    paid_amount: 0,
                    load_amount: 0,
                    due: 0,
                    invoice_id: getInvoice.data[0].id,
                };
            }
        });
    }
}
exports.AgentFlightBookingSupportService = AgentFlightBookingSupportService;
