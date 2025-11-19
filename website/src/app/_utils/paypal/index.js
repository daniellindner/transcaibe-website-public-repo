import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

const configureEnvironment = function () {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  console.log("VERCEL_ENV", process.env.VERCEL_ENV);

  let environment;
  if (process.env.VERCEL_ENV === "production") {
    console.log("PAYPAL: Running in production environment");
    environment = new checkoutNodeJssdk.core.LiveEnvironment(
      clientId,
      clientSecret,
    );
  } else {
    console.log("PAYPAL: Running in sandbox environment");
    environment = new checkoutNodeJssdk.core.SandboxEnvironment(
      clientId,
      clientSecret,
    );
  }
  return environment;
};

const client = function () {
  return new checkoutNodeJssdk.core.PayPalHttpClient(configureEnvironment());
};

export default client;
