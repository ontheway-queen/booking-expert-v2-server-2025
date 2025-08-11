import AbstractController from '../../../abstract/abstract.controller';
import AgentB2CPaymentService from '../services/agentB2CPayment.service';

export default class AgentB2CPaymentController extends AbstractController {
  private service = new AgentB2CPaymentService();
  constructor() {
    super();
  }
}
