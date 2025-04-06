import AbstractServices from '../../../abstract/abstract.service';

export default class PublicEmailOTPService extends AbstractServices {
  constructor() {
    super();
  }

  // send email otp service
  public async sendEmailOtp(req: Request) {
    const { email, type } = req.body;

    let error = false;

    switch (type) {
      case OTP_TYPE_RESET_BTOC_USER:
        const { agency_id } = req.btocAgency;
        const btocUserModel = this.Model.userModel();

        const checkbtocUser = await btocUserModel.getUser({ agency_id, email });

        if (!checkbtocUser.length) {
          error = true;
        }
        break;
      case OTP_TYPE_RESET_BTOB_USER:
        const btobUserModel = this.Model.btobUsersModel();
        const checkbtobUser = await btobUserModel.getSingleUser({ email });

        if (!checkbtobUser.length) {
          error = true;
        }
        break;
      case OTP_TYPE_RESET_ADMIN_USER:
        const adminModel = this.Model.adminModel();
        const checkAdmin = await adminModel.getSingleAdmin({
          email,
        });

        if (!checkAdmin.length) {
          error = true;
        }
        break;
      default:
        throw new Error('Invalid type.');
        break;
    }
  }
}
