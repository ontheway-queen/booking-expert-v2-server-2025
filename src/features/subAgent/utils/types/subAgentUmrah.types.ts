export interface IBookSubAgentUmrahPackageReqBody {
  traveler_adult: number;
  traveler_child?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
}
