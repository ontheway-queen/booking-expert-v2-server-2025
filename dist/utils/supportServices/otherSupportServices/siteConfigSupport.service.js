"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteConfigSupportService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const pagesContent_1 = require("../../miscellaneous/siteConfig/pagesContent");
class SiteConfigSupportService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    insertSiteConfigData(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, address, email, phone, site_name, logo, }) {
            const SiteConfigModel = this.Model.AgencyB2CConfigModel(this.trx);
            const payload = {
                agency_id,
                about_us_content: (0, pagesContent_1.aboutUsContent)(site_name, address),
                emails: JSON.stringify([{ email }]),
                numbers: JSON.stringify([{ number: phone }]),
                address: JSON.stringify([{ address }]),
                contact_us_content: (0, pagesContent_1.contactUsContent)(address, phone, email),
                privacy_policy_content: (0, pagesContent_1.privacyAndPolicy)(site_name),
                terms_and_conditions_content: (0, pagesContent_1.privacyAndPolicy)(site_name),
                site_name,
                hero_quote: `Welcome to ${site_name}!`,
                hero_sub_quote: 'Find Flights, Hotels, Visa & Holidays',
                main_logo: logo,
                site_thumbnail: 'agent/b2c/site-config/site-thumbnail.jpg',
                about_us_thumbnail: 'agent/b2c/site-config/about-us.png',
                contact_us_thumbnail: 'agent/b2c/site-config/contact-us.jpg',
                favicon: 'agent/b2c/site-config/favicon.png',
                meta_description: `Welcome to ${site_name}, The ultimate online platform for ota services! Book air tickets, hotels, visa, tour package without hassle at the most competitive rates.`,
                meta_tags: `${site_name}, flight booking, cheap hotels, tour packages, visa services, travel deals, online travel agency`,
                meta_title: ` ${site_name} | Book Flights, Hotel, Tour, Visa Online`,
                notice: `Welcome to ${site_name}`,
            };
            yield SiteConfigModel.insertSiteConfig(payload);
            const popularDestPayload = (0, pagesContent_1.popularDestination)(agency_id);
            const popularPlacesPayload = (0, pagesContent_1.popularPlaces)(agency_id);
            const heroBGPayload = (0, pagesContent_1.heroBG)(agency_id);
            yield SiteConfigModel.insertHeroBGContent(heroBGPayload);
            yield SiteConfigModel.insertPopularDestination(popularDestPayload);
            yield SiteConfigModel.insertPopularPlaces(popularPlacesPayload);
        });
    }
}
exports.SiteConfigSupportService = SiteConfigSupportService;
