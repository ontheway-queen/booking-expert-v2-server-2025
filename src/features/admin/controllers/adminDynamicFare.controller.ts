import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AdminDynamicFareService from '../services/adminDynamicFare.service';
import { AdminDynamicFareValidator } from '../utils/validators/adminDynamicFare.validator';

export default class AdminDynamicFareController extends AbstractController {
  private service = new AdminDynamicFareService();
  private validator = new AdminDynamicFareValidator();

  constructor() {
    super();
  }

  public createSupplier = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createSupplier },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSupplier(req);
      res.status(code).json(data);
    }
  );

  public getSuppliers = this.asyncWrapper.wrap(
    { querySchema: this.validator.getSupplier },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSuppliers(req);
      res.status(code).json(data);
    }
  );

  public updateSupplier = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateSupplier,
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSupplier(req);
      res.status(code).json(data);
    }
  );

  public deleteSupplier = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteSupplier(req);
      res.status(code).json(data);
    }
  );

  public createSupplierAirlinesFare = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createSupplierAirlinesFare,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSupplierAirlinesFare(
        req
      );
      res.status(code).json(data);
    }
  );

  public getSupplierAirlinesFares = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getSupplierAirlinesFare,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSupplierAirlinesFares(
        req
      );
      res.status(code).json(data);
    }
  );

  public updateSupplierAirlinesFare = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateSupplierAirlinesFare,
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSupplierAirlinesFare(
        req
      );
      res.status(code).json(data);
    }
  );

  public deleteSupplierAirlinesFare = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteSupplierAirlinesFare(
        req
      );
      res.status(code).json(data);
    }
  );

  public createFareTax = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createFareTax,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createFareTax(req);
      res.status(code).json(data);
    }
  );

  public getFareTaxes = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getFareTax,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getFareTaxes(req);
      res.status(code).json(data);
    }
  );

  public updateFareTax = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateFareTax,
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateFareTax(req);
      res.status(code).json(data);
    }
  );

  public deleteFareTax = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteFareTax(req);
      res.status(code).json(data);
    }
  );
}
