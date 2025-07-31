import { Request } from "express";
import AbstractServices from "../../../../abstract/abstract.service";

export class AgentB2CSubUmrahService extends AbstractServices{


 public async createUmrahPackage(req:Request){
    return await this.db.transaction(async(trx)=>{
         const model = this.Model.UmrahPackageModel(trx);
        const files = (req.files as Express.Multer.File[]) || [];

        const reqBody = req.body;
        const { slug } = reqBody;

          const check_slug = await model.getSingleUmrahPackageDetails({ slug: slug });

      if (check_slug) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.SLUG_EXISTS,
        };
      }
    })
 }
}