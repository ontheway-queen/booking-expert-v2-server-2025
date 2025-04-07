import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import CustomError from '../../../../utils/lib/customError';

export default class AdminAgentAgencyController extends AbstractController {
  constructor() {
    super();
  }

  public insertDeposit = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      res
        .status(200)
        .json({ success: true, message: 'Deposit inserted successfully' });
    }
  );
}
