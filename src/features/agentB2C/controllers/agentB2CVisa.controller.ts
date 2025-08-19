import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentB2CVisaService } from '../services/agentB2CVisa.service';
import { AgentB2CVisaValidator } from '../utils/validators/agentB2CVisa.validator';

export class AgentB2CVisaController extends AbstractController {
  private service = new AgentB2CVisaService();
  private validator = new AgentB2CVisaValidator();

  //get all visa list
  public getAllVisaList = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getAllVisaListQuerySchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllVisaList(req);
      res.status(code).json(rest);
    }
  );

  //get single visa
  public getSingleVisa = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamStringValidator('slug'),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleVisa(req);
      res.status(code).json(rest);
    }
  );

  //create visa
  public createVisaApplication = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.createVisaValidatorSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createVisaApplication(req);
      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );


  //get visa application list
  public getVisaApplicationList = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getVisaApplicationListQuerySchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getVisaApplicationList(req);
      res.status(code).json(rest);
    }
  );

  //get single visa application
  public getSingleVisaApplication = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleVisaApplication(req);
      res.status(code).json(rest);
    }
  );
}
