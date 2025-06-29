export interface IAgentB2CHotelSearchReqBody {
  client_nationality: string;
  checkin: string;
  checkout: string;
  destination: 'City' | 'Hotel';
  code: number;
  name: string;
  rooms: { adults: number; children_ages: number[] }[];
}
