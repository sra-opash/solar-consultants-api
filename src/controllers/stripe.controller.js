const environment = require("../environments/environment");
const stripe = require("stripe")(environment.STRIPE_SECRET_KEY);
const transactionController = require("./transaction.controller");
const endpointSecret = environment.WEBHOOK_SECRET_KEY;

exports.createPaymentIntent = async function (req, res) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.metadata.amount * 100,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: req.body.metadata,
      description: "Software development services",
      shipping: {
        name: "Jenny Rosen",
        address: {
          line1: "510 Townsend St",
          postal_code: "98140",
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      },
    });
    if (paymentIntent) {
      const data = {
        paymentIntentId: paymentIntent.id,
        practitionerId: +paymentIntent.metadata.practitionerId,
        profileId: +paymentIntent.metadata.profileId,
        amount: paymentIntent.amount,
        creatorId: +paymentIntent.metadata.creatorId,
      };
      await transactionController.create(data);
    }
    res.send(paymentIntent);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.webhook = async (request, response) => {
  try {
    let event = request.body;
    console.log(request.body);
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    const paymentIntent = event.data.object;
    const data = {
      paymentIntentId: paymentIntent.id,
      practitionerId: paymentIntent.metadata.practitionerId,
      profileId: paymentIntent.metadata.profileId,
      amount: paymentIntent.amount,
      creatorId: paymentIntent.metadata.creatorId,
    };
    console.log("payment info ===> ", data, paymentIntent);
    switch (event.type) {
      case "payment_intent.succeeded":
        data.status = "SUCCESS";
        await transactionController.update(data);
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        break;
      case "payment_intent.canceled":
        data.status = "CANCELED";
        await transactionController.update(data);
        const paymentMethod1 = event.data.object;
        break;
      case "payment_intent.payment_failed":
        data.status = "FAILED";
        await transactionController.update(data);
        const paymentMethod = event.data.object;
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }
    response.status(200).send({
      success: true,
    });
  } catch (error) {
    response.status(500).send(error);
  }
};
