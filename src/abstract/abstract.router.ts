import { Router } from 'express';
import CommonValidator from '../features/public/commonUtils/validators/commonValidator';
import FileFolder from '../utils/miscellaneous/fileFolders';
import Uploader from '../middleware/uploader/uploader';

class AbstractRouter {
  public router = Router();
  protected commonValidator = new CommonValidator();
  protected uploader = new Uploader();
  protected fileFolders = FileFolder;
}

export default AbstractRouter;
