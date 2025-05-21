
import { IGetSingleFlightBookingData } from "../modelTypes/flightModelTypes/flightBookingModelTypes";
import { IGetFlightBookingTravelerData } from '../modelTypes/flightModelTypes/flightBookingTravelerModelTypes';
import { IGetFlightBookingPriceBreakdownData } from '../modelTypes/flightModelTypes/flightBookingPriceBreakdownModelTypes';
import { IGetFlightBookingSegmentData } from '../modelTypes/flightModelTypes/flightBookingSegmentModelType';
import { PROJECT_LOGO, PROJECT_NAME, PROJECT_EMAIL, PROJECT_NUMBER, PROJECT_ADDRESS } from "../miscellaneous/constants";
import { FILE_STORAGE_HOST } from "../../middleware/uploader/uploaderConstants";

interface IEmailTicketIssueTemplate {
  booking: IGetSingleFlightBookingData;
  travelers: IGetFlightBookingTravelerData[];
  panel_link: string;
  logo?: string;
  due: number;
}

export const flightTicketIssueBodyTemplate = (payload: IEmailTicketIssueTemplate) => {
    const { booking, travelers, panel_link, logo } = payload;

  const ticketNumbers = travelers
    .map((traveler) => traveler.ticket_number)
    .filter(Boolean)
    .join(", ");

  const formattedDate = new Date(booking.travel_date).toDateString();
  // Explicitly type the allowed status values
  type BookingStatus = "ISSUED" | "TICKET HOLD" | "TICKET IN PROCESS";
  const statusTextMap: Record<BookingStatus, string> = {
    ISSUED: "This booking has been ticketed.",
    "TICKET HOLD": "This booking is on hold and will be ticketed soon.",
    "TICKET IN PROCESS": "Ticketing is currently in process.",
  };
  const statusColorMap: Record<BookingStatus, string> = {
    ISSUED: "green",
    "TICKET HOLD": "#ff9800", // orange
    "TICKET IN PROCESS": "#2196f3", // blue
  };
  const statusText = statusTextMap[booking.status as BookingStatus] || "Booking status is unknown.";
  const statusColor = statusColorMap[booking.status as BookingStatus] || "#333";

  return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Flight Booking Status</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
                <div style="background-color: #ececec; padding: 20px; text-align: center;">
                    <img src="${logo || PROJECT_LOGO}" alt=${PROJECT_NAME} style="display: block; width: 80px; margin: 0 auto 10px;" />
                    <h1 style="margin: 0; font-size: 24px; color: #333;">Flight Ticket Issuance</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Booking Details:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2;">Ticket Numbers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${ticketNumbers || 'Not Available Yet'}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2;">Journey Type</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${booking.journey_type}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2;">Route</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${booking.route}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2;">Number of Travelers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${booking.total_passenger}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2;">Travel Date</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${formattedDate}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2;">Payable Price</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${booking.payable_amount} BDT</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2;">Due Amount</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.due} BDT</td>
                        </tr>
                    </table>

                    <p style="font-size: 16px; color: ${statusColor}; margin-top: 30px;">${statusText}</p>

                    <div style="margin-top: 30px; text-align: center;">
                        <a href="${panel_link}" style="display: inline-block; padding: 12px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                            View in Panel
                        </a>
                    </div>
                </div>
            </div>
        </body>
    </html>
  `;
};





export const flightTicketIssuePdfTemplate = (payload: {
  booking: IGetSingleFlightBookingData;
  priceBreakdown: IGetFlightBookingPriceBreakdownData[];
  segments: IGetFlightBookingSegmentData[];
  travelers: IGetFlightBookingTravelerData[];
  agency?: {
    email: string;
    phone: string;
    address: string;
    photo: string;
    name: string;
  };
}) => {
  const passengerRows = payload.travelers
    .map(
      (traveler) =>
        `<tr>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${traveler.first_name} ${traveler.last_name}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${
            traveler.passport_number ?? "N/A"
          }</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${
            traveler.frequent_flyer_number ?? "N/A"
          }</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${
            traveler.ticket_number ? traveler.ticket_number : "N/A"
          }</td>
      </tr>`
    )
    .join("");

  const segmentRows = payload.segments
    .map(
      (segment) =>
        `<tr>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">
              <div style="text-align: center; margin-bottom: 5px;">
                  <img src="${FILE_STORAGE_HOST}${segment.airline_logo}" alt="${segment.airline}" style="width: 30px; height: 30px;">
              </div>
              <div style="text-align: center; font-size: 12px;">
                  ${segment.airline}<br>
                  <span style="color: #6c757d;">${segment.flight_number}</span>
              </div>
          </td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">
            ${segment.origin}<br>
            ${new Date(segment.departure_date).toLocaleDateString()} ${segment.departure_time}
          </td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${segment.duration}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">
            ${segment.destination}<br>
            ${new Date(segment.arrival_date).toLocaleDateString()} ${segment.arrival_time}
          </td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">
              Class: ${segment.class}<br>
              Baggage: ${segment.baggage}
          </td>
      </tr>`
    )
    .join("");

  const fareRows = payload.priceBreakdown
    .map(
      (fare) =>
        `<tr>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${fare.type}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">BDT ${fare.base_fare}/-</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">BDT ${fare.tax}/-</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${fare.total_passenger}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">BDT ${fare.total_fare}/-</td>
        </tr>`
    )
    .join("");

  const totalAmount = payload.priceBreakdown.reduce((sum, fare) => sum + Number(fare.total_fare), 0);


  return `<!DOCTYPE html>
<html>
<head>
    <title>Flight Ticket</title>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
                <h1 style="margin: 0; font-size: 18px; font-weight: bold;">${
                  payload?.agency?.name || PROJECT_NAME
                }</h1>
                <p style="margin: 5px 0; font-size: 12px;">📞 Customer support: ${
                  payload?.agency?.phone || PROJECT_NUMBER
                }</p>
                <p style="margin: 5px 0; font-size: 12px;">📍 Address: ${
                  payload?.agency?.address || PROJECT_ADDRESS
                }</p>
                 <p style="margin: 5px 0; font-size: 12px;">🔗 Booking Status: ${
                  payload.booking.status
                }</p>
            </div>
            <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; background-color: #007bff; display: flex; justify-content: center; align-items: center;">
                <img src="${
                  payload?.agency?.photo || "PROJECT_LOGO"
                }" alt="Logo" style="width: 80px; height: 80px; object-fit: cover;">
            </div>
        </div>

        <!-- Passenger Information -->
        <div style="margin-bottom: 20px;">
            <div style="background: #007bff; color: white; padding: 8px; font-weight: bold; font-size: 14px;">
                ✈️ PASSENGER INFORMATION
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tr style="background: #f8f9fa;">
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">PASSENGER</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">PASSPORT NO.</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">FREQUENT FLYER NUMBER</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">TICKET</th>
                </tr>
                ${passengerRows}
            </table>
        </div>

        <!-- Airline Information -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background: #e3f2fd;">
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">AIRLINE PNR</th>
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">BOOKING REF</th>
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">DATE OF ISSUE</th>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${payload.booking.airline_pnr || "N/A"}</td>
                <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${payload.booking.booking_ref}</td>
                <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${payload.booking.issued_at ? new Date(payload.booking.issued_at).toLocaleString() : "N/A"}</td>
            </tr>
        </table>

        <!-- Itinerary Information -->
        <div style="margin-bottom: 20px;">
            <div style="background: #007bff; color: white; padding: 8px; font-weight: bold; font-size: 14px;">
                ✈️ ITINERARY INFORMATION
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tr style="background: #e3f2fd;">
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">FLIGHT</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">DEPARTURE</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">DURATION</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">ARRIVAL</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">DETAILS</th>
                </tr>
                ${segmentRows}
            </table>
        </div>

        <!-- Fare Data -->
        <div style="margin-bottom: 20px;">
            <div style="background: #007bff; color: white; padding: 8px; font-weight: bold; font-size: 14px;">
                💰 FARE DATA
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tr style="background: #e3f2fd;">
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">PASSENGER TYPE</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">BASE FARE</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">TAXES</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">QUANTITY</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">TOTAL</th>
                </tr>
                ${fareRows}
                <tr>
                    <td colspan="4" style="text-align: right; padding: 8px; border: 1px solid #dee2e6; font-size: 12px;"><strong>Total Amount</strong></td>
                    <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;"><strong>BDT ${totalAmount}/-</strong></td>
                </tr>
            </table>
        </div>

        <!-- Important Reminders -->
        <div style="margin-top: 20px;">
            <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px; font-size: 14px;">
                <span style="color: #007bff;">📝</span> IMPORTANT REMINDERS
            </h3>
            <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6c757d; font-size: 12px;">1</span>
                </div>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 13px;">Flight Status</h4>
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">Before your flight, please check your updated flight status on the airline website or by calling the airline customer support.</p>
                </div>
            </div>
            
            <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6c757d; font-size: 12px;">2</span>
                </div>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 13px;">Online Checkin</h4>
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">Airline websites usually have online checkins available which can be availed to.</p>
                </div>
            </div>

            <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6c757d; font-size: 12px;">3</span>
                </div>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 13px;">Bag Drop Counter</h4>
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">Please be at the check-in bag Drop counter before closure for document verification & acceptance of check-in baggage.</p>
                </div>
            </div>

            <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6c757d; font-size: 12px;">4</span>
                </div>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 13px;">Government Issued ID card</h4>
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">Please carry a government issued ID card along with your e-ticket while travelling.</p>
                </div>
            </div>

            <div style="display: flex; align-items: start; gap: 15px;">
                <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6c757d; font-size: 12px;">5</span>
                </div>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 13px;">Emergency Exit Row</h4>
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">Passengers seated on the emergency exit row must comply with safety regulations & requirements.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
};