import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentB2CBlogService } from '../services/agentB2CBlog.service';
import AgentB2CBlogValidator from '../utils/validators/agentB2CBlog.validator';

export class AgentB2CBlogController extends AbstractController {
  private controller = new AgentB2CBlogService();
  private validator = new AgentB2CBlogValidator();

  public getBlogList = this.asyncWrapper.wrap(
    { querySchema: this.validator.getBlog },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.controller.getBlogList(req);
      res.status(code).json(data);
    }
  );

  public getSingleBlog = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamStringValidator('slug'),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.controller.getSingleBlog(req);
      res.status(code).json(data);
    }
  );
}
