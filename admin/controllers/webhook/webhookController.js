app.use(require('body-parser').text({type: '*/*'}));

const endpointSecret = 'whsec_...';

app.post('/webhook', function(request, response) {
    const sig = request.headers['stripe-signature'];

    let event = null;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        //invalid signature
        response.status(400).end();
        return;
    }

    let intent = null;
    switch (event['type']) {
        case 'payment_intent.succeeded':
            intent = event.data.object;
            console.log("Succeeded:", intent.id);
            break;
        case 'payment_intent.payment_failed':
            intent = event.data.object;
            const message = intent.last_payment_error && intent.last_payment_error.message;
            console.log('Failed:', intent.id, message);
            break;
    }

    response.sendStatus(200);
});