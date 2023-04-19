// import {jest, describe, expect, it, beforeEach} from '@jest/globals';
// import {GumroadLicenseVerificationService} from "../../src/services/LicenseVerificationService";
//
// describe('GumroadLicenseVerificationService', () => {
//     const gumroadLicenseVerificationService = new GumroadLicenseVerificationService();
//
//     const testResponse = {
//         "success": true,
//         "uses": 3,
//         "purchase": {
//             "seller_id": "kL0psVL2admJSYRNs-OCMg==",
//             "product_id": "32-nPAicqbLj8B_WswVlMw==",
//             "product_name": "licenses demo product",
//             "permalink": "QMGY",
//             "product_permalink": "https://sahil.gumroad.com/l/pencil",
//             "email": "customer@example.com",
//             "price": 0,
//             "gumroad_fee": 0,
//             "currency": "usd",
//             "quantity": 1,
//             "discover_fee_charged": false,
//             "can_contact": true,
//             "referrer": "direct",
//             "card": {
//                 "expiry_month": null,
//                 "expiry_year": null,
//                 "type": null,
//                 "visual": null
//             },
//             "order_number": 524459935,
//             "sale_id": "FO8TXN-dbxYaBdahG97Y-Q==",
//             "sale_timestamp": "2021-01-05T19:38:56Z",
//             "purchaser_id": "5550321502811",
//             "subscription_id": "GDzW4_aBdQc-o7Gbjng7lw==",
//             "variants": "",
//             "license_key": "85DB562A-C11D4B06-A2335A6B-8C079166",
//             "is_multiseat_license": false,
//             "ip_country": "United States",
//             "recurrence": "monthly",
//             "is_gift_receiver_purchase": false,
//             "refunded": false,
//             "disputed": false,
//             "dispute_won": false,
//             "id": "FO8TXN-dvaYbBbahG97a-Q==",
//             "created_at": "2021-01-05T19:38:56Z",
//             "custom_fields": [],
//             "chargebacked": false,
//             "subscription_ended_at": null,
//             "subscription_cancelled_at": null,
//             "subscription_failed_at": null
//         }};
//
//     global.fetch = (jest.fn(() =>
//         Promise.resolve({
//             json: () => Promise.resolve(testResponse),
//         })
//     )) as jest.Mock;
//
//
//     // Test 1: Fetch throws an error
//     it('should return unable-to-verify status when fetch throws an error', async () => {
//         jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
//         // @ts-ignore
//         fetch.mockImplementationOnce(() => Promise.reject("API is down"));
//
//         const result = await gumroadLicenseVerificationService.verifyLicense('test-license', true);
//         expect(result).toEqual({
//             premiumStatus: 'unable-to-verify',
//             message: 'Unable to verify premium license. Please check your internet connection and reload the extension.',
//         });
//     });
//
//     // Test 2: Response status is 404
//     it('should return free status when response status is 404', async () => {
//         const mockResponse = new Response(undefined, {status: 404});
//         jest.spyOn(global, "fetch").mockImplementation(
//             jest.fn(
//                 () => Promise.resolve({ json: () => Promise.resolve({ data: 100 }),
//                 }),
//             ) as jest.Mock );
//         // jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
//
//         const result = await gumroadLicenseVerificationService.verifyLicense('test-license', true);
//
//         expect(result).toEqual({
//             premiumStatus: 'invalid',
//             message: 'Invalid premium license. Please check your license key and try again.',
//         });
//     });
//
//     // Test 3: Response status is not 200 and not 404
//     it('should return unable-to-verify status when response status is not 200 and not 404', async () => {
//         const mockResponse = new Response(null, {status: 500});
//         jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
//
//         const result = await gumroadLicenseVerificationService.verifyLicense('test-license', true);
//
//         expect(result).toEqual({
//             premiumStatus: 'unable-to-verify',
//             message: 'Unable to verify premium license. The license verification service is not responding as expected. Please try again later or contact the developer for support.',
//         });
//     });
//
//     // Test 4: Response JSON success is false
//     it('should return free status when response JSON success is false', async () => {
//         const mockResponse = new Response(JSON.stringify({success: false}), {status: 200});
//         jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
//
//         const result = await gumroadLicenseVerificationService.verifyLicense('test-license', true);
//
//         expect(result).toEqual({
//             premiumStatus: 'invalid',
//             message: 'Invalid premium license. Please check your license key and try again.',
//         });
//     });
//
//     // Test 5: Subscription is no longer active
//     it('should return expired status when subscription is no longer active', async () => {
//         const mockResponseJson = {
//             success: true,
//             purchase: {
//                 subscription_ended_at: '2023-01-01',
//                 subscription_cancelled_at: null,
//                 subscription_failed_at: null,
//             },
//         };
//
//         const mockResponse = new Response(JSON.stringify(mockResponseJson), {status: 200});
//         jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
//
//         const result = await gumroadLicenseVerificationService.verifyLicense('test-license', true);
//
//         expect(result).toEqual({
//             premiumStatus: 'expired',
//             message: 'Your premium subscription is no longer active. Purchase and verify a new subscription license to continue using premium features.',
//         });
//     });
//
//     // Test 6: License has already been redeemed
//     // it('should return free status when license has already been redeemed', async
// });