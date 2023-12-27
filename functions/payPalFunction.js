
const fetch =  require("node-fetch");
const db = require("../config/db");
const { generateReferenceNumber } = require("./index");
const moment = require("moment/moment");
const config = require("../config/config");
const logger = require("../winston");

const PAYPAL_CLIENT_ID = config.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = config.PAYPAL_CLIENT_SECRET;
const base = config.PAYPAL_BASE;


/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
const generateAccessToken = async () => {
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }
        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
        ).toString("base64");

        const response = await fetch(`${base}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        logger.error("Failed to generate Paypal Access Token:", error);
    }
};

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async ({deliveryFee, cart}) => {

    //Calculate cart total
    let total = parseFloat(deliveryFee);
    for (const cartElement of cart) {
        total += parseFloat(cartElement.price) * parseInt(cartElement.qty);
    }

    const accessToken = await generateAccessToken();

    const url = `${base}/v2/checkout/orders`;
    const payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "EUR",
                    value: `${total}`,
                },
            },
        ],
    };

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
            // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
            // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
        },
        method: "POST",
        body: JSON.stringify(payload),
    });


    const ress = await handleResponse(response);


    // save order to database
    // if (res.httpStatusCode === 201){
    //     await db.transaction(async trx => {
    //
    //         const order = await trx('orders').insert({
    //             userId,
    //             orderDate,
    //             total,
    //             deliveryAddress,
    //             deliveryFee,
    //             numberOfItems: cart.length,
    //             note
    //         })
    //
    //         const orderDetailsArray = [];
    //         for (const crt of cart) {
    //             orderDetailsArray.push({
    //                 orderId: order[0],
    //                 menuItemId: crt.id,
    //                 menuItemName: crt.name,
    //                 menuId: crt.menuId,
    //                 menuName: crt.menu,
    //                 qty: crt.qty,
    //                 price: crt.price,
    //                 choiceOf: crt.selectedChoice
    //             })
    //         }
    //
    //         //Save to orderDetails table
    //         await trx.batchInsert('orderDetails', orderDetailsArray, 30)
    //
    //
    //         //Insert into payments table
    //         const referenceNumber = generateReferenceNumber(moment()) + userId;
    //         await trx('payments').insert({
    //             reference: referenceNumber,
    //             extReference: res.jsonResponse.id,
    //             orderId: order[0],
    //             paymentDate: orderDate,
    //             paymentMethod: 'paypal',
    //             amount: total
    //         })
    //
    //
    //     })// ./Transaction
    // }

    return ress;
};

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
            // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
            // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
        },
    });

    return handleResponse(response);
};

async function handleResponse(response) {
    try {
        const jsonResponse = await response.json();
        return {
            jsonResponse,
            httpStatusCode: response.status,
        };
    } catch (err) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}

// app.post("/api/orders", async (req, res) => {
//     try {
//         // use the cart information passed from the front-end to calculate the order amount detals
//         const { cart } = req.body;
//         const { jsonResponse, httpStatusCode } = await createOrder(cart);
//         res.status(httpStatusCode).json(jsonResponse);
//     } catch (error) {
//         console.error("Failed to create order:", error);
//         res.status(500).json({ error: "Failed to create order." });
//     }
// });
//
// app.post("/api/orders/:orderID/capture", async (req, res) => {
//     try {
//         const { orderID } = req.params;
//         const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
//         res.status(httpStatusCode).json(jsonResponse);
//     } catch (error) {
//         console.error("Failed to create order:", error);
//         res.status(500).json({ error: "Failed to capture order." });
//     }
// });


module.exports = {
    createOrder, captureOrder
}