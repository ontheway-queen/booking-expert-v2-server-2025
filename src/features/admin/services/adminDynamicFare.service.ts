import AbstractServices from '../../../abstract/abstract.service';
import { Request } from 'express';
import CustomError from '../../../utils/lib/customError';
import { ICreateSupplierAirlinesDynamicFarePayload } from '../../../utils/modelTypes/dynamicFareRulesModelTypes/dynamicFareModelTypes';

export default class AdminDynamicFareService extends AbstractServices {
  // ------------------ Dynamic Fare Supplier ------------------
  public async createSupplier(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.DynamicFareModel(trx);
      const check_entry = await model.getDynamicFareSuppliers({
        set_id: req.body.set_id,
        supplier_id: req.body.supplier_id,
      });
      if (check_entry.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'This supplier already exists for this set',
        };
      }
      const res = await model.createDynamicFareSupplier(req.body);
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Supplier created',
        data: { id: res[0]?.id },
      };
    });
  }

  public async getSuppliers(req: Request) {
    const { set_id } = req.query;
    const model = this.Model.DynamicFareModel();
    const data = await model.getDynamicFareSuppliers({
      set_id: Number(set_id),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateSupplier(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getDynamicFareSupplierById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.updateDynamicFareSupplier(Number(id), req.body);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Supplier updated',
    };
  }

  public async deleteSupplier(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getDynamicFareSupplierById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.deleteDynamicFareSupplier(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Supplier deleted',
    };
  }

  // ------------------ Supplier Airlines Dynamic Fare ------------------
  public async createSupplierAirlinesFare(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.DynamicFareModel(trx);
      const { body } = req.body as {
        body: {
          dynamic_fare_supplier_id: number;
          airline: string;
          from_dac?: boolean;
          to_dac?: boolean;
          soto?: boolean;
          domestic?: boolean;
          commission_type?: 'PER' | 'FLAT';
          commission?: number;
          markup_type?: 'PER' | 'FLAT';
          markup?: number;
          flight_class?: string;
          segment_commission?: number;
          pax_markup?: number;
          segment_commission_type?: 'PER' | 'FLAT';
          segment_markup?: number;
          segment_markup_type?: 'PER' | 'FLAT' | undefined;
        }[];
      };

      const payload: ICreateSupplierAirlinesDynamicFarePayload[] = [];

      for (const elm of body) {
        const checkDynamic = await model.getDynamicFareSupplierById(
          elm.dynamic_fare_supplier_id
        );

        if (checkDynamic.length) {
          const airlineCodes = elm.airline
            .split(',')
            .map((code: string) => code.trim().toUpperCase());

          for (const code of airlineCodes) {
            payload.push({
              ...elm,
              airline: code,
            });
          }
        }
      }

      if (!payload.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Dynamic fare supplier id not found.',
        };
      }

      await model.createSupplierAirlinesFare(payload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Supplier airline fare created',
      };
    });
  }

  public async getSupplierAirlinesFares(req: Request) {
    const { dynamic_fare_supplier_id } = req.query;
    const model = this.Model.DynamicFareModel();
    const data = await model.getSupplierAirlinesFares({
      dynamic_fare_supplier_id: Number(dynamic_fare_supplier_id),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateSupplierAirlinesFare(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getSupplierAirlinesFareById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.updateSupplierAirlinesFare(Number(id), req.body);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Supplier airline fare updated',
    };
  }

  public async deleteSupplierAirlinesFare(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getSupplierAirlinesFareById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.deleteSupplierAirlinesFare(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Supplier airline fare deleted',
    };
  }

  // ------------------ Dynamic Fare Tax ------------------
  public async createFareTax(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.DynamicFareModel(trx);
      const { body } = req.body;

      for (const elm of body) {
        const airlineCodes = elm.airline
          .split(',')
          .map((code: string) => code.trim().toUpperCase());

        for (const code of airlineCodes) {
          const check_duplicate = await model.getFareTaxes({
            dynamic_fare_supplier_id: elm.dynamic_fare_supplier_id,
            airline: code,
            tax_name: elm.tax_name,
          });

          if (check_duplicate.length) {
            throw new CustomError(
              `This tax (${elm.tax_name}) already exists for airline (${code})`,
              this.StatusCode.HTTP_CONFLICT
            );
          }

          await model.createFareTax({
            ...elm,
            airline: code,
          });
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Fare tax created',
      };
    });
  }

  public async getFareTaxes(req: Request) {
    const { dynamic_fare_supplier_id } = req.query;
    const model = this.Model.DynamicFareModel();
    const data = await model.getFareTaxes({
      dynamic_fare_supplier_id: Number(dynamic_fare_supplier_id),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateFareTax(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getFareTaxById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.updateFareTax(Number(id), req.body);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Fare tax updated',
    };
  }

  public async deleteFareTax(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getFareTaxById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.deleteFareTax(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Fare tax deleted',
    };
  }
}
