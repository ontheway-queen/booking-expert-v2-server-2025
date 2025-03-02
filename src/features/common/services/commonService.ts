import { Request } from 'express';
import axios from 'axios';
import qs from 'qs';

class CommonServices extends AbstractServices {
  constructor() {
    super();
  }

  // Create pnr
  public async getStartupToken(req: Request) {
    const conn = this.Model.authModel();
    const { agency_id, name, id: user_id } = req.agency;

    const organization_info = await conn.getAgencyInfo(agency_id);

    const user = {
      user_full_name: name,
      user_id,
      organization_info,
    };
    return {
      success: true,
      message: 'Trabill agency startup token',
      user,
      code: this.StatusCode.HTTP_OK,
    };
  }

  // Get Sebre token
  public async getSabreToken() {
    try {
      let data = qs.stringify({
        grant_type: 'password',
        username: config.SABRE_USERNAME,
        password: config.SABRE_PASSWORD,
      });

      let axiosConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${config.SABRE_URL}/${GET_TOKEN_ENDPOINT}`,
        headers: {
          Authorization: `Basic ${config.SABRE_AUTH_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
      };

      axios
        .request(axiosConfig)
        .then(async (response) => {
          const data = response.data;

          const authModel = this.Model.authModel();
          await authModel.updateEnv(SEBRE_TOKEN_ENV_ID, {
            value: data.access_token,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
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

export default CommonServices;
