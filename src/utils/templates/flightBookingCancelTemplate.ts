import { IGetSingleFlightBookingData } from "../modelTypes/flightModelTypes/flightBookingModelTypes";
import { PROJECT_LOGO, PROJECT_NAME, PROJECT_EMAIL, PROJECT_NUMBER, PROJECT_ADDRESS } from "../miscellaneous/constants";
import { FILE_STORAGE_HOST } from "../../middleware/uploader/uploaderConstants";

interface IEmailFlightBookingCancelTemplate {
  booking: IGetSingleFlightBookingData;
  panel_link: string;
  logo?: string;
}

export const flightBookingCancelBodyTemplate = (payload: IEmailFlightBookingCancelTemplate) => {
    const { booking, panel_link, logo } = payload;

  const formattedDate = new Date(booking.travel_date).toDateString();


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
                    <h1 style="margin: 0; font-size: 24px; color: #333;">Flight Booking Cancelled</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Booking Details:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
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
        
                    </table>

                    <p style="font-size: 16px; color: "#ff9800"; margin-top: 30px;">Booking has been cancelled</p>

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