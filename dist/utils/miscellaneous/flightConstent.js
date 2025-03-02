"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SABRE_CABIN_CODE = exports.SABRE_MEAL_CODE = exports.BD_AIRPORT = exports.COM_MODE_DECREASE = exports.COM_MODE_INCREASE = exports.COM_TYPE_FLAT = exports.COM_TYPE_PER = exports.SABRE_API = exports.SABRE_FLIGHT_ITINS = exports.SABRE_TOKEN_ENV = void 0;
// Sabre token env ID
exports.SABRE_TOKEN_ENV = 'sabre_token';
exports.SABRE_FLIGHT_ITINS = '200ITINS';
// API Name Const
exports.SABRE_API = 'SABRE';
// airlines commission const
exports.COM_TYPE_PER = 'PER';
exports.COM_TYPE_FLAT = 'FLAT';
exports.COM_MODE_INCREASE = 'INCREASE';
exports.COM_MODE_DECREASE = 'DECREASE';
// BD Airport
exports.BD_AIRPORT = [
    'DAC',
    'CGP',
    'ZYL',
    'CXB',
    'JSR',
    'BZL',
    'RJH',
    'SPD',
    'IRD',
];
// meal data for sabre code
exports.SABRE_MEAL_CODE = [
    {
        id: 1,
        code: 'B',
        name: 'Breakfast',
    },
    {
        id: 2,
        code: 'K',
        name: 'Continental breakfast',
    },
    {
        id: 3,
        code: 'L',
        name: 'Lunch',
    },
    {
        id: 4,
        code: 'S',
        name: 'Snack',
    },
    {
        id: 5,
        code: 'D',
        name: 'Dinner',
    },
    {
        id: 6,
        code: 'M',
        name: 'Meal',
    },
    {
        id: 7,
        code: 'F',
        name: 'Food for purchase',
    },
    {
        id: 8,
        code: 'G',
        name: 'Food/Beverages for purchase',
    },
    {
        id: 9,
        code: 'P',
        name: 'Alcoholic beverages for purchase',
    },
    {
        id: 10,
        code: 'C',
        name: 'Complimentary alcoholic beverages',
    },
    {
        id: 11,
        code: 'N',
        name: 'No meal service',
    },
    {
        id: 12,
        code: 'R',
        name: 'Complimentary refreshments',
    },
    {
        id: 13,
        code: 'V',
        name: 'Refreshments for purchase',
    },
];
// cabin data for sabre code
exports.SABRE_CABIN_CODE = [
    {
        id: 1,
        code: 'P',
        name: 'Premium First',
    },
    {
        id: 2,
        code: 'F',
        name: 'First',
    },
    {
        id: 3,
        code: 'J',
        name: 'Premium Business',
    },
    {
        id: 4,
        code: 'C',
        name: 'Business',
    },
    {
        id: 5,
        code: 'S',
        name: 'Premium Economy',
    },
    {
        id: 6,
        code: 'Y',
        name: 'Economy',
    },
];
