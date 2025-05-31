import { TDB } from '../../features/public/utils/types/publicCommon.types';
import AgencyModel from '../../models/agentModel/agencyModel';
import AgencyPaymentModel from '../../models/agentModel/agencyPaymentModel';

export default class BalanceLib {
  private trx: TDB;
  constructor(trx: TDB) {
    this.trx = trx;
  }

  public async AgencyBalanceAvailabilityCheck({
    agency_id,
    price,
  }: {
    agency_id: number;
    price: number;
  }): Promise<{
    availability: boolean;
    deduct: 'Balance' | 'Loan' | 'Both';
    balance: number;
    loan: number;
  }> {
    const agencyModel = new AgencyModel(this.trx);

    const balance = await agencyModel.getAgencyBalance(agency_id);

    const checkAgency = await agencyModel.checkAgency({ agency_id });

    if (balance > 0) {
      if (price <= balance) {
        return {
          availability: true,
          deduct: 'Balance',
          balance: price,
          loan: 0,
        };
      }

      if (price <= balance + Number(checkAgency?.usable_loan)) {
        return {
          availability: true,
          deduct: 'Both',
          balance: balance,
          loan: Number(checkAgency?.usable_loan) - price,
        };
      }
    }

    if (price <= Number(checkAgency?.usable_loan)) {
      return {
        availability: true,
        deduct: 'Loan',
        balance: 0,
        loan: price,
      };
    } else {
      return { availability: false, deduct: 'Both', balance: 0, loan: 0 };
    }
  }

  public async AgencyDeductBalance({
    balance,
    deduct,
    loan,
    remark,
    agency_id,
    voucher_no,
  }: {
    agency_id: number;
    deduct: 'Balance' | 'Loan' | 'Both';
    balance: number;
    loan: number;
    remark: string;
    voucher_no: string;
  }) {
    const agencyModel = new AgencyModel(this.trx);
    const agencyPaymentModel = new AgencyPaymentModel(this.trx);

    if (deduct === 'Balance') {
      await agencyPaymentModel.insertAgencyLedger({
        agency_id,
        amount: balance,
        voucher_no,
        details: remark,
        type: 'Debit',
      });

      return true;
    }

    if (deduct === 'Loan') {
      await agencyPaymentModel.insertAgencyLedger({
        agency_id,
        amount: loan,
        voucher_no,
        details: remark + `(Debited from Emergency credit.)`,
        type: 'Debit',
      });

      const checkAgency = await agencyModel.checkAgency({ agency_id });

      await agencyModel.updateAgency(
        {
          usable_loan: Number(checkAgency?.usable_loan) - loan,
        },
        agency_id
      );

      return true;
    }

    if (deduct === 'Both') {
      await agencyPaymentModel.insertAgencyLedger({
        agency_id,
        amount: loan + balance,
        voucher_no,
        details:
          remark +
          `(${balance}/- debited from balance, ${loan}/- debited from emergency credit.)`,
        type: 'Debit',
      });

      const checkAgency = await agencyModel.checkAgency({ agency_id });

      await agencyModel.updateAgency(
        {
          usable_loan: Number(checkAgency?.usable_loan) - loan,
        },
        agency_id
      );

      return true;
    }

    return false;
  }
}
