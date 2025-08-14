import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubBlogService } from '../../services/agentB2CServices/agentB2CSubBlog.service';
import { AgentB2CSubBlogValidator } from '../../utils/validators/agentB2CValidators/agentB2CSubBlog.validator';

export class AgentB2CSubBlogController extends AbstractController {
  private controller = new AgentB2CSubBlogService();
  private validator = new AgentB2CSubBlogValidator();

  public createBlog = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createBlogSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.controller.createBlog(req);

      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getBlogList = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getBlogListQuerySchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.controller.getBlogList(req);
      res.status(code).json(data);
    }
  );

  public getSingleBlog = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.controller.getSingleBlog(req);
      res.status(code).json(data);
    }
  );

  public updateBlog = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateBlogSchema,
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.controller.updateBlog(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public deleteBlog = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.controller.deleteBlog(req);
      res.status(code).json(data);
    }
  );
}
