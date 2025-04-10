import { Request, Response } from "express";
import AbstractServices from "../../../abstract/abstract.service";

export class AgentFlightService extends AbstractServices {
  constructor() {
    super();
  }

  //flight search
  public async flightSearch(req: Request, res: Response){
    return this.db.transaction(async (trx)=>{
    
    });
  }

 
}