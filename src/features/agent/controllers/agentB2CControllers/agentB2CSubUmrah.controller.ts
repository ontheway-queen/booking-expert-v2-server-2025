import AbstractController from "../../../../abstract/abstract.controller";
import { AgentB2CSubUmrahService } from "../../services/agentB2CServices/agentB2CSubUmrah.service";

export class AgentB2CSubUmrahController extends AbstractController {
    private services = new AgentB2CSubUmrahService();
    
}