import { Knex } from 'knex';
import AbstractServices from '../../../abstract/abstract.service';

export default class FitsAirFlightService extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
  }
}
