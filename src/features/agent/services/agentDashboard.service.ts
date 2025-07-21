import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';

export class AgentDashboardService extends AbstractServices {
  constructor() {
    super();
  }

  public async getDashboardData(req: Request) {
    const { agency_id } = req.agencyUser;
  }
}
