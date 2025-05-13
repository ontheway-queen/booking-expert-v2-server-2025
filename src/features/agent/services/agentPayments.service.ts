import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import { DEPOSIT_STATUS_CANCELLED, DEPOSIT_STATUS_PENDING, GENERATE_AUTO_UNIQUE_ID, PAYMENT_GATEWAYS, SOURCE_AGENT } from "../../../utils/miscellaneous/constants";
import { PaymentSupportService } from "../../../utils/supportServices/paymentSupportServices/paymentSupport.service";
import { ICreateDepositPayload, IGetAgentLedgerHistoryQuery, IGetAgentLoanHistoryQuery, ITopUpUsingPaymentGatewayReqBody } from "../utils/types/agentPayment.types";

export class AgentPaymentsService extends AbstractServices {

    public async getLoanHistory(req: Request) {
        const { agency_id } = req.agencyUser;
        const restQuery = req.query as unknown as IGetAgentLoanHistoryQuery;
        const AgencyPaymentModel = this.Model.AgencyPaymentModel();

        const data = await AgencyPaymentModel.getLoanHistory(
            {
                agency_id,
                ...restQuery,
            },
            true
        );

        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: this.ResMsg.HTTP_OK,
            data: data.data,
            total: data.total || 0,
        };
    }

    public async getLedger(req: Request) {
        const { agency_id } = req.agencyUser;
        const restQuery = req.query as IGetAgentLedgerHistoryQuery;
        const AgencyPaymentModel = this.Model.AgencyPaymentModel();

        const data = await AgencyPaymentModel.getAgencyLedger({
            agency_id,
            ...restQuery,
        });

        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: this.ResMsg.HTTP_OK,
            data: data.data,
            total: data.total || 0,
        };
    }

    public async createDepositRequest(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { user_id, agency_id } = req.agencyUser;

            const paymentModel = this.Model.AgencyPaymentModel(trx);

            const check_duplicate = await paymentModel.getDepositRequestList({ agency_id, status: DEPOSIT_STATUS_PENDING });

            if (!check_duplicate.data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Your previous deposit request is still in pending. New deposit request cannot be made"
                }
            }

            const body = req.body as ICreateDepositPayload;

            const request_no = await Lib.generateNo({ trx, type: GENERATE_AUTO_UNIQUE_ID.agent_deposit_request });

            const files = (req.files as Express.Multer.File[]) || [];
            let docs = "";
            files.forEach((file) => {
                switch (file.fieldname) {
                    case 'docs':
                        docs = file.filename;
                        break;
                    default:
                        throw new CustomError(
                            'Invalid files. Please provide valid docs',
                            this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
                        );
                }
            });

            const deposit_body = {
                request_no,
                agency_id,
                ...body,
                docs,
                created_by: user_id
            };

            const res = await paymentModel.createDepositRequest(deposit_body);

            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Deposit request has been created",
                data: {
                    id: res[0].id
                }
            }

        });
    }

    public async getCurrentDepositRequest(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { agency_id } = req.agencyUser;
            const paymentModel = this.Model.AgencyPaymentModel(trx);
            const getCurrentDepositData = await paymentModel.getDepositRequestList({ agency_id, status: DEPOSIT_STATUS_PENDING, limit: 1 }, false);
            if (!getCurrentDepositData.data.length) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: []
                }
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: getCurrentDepositData.data[0]
            }
        });
    }

    public async cancelCurrentDepositRequest(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { agency_id } = req.agencyUser;
            const paymentModel = this.Model.AgencyPaymentModel(trx);
            const getCurrentDepositData = await paymentModel.getDepositRequestList({ agency_id, status: DEPOSIT_STATUS_PENDING, limit: 1 }, false);
            if (!getCurrentDepositData.data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "No Pending deposit request has been found!"
                }
            };

            await paymentModel.updateDepositRequest({ status: DEPOSIT_STATUS_CANCELLED }, getCurrentDepositData.data[0].id);

            return {
                success: false,
                code: this.StatusCode.HTTP_OK,
                message: "Deposit request has been cancelled"
            }
        });
    }

    public async getDepositHistory(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { agency_id } = req.agencyUser;
            const paymentModel = this.Model.AgencyPaymentModel(trx);
            const query = req.query;
            const depositData = await paymentModel.getDepositRequestList({ ...query, agency_id }, true);

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                count: depositData.total,
                data: depositData.data
            }
        });
    }

    public async topUpUsingPaymentGateway(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { agency_id, user_id, name, user_email, phone_number } = req.agencyUser;
            const body = req.body;
            const { amount, currency, payment_gateway, success_page, failed_page, cancelled_page, is_app } = req.body as ITopUpUsingPaymentGatewayReqBody;

            const paymentService = new PaymentSupportService();

            switch (payment_gateway) {
                case PAYMENT_GATEWAYS.SSL:
                    return await paymentService.SSLPaymentGateway({
                        total_amount: amount,
                        currency,
                        tran_id: `${SOURCE_AGENT}-${agency_id}-${user_id}`,
                        cus_name: name,
                        cus_email: user_email,
                        cus_phone: phone_number,
                        product_name: 'credit load',
                        success_page,
                        failed_page,
                        cancelled_page,
                    });

                default:
                    return {
                        success: false,
                        message: 'Invalid bank',
                        redirectUrl: null,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                    };
            }
        });
    }

    public async getADMList(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { agency_id } = req.agencyUser;
            const admModel = this.Model.ADMManagementModel(trx);
            const query = req.query;
            const data = await admModel.getADMManagementList({ ...query, agency_id, adm_for: SOURCE_AGENT }, true);

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data
            }
        });
    }


}