"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heroBG = exports.popularPlaces = exports.popularDestination = exports.privacyAndPolicy = exports.termsAndConditions = exports.contactUsContent = exports.aboutUsContent = void 0;
const aboutUsContent = (site_name, site_address) => {
    return `<div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; color: #333; line-height: 1.6;">
  <div style="max-width: 1100px; margin: auto; padding: 20px;">

    <!-- Header -->
    <h1 style="text-align: center; color: #0d6efd; margin-bottom: 10px;">About ${site_name}</h1>
    <p style="text-align: center; font-size: 16px; color: #555;">
      Welcome to ${site_name} – Your Trusted Travel Companion! We craft seamless journeys for individuals and businesses — from flights and visas to holiday & Umrah packages and custom group tours.
    </p>

    <!-- Who We Are -->
    <h2 style="color: #0d6efd; margin-top: 30px;">Who We Are</h2>
    <p>
      ${site_name}, established in ${site_address}, is a premier travel agency with a strong reputation in the travel and tourism industry. We uphold the highest standards of service to ensure reliability and trustworthiness.
    </p>
    <p>
      Our experienced professionals handle every detail — from booking flights and arranging visa support to curating exclusive holiday packages and organizing your Umrah pilgrimage — with utmost care and efficiency.
    </p>

    <!-- Our Services -->
    <h2 style="color: #0d6efd; margin-top: 30px;">Our Services</h2>
    <ul style="padding-left: 20px; margin-top: 10px;">
      <li><strong>Air Ticketing (Domestic & International):</strong> Competitive fares, flexible options, and exclusive discounts.</li>
      <li><strong>Visa Assistance:</strong> Support for multiple destinations like Singapore, Thailand, Vietnam, Uzbekistan, and more.</li>
      <li><strong>Holiday & Umrah Packages:</strong> Tailored getaways and specialized spiritual packages.</li>
      <li><strong>Corporate Travel Management:</strong> Business trip solutions including flights, hotels, and visas.</li>
      <li><strong>Group Tours & Customized Itineraries:</strong> Personalized plans for families, students, and corporate retreats.</li>
    </ul>

    <!-- Why Choose Us -->
    <h2 style="color: #0d6efd; margin-top: 30px;">Why Choose Us?</h2>
    <ul style="padding-left: 20px;">
      <li><strong>Customer-Centric Approach:</strong> Tailored solutions for your needs.</li>
      <li><strong>Experienced Professionals:</strong> Efficient handling of travel arrangements.</li>
      <li><strong>Reliability & Transparency:</strong> No hidden charges or surprises.</li>
      <li><strong>24/7 Customer Support:</strong> Assistance whenever you need it.</li>
      <li><strong>Digital Solutions:</strong> Easy online booking with secure payments.</li>
    </ul>

    <!-- Mission & Vision -->
    <h2 style="color: #0d6efd; margin-top: 30px;">Our Mission</h2>
    <p>To provide exceptional travel services that exceed expectations — creating lifelong memories and inspiring a love for exploring the world.</p>

    <h2 style="color: #0d6efd; margin-top: 30px;">Our Vision</h2>
    <p>To be Bangladesh’s leading travel agency, celebrated for integrity, innovation, and outstanding customer service — setting new industry standards through technology and continuous improvement.</p>

    <!-- Core Values -->
    <h2 style="color: #0d6efd; margin-top: 30px;">Our Core Values</h2>
    <ul style="padding-left: 20px;">
      <li><strong>Integrity:</strong> Honesty and transparency in all interactions.</li>
      <li><strong>Excellence:</strong> Commitment to the highest quality of service.</li>
      <li><strong>Customer Satisfaction:</strong> Dedicated to exceeding expectations.</li>
      <li><strong>Innovation:</strong> Embracing change to enhance services.</li>
      <li><strong>Sustainability:</strong> Responsible tourism for future generations.</li>
    </ul>

    <!-- Call to Action -->
    <div style="margin-top: 30px; text-align: center;">
      <p style="font-size: 16px; color: #555;">Ready to plan your next trip? Contact us today and let’s make it happen!</p>
    </div>

    <!-- Footer -->
    <p style="text-align: center; margin-top: 40px; font-size: 14px; color: #777;">
      &copy; ${site_name}. All rights reserved.
    </p>
  </div>

</div>
`;
};
exports.aboutUsContent = aboutUsContent;
const contactUsContent = (address, phone, email) => {
    return `<div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; color: #333; line-height: 1.6;">
  <div style="max-width: 1100px; margin: auto; padding: 20px;">

    <!-- Header -->
    <h1 style="text-align: center; color: #0d6efd; margin-bottom: 10px;">Contact Us</h1>
    <p style="text-align: center; font-size: 16px; color: #555;">
      We’d love to hear from you! Whether you have a question, need assistance, or want to start planning your next journey, our team is here to help.
    </p>

    <!-- Contact Info -->
    <div style="margin-top: 30px; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #0d6efd;">Get In Touch</h2>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Office Hours:</strong> Sat–Thu, 9:00 AM – 8:00 PM</p>
    </div>

  </div>
</div>`;
};
exports.contactUsContent = contactUsContent;
const termsAndConditions = (site_name) => {
    return `
<div style="margin:0; font-family: Arial, Helvetica, sans-serif; line-height:1.65; color:#222; background:#f7f8fa;">
  <!-- Header -->
  <header style="background:#0d6efd; color:#fff; padding:28px 16px; text-align:center;">
    <h1 style="margin:0; font-size:28px;">Terms and Condition</h1>
    <p style="margin:6px 0 0; opacity:0.95;">${site_name} B2B Portal</p>
  </header>

  <!-- Container -->
  <main style="max-width:1000px; margin:24px auto 40px; background:#fff; padding:24px; border-radius:10px; box-shadow:0 6px 20px rgba(0,0,0,0.06);">

    <!-- General Terms -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">General Terms</h2>

      <p style="margin:0 0 12px;">
        Please be informed that, by registering on our B2B Portal of ${site_name} Agent,
        you are agreeing to accept all of our terms and conditions.
      </p>
      <p style="margin:0 0 12px;">
        By accessing, using or booking through our portal means that you have agreed to the terms and conditions that we set out below.
      </p>
      <p style="margin:0 0 12px;">
        The information provided on our booking platform must be truthful, accurate and updated. Our supplier reserves the sole right to cancel bookings without refund when incorrect information has been provided.
      </p>
      <p style="margin:0 0 12px;">
        We may terminate your account anytime, with or without notice, if we find you to conduct any activity that is in breach of these Terms, and if we believe that to be harmful to our business, or for conduct where the use of the Service is harmful to any other party.
        ${site_name} authorities do not encourage the B2B agents to keep an extra amount of money in the agent's account. If the b2b agent keeps the more or an extra amount of money in their account then they will not be able to withdraw the extra amount which is kept in the ${site_name} Agent portal. Whenever required, the agent can utilize the amount of money by issuing tickets or availing any of the services. ${site_name} authority preserves the right to release or hold the amount based on different situations.
      </p>
      <p style="margin:0 0 12px;">
        If any of our services have any additional terms specific to the service, those terms will be specified in the product details page, and you will be responsible to read them before booking.
      </p>
      <p style="margin:0 0 0;">
        We may, in our sole discretion, change or modify these Terms at any time, with or without notice. You are responsible to read this document from time to time to ensure that your use of the Service remains in compliance with these Terms.
      </p>
    </section>

    <!-- Services -->
    <section style="margin-bottom:28px; padding:16px; background:#f3f6ff; border:1px solid #e1e9ff; border-radius:10px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">${site_name} Services</h2>
      <p style="margin:0 0 12px;">
        ${site_name} provides flight, hotel, holiday, visa, tours and transfers to its B2B clients.
        Getting a service from us on any of these service categories will depend on its availability.
      </p>
      <p style="margin:0;">
        We reserve the right to modify, change, or discontinue any aspect of the Services at any time.
      </p>
    </section>

    <!-- T&C for Providing of Services -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">TERMS AND CONDITIONS FOR THE PROVIDING OF SERVICES</h2>
      <p style="margin:0 0 12px;">By using this site you agree to understand that ${site_name}</p>
      <ul style="margin:0; padding-left:22px;">
        <li style="margin-bottom:8px;">
          Any loss of or damage to property or injury to any person caused by reason of any defect, negligence, or other wrongful act of omission of, or any failure of performance of any kind by any Travel Supplier.
        </li>
        <li style="margin-bottom:8px;">
          Any inconvenience, loss of enjoyment, mental distress or other similar matter. Any delayed departure, missed connections, substitutions of accommodations, terminations of service, or changes in fares and rates.
        </li>
        <li style="margin-bottom:8px;">
          Any cancellation or double-booking of reservations or tickets beyond the reasonable control of ${site_name}.
        </li>
        <li style="margin-bottom:0;">
          Any claim of any nature arising out of or in connection with air or other transportation services, products or other features performed (or not) or occurring (or not) in connection with your itinerary.
        </li>
      </ul>
    </section>

    <!-- Booking -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">Booking</h2>
      <p style="margin:0 0 12px;">
        You should book any service with accurate information of the customer, after booking any kind of information change may not be allowed.
      </p>
      <p style="margin:0 0 12px;">
        When we place Service Elements on our Site, we are inviting you to make an offer for their purchase. You do not make this offer until you press Book
      </p>
      <p style="margin:0;">
        If the relevant Service Element is available, your Booking will be processed. The contract pertaining to the relevant Booking is formed when payment in full has been received. The contract between you and the relevant Travel Supplier will relate only to those Service Elements confirmed by email with ticket numbers in case of air or reservation numbers in case of hotels, cars or activities.
      </p>
    </section>

    <!-- Cancellations -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">Cancellations</h2>
      <p style="margin:0;">
        We provide cancellation or amendment deadlines along with any cancellation charges that may apply if canceled or amended after the Deadline. Please read it carefully prior to any booking.
      </p>
    </section>

    <!-- No Shows -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">No Shows</h2>
      <p style="margin:0;">
        No show by the guest at any service without prior information shall be considered a cancellation for Hotel, Tours &amp; Transfer &amp; for Flight as per Airline/Supplier policy. No refunds will be applicable in the case of no shows for Hotel, Tours &amp; Transfer &amp; for Flight as per Airline/Supplier policy.
      </p>
    </section>

    <!-- Re-Issue / Date Change -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">Re-Issue / Date Change</h2>
      <p style="margin:0;">
        R-issue or Date change of any service will be as per supplier’s policy.
      </p>
    </section>

    <!-- Refund -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">Refund</h2>
      <p style="margin:0;">
        The amount will be credited to the Agent ID as per Airlines Rules, printed on the Issued Air Tickets. Necessary Charges will be deducted as per Banks and Airlines policies.
      </p>
    </section>

    <!-- Rates & Currency -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">Rates &amp; Currency</h2>
      <p style="margin:0 0 12px;">
        All the rates presented on our website are inclusive of all taxes and service charges except any city taxes, resort fee or other charges directly payable at the hotel by the guests. You will be responsible to go through the breakdown of the rate before booking any service.
      </p>
      <p style="margin:0;">
        Rates displayed on the ${site_name} website are subject to currency fluctuations. There may be slight variations in the published rates on a daily basis that will reflect any movement in the currency exchange rates. Once your booking is complete and you are charged, there is no refund for the price difference, because rates can change/fluctuate at any time without any notification as these rates run totally on a real time basis globally.
      </p>
    </section>

    <!-- No Liability for Onward Sales -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">No Liability for Onward Sales</h2>
      <p style="margin:0 0 12px;">
        We cannot be held responsible for your clients purchasing travel services from you. The resell of our travel services is solely your responsibility. We do not accept any liability for Onward Sales to a client nor do we accept liability for anything which may go wrong with a travel service. We are also not responsible for any dispute between you and your client arising from the onward sale of a travel service.
      </p>
      <p style="margin:0 0 12px;">
        We only show information that we get from our suppliers, you are responsible to reconfirm those to your clients prior to charging him/her
      </p>
      <p style="margin:0;">
        If your customer is denied by any immigration to enter any country &amp; imposed any fine for false VISA or any passport related issues or any reason you have to pay the fine.
      </p>
    </section>

    <!-- Flight -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">Flight</h2>
      <p style="margin:0 0 12px;">
        You can book tickets to all over the world using our website. Please note that seats, meals, frequent flyer and other special requests are requests only. The airline reserves the right to apply any revisions to the requested seat allocation without notification. All requests should be verified with the airline. We do not guarantee you will be assigned the seat you have requested. We also do not guarantee that meals, frequent flyer and other special requests will be confirmed by the airline. It is therefore recommended to contact the airline directly to confirm these requests.
      </p>
      <p style="margin:0 0 12px;">
        If your customers have excess baggage, will have to pay any excess baggage fee assessed by each airline. When there are two or more airlines involved for connecting flights, they may have to reclaim bags at the connecting airport and check-in again to continue the journey. In these cases, if excess baggage, will have to pay any excess baggage fee assessed by each airline. We recommend traveling light to reduce these costs.
      </p>
      <p style="margin:0;">
        All Airlines have differing rules and policies regarding schedule changes, which are beyond our control. Due to the operational needs of each airline, changes are often made to the flights that they are currently operating. Often these changes are a prediction of travel needs for a future date but can also reflect same day changes. ${site_name} does not assume any liability whatsoever for canceled flights, flights that are missed, or flights not connecting due to any scheduled changes made by the airlines. We will inform you about the changes after being notified from Airlines or Suppliers that it’s your responsibility to inform your customer about changes.
      </p>
    </section>

    <!-- Holiday -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">Holiday</h2>
      <p style="margin:0 0 12px;">
        Package rates are valid as per our mentioned validity dates and for the room category specified. Should the period of stay or room type change, above rates will not be valid. Hotel rates are not valid during trade fairs, exhibitions, blackout periods, and special events. A surcharge will be levied in those cases.
      </p>
      <p style="margin:0 0 12px;">
        Photos of the hotel and information provided regarding the service, amenities, products, etc. have been provided to us by the supplier. ${site_name} accepts NO RESPONSIBILITY for any changes that the supplier has not updated. Specific features such as bedding type or non-smoking rooms are simply a request and not guaranteed unless otherwise specified by the hotel. While most hotels will strive to honor your requests, neither${site_name} nor the hotel will guarantee that your request will be honored.
      </p>
      <p style="margin:0;">
        No amendment (name changes, date changes, hotel change, etc) will be done once the booking is confirmed.
      </p>
    </section>

    <!-- Visa -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">Visa</h2>
      <p style="margin:0 0 12px;">
        ${site_name} process visa for all popular destinations worldwide. For places where the submission has to be by the individuals, we only process the papers for the client. Clients shall have to face embassy interviews by themselves if needed. We also do not provide any assurance of getting a visa, as that depends solely on the embassy. In order to have a higher chance of getting visa, clients are suggested to-
      </p>
      <ul style="margin:0; padding-left:22px;">
        <li style="margin-bottom:6px;">Provide accurate documents to us.</li>
        <li style="margin-bottom:6px;">Share only true information.</li>
        <li style="margin-bottom:6px;">Not hide any information.</li>
        <li style="margin-bottom:6px;">Provide any additional documents requested as supporting documents.</li>
        <li style="margin-bottom:6px;">Passport should have at least 7 months validity before applying for visa. Customers will be responsible for checking the passport validity before applying.</li>
        <li style="margin-bottom:0;">Visa fee and our service charge are strictly not refundable even if the client does not get the visa.</li>
      </ul>
    </section>

    <!-- Prohibited Activities -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">Prohibited Activities</h2>
      <p style="margin:0 0 10px;">When booking services, you are agreeing not to:</p>
      <ul style="margin:0 0 12px; padding-left:22px;">
        <li style="margin-bottom:6px;">Use the contents of this website anywhere else.</li>
        <li style="margin-bottom:6px;">Make any false or fraudulent reservation.</li>
        <li style="margin-bottom:6px;">Copy any part of this website without proper permission.</li>
      </ul>
      <p style="margin:0 0 12px;">
        If ${site_name} finds any suspicious, or fraudulent booking, booked under a false name, we reserve the right to cancel the booking immediately and block the email, phone number that are associated with that particular account from our website. ${site_name} reserves the right to take legal action if needed, in case of any fraudulent activity. If you think your account has been blocked by any mistake, we request you to contact our customer service with proper verifiable documents.
      </p>
    </section>

    <!-- Disclaimers -->
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 10px; color:#0d6efd; font-size:22px;">Disclaimers</h2>
      <p style="margin:0;">
        By booking any service from our B2B portal, you acknowledge and agree to have read, understood, and agreed to the terms and conditions. Disagreement to any of the terms and conditions stated above will not be considered after booking any service through ${site_name}.
      </p>
    </section>


  </main>

</div>

`;
};
exports.termsAndConditions = termsAndConditions;
const privacyAndPolicy = (site_name) => {
    return `

<div style="margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; color:#0f172a; background:#ffffff; line-height:1.6;">
  <header style="background:#0ea5e9; color:#ffffff; padding:40px 16px;">
    <div style="max-width:1000px; margin:0 auto;">
      <h1 style="margin:0 0 8px; font-size:32px;">Privacy and Policy</h1>
    </div>
  </header>

  <main style="max-width:1000px; margin:32px auto; padding:0 16px;">

    <section style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px 20px; margin-bottom:28px;">
      <p style="margin:0;">
        <strong>${site_name}</strong> understands its valuable customer’s concerns for privacy and undertakes several measures of protecting and maintaining the personal information that is being shared with us. The applicability of this Privacy Policy extends to the User who inquires or means to purchase or purchase the product(s) or service(s) offered by <strong>${site_name}</strong>. Through any of its online channels including its website, mobile site, mobile app &amp; offline channels including call centers and offices (collectively referred herein as <em>Sales Channels</em>). For the purpose of this Privacy Policy, <em>Website</em> means the website(s), mobile site(s) and mobile app(s). By using or accessing the Website or other Sales Channels, the User hereby agrees with the terms of this Privacy Policy and the contents herein. If you disagree with this Privacy Policy please do not use or access our Website or other Sales Channels. This Privacy Policy does not apply to any website(s), mobile sites and mobile apps of third parties, even if their websites/products are linked to our Website. Users should take note that information and privacy practices of <strong>${site_name}</strong> business partners, advertisers, sponsors or other sites to which <strong>${site_name}</strong> provides hyperlink(s), may be significantly different from this Privacy Policy. Accordingly, it is recommended that the User reviews the privacy statements and policies of any such third parties with whom they interact.
      </p>
    </section>

    <section style="margin-bottom:28px;">
      <h2 id="what-we-collect" style="font-size:24px; margin:0 0 12px;">1. WHAT PERSONAL DETAILS ${site_name} COLLECTS &amp; HOW THESE ARE USED</h2>
      <p style="margin-top:0;">${site_name} collects information, as outlined below, to be able to offer and deliver the product(s) and services(s) chosen by you and also to fulfill our legal obligations as well as our obligations towards third parties as per our User Agreement. Personal Information of User shall include the information shared by the User and collected by us for the following purposes:</p>

      <h3 style="font-size:20px; margin:20px 0 8px;">A) Registration on the Website</h3>
      <p style="margin-top:0;">Information which the User provides while subscribing to or registering on the Website, including but not limited to information about the User’s personal identity such as name, gender, marital status, religion, age etc., the contact details such as the email address, postal addresses, frequent flyer number, telephone (mobile or otherwise) and/or fax numbers. The information may also include information such as the banking details (including credit/debit card) and any other information relating to the User’s income and/or lifestyle; billing information, payment history etc.</p>

      <h3 style="font-size:20px; margin:20px 0 8px;">B) Other information</h3>
      <p style="margin-top:0;">${site_name} also collects some other information and documents including but not limited to:</p>
      <ol style="margin:0 0 0 20px; padding:0;">
        <li style="margin:8px 0;">Transactional history (other than banking details) about your e-commerce activities, buying behavior.</li>
        <li style="margin:8px 0;">Your usernames, passwords, email addresses and other security-related information used by the User in relation to ${site_name} Services.</li>
        <li style="margin:8px 0;">Data either created by the User or by a third party and which the User wishes to store on ${site_name} servers such as image files, documents etc.</li>
        <li style="margin:8px 0;">Data available in public domain or received from any third party including social media channels, including but not limited to personal or non-personal information from the User’s linked social media channels (like name, email address, profile pictures or any other information that is permitted to be received as per the User’s account settings) as a part of the User’s account information.</li>
        <li style="margin:8px 0;">If the User requests ${site_name} to provide visa-related services, then copies of the User’s passport, bank statements, originals of the filled-in application forms, photographs, and any other information which may be required by the respective embassy to process the User’s visa application.</li>
        <li style="margin:8px 0;">For international bookings, User, in compliance with the Bangladesh Bank or any other law may be required to provide details such as their TIN information or passport details number or any such information required by the Service Provider. Such information shall be strictly used as per the aforesaid requirements only. In case a User does not wish to provide this information, ${site_name} may not be able to process the booking. ${site_name} will never share User’s TIN details without their prior consent unless otherwise such action is required by any law enforcement authority for investigation, by court order or in reference to any legal process.</li>
        <li style="margin:8px 0;">In case the User opts for contactless check-in at Hotels, then copies of the User’s government identification like NID, driving license, election card etc. Self-declaration and any other information like date of birth, destination/origin of travel and place of residence that may be required by the concerned Hotel to honor the User’s hotel booking.</li>
        <li style="margin:8px 0;">The User’s Covid-19 Vaccination status and certificate in case the User wishes to avail any service for provision of which such Covid-19 vaccination related information is required or want to access your vaccination certificate at a later stage for travel related or any other purpose. ${site_name} will never process the beneficiary id and other id details contained in the vaccination certificate.</li>
        <li style="margin:8px 0;">Such information shall be strictly used for the aforesaid specified &amp; lawful purpose only. Users further understand that ${site_name} may share this information with the end service provider or any other third party for provision and facilitation of the desired booking. ${site_name} will always redact all/any sensitive &amp; confidential information contained in the vaccination certificate, passbook, bank statement or any other identity card submitted for the purpose of availing a service, promotional offer or booking a product on the Website. In case the User does not wish to provide this information or opts for deletion of the information already provided, ${site_name} may not be able to process the desired booking request. ${site_name} will never share any of the above information collected including Credit card details, Vaccination status &amp; certificate, Passport details without the User’s prior consent unless otherwise such action is required by any law enforcement authority for investigation, by court order or in reference to any legal process.</li>
      </ol>

      <h3 style="font-size:20px; margin:20px 0 8px;">C) ${site_name} uses the personal information collected from the Users for the following</h3>
      <ol style="margin:0 0 0 20px; padding:0;">
        <li style="margin:8px 0;">
          <strong>To Book a Service:</strong> Names, addresses, phone numbers and age details are shared with related service providers, including airlines, hotels, or bus/car services to provide reservation and booking to the customers or travelers.
        </li>
        <li style="margin:8px 0;">
          <strong>To Send Promotional Offers:</strong> ${site_name} uses details like mobile numbers and e-mail Id for sending information about any promotional offers. ${site_name} often sponsors promotions and lucky draws to give Users an opportunity to win discounts on travel or other prizes. This is also optional and the User can unsubscribe for such emails.
        </li>
      </ol>

      <h4 style="font-size:18px; margin:16px 0 8px;">Member Registration</h4>
      <p style="margin-top:0;">If the User opts to be a registered member of the Website, information like name, address, telephone number, e-mail address, a unique login name and password are asked. This information is collected on the registration form for various purposes like:</p>
      <ul style="margin:0 0 0 20px; padding:0;">
        <li style="margin:6px 0;">User recognition</li>
        <li style="margin:6px 0;">To complete the travel reservations</li>
        <li style="margin:6px 0;">To let ${site_name} connect with the User for customer service purposes, if necessary</li>
        <li style="margin:6px 0;">To contact the User in order to meet any specific needs; and</li>
        <li style="margin:6px 0;">To improve ${site_name}’s products and services</li>
        <li style="margin:6px 0;">To confirm the new member registration and consequent booking</li>
      </ul>

      <h4 style="font-size:18px; margin:16px 0 8px;">IV) Surveys</h4>
      <h4 style="font-size:18px; margin:16px 0 8px;">V) Safeguard Sensitive Information</h4>
      <p style="margin-top:0;">Sensitive information like Credit/Debit Card and Net Banking Details are mainly collected by the payment gateways and banks and not by ${site_name}. However, if still this information is stored on the Website, it remains completely safe, excluding that if it has been shared with any third party inadvertently by the User while browsing the Website. Sometimes, such information is shared with certain third parties to process the cashback offers &amp; discounts, if applicable.</p>

      <h4 style="font-size:18px; margin:16px 0 8px;">VI) To verify payment and disbursement of refund</h4>
      <p style="margin-top:0;">${site_name} may ask the user about transaction ID, Transaction time, bKash number, payment gateway that have been used for transaction purpose to verify the payment if service is not provided due to delay of payment validation. Also, ${site_name} may ask for Bank information (likes- Account Number, Routing Number, Branch Name, Bank name) to disburse any refund to customer/user. We will ask for this secured information to provide smooth service to the Authentic customer.</p>
    </section>

    <section style="margin-bottom:28px;">
      <h2 id="cookies" style="font-size:24px; margin:0 0 12px;">2. COOKIES &amp; AUTOMATIC LOGGING OF SESSION DATA</h2>
      <h3 style="font-size:20px; margin:16px 0 8px;">Cookies</h3>
      <ol style="margin:0 0 0 20px; padding:0;">
        <li style="margin:8px 0;">${site_name} uses cookies to personalize the User’s experience on the Website and the advertisements that may be displayed. ${site_name} use of cookies is similar to that of any other Travel/ecommerce companies.</li>
        <li style="margin:8px 0;">Cookies are small pieces of information that are stored by the User’s browser on User’s devices hard drive. Cookies allow ${site_name} to deliver better services in an efficient manner. Cookies also allow ease of access, by logging the User in without having to type the User’s login name each time (only the password is needed); ${site_name} may also use such cookies to display any advertisement(s) to the Users while they are on the Website or to send the Users offers (or similar emails – provided the Users have not opted out of receiving such emails) focusing on destinations which may be of the User’s interest.</li>
        <li style="margin:8px 0;">Most web browsers automatically accept cookies. Of course, by changing the options on the User’s web browser or using certain software programs, the User can control how and whether cookies will be accepted by the browser. ${site_name} supports the User’s right to block any unwanted Internet activity, especially that of unscrupulous websites. However, blocking ${site_name} cookies may disable certain features on the Website, and may hinder an otherwise seamless experience to purchase or use certain services available on the Website. Please note that it is possible to block cookie activity from certain websites while permitting cookies from websites you trust.</li>
        <li style="margin:8px 0;">Automatic Logging of Session Data: ${site_name} records session data of the Users, which includes IP address, Operating System, browser software and the activities of the user on his device. We collect session data to evaluate the User behavior. Such session data helps ${site_name} in identifying the problems with its servers and lets ${site_name} improve its systems. This information does not identify any visitor personally and only examines the User’s geographic location.</li>
      </ol>
    </section>

    <section style="margin-bottom:28px;">
      <h2 id="ugc" style="font-size:24px; margin:0 0 12px;">3. CONTENT GENERATED BY THE USER</h2>
      <ol style="margin:0 0 0 20px; padding:0;">
        <li style="margin:8px 0;">
          ${site_name} provides an option to its users to post their experiences by way of reviews, ratings and general poll questions. The customers also have an option of posting questions w.r.t a service offered by ${site_name} or post answers to questions raised by other users. Though participation in the feedback process is purely optional, you may still receive emails, notifications (app, sms, Whatsapp or any other messaging service) for you to share your review(s), answer questions posted by other users or a. The reviews written or posted may also be visible on other travel or travel related platforms.
        </li>
        <li style="margin:8px 0;">
          Each User who posts reviews or ratings, photographs shall have a profile, which other Users will be able to access. Other Users may be able to view the number of trips, reviews written, questions asked and answered and photographs posted about ${site_name}.
        </li>
      </ol>
    </section>

    <section style="margin-bottom:28px;">
      <h2 id="sharing" style="font-size:24px; margin:0 0 12px;">4. WITH WHOM YOUR PERSONAL INFORMATION IS SHARED</h2>

      <h3 style="font-size:20px; margin:16px 0 8px;">A) Service Providers and Suppliers</h3>
      <ol style="margin:0 0 0 20px; padding:0;">
        <li style="margin:8px 0;">The User’s information shall be shared with the end service providers like airlines, hotels, bus service providers, car/taxi rental, railways or any other suppliers who are responsible for fulfilling the User’s booking. The User may note that while making a booking with ${site_name}, the User authorizes ${site_name} to share the User’s information with the said service providers and suppliers. It is pertinent to note that ${site_name} does not authorize the end service provider to use the concerned User’s information for any other purpose(s) except as may be for fulfilling their part of service. However, how the said service providers/suppliers use the information shared with them is beyond the purview and control of ${site_name} as they process Personal Information as independent data controllers, and hence ${site_name} cannot be made accountable for the same. The User is therefore advised to review the privacy policies of the respective service provider or supplier whose services the User chooses to avail.</li>
        <li style="margin:8px 0;">${site_name} does not sell or rent individual customer names or other Personal Information of Users to third parties except sharing of such information with our business / alliance partners or vendors who are engaged by us for providing various referral services and for sharing promotional and other benefits to our customers from time-to-time basis their booking history with us.</li>
      </ol>

      <h3 style="font-size:20px; margin:16px 0 8px;">B) COMPANIES IN THE SAME GROUP</h3>
      <p style="margin-top:0;">In the interests of improving personalization and service efficiency, ${site_name} may, under controlled and secure circumstances, share the User’s Personal Information with its affiliate or associate entities. This will enable ${site_name} to provide the User with information about various products and services, both leisure- and travel-related, which might interest the User; or help ${site_name} address the User’s questions and requests in relation to their bookings.</p>

      <h3 style="font-size:20px; margin:16px 0 8px;">C) BUSINESS PARTNERS and THIRD-PARTY VENDORS</h3>
      <ol style="margin:0 0 0 20px; padding:0;">
        <li style="margin:8px 0;">${site_name} may also share certain filtered Personal Information to its corporate affiliates or business partners who may contact the Users to offer certain products or services, which may include free or paid products / services, which will enable the User to have better travel experience or to avail certain benefits specially made for ${site_name} customers. Examples of such partners are entities offering co-branded credit cards, travel insurance, insurance cover against loss of wallet, banking cards or similar sensitive information etc. If the User chooses to avail any such services offered by our business partners, the services so availed will be governed by the privacy policy of the respective service provider.</li>
        <li style="margin:8px 0;">${site_name} may share the User’s Personal Information to third parties that ${site_name} may engage to perform certain tasks on its behalf, including but not limited to payment processing, data hosting, and data processing platforms.</li>
        <li style="margin:8px 0;">${site_name} uses non-identifiable Personal Information of Users in aggregate or anonymized form to build higher quality, more useful online services by performing statistical analysis of the collective characteristics and behavior of its customers and visitors, and by measuring demographics and interests regarding specific areas of the Website. ${site_name} may provide anonymous statistical information based on this data to suppliers, advertisers, affiliates and other current and potential business partners.</li>
        <li style="margin:8px 0;">${site_name} may also use such aggregate data to inform these third parties as to the number of people who have seen and clicked on links to their websites. Any Personal Information which ${site_name} collects and which it may use in an aggregated format is our property. ${site_name} may use it, in our sole discretion and without any compensation to the User, for any legitimate purpose including without limitation the commercial sale thereof to third parties.</li>
        <li style="margin:8px 0;">Occasionally, ${site_name} will hire a third party for market research, surveys etc. and will provide information to these third parties specifically for use in connection with these projects. The information (including aggregate cookie and tracking information) ${site_name} provides to such third parties, alliance partners, or vendors are protected by confidentiality agreements and such information is to be used solely for completing the specific project, and in compliance with the applicable regulations.</li>
      </ol>
    </section>

    <section style="margin-bottom:28px;">
      <h2 id="disclosure" style="font-size:24px; margin:0 0 12px;">5) DISCLOSURE OF INFORMATION</h2>
      <p style="margin-top:0;">In addition to the circumstances described above, ${site_name} may disclose User’s Personal Information if required to do so:</p>
      <p style="margin-top:0;">By law, required by any enforcement authority for investigation, by court order or in reference to any legal process; to conduct its business; for regulatory, internal compliance and audit exercise(s) to secure its systems; or to enforce or protect its rights or properties of ${site_name} or any or all of its affiliates, associates, employees, directors or officers or when we have reason to believe that disclosing Personal Information of User(s) is necessary to identify, contact or bring legal action against someone who may be causing interference with its rights or properties, whether intentionally or otherwise, or when anyone else could be harmed by such activities.</p>
      <p style="margin-top:0;">Such disclosure and storage may take place without the User’s knowledge. In that case, ${site_name} shall not be liable to the User or any third party for any damages however arising from such disclosure and storage.</p>
    </section>

    <section style="margin-bottom:28px;">
      <h2 id="permissions" style="font-size:24px; margin:0 0 12px;">6) PERMISSIONS ASKED AND REQUIRED DURING ${site_name} MOBILE APP INSTALLATION</h2>

      <h3 style="font-size:20px; margin:16px 0 8px;">A) Android App permissions</h3>
      <p style="margin-top:0;">When the ${site_name} app is installed on the User’s phone, a list of permissions appears. Permissions that ${site_name} requires are:</p>

      <h4 style="font-size:18px; margin:16px 0 8px;">B) Device &amp; App History</h4>
      <p style="margin-top:0;">${site_name} needs the User’s device permission to collect details like Operating System name &amp; version, mobile network, preferred language, and few others. On the basis of these inputs, ${site_name} optimize the User’s travel booking experience.</p>

      <h4 style="font-size:18px; margin:16px 0 8px;">C) Identity</h4>
      <p style="margin-top:0;">Through this permission, the User allows ${site_name} to get the info of one’s account(s) on the User’s mobile device. This information is used to fill the User’s email IDs automatically. This action allows ${site_name} to map email ID’s of its Users to give them the benefits of exclusive travel discounts and cashback etc.</p>

      <h4 style="font-size:18px; margin:16px 0 8px;">D) Location</h4>
      <p style="margin-top:0;">With this permission, the User allows ${site_name} for letting the User know the benefits of ongoing specific offers on the User’s location. When the User launches ${site_name} app for travel booking, ${site_name} detects the User’s location automatically and the User’s nearest airport or city is auto-filled. For international journeys, this action allows ${site_name} in calculating the User’s time zone and to provide information consequently.</p>

      <h4 style="font-size:18px; margin:16px 0 8px;">E) Photo / Media / Files</h4>
      <p style="margin-top:0;">The libraries in the app use these permissions to allow map data to be saved to the user’s phone’s external storage, like SD cards. By saving map data locally, the user’s smartphone does not need to re-download the same map data every time the user uses the app. This provides users a seamless Map based Hotel selection experience, even on low bandwidth networks.</p>

      <h4 style="font-size:18px; margin:16px 0 8px;">F) Wi‑Fi connection information</h4>

      <h4 style="font-size:18px; margin:16px 0 8px;">G) SMS</h4>
      <p style="margin-top:0;">If the User allows ${site_name} to access its SMS, ${site_name} reads SMS and fills the One Time Password (OTP) automatically while making transactions. This offers the User a hassle-free booking experience and the User does not have to move out of the app for checking the OTP and then filling it manually.</p>

      <h4 style="font-size:18px; margin:16px 0 8px;">H) Contacts</h4>
      <p style="margin-top:0;">If the User lets ${site_name} to access its contacts, then ${site_name} can invite your friends to try its app and also give them recommendations for various travel related services. These details will be stored on its servers and synchronized from the User’s phone.</p>

      <h4 style="font-size:18px; margin:16px 0 8px;">I) Device ID</h4>
      <p style="margin-top:0;">This permission helps ${site_name} in identifying the Android ID through which ${site_name} can exclusively recognize its users. It also lets ${site_name} know the contact details through which ${site_name} auto-fills specific details and guarantees a seamless booking experience.</p>

      <h4 style="font-size:18px; margin:16px 0 8px;">J) Calendar</h4>
      <p style="margin-top:0;">This permission allows ${site_name} to put a travel plan on your calendar.</p>

      <p style="margin-top:12px;">${site_name} takes maximum initiatives possible to protect the information that a User shares. ${site_name} has undertaken advanced technology and security measures along with strict policy guidelines to secure the privacy of its customers and save their information from any unwanted access. ${site_name} is constantly enhancing its security measures by using more advanced technology.</p>
      <p style="margin-top:12px;">${site_name}’s Privacy Policy may change due to any unforeseen circumstances and enhancement of technologies. We will duly notify the users as may be necessary.</p>

      <h3 style="font-size:20px; margin:16px 0 8px;">K) iOS App Permissions</h3>
      <ol style="margin:0 0 0 20px; padding:0;">
        <li style="margin:8px 0;"><strong>Notifications:</strong> If you allow notifications for ${site_name} app, it enables us to send across exclusive deals, promotional offers, travel related updates, etc. on your device. If you do permit this, updates for your travel like PNR status, booking confirmation, refund (in case of cancellation), etc. will be sent through SMS.</li>
        <li style="margin:8px 0;"><strong>Contacts:</strong> If you allow contact permission, it enables us to provide a lot of social features to you such as sharing your hotel / flight / holidays with your friends, inviting your friends to try our app, sending referral links to your friends, etc. We will also use this information to make recommendations for hotels where your friends have stayed. This information will be stored on our servers and synced from your phone.</li>
        <li style="margin:8px 0;"><strong>Location:</strong> This permission enables us to give you the benefit of location specific deals and provide you a personalized in-funnel experience. When you launch our app to make a travel booking, we auto-detect your location so that your nearest Airport or City is auto-filled. We require this permission to recommend your nearest hotels in case you are running late and want to make a quick last minute booking for the nearest hotel. Your options are personalized based on your locations. For international travel, this enables us to determine your time zone and provide information accordingly.</li>
      </ol>
    </section>

    <section style="margin-bottom:28px;">
      <h2 id="protection" style="font-size:24px; margin:0 0 12px;">7) PROTECTION OF PERSONAL INFORMATION</h2>
      <p style="margin-top:0;">All payments on the Website are secured. Website has stringent security measures in place to protect the loss, misuse, and alteration of the information under our control. Once your information is in our possession we adhere to strict security guidelines, protecting it against unauthorized access.</p>
    </section>

    <section style="margin-bottom:28px;">
      <h2 id="withdrawal" style="font-size:24px; margin:0 0 12px;">8) WITHDRAWAL OF CONSENT AND PERMISSION</h2>
      <p style="margin-top:0;">The User may withdraw its consent to submit any or all Personal Information or decline to provide any permissions on the Website as covered above at any time. In such a circumstance, the User may face limited access to the Product(s) and Services(s) offered by ${site_name}.</p>
    </section>
  </main>
</div>
`;
};
exports.privacyAndPolicy = privacyAndPolicy;
const popularDestination = (agency_id) => {
    return [
        {
            agency_id,
            thumbnail: "agent/b2c/others/jeddah.jpg",
            order_number: 1,
            from_airport: 210,
            to_airport: 1139,
        },
        {
            agency_id,
            thumbnail: "agent/b2c/others/dubai.jpg",
            order_number: 2,
            from_airport: 210,
            to_airport: 1349,
        },
        {
            agency_id,
            thumbnail: "agent/b2c/others/newyork.jpg",
            order_number: 3,
            from_airport: 210,
            to_airport: 1754,
        },
        {
            agency_id,
            thumbnail: "agent/b2c/others/sydney.jpg",
            order_number: 4,
            from_airport: 210,
            to_airport: 171,
        },
        {
            agency_id,
            thumbnail: "agent/b2c/others/paris.jpg",
            order_number: 5,
            from_airport: 210,
            to_airport: 1386,
        },
        {
            agency_id,
            thumbnail: "agent/b2c/others/india.jpg",
            order_number: 6,
            from_airport: 210,
            to_airport: 698,
        },
    ];
};
exports.popularDestination = popularDestination;
const popularPlaces = (agency_id) => {
    return [
        {
            agency_id,
            thumbnail: "agent/b2c/others/dubai.jpg",
            order_number: 1,
            country_id: 224,
            location_id: 121449,
            location_name: "Dubai",
            location_type: "City",
            short_description: "Discover the modern marvels and luxurious experiences of Dubai.",
        },
        {
            agency_id,
            thumbnail: "agent/b2c/others/kuala-lampur.avif",
            order_number: 2,
            country_id: 129,
            location_id: 124046,
            location_name: "Kuala Lumpur",
            location_type: "City",
            short_description: "Explore the vibrant cityscape of Kuala Lumpur, known for its iconic Petronas Towers.",
        },
        {
            agency_id,
            thumbnail: "agent/b2c/others/bangkok.avif",
            order_number: 3,
            country_id: 211,
            location_id: 122861,
            location_name: "Bangkok",
            location_type: "City",
            short_description: "Experience the bustling life of Bangkok, Thailand's vibrant capital city.",
        },
        {
            agency_id,
            thumbnail: "agent/b2c/others/singapore.avif",
            order_number: 4,
            country_id: 192,
            location_id: 121673,
            location_name: "Singapore",
            location_type: "City",
            short_description: "Discover the beautiful and ultra-modern city of Singapore.",
        },
        {
            agency_id,
            thumbnail: "agent/b2c/others/bali.jpg",
            order_number: 5,
            country_id: 100,
            location_id: 124781,
            location_name: "Bali",
            location_type: "City",
            short_description: "Enjoy the serene beaches and tropical vibes of Bali, Indonesia.",
        },
        {
            agency_id,
            thumbnail: "agent/b2c/others/colombo.webp",
            order_number: 6,
            country_id: 224,
            location_id: 139467,
            location_name: "Colombo",
            location_type: "City",
            short_description: "Experience the cultural heritage and lush landscapes of Sri Lanka.",
        },
    ];
};
exports.popularPlaces = popularPlaces;
const heroBG = (agency_id) => {
    return [
        {
            agency_id,
            content: "agent/b2c/hero-bg/hero-flight.jpg",
            order_number: 1,
            type: "PHOTO",
            quote: "Explore the Best Flight Options",
            sub_quote: "Uncover unbeatable offers on global travel destinations",
            tab: "FLIGHT",
        },
        {
            agency_id,
            content: "agent/b2c/hero-bg/hero-hotel.jpg",
            order_number: 2,
            type: "PHOTO",
            quote: "Discover Your Perfect Vacation Stay",
            sub_quote: "Discover amazing deals to destinations worldwide",
            tab: "HOTEL",
        },
        {
            agency_id,
            content: "agent/b2c/hero-bg/hero-holiday.jpg",
            order_number: 3,
            type: "PHOTO",
            quote: "Discover Your Next Tour",
            sub_quote: "Discover amazing deals to destinations worldwide",
            tab: "HOLIDAY",
        },
        {
            agency_id,
            content: "agent/b2c/hero-bg/hero-visa.jpg",
            order_number: 4,
            type: "PHOTO",
            quote: "Visa Services Available for These Countries",
            sub_quote: "Visa Services Available for These Countries",
            tab: "VISA",
        },
    ];
};
exports.heroBG = heroBG;
