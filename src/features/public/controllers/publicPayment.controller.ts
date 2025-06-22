import AbstractController from '../../../abstract/abstract.controller';
import { PublicPaymentService } from '../services/publicPayment.service';
import { Request, Response } from 'express';

export class PublicPaymentController extends AbstractController {
  private service = new PublicPaymentService();

  constructor() {
    super();
  }

  public transactionUsingSSL = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.transactionUsingSSL(req);
      if (rest.redirect_url) {
        res.status(code).redirect(rest.redirect_url);
      } else {
        res.status(code).json(rest);
      }
    }
  );
}
