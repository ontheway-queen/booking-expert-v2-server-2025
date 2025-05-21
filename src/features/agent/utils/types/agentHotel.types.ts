export interface AgentHotelSearchReqBody {
  client_nationality: string;
  checkin: string;
  checkout: string;
  destination: 'City' | 'Hotel';
  code: number;
  rooms: { adults: number; children_ages: number[] }[];
}
