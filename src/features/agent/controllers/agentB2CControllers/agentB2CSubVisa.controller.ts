import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubVisaService } from '../../services/agentB2CServices/agentB2CSubVisa.service';
import { AgentB2CSubVisaValidator } from '../../utils/validators/agentB2CValidators/agentB2CSubVisa.validator';

export class AgentB2CSubVisaController extends AbstractController {
  private service = new AgentB2CSubVisaService();
  private validator = new AgentB2CSubVisaValidator();

  //create visa
  public createVisa = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createVisaValidatorSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createVisa(req);
      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  //get visa list
  public getVisaList = this.asyncWrapper.wrap(
    { querySchema: this.validator.getVisaListValidatorSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getVisaList(req);
      res.status(code).json(rest);
    }
  );

  //get single visa
  public getSingleVisa = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleVisa(req);
      res.status(code).json(rest);
    }
  );

  public updateVisa = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateVisaValidatorSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.updateVisa(req);
      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  public deleteVisa = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.deleteVisa(req);
      res.status(code).json(rest);
    }
  );

  public getAgentB2CApplicationList = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAgentB2CApplicationListValidatorSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAgentB2CApplicationList(req);
      res.status(code).json(rest);
    }
  );

  public getAgentB2CSingleApplication = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAgentB2CSingleVisaApplication(req);
      res.status(code).json(rest);
    }
  );
}
