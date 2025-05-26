export interface IUpdateAgentB2CProfileReqBody {
    name?: string;
    gender?: string;
    phone_number?: string;
}

export interface IAgentB2CChangePasswordReqBody {
    new_password: string;
    old_password: string;
}