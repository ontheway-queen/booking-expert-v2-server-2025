import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminConfigService } from '../services/adminConfig.service';
import AdminConfigValidator from '../utils/validators/adminConfig.validator';

export default class AdminConfigController extends AbstractController {
    private validator = new AdminConfigValidator();
    private service = new AdminConfigService();
    constructor() {
        super();
    }

    public checkSlug = this.asyncWrapper.wrap(
        { querySchema: this.validator.checkSlugSchema },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.checkSlug(req);
            res.status(code).json(data);
        }
    );


}
