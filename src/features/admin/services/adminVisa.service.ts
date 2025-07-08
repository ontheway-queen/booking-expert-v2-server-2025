import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';

export default class AdminVisaService extends AbstractServices {
  constructor() {
    super();
  }

  public async createVisa(req: Request) {
    const { user_id } = req.admin;
    const body = req.body;
  }
}
