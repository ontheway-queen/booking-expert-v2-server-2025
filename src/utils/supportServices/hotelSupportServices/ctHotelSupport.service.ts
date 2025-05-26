import { Knex } from 'knex';
import AbstractServices from '../../../abstract/abstract.service';

export class CTHotelSupportService extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  // Get Balance
  public async GetBalance() {}
}
