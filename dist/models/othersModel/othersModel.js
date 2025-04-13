"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class OthersModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
}
exports.default = OthersModel;
