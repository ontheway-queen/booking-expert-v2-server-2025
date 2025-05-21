import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import Lib from '../../../utils/lib/lib';
import { ITokenParseUser } from '../../public/utils/types/publicCommon.types';
import config from '../../../config/config';
import {
  IB2CUserChangePassReqBody,
  IUpdateUserProfileReqBody,
} from '../utils/types/b2cProfile.types';
import { IUpdateB2CUserPayload } from '../../../utils/modelTypes/b2cModelTypes/b2cModelTypes';

export default class B2CProfileService extends AbstractServices {
  constructor() {
    super();
  }

  public async getProfile(req: Request) {
    const { user_id } = req.user;
    const B2CUserModel = this.Model.B2CUserModel();
    const user = await B2CUserModel.checkUser({ id: user_id });

    if (!user) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    
    const tokenData: ITokenParseUser = {
      name: user.name,
      photo: user.photo,
      user_email: user.email,
      user_id: user.id,
      username: user.username,
      phone_number: user.phone_number,
    };

    const token = Lib.createToken(tokenData, config.JWT_SECRET_USER, '24h');

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.LOGIN_SUCCESSFUL,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        two_fa: user.two_fa,
        status: user.status,
        photo: user.photo,
        gender: user.gender,
      },
      token,
    };
  }

  public async updateProfile(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id, photo } = req.user;
      const body = req.body as IUpdateUserProfileReqBody;
      const B2CUserModel = this.Model.B2CUserModel(trx);

      const files = (req.files as Express.Multer.File[]) || [];
      const payload: IUpdateB2CUserPayload = { ...body };

      if (files.length === 1 || files.length === 0) {
        files.forEach((file) => {
          payload.photo = file.filename;
        });
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      if (!Object.keys(payload).length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      await B2CUserModel.updateUser(payload, user_id);

      if (photo && payload.photo) {
        await this.manageFile.deleteFromCloud([photo]);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          photo: payload.photo,
        },
      };
    });
  }

  public async changePassword(req: Request) {
    const { user_id } = req.user;
    const { new_password, old_password } =
      req.body as IB2CUserChangePassReqBody;
    const B2CUserModel = this.Model.B2CUserModel();

    const checkUser = await B2CUserModel.checkUser({
      id: user_id,
    });

    if (!checkUser) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const checkPass = await Lib.compareHashValue(
      old_password,
      checkUser.password_hash
    );

    if (!checkPass) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'Old password does not match.',
      };
    }

    const password_hash = await Lib.hashValue(new_password);

    await B2CUserModel.updateUser({ password_hash }, user_id);

    return {
      success: false,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PASSWORD_CHANGED,
    };
  }
}
