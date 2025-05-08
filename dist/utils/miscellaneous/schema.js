"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Schema {
    constructor() {
        this.PUBLIC_SCHEMA = 'public';
        this.ADMIN_SCHEMA = 'admin';
        this.DBO_SCHEMA = 'dbo';
        this.B2C_SCHEMA = 'b2c';
        this.SERVICE_SCHEMA = 'services';
        this.AGENT_SCHEMA = 'agent';
        this.AGENT_B2C_SCHEMA = 'agent_b2c';
        this.EXTERNAL_SCHEMA = 'external';
    }
}
exports.default = Schema;
