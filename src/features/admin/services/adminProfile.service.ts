import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import Lib from '../../../utils/lib/lib';
import {
  IAdminChangePassReqBody,
  IUpdateAdminProfileReqBody,
} from '../utils/types/adminProfile.types';
import { IUpdateAdminPayload } from '../../../utils/modelTypes/adminModelTypes/adminModel.types';
import { CTHotelSupportService } from '../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service';

export default class AdminProfileService extends AbstractServices {
  constructor() {
    super();
  }

  public async getProfile(req: Request) {
    const { user_id } = req.admin;
    const adminModel = this.Model.AdminModel();

    const admin = await adminModel.getSingleAdmin({ id: user_id });

    if (!admin) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const role = await adminModel.getSingleRoleWithPermissions(admin.role_id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.LOGIN_SUCCESSFUL,
      data: {
        two_fa: admin.two_fa,
        status: admin.status,
        email: admin.email,
        id: admin.id,
        username: admin.username,
        name: admin.name,
        photo: admin.photo,
        phone_number: admin.phone_number,
        gender: admin.gender,
        is_main_user: admin.is_main_user,
        role,
      },
    };
  }

  public async updateProfile(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id, photo } = req.admin;
      const body = req.body as IUpdateAdminProfileReqBody;
      const adminModel = this.Model.AdminModel(trx);

      const files = (req.files as Express.Multer.File[]) || [];
      const payload: IUpdateAdminPayload = { ...body };

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

      await adminModel.updateUserAdmin(payload, { id: user_id });

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
    const { user_id } = req.admin;
    const { new_password, old_password } = req.body as IAdminChangePassReqBody;
    const adminModel = this.Model.AdminModel();

    const checkAdmin = await adminModel.checkUserAdmin({ id: user_id });

    if (!checkAdmin) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const checkPass = Lib.compareHashValue(
      old_password,
      checkAdmin.password_hash
    );

    if (!checkPass) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'Old password does not match.',
      };
    }

    const password_hash = await Lib.hashValue(new_password);

    await adminModel.updateUserAdmin({ password_hash }, { id: user_id });

    return {
      success: false,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PASSWORD_CHANGED,
    };
  }

  public async getBalance(_req: Request) {
    return this.db.transaction(async (trx) => {
      const CTHotelModel = new CTHotelSupportService(trx);

      const response = await CTHotelModel.GetBalance();

      const CTHotelBalance = {
        balance: '0.00',
        emergency_credit: '0.00',
      };

      if (response.data) {
        CTHotelBalance.balance = response.data.balance;
        CTHotelBalance.emergency_credit = response.data.lend_balance;
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          CTHotelBalance,
        },
      };
    });
  }
}
