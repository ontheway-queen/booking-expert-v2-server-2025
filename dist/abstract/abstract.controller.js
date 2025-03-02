"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractController {
    constructor() {
        this.commonValidator = new CommonValidator();
        this.StatusCode = StatusCode;
        this.asyncWrapper = new Wrapper();
    }
    error(message, status) {
        throw new CustomError(message || ResMsg.HTTP_INTERNAL_SERVER_ERROR, status || StatusCode.HTTP_INTERNAL_SERVER_ERROR);
    }
}
exports.default = AbstractController;
