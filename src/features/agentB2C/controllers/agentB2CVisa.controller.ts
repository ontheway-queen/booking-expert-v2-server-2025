import AbstractController from "../../../abstract/abstract.controller";
import { AgentB2CVisaService } from "../services/agentB2CVisa.service";



export class AgentB2CVisaController extends AbstractController {
    private service = new AgentB2CVisaService()
}