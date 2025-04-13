import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminMarkupSetService } from '../services/adminMarkupSet.service';
import AdminMarkupSetValidator from '../utils/validators/adminMarkupSet.validator';

export default class AdminMarkupSetController extends AbstractController {
    private validator = new AdminMarkupSetValidator();
    private service = new AdminMarkupSetService();
    constructor() {
        super();
    }

    public createCommissionSet = this.asyncWrapper.wrap(
        { bodySchema: this.validator.createMarkupSetSchema },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.createMarkupSet(req);
            res.status(code).json(data);
        }
    );
}
