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

    public getMarkupSet = this.asyncWrapper.wrap(
        { querySchema: this.validator.getMarkupSetSchema },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.getMarkupSet(req);
            res.status(code).json(data);
        }
    );

    public getSingleMarkupSet = this.asyncWrapper.wrap(
        { paramSchema: this.commonValidator.singleParamNumValidator() },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.getSingleMarkupSet(req);
            res.status(code).json(data);
        }
    );

    public updateMarkupSet = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updateCommissionSetSchema
        },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.updateMarkupSet(req);
            res.status(code).json(data);
        }
    );

    public deleteMarkupSet = this.asyncWrapper.wrap(
        { paramSchema: this.commonValidator.singleParamNumValidator() },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.deleteMarkupSet(req);
            res.status(code).json(data);
        }
    );

    public getMarkupSetFlightApiDetails = this.asyncWrapper.wrap(
        { paramSchema: this.commonValidator.multipleParamsNumValidator(["set_id", "set_api_id"]) },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.getMarkupSetFlightApiDetails(req);
            res.status(code).json(data);
        }
    );

    public updateMarkupSetFlightApi = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.multipleParamsNumValidator(["set_id", "set_api_id"]),
            bodySchema: this.validator.updateFlightMarkupsSchema
        },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.updateMarkupSetFlightApi(req);
            res.status(code).json(data);
        }
    );
}
